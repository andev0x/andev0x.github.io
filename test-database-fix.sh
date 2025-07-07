#!/bin/bash

echo "🧪 Testing Database Fix..."
echo "=========================="

BASE_URL="https://go-blog-production-e388.up.railway.app"

echo "1. Testing POST comment endpoint..."
COMMENT_RESPONSE=$(curl -s -X POST \
  -H "Content-Type: application/json" \
  -d '{"author":"test","content":"test comment"}' \
  "$BASE_URL/api/v1/posts/test-slug/comments")

if [[ $COMMENT_RESPONSE == *"id"* ]] && [[ $COMMENT_RESPONSE == *"author"* ]]; then
    echo "✅ POST comment working: $COMMENT_RESPONSE"
    COMMENT_WORKING=true
else
    echo "❌ POST comment failed: $COMMENT_RESPONSE"
    COMMENT_WORKING=false
fi

echo ""
echo "2. Testing POST rating endpoint..."
RATING_RESPONSE=$(curl -s -X POST \
  -H "Content-Type: application/json" \
  -d '{"value":5}' \
  "$BASE_URL/api/v1/posts/test-slug/ratings")

if [[ $RATING_RESPONSE == *"id"* ]] && [[ $RATING_RESPONSE == *"value"* ]]; then
    echo "✅ POST rating working: $RATING_RESPONSE"
    RATING_WORKING=true
else
    echo "❌ POST rating failed: $RATING_RESPONSE"
    RATING_WORKING=false
fi

echo ""
echo "3. Testing GET comments to verify data persistence..."
GET_COMMENTS=$(curl -s "$BASE_URL/api/v1/posts/test-slug/comments")
if [[ $GET_COMMENTS == *"test"* ]]; then
    echo "✅ GET comments shows persisted data: $GET_COMMENTS"
    PERSISTENCE_WORKING=true
else
    echo "❌ GET comments doesn't show persisted data: $GET_COMMENTS"
    PERSISTENCE_WORKING=false
fi

echo ""
echo "=========================="
if [[ $COMMENT_WORKING == true ]] && [[ $RATING_WORKING == true ]] && [[ $PERSISTENCE_WORKING == true ]]; then
    echo "🎉 Database fix successful! Your blog is now fully functional."
    echo "   Comments and ratings will persist after page refresh."
else
    echo "⚠️  Database still needs fixing. Please run the SQL command in Railway."
    echo "   See the instructions above."
fi 