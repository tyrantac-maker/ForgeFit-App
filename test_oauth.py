#!/usr/bin/env python3
"""
Test Google OAuth Session Exchange
"""

import asyncio
import httpx
import json

BASE_URL = "https://ai-trainer-forge.preview.emergentagent.com/api"

async def test_oauth_session():
    """Test the OAuth session exchange endpoint"""
    try:
        async with httpx.AsyncClient() as client:
            # Test with invalid session_id to see if endpoint is working
            response = await client.post(
                f"{BASE_URL}/auth/session",
                json={"session_id": "invalid_session_id_test"}
            )
            
            print(f"OAuth Session Exchange Test:")
            print(f"Status Code: {response.status_code}")
            print(f"Response: {response.text}")
            
            # We expect 401 for invalid session, which means endpoint is working
            if response.status_code == 401:
                print("✅ OAuth session exchange endpoint is working (correctly rejected invalid session)")
                return True
            else:
                print("❌ Unexpected response from OAuth session exchange")
                return False
                
    except Exception as e:
        print(f"🔥 Error testing OAuth session exchange: {e}")
        return False

async def main():
    await test_oauth_session()

if __name__ == "__main__":
    asyncio.run(main())