#!/usr/bin/env python3
"""
Script to register a demo user for testing
"""
import requests
import json

# Demo user data
demo_user = {
    "email": "demo@farmconnect.com",
    "phone": "+2348012345678",
    "username": "demouser",
    "first_name": "Demo",
    "last_name": "User",
    "address": "123 Demo Street",
    "city": "Lagos",
    "state": "Lagos",
    "country": "Nigeria",
    "role": "buyer",
    "user_type": "individual",
    "password": "Demo1234",
    "confirm_password": "Demo1234",
    "terms_agreed": True
}

# Register the user
try:
    response = requests.post(
        "http://localhost:8002/api/auth/register",
        json=demo_user,
        headers={"Content-Type": "application/json", "Origin": "http://localhost:3000"}
    )
    
    print(f"Status Code: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")
    
    if response.status_code == 201:
        print("\nDemo user registered successfully!")
        print("Check the backend console for the verification code.")
        result = response.json()
        print(f"\nVerification code will be sent to: {demo_user['email']}")
        print("Check backend console logs for the verification code.")
    else:
        print(f"\nRegistration failed: {response.json()}")
        
except requests.exceptions.RequestException as e:
    print(f"Error connecting to backend: {e}")
    print("Make sure the backend is running on http://localhost:8002")

