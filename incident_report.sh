#!/bin/bash

# ============================================================
# Incident Data Collector Script
# Collects incident information and outputs Excel + HTML files
# ============================================================

# Output filenames
CSV_FILE="incident_data.csv"
XLSX_FILE="incident_data.xlsx"
HTML_FILE="incident_data.html"

source /usr/lib/cgi-bin/temp/form.txt

#INPUT VALUES
INCIDENT_NUMBER=$INCIDENT_NUMBER
INCIDENT_TEXT=$INCIDENT_TEXT
ASSIGNEE=$ASSIGNEE
DEADLINE=$DEADLINE
ACTIONS=$ACTIONS

# If CSV doesn't exist, create header
if [ ! -f "$CSV_FILE" ]; then
    echo "incident_number,incident_text,assignee,dead_line,actions_taken" >> "$CSV_FILE"
fi

echo "=== Incident Data Entry ==="

echo "$INCIDENT_NUMBER,\"$INCIDENT_TEXT\",\"$ASSIGNEE\",$DEADLINE,\"$ACTIONS\"" >> "$CSV_FILE"


# Convert CSV to Excel (if ssconvert is available)
if command -v ssconvert &>/dev/null; then
    ssconvert "$CSV_FILE" "$XLSX_FILE" >/dev/null 2>&1
    echo "✅ Excel file created: $XLSX_FILE"
else
    echo "⚠️ ssconvert not found. Skipping Excel export."
fi

# Convert CSV to HTML table
if command -v csvformat &>/dev/null; then
    echo "<html><head><title>Incident Report</title></head><body><h2>Incident Report</h2><table border='1'>" > "$HTML_FILE"
    awk -F, 'NR==1{print "<tr>"; for(i=1;i<=NF;i++) print "<th>"$i"</th>"; print "</tr>"} NR>1{print "<tr>"; for(i=1;i<=NF;i++) print "<td>"$i"</td>"; print "</tr>"}' "$CSV_FILE" >> "$HTML_FILE"
    echo "</table></body></html>" >> "$HTML_FILE"
    echo "✅ HTML file created: $HTML_FILE"
else
    echo "⚠️ csvkit not found. Skipping HTML export."
fi

echo "🎉 Data collection complete!"
