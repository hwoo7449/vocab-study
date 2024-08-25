# 개발 세부 지침 (App Router 사용을 반영한 수정)

1. 프로젝트 초기 설정 (완료)
   - GitHub에 새 저장소 생성 (vocab-study)
   - Next.js 프로젝트 생성: `npx create-next-app@latest vocab-study --typescript`
   - App Router 선택

2. 기본 브랜치 구조 설정 (완료)
   - main 브랜치 사용 중 (기본 브랜치)
   - 향후 필요시 develop, feature 브랜치 생성 고려

3. 기본 프로젝트 구조 설정 (완료)
   - src/components, src/styles, src/lib, src/utils 폴더 생성
   - src/app 디렉토리 확인 (layout.tsx, page.tsx 포함)
   - 전역 스타일 설정 (src/app/globals.css)

4. 사용자 인증 시스템 구현 (부분 완료)
   - 회원가입 페이지 생성 (src/app/signup/page.tsx)
   - 로그인 페이지 생성 (src/app/login/page.tsx)
   - JWT 토큰 관리 유틸리티 함수 작성 (src/utils/auth.ts)
   - API 라우트 생성 (src/app/api/auth/[...nextauth]/route.ts)

5. Vercel Postgres 설정 (완료)
   - 로컬 PostgreSQL 데이터베이스 설정
   - 환경 변수 설정 (.env 파일 생성)
   - 데이터베이스 연결 설정 (prisma/schema.prisma)

6. 데이터베이스 스키마 구현 (완료)
   - Prisma 스키마 정의
   - 초기 마이그레이션 실행

7. API 엔드포인트 구현 (진행 중)
   - "시스템 설계 및 데이터베이스 구조.md" 파일의 API 엔드포인트 목록에 따라 구현
   - API 라우트 파일 생성 및 로직 구현 (src/app/api/ 디렉토리 내)

8. 단어 학습 시스템 구현
   - Day 선택 페이지 생성 (src/app/study/page.tsx)
   - 단어 카드 컴포넌트 생성 (src/components/WordCard.tsx)
   - 학습 상태 선택 UI 구현 (src/components/LearningStatus.tsx)
   - 학습 진행 상황 실시간 업데이트 기능 구현

9. 개인별 학습 통계 기능 구현
   - 통계 페이지 생성 (src/app/statistics/page.tsx)
   - 차트 컴포넌트 구현 (src/components/StatisticsChart.tsx)

10. 프론트엔드 UI 개발
    - 반응형 레이아웃 구현
    - 사용자 경험을 고려한 애니메이션 및 전환 효과 추가

11. 테스트 및 디버깅
    - 단위 테스트 작성 및 실행
    - 통합 테스트 구현
    - 성능 최적화

12. 보안 강화
    - 입력 데이터 검증 및 살균
    - CSRF 보호 구현
    - Rate limiting 적용

13. 배포 준비
    - 환경 변수 설정 확인
    - 빌드 스크립트 최적화
    - Vercel 배포 설정

14. 문서화
    - README.md 업데이트
    - API 문서 작성
    - 사용자 가이드 작성

15. 지속적 통합 및 배포 (CI/CD) 설정
    - GitHub Actions 워크플로우 구성
    - 자동 테스트 및 배포 파이프라인 구축

각 단계를 완료할 때마다 적절한 커밋을 생성하고, 필요한 경우 feature 브랜치를 만들어 작업하세요. 정기적으로 main 브랜치로 병합하여 배포를 진행하세요.