import { useState, useRef, useEffect } from "react";

export default function VideoRecorder({ skill, onVideoRecorded, onClose }) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [error, setError] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  
  const videoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  const timerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const startRecording = async () => {
    try {
      setError("");
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: true, 
        audio: true 
      });
      
      streamRef.current = stream;
      videoRef.current.srcObject = stream;
      
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      
      const chunks = [];
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        setRecordedBlob(blob);
      };
      
      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      
      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      
    } catch (err) {
      setError("Failed to access camera/microphone. Please check permissions.");
      console.error("Error starting recording:", err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    }
  };

  const retakeRecording = () => {
    setRecordedBlob(null);
    setRecordingTime(0);
    setError("");
  };

  const uploadVideo = async () => {
    if (!recordedBlob) return;
    
    setIsUploading(true);
    setError("");
    
    try {
      const formData = new FormData();
      formData.append("video", recordedBlob, `${skill}_demonstration.webm`);
      formData.append("skill", skill);
      formData.append("duration", recordingTime);
      
      const response = await fetch("http://127.0.0.1:8002/upload_skill_video", {
        method: "POST",
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      if (data.success) {
        onVideoRecorded({
          skill,
          videoUrl: data.video_url,
          duration: recordingTime,
          uploadedAt: new Date().toISOString()
        });
      }
      
    } catch (err) {
      setError(`Failed to upload video: ${err.message}`);
      console.error("Error uploading video:", err);
    } finally {
      setIsUploading(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
        <div className="text-center mb-6">
          <h3 className="text-2xl font-bold mb-2">Record Skill Demonstration</h3>
          <p className="text-gray-600">Record a video demonstrating your {skill} skills</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <div className="mb-6">
          <div className="bg-gray-900 rounded-lg overflow-hidden mb-4">
            <video
              ref={videoRef}
              autoPlay
              muted
              className="w-full h-64 object-cover"
            />
          </div>
          
          {isRecording && (
            <div className="text-center mb-4">
              <div className="inline-flex items-center gap-2 bg-red-100 text-red-800 px-3 py-1 rounded-full">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                <span className="font-semibold">Recording: {formatTime(recordingTime)}</span>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-4">
          {!recordedBlob ? (
            <div className="flex gap-3 justify-center">
              {!isRecording ? (
                <button
                  onClick={startRecording}
                  className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-semibold flex items-center gap-2"
                >
                  <span className="w-3 h-3 bg-white rounded-full"></span>
                  Start Recording
                </button>
              ) : (
                <button
                  onClick={stopRecording}
                  className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-semibold"
                >
                  Stop Recording
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-2">
                  Video recorded ({formatTime(recordingTime)})
                </p>
                <video
                  src={URL.createObjectURL(recordedBlob)}
                  controls
                  className="w-full h-48 object-cover rounded"
                />
              </div>
              
              <div className="flex gap-3 justify-center">
                <button
                  onClick={retakeRecording}
                  className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                >
                  Retake
                </button>
                <button
                  onClick={uploadVideo}
                  disabled={isUploading}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                >
                  {isUploading ? "Uploading..." : "Upload Video"}
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="mt-6 text-center">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            Cancel
          </button>
        </div>

        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
          <h4 className="font-semibold text-blue-800 mb-2">💡 Recording Tips:</h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Explain your approach to solving {skill} problems</li>
            <li>• Demonstrate coding or technical concepts</li>
            <li>• Keep it concise (2-5 minutes recommended)</li>
            <li>• Ensure good lighting and clear audio</li>
          </ul>
        </div>
      </div>
    </div>
  );
}