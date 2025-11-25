# Convert CSV to sorted HTML FILE

INPUT="/var/lib/jenkins/workspace/FORM_TO_EXCELV2/incident_data.csv"
SORTED="/var/lib/jenkins/workspace/FORM_TO_EXCELV2/SORTED.csv"
OUTPUT="/var/lib/jenkins/workspace/FORM_TO_EXCELV2/SORTED.html"

# 1. Sort by column A (column 1)
#    -t, sets comma as delimiter
#    -k1,1 sorts on column 1 only
sort -t, -k1,1 "$INPUT" > "$SORTED"

# 2. Convert sorted CSV to HTML

{
echo "<html>"
echo "<head><title>CSV to HTML</title></head>"
echo "<body>"
echo "<table border=\"1\">"

# Read and convert line-by-line
while IFS=',' read -r erp_group incident_change incident_text assignee dead_line status actions_taken; do
    echo "  <tr><td>$erp_group</td><td>$incident_change</td><td>$incident_text</td><td>$assignee</td><td>$dead_line</td><td>$status</td><td>$actions_taken</td></tr>"
done < "$SORTED"

echo "</table>"
echo "</body>"
echo "</html>"
} > "$OUTPUT"

echo "Done! Sorted CSV saved as $SORTED and HTML table saved as $OUTPUT."


echo "🎉 Data collection complete!"
