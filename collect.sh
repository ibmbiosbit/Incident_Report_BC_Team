#!/bin/bash
# collect.sh — CGI form handler for HTMX or plain HTML

echo "Content-Type: text/html"
echo ""

# Ensure this is a POST request
if [ "$REQUEST_METHOD" != "POST" ]; then
    echo "<p>Error: Only POST method is supported.</p>"
    exit 1
fi

# Read POST data based on content length
if [ -n "$CONTENT_LENGTH" ]; then
    read -n "$CONTENT_LENGTH" POST_DATA
else
    echo "<p>Error: No POST data received.</p>"
    exit 1
fi

# URL decode function
urldecode() {
    local data="${1//+/ }"
    printf '%b' "${data//%/\\x}"
}

# Initialize empty variables

INCIDENT_NUMBER=""
INCIDENT_TEXT=""
ASSIGNEE=""
DEADLINE=""
ACTIONS=""

# Split POST data safely
IFS='&'
for pair in $POST_DATA; do
    key="${pair%%=*}"
    val="${pair#*=}"
    decoded_val="$(urldecode "$val")"
    if [ "$key" = "INCIDENT_NUMBER" ]; then
        INCIDENT_NUMBER="$decoded_val"
    elif [ "$key" = "INCIDENT_TEXT" ]; then
        INCIDENT_TEXT="$decoded_val"
    elif [ "$key" = "ASSIGNEE" ]; then
        ASSIGNEE="$decoded_val"
    elif [ "$key" = "DEADLINE" ]; then
        DEADLINE="$decoded_val"
    elif [ "$key" = "ACTIONS" ]; then
        ACTIONS="$decoded_val"
    
    fi
done
unset IFS

# Store in file
DATA_FILE="/usr/lib/cgi-bin/temp/form.txt"
{
    echo "INCIDENT_NUMBER=\"$INCIDENT_NUMBER\""
    echo "INCIDENT_TEXT=\"$INCIDENT_TEXT\""
    echo "ASSIGNEE=\"$ASSIGNEE\""
    echo "DEADLINE=\"$DEADLINE\""
    echo "ACTIONS=\"$ACTIONS\"" 

} > "$DATA_FILE"

# Output HTML back to browser
cat <<EOF
<p>✅ Data received successfully!</p>
<p><strong>Name:</strong> $ASSIGNEE</p>
<p><strong>DEADLINE:</strong> $DEADLINE</p>
<p>Saved in: $DATA_FILE</p>
EOF
# ==========================================
# Trigger Jenkins build remotely
# ==========================================

JENKINS_URL="http://ec2-54-196-155-95.compute-1.amazonaws.com:8080"
JOB_NAME="FORM_TO_EXCEL"
USER="rnbiosbit"
API_TOKEN="11663568b5973a77adbf001d82400da483"
TRIGGER_TOKEN="incident_token_123"

BUILD_URL="${JENKINS_URL}/job/${JOB_NAME}/build?token=${TRIGGER_TOKEN}"

echo "🔗 Triggering Jenkins job: $JOB_NAME"

curl -X POST "${BUILD_URL}" \
     --user "${USER}:${API_TOKEN}"

if [ $? -eq 0 ]; then
    echo "✅ Jenkins build triggered successfully!"
else
    echo "❌ Failed to trigger Jenkins build!"
fi
