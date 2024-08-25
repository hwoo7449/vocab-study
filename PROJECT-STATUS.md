# 영어 단어 암기 사이트 개발 진행 상황

## 완료된 단계:
1. 프로젝트 초기 설정
   - GitHub 저장소 생성 (vocab-study)
   - Next.js 프로젝트 생성 (TypeScript 사용, App Router 선택)
   - 초기 커밋

2. 기본 브랜치 구조 설정
   - main 브랜치 사용 중

3. 기본 프로젝트 구조 설정
   - src/components, src/styles, src/lib, src/utils 폴더 생성
   - src/app 디렉토리 확인 (App Router 사용)
   - globals.css 위치 확인 (src/app/globals.css)

4. Vercel Postgres 설정
   - 로컬 PostgreSQL 데이터베이스 설치 및 설정
   - .env 파일 생성 및 환경 변수 설정
   - Prisma 설정 및 초기 마이그레이션 실행

## 현재 작업 중인 단계:
5. 사용자 인증 시스템 구현
   - NextAuth.js 설정
   - 회원가입 및 로그인 페이지 구현 중

6. API 엔드포인트 구현
   - 기본 구조 설계 중

## 다음 예정 단계:
7. 단어 학습 시스템 구현
8. 개인별 학습 통계 기능 구현

## 메모 및 특이사항:
- PostgreSQL과 Prisma를 사용한 데이터베이스 설정 완료
- NextAuth.js를 이용한 인증 시스템 구현 진행 중
- 환경 변수 관리를 위해 .env 파일 사용 중