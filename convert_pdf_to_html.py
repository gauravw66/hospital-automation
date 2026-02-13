import fitz  # PyMuPDF
import os
from pathlib import Path

def convert_pdfs_to_html(input_dir, output_root):
    """
    Converts all PDF files in input_dir to HTML pages, 
    stored in folders inside output_root.
    """
    input_path = Path(input_dir)
    output_path = Path(output_root)
    
    # Create main html folder if it doesn't exist
    output_path.mkdir(parents=True, exist_ok=True)
    
    pdf_files = list(input_path.glob("*.pdf"))
    
    if not pdf_files:
        print(f"No PDF files found in {input_dir}")
        return

    for pdf_file in pdf_files:
        pdf_name = pdf_file.stem
        # Create a folder for this specific PDF inside the html folder
        pdf_output_dir = output_path / pdf_name
        pdf_output_dir.mkdir(parents=True, exist_ok=True)
        
        print(f"Processing: {pdf_file.name}")
        
        try:
            with fitz.open(pdf_file) as doc:
                for page_num in range(len(doc)):
                    page = doc.load_page(page_num)
                    
                    # Get the HTML representation of the page
                    html_content = page.get_text("html")
                    
                    # Get page dimensions
                    rect = page.rect
                    width = rect.width
                    height = rect.height
                    
                    # Wrap content
                    styled_html = f"""<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>{pdf_name} - Page {page_num + 1}</title>
    <style>
        body {{
            margin: 0;
            padding: 20px;
            background-color: #e0e0e0;
            font-family: sans-serif;
            display: flex;
            flex-direction: column;
            align-items: center;
        }}
        .page-container {{
            width: {width}pt;
            height: {height}pt;
            background-color: white;
            position: relative;
            overflow: hidden;
            box-shadow: 0 4px 15px rgba(0,0,0,0.2);
            box-sizing: border-box;
        }}
        /* Ensure the content inside respects the container */
        .page-container > div {{
            position: absolute !important;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
        }}
    </style>
</head>
<body>
    <div class="page-container">
        {html_content}
    </div>
</body>
</html>"""
                    output_filename = pdf_output_dir / f"page_{page_num + 1}.html"
                    output_filename.write_text(styled_html, encoding="utf-8")
                
                print(f"Successfully converted {pdf_file.name} ({len(doc)} pages)")
            
        except Exception as e:
            import traceback
            print(f"Failed to convert {pdf_file.name}: {e}")
            traceback.print_exc()

if __name__ == "__main__":
    # Define paths
    BASE_DIR = r"g:\INTERNSHIP\hospital-automation"
    INPUT_DIR = os.path.join(BASE_DIR, "files")
    OUTPUT_DIR = os.path.join(INPUT_DIR, "html")
    
    convert_pdfs_to_html(INPUT_DIR, OUTPUT_DIR)
