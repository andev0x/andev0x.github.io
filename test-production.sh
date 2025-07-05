#!/bin/bash

echo "🧪 Testing Production Backend..."
echo "=================================="

BASE_URL="https://go-blog-production-e388.up.railway.app"

echo "1. Testing health endpoint..."
HEALTH_RESPONSE=$(curl -s "$BASE_URL/test")
if [[ $HEALTH_RESPONSE == *"Test endpoint working"* ]]; then
    echo "✅ Health check passed"
else
    echo "❌ Health check failed: $HEALTH_RESPONSE"
    exit 1
fi

echo ""
echo "2. Testing GET comments endpoint..."
COMMENTS_RESPONSE=$(curl -s "$BASE_URL/api/v1/posts/test-slug/comments")
if [[ $COMMENTS_RESPONSE == "[]" ]] || [[ $COMMENTS_RESPONSE == *"author"* ]]; then
    echo "✅ GET comments working: $COMMENTS_RESPONSE"
else
    echo "❌ GET comments failed: $COMMENTS_RESPONSE"
fi

echo ""
echo "3. Testing POST comment endpoint..."
POST_RESPONSE=$(curl -s -X POST \
  -H "Content-Type: application/json" \
  -d '{"author":"test","content":"test comment"}' \
  "$BASE_URL/api/v1/posts/test-slug/comments")

if [[ $POST_RESPONSE == *"author"* ]] && [[ $POST_RESPONSE == *"id"* ]]; then
    echo "✅ POST comment working: $POST_RESPONSE"
else
    echo "❌ POST comment failed: $POST_RESPONSE"
    echo "   This means the backend needs to be redeployed!"
fi

echo ""
echo "4. Testing POST rating endpoint..."
RATING_RESPONSE=$(curl -s -X POST \
  -H "Content-Type: application/json" \
  -d '{"value":5}' \
  "$BASE_URL/api/v1/posts/test-slug/ratings")

if [[ $RATING_RESPONSE == *"value"* ]] && [[ $RATING_RESPONSE == *"id"* ]]; then
    echo "✅ POST rating working: $RATING_RESPONSE"
else
    echo "❌ POST rating failed: $RATING_RESPONSE"
    echo "   This means the backend needs to be redeployed!"
fi

echo ""
echo "=================================="
if [[ $POST_RESPONSE == *"author"* ]] && [[ $RATING_RESPONSE == *"value"* ]]; then
    echo "🎉 All tests passed! Your backend is working correctly."
    echo "   Your frontend should now be able to save and retrieve data."
else
    echo "⚠️  Some tests failed. Please redeploy your backend."
    echo "   See DEPLOYMENT_GUIDE.md for instructions."
fi 