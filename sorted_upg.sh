#!/bin/sh
# Usage: ./sort_multiline_table.sh input.html output.html

INPUT="/var/lib/jenkins/workspace/FORM_TO_EXCELV2/incident_data.html"
OUTPUT="/var/lib/jenkins/workspace/FORM_TO_EXCELV2/SORTED_FINAL.html"

# Temporary files
TMP_TABLE=$(mktemp)
TMP_ROWS=$(mktemp)
TMP_SORT=$(mktemp)

# --- 1. Extract ONLY the table content (between <table> and </table>) ---
sed -n '/<table/,/<\/table>/p' "$INPUT" > "$TMP_TABLE"

# --- 2. Extract multi-line <tr>...</tr> blocks ---
# Convert each <tr>...</tr> block into a SINGLE line
awk '
    BEGIN { RS="</tr>"; ORS="" }
    /<tr/ {
        block = $0 "</tr>"
        gsub(/\n/, " ", block)   # flatten to one line
        print block "\n"
    }
' "$TMP_TABLE" > "$TMP_ROWS"

# --- 3. Keep the FIRST row unchanged ---
FIRST_ROW=$(head -n 1 "$TMP_ROWS")

# --- 4. Extract remaining rows ---
tail -n +2 "$TMP_ROWS" > "$TMP_ROWS.rest"

# --- 5. Sort by first <td> content ---
(
while IFS= read -r ROW; do
    COLA=$(echo "$ROW" | sed -n 's/.*<td[^>]*>\([^<]*\)<\/td>.*/\1/p')
    printf "%s\t%s\n" "$COLA" "$ROW"
done < "$TMP_ROWS.rest"
) | sort -f -t $'\t' -k1,1 > "$TMP_SORT"

# --- 6. Build new table inside output file ---
{
    # print everything BEFORE <table>
    sed '/<table/ q' "$INPUT"

    echo "<table>"

    # print FIRST ROW
    echo "$FIRST_ROW"

    # print sorted rows (remove sort key)
    cut -f2- "$TMP_SORT"

    echo "</table>"

    # print everything AFTER </table>
    sed -n '/<\/table>/,$p' "$INPUT" | sed '1d'
} > "$OUTPUT"

echo "Sorted table saved to $OUTPUT"

# Cleanup
rm -f "$TMP_TABLE" "$TMP_ROWS" "$TMP_ROWS.rest" "$TMP_SORT"
