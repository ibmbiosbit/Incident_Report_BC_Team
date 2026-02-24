#!/bin/bash
# collect.sh — CGI form handler

echo "Content-Type: text/html"
echo ""

# Only allow POST
if [ "$REQUEST_METHOD" != "POST" ]; then
    echo "<p>❌ Error: Only POST method is supported.</p>"
    exit 1
fi

# Read POST data
if [ -n "$CONTENT_LENGTH" ]; then
    read -n "$CONTENT_LENGTH" POST_DATA
else
    echo "<p>❌ Error: No POST data received.</p>"
    exit 1
fi

# URL decode function
urldecode() {
    local data="${1//+/ }"
    printf '%b' "${data//%/\\x}"
}

# Init variables
INCIDENT_NUMBER=""
INCIDENT_TEXT=""
ASSIGNEE=""
DEADLINE=""
ACTIONS=""

# Parse POST data
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

# CSV file location (on server)
CSV_FILE="/usr/lib/cgi-bin/temp/incidents.csv"

mkdir -p /usr/lib/cgi-bin/temp

# Create header if file does not exist
if [ ! -f "$CSV_FILE" ]; then
    echo "INCIDENT_NUMBER,INCIDENT_TEXT,ASSIGNEE,DEADLINE,ACTIONS,TIMESTAMP" > "$CSV_FILE"
fi

# Escape double quotes for CSV
esc() {
    echo "$1" | sed 's/"/""/g'
}

# Append row
echo "\"$(esc "$INCIDENT_NUMBER")\",\"$(esc "$INCIDENT_TEXT")\",\"$(esc "$ASSIGNEE")\",\"$(esc "$DEADLINE")\",\"$(esc "$ACTIONS")\",\"$(date '+%Y-%m-%d %H:%M:%S')\"" >> "$CSV_FILE"

# Response
cat <<EOF
<p>✅ Data received and saved successfully!</p>
<p><strong>Incident:</strong> $INCIDENT_NUMBER</p>
<p><strong>Assignee:</strong> $ASSIGNEE</p>
<p><strong>Saved to:</strong> $CSV_FILE</p>
EOF

# ==========================================
# Trigger Jenkins
# ==========================================

JENKINS_URL="http://ec2-54-196-155-95.compute-1.amazonaws.com:8080"
JOB_NAME="FORM_TO_EXCEL"
USER="rnbiosbit"
API_TOKEN="11663568b5973a77adbf001d82400da483"
TRIGGER_TOKEN="incident_token_123"

BUILD_URL="${JENKINS_URL}/job/${JOB_NAME}/build?token=${TRIGGER_TOKEN}"

curl -X POST "${BUILD_URL}" --user "${USER}:${API_TOKEN}"