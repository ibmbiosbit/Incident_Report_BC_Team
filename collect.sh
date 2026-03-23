#!/bin/bash
# collect.sh — CGI form handler (CSV + Jenkins + Duplicate Protection)

echo "Content-Type: text/html"
echo ""

# Allow only POST
if [ "$REQUEST_METHOD" != "POST" ]; then
    echo "<p>❌ Error: Only POST method allowed.</p>"
    exit 1
fi

# Read POST data
if [ -n "$CONTENT_LENGTH" ]; then
    read -n "$CONTENT_LENGTH" POST_DATA
else
    echo "<p>❌ Error: No POST data received.</p>"
    exit 1
fi

# URL decode
urldecode() {
    local data="${1//+/ }"
    printf '%b' "${data//%/\\x}"
}

# Initialize variables
PROJECT_TITLE=""
INCIDENT_NUMBER=""
INCIDENT_TEXT=""
ASSIGNEE=""
START_DATE=""
DEADLINE=""
PRIORITY=""
STATUS=""
ACTIONS=""

# Parse POST data
IFS='&'
for pair in $POST_DATA; do
    key="${pair%%=*}"
    val="${pair#*=}"
    decoded_val="$(urldecode "$val")"

    case "$key" in
        PROJECT_TITLE) PROJECT_TITLE="$decoded_val" ;;
        INCIDENT_NUMBER) INCIDENT_NUMBER="$decoded_val" ;;
        INCIDENT_TEXT) INCIDENT_TEXT="$decoded_val" ;;
        ASSIGNEE) ASSIGNEE="$decoded_val" ;;
        START_DATE) START_DATE="$decoded_val" ;;
        DEADLINE) DEADLINE="$decoded_val" ;;
        PRIORITY) PRIORITY="$decoded_val" ;;
        STATUS) STATUS="$decoded_val" ;;
        ACTIONS) ACTIONS="$decoded_val" ;;
    esac
done
unset IFS

CSV_DIR="/usr/lib/cgi-bin/temp"
CSV_FILE="$CSV_DIR/incidents.csv"

mkdir -p "$CSV_DIR"

# Create CSV with updated headers if missing
if [ ! -f "$CSV_FILE" ]; then
    echo "ERP_PROJECT,INCIDENT_NUMBER,INCIDENT_TEXT,ASSIGNEE,START_DATE,DEADLINE,CATEGORY,STATUS,ACTIONS,TIMESTAMP" > "$CSV_FILE"
fi

# ==========================================
# DUPLICATE CHECK
# ==========================================

if awk -F',' -v inc="$INCIDENT_NUMBER" '
NR>1 {
gsub(/"/,"",$2)
if ($2 == inc) {
print "duplicate"
exit
}
}' "$CSV_FILE" | grep -q duplicate
then
    echo "<p style='color:red;'>❌ Duplicate incident number detected. Entry already exists.</p>"
    exit 0
fi

# CSV escape
esc() {
    echo "$1" | sed 's/"/""/g'
}

# Append row
echo "\"$(esc "$PROJECT_TITLE")\",\"$(esc "$INCIDENT_NUMBER")\",\"$(esc "$INCIDENT_TEXT")\",\"$(esc "$ASSIGNEE")\",\"$(esc "$START_DATE")\",\"$(esc "$DEADLINE")\",\"$(esc "$PRIORITY")\",\"$(esc "$STATUS")\",\"$(esc "$ACTIONS")\",\"$(date '+%Y-%m-%d %H:%M:%S')\"" >> "$CSV_FILE"

# Response
cat <<EOF
<p>✅ Data saved successfully!</p>
<p><strong>Incident:</strong> $INCIDENT_NUMBER</p>
<p><strong>Assignee:</strong> $ASSIGNEE</p>
<p><strong>Category:</strong> $PRIORITY</p>
<p><strong>Status:</strong> $STATUS</p>
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

curl -s -X POST "${BUILD_URL}" --user "${USER}:${API_TOKEN}" > /dev/null
