import os
import shutil

def organize_files(src_dirs, result_dir, exclude_dirs):
    # 스크립트의 현재 위치를 기준으로 프로젝트 루트 경로 계산
    project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
    
    # 결과 디렉토리의 절대 경로 계산
    result_dir = os.path.join(project_root, result_dir)

    # 결과 디렉토리 생성 (이미 존재하는 경우 무시)
    os.makedirs(result_dir, exist_ok=True)

    for src_dir in src_dirs:
        # 소스 디렉토리의 절대 경로 계산
        src_dir = os.path.join(project_root, src_dir)

        for root, _, files in os.walk(src_dir):
            # 제외할 디렉토리인지 확인
            if any(excluded in root for excluded in exclude_dirs):
                continue

            for file in files:
                if file.endswith(('.ts', '.tsx', '.prisma')):
                    # 원본 파일의 전체 경로
                    src_path = os.path.join(root, file)
                    
                    # 새 파일 이름 생성
                    rel_path = os.path.relpath(src_path, project_root)
                    new_name = rel_path.replace(os.path.sep, '_')
                    
                    # 새 파일의 전체 경로
                    dest_path = os.path.join(result_dir, new_name)
                    
                    # 파일 복사
                    shutil.copy2(src_path, dest_path)
                    print(f"Copied: {src_path} -> {dest_path}")

# 스크립트 실행
if __name__ == "__main__":
    src_directories = ["src", "prisma"]  # 처리할 디렉토리들
    result_directory = "project_knowledge"  # 결과 디렉토리 (프로젝트 루트 기준)
    exclude_directories = ["prisma/migrations"]  # 제외할 디렉토리들
    organize_files(src_directories, result_directory, exclude_directories)