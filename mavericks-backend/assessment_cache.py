"""
Assessment Cache and Video Recommendations System
Speeds up assessment generation and provides curated video recommendations
"""

import json
import time
from typing import Dict, List, Optional

# Pre-generated assessments for common skills (faster than AI generation)
PREDEFINED_ASSESSMENTS = {
    "Python": {
        "questions": [
            {
                "id": "py_1",
                "skill": "Python",
                "question": "What is the correct way to create a list in Python?",
                "options": ["[]", "()", "{}", "<>"],
                "correct_answer": "[]",
                "explanation": "Square brackets [] are used to create lists in Python"
            },
            {
                "id": "py_2", 
                "skill": "Python",
                "question": "Which method is used to add an element to a list?",
                "options": ["add()", "append()", "insert()", "push()"],
                "correct_answer": "append()",
                "explanation": "append() adds an element to the end of a list"
            },
            {
                "id": "py_3",
                "skill": "Python", 
                "question": "What is the output of print(type([]))?",
                "options": ["<class 'list'>", "<class 'array'>", "<class 'tuple'>", "<class 'set'>"],
                "correct_answer": "<class 'list'>",
                "explanation": "[] creates a list object in Python"
            },
            {
                "id": "py_4",
                "skill": "Python",
                "question": "How do you create a dictionary in Python?",
                "options": ["{}", "[]", "()", "dict()"],
                "correct_answer": "{}",
                "explanation": "Curly braces {} are used to create dictionaries"
            },
            {
                "id": "py_5",
                "skill": "Python",
                "question": "What is the correct way to define a function?",
                "options": ["function name():", "def name():", "func name():", "define name():"],
                "correct_answer": "def name():",
                "explanation": "def is the keyword to define functions in Python"
            }
        ]
    },
    "JavaScript": {
        "questions": [
            {
                "id": "js_1",
                "skill": "JavaScript",
                "question": "How do you declare a variable in JavaScript?",
                "options": ["var x = 5;", "variable x = 5;", "v x = 5;", "declare x = 5;"],
                "correct_answer": "var x = 5;",
                "explanation": "var is the traditional way to declare variables"
            },
            {
                "id": "js_2",
                "skill": "JavaScript",
                "question": "What is the modern way to declare a constant?",
                "options": ["const x = 5;", "constant x = 5;", "let x = 5;", "var x = 5;"],
                "correct_answer": "const x = 5;",
                "explanation": "const declares a constant that cannot be reassigned"
            },
            {
                "id": "js_3",
                "skill": "JavaScript",
                "question": "Which method adds elements to the end of an array?",
                "options": ["push()", "pop()", "shift()", "unshift()"],
                "correct_answer": "push()",
                "explanation": "push() adds elements to the end of an array"
            },
            {
                "id": "js_4",
                "skill": "JavaScript",
                "question": "What is the output of typeof []?",
                "options": ["array", "object", "list", "undefined"],
                "correct_answer": "object",
                "explanation": "Arrays are objects in JavaScript"
            },
            {
                "id": "js_5",
                "skill": "JavaScript",
                "question": "How do you create an object in JavaScript?",
                "options": ["{}", "[]", "()", "object()"],
                "correct_answer": "{}",
                "explanation": "Curly braces {} create object literals"
            }
        ]
    },
    "React": {
        "questions": [
            {
                "id": "react_1",
                "skill": "React",
                "question": "Which hook is used to manage state in functional components?",
                "options": ["useState", "useEffect", "useContext", "useReducer"],
                "correct_answer": "useState",
                "explanation": "useState is the primary hook for managing state"
            },
            {
                "id": "react_2",
                "skill": "React",
                "question": "What is the correct way to create a React component?",
                "options": ["function Component() {}", "class Component {}", "component Component() {}", "react Component() {}"],
                "correct_answer": "function Component() {}",
                "explanation": "Functional components use function declarations"
            },
            {
                "id": "react_3",
                "skill": "React",
                "question": "How do you pass data from parent to child component?",
                "options": ["props", "state", "context", "refs"],
                "correct_answer": "props",
                "explanation": "Props are used to pass data down the component tree"
            },
            {
                "id": "react_4",
                "skill": "React",
                "question": "Which lifecycle method runs after component mounts?",
                "options": ["componentDidMount", "componentWillMount", "componentDidUpdate", "componentWillUnmount"],
                "correct_answer": "componentDidMount",
                "explanation": "componentDidMount runs after the component is mounted"
            },
            {
                "id": "react_5",
                "skill": "React",
                "question": "What is JSX?",
                "options": ["JavaScript XML", "JavaScript Extension", "React Syntax", "HTML in JavaScript"],
                "correct_answer": "JavaScript XML",
                "explanation": "JSX stands for JavaScript XML"
            }
        ]
    },
    "SQL": {
        "questions": [
            {
                "id": "sql_1",
                "skill": "SQL",
                "question": "Which SQL command is used to retrieve data?",
                "options": ["SELECT", "INSERT", "UPDATE", "DELETE"],
                "correct_answer": "SELECT",
                "explanation": "SELECT is used to retrieve data from tables"
            },
            {
                "id": "sql_2",
                "skill": "SQL",
                "question": "What is the correct syntax for a basic SELECT statement?",
                "options": ["SELECT * FROM table", "SELECT table FROM *", "FROM table SELECT *", "TABLE * FROM SELECT"],
                "correct_answer": "SELECT * FROM table",
                "explanation": "SELECT * FROM table retrieves all columns from a table"
            },
            {
                "id": "sql_3",
                "skill": "SQL",
                "question": "Which clause is used to filter results?",
                "options": ["WHERE", "HAVING", "FILTER", "CONDITION"],
                "correct_answer": "WHERE",
                "explanation": "WHERE clause filters rows based on conditions"
            },
            {
                "id": "sql_4",
                "skill": "SQL",
                "question": "How do you sort results in ascending order?",
                "options": ["ORDER BY ASC", "ORDER BY", "SORT ASC", "ASC ORDER"],
                "correct_answer": "ORDER BY",
                "explanation": "ORDER BY sorts in ascending order by default"
            },
            {
                "id": "sql_5",
                "skill": "SQL",
                "question": "Which keyword is used to join tables?",
                "options": ["JOIN", "CONNECT", "LINK", "MERGE"],
                "correct_answer": "JOIN",
                "explanation": "JOIN is used to combine data from multiple tables"
            }
        ]
    }
}

# Curated video recommendations for skills
VIDEO_RECOMMENDATIONS = {
    "Python": [
        {
            "video_title": "Python for Beginners - Full Course",
            "video_url": "https://www.youtube.com/watch?v=_uQrJ0TkZlc",
            "description": "Complete Python tutorial for beginners by Programming with Mosh"
        },
        {
            "video_title": "Python Tutorial for Beginners",
            "video_url": "https://www.youtube.com/watch?v=rfscVS0vtbw",
            "description": "Learn Python basics with freeCodeCamp"
        }
    ],
    "JavaScript": [
        {
            "video_title": "JavaScript Full Course for Beginners",
            "video_url": "https://www.youtube.com/watch?v=PkZNo7MFNFg",
            "description": "Complete JavaScript tutorial by freeCodeCamp"
        },
        {
            "video_title": "JavaScript Tutorial for Beginners",
            "video_url": "https://www.youtube.com/watch?v=W6NZfCO5SIk",
            "description": "Learn JavaScript fundamentals with Programming with Mosh"
        }
    ],
    "React": [
        {
            "video_title": "React Tutorial for Beginners",
            "video_url": "https://www.youtube.com/watch?v=Ke90Tje7VS0",
            "description": "Complete React tutorial by Programming with Mosh"
        },
        {
            "video_title": "React Full Course for Beginners",
            "video_url": "https://www.youtube.com/watch?v=bMknfKXIFA8",
            "description": "Learn React from scratch with freeCodeCamp"
        }
    ],
    "SQL": [
        {
            "video_title": "SQL Tutorial for Beginners",
            "video_url": "https://www.youtube.com/watch?v=HXV3zeQKqGY",
            "description": "Complete SQL tutorial by freeCodeCamp"
        },
        {
            "video_title": "SQL for Beginners",
            "video_url": "https://www.youtube.com/watch?v=7S_tz1z_5bA",
            "description": "Learn SQL basics with Programming with Mosh"
        }
    ]
}

# Assessment cache to avoid regenerating
assessment_cache = {}

def get_cached_assessment(skill: str, difficulty: str = "intermediate") -> Optional[Dict]:
    """Get cached assessment if available"""
    cache_key = f"{skill}_{difficulty}"
    if cache_key in assessment_cache:
        cached = assessment_cache[cache_key]
        # Check if cache is still valid (24 hours)
        if time.time() - cached["timestamp"] < 86400:
            return cached["assessment"]
    return None

def cache_assessment(skill: str, difficulty: str, assessment: Dict):
    """Cache an assessment"""
    cache_key = f"{skill}_{difficulty}"
    assessment_cache[cache_key] = {
        "assessment": assessment,
        "timestamp": time.time()
    }

def get_predefined_assessment(skill: str) -> Optional[Dict]:
    """Get predefined assessment for common skills"""
    skill_lower = skill.lower()
    
    # Map skill names to predefined assessments
    skill_mapping = {
        "python": "Python",
        "javascript": "JavaScript", 
        "js": "JavaScript",
        "react": "React",
        "reactjs": "React",
        "sql": "SQL",
        "mysql": "SQL",
        "postgresql": "SQL"
    }
    
    mapped_skill = skill_mapping.get(skill_lower)
    if mapped_skill and mapped_skill in PREDEFINED_ASSESSMENTS:
        return PREDEFINED_ASSESSMENTS[mapped_skill]
    
    return None

def get_video_recommendations(skill: str, score: float) -> List[Dict]:
    """Get curated video recommendations for a skill"""
    skill_lower = skill.lower()
    
    # Map skill names to video recommendations
    skill_mapping = {
        "python": "Python",
        "javascript": "JavaScript",
        "js": "JavaScript", 
        "react": "React",
        "reactjs": "React",
        "sql": "SQL",
        "mysql": "SQL",
        "postgresql": "SQL"
    }
    
    mapped_skill = skill_mapping.get(skill_lower)
    if mapped_skill and mapped_skill in VIDEO_RECOMMENDATIONS:
        videos = VIDEO_RECOMMENDATIONS[mapped_skill]
        
        # If score is low, recommend more videos
        if score < 40:  # Changed from 60 to 40 to recommend videos for scores below 40%
            return videos
        else:
            return []  # No videos needed for higher scores
    
    # Fallback for unknown skills
    return [{
        "video_title": f"Learn {skill} - Complete Tutorial",
        "video_url": f"https://www.youtube.com/results?search_query={skill}+tutorial+beginner",
        "description": f"Comprehensive tutorial to improve your {skill} skills"
    }]