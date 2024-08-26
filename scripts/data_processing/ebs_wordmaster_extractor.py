import pdfplumber
import pandas as pd
import re

def extract_text_from_pdf(pdf_path):
    with pdfplumber.open(pdf_path) as pdf:
        all_text = []
        for page in pdf.pages:
            width = page.width
            left_part = page.crop((0, 0, width/2, page.height))
            right_part = page.crop((width/2, 0, width, page.height))
            left_text = left_part.extract_text()
            right_text = right_part.extract_text()
            all_text.extend([left_text, right_text])
    return all_text

def process_text_file1(text_parts):
    data = []
    current_day = 1
    current_word = ''
    current_meaning = ''

    for text in text_parts:
        lines = text.split('\n')
        for line in lines:
            if '워마 EBS 파이널' in line:
                current_day = int(re.search(r'\d+', line).group())
                continue
            
            match = re.match(r'(\d+):\s*(.+)\s*▶\s*(.+)', line)
            if match:
                if current_word:
                    clean_meaning = re.sub(r'애니보카\(anyvoca\.com\).*|-\d+-|☎ \d{3}-\d{4}-\d{4}', '', current_meaning)
                    data.append([current_day, current_word.strip(), clean_meaning.strip()])
                    current_word = ''
                    current_meaning = ''
                _, current_word, current_meaning = match.groups()
            elif '▶' in line:
                parts = line.split('▶')
                if len(parts) == 2:
                    if current_word:
                        current_word += ' ' + parts[0].strip()
                    current_meaning += ' ' + parts[1].strip()
            elif current_word:
                current_meaning += ' ' + line.strip()

    if current_word:
        clean_meaning = re.sub(r'애니보카\(anyvoca\.com\).*|-\d+-|☎ \d{3}-\d{4}-\d{4}', '', current_meaning)
        data.append([current_day, current_word.strip(), clean_meaning.strip()])

    return data

def process_text_file2(text_parts):
    data = {}
    current_day = 1
    for text in text_parts:
        lines = text.split('\n')
        for line in lines:
            if 'Day' in line:
                match = re.search(r'Day (\d+)~(\d+)', line)
                if match:
                    current_day = int(match.group(1))
                continue
            
            match = re.match(r'(\d+)\s+(\w+)\s+(.*)', line)
            if match:
                _, word, meaning = match.groups()
                if word not in data:
                    data[word] = [current_day, meaning.strip()]

    return data

def merge_data(file1_data, file2_data):
    merged_data = []
    for day, word, meaning in file1_data:
        if word in file2_data:
            merged_data.append([day, word, file2_data[word][1]])
        else:
            merged_data.append([day, word, meaning])
    return merged_data

def save_to_excel(data, output_path):
    df = pd.DataFrame(data, columns=['Day', 'English', 'Korean'])
    df.index = range(1, len(df) + 1)  # ID 열 추가
    df = df.reset_index().rename(columns={'index': 'ID'})
    df.to_excel(output_path, index=False, engine='openpyxl')

# 메인 실행 부분
pdf_path1 = '워드마스터 ebs파이널 1번 파일.pdf'
pdf_path2 = '워드마스터 파이널1200 2번 파일.pdf'
excel_output = 'final_output.xlsx'

text_parts1 = extract_text_from_pdf(pdf_path1)
text_parts2 = extract_text_from_pdf(pdf_path2)

file1_data = process_text_file1(text_parts1)
file2_data = process_text_file2(text_parts2)

merged_data = merge_data(file1_data, file2_data)
save_to_excel(merged_data, excel_output)

print(f"처리된 항목 수: {len(merged_data)}")
print("최종 Excel 파일이 생성되었습니다.")