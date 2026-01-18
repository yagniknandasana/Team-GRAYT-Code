# AUHackathon API Documentation (v1.0)

## Overview
This documentation outlines the RESTful API endpoints for **AUHackathon**, designed to allow external Learning Management Systems (LMS), Universities, and MOOC platforms (e.g., Coursera, Udemy) to integrate with our skill intelligence system.

**Base URL**: `https://api.auhackathon.ai/v1` (Mock Environment)

---

## Authentication
All API requests require an API Key to be passed in the header.
`Authorization: Bearer <YOUR_API_KEY>`

--- 

## 1. User Profile & Skills
Allow external platforms to read a student's current skill gap to tailor their course content.

### Get User Skill Profile
**GET** `/users/{userId}/skills`

**Response:**
```json
{
  "userId": "12345",
  "domain": "Healthcare Technology",
  "specialization": "Cardiology",
  "readinessScore": 78,
  "skills": [
    {
      "name": "Cardiac Anatomy",
      "level": "Intermediate",
      "verified": true
    },
    {
      "name": "ECG Interpretation",
      "level": "Beginner",
      "verified": false
    }
  ]
}
```

---

## 2. External Certifications (Write Access)
Allow platforms to automatically update a user's AUHackathon profile when they complete an external course.

### Post New Certification
**POST** `/users/{userId}/certifications`

**Request Body:**
```json
{
  "provider": "Coursera",
  "courseName": "Advanced Cardiac Imaging",
  "completionDate": "2024-10-15",
  "skillsAwarded": [
    {
      "name": "MRI Interpretation",
      "level": "Advanced"
    }
  ],
  "certificateUrl": "https://coursera.org/verify/xyz"
}
```

**Response:** `200 OK`
*Action: System automatically recalculates the user's Readiness Score.*

---

## 3. Intelligence Engine
Access AUHackathon's AI logic to get gap analysis for a cohort of students.

### Get Cohort Gap Analysis
**GET** `/analytics/skills/gaps?specialization=Cardiology`

**Response:**
```json
{
  "specialization": "Cardiology",
  "commonGaps": [
    { "skill": "Robotic Surgery Basics", "frequency": "65%" },
    { "skill": "Telemedicine Protocols", "frequency": "40%" }
  ],
  "recommendedFocus": "Digital Health Literacy"
}
```
