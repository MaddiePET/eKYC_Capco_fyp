import cv2
import pytesseract
import re
import sys
import json

def extract_mykad_data(image_path):
    img = cv2.imread(image_path)
    if img is None:
        return {"error": "Image not found"}

    # Preprocessing for better accuracy
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    processed = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)[1]
    
    # PSM 3 is optimal for ID cards
    raw_text = pytesseract.image_to_string(processed, config='--psm 3')
    
    # Extract IC Number (Regex for 12 digits or XX-XX-XXXX)
    ic_pattern = r'\d{6}-?\d{2}-?\d{4}'
    ic_match = re.search(ic_pattern, raw_text)
    
    return {
        "ic_number": ic_match.group(0) if ic_match else "Unknown",
        "status": "Success" if ic_match else "Failed"
    }

if __name__ == "__main__":
    if len(sys.argv) > 1:
        # Process the temporary file path sent by the Node.js bridge
        result = extract_mykad_data(sys.argv[1])
        print(json.dumps(result)) # Output as JSON for the bridge to read