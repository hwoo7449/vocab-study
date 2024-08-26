# 영어 단어 학습 시스템 설계 및 데이터베이스 구조

## 1. 사용자 경험 흐름
1. 사용자가 원하는 Day를 선택
2. 선택한 Day의 단어들을 순서대로 표시
3. 영어 단어만 먼저 표시 (사용자가 뜻을 생각할 시간 제공)
4. 사용자가 카드를 클릭하면 한국어 뜻 표시
5. 사용자가 자신의 이해도에 따라 세 가지 상태 중 하나를 선택
   - 완벽 (Mastered)
   - 애매함 (Unsure)
   - 모름 (Unknown)
6. 선택한 상태를 데이터베이스에 저장
7. 다음 단어로 넘어감

### 데이터베이스 모델:
1. User: 사용자 정보 관리
2. Wordbook: 단어장 정보 관리
3. Word: 개별 단어 정보 관리
4. UserProgress: 사용자의 단어 학습 진행 상황 관리

### 주요 API 엔드포인트:
- /api/auth/[...nextauth]: 인증 관련 엔드포인트
- /api/wordbooks: 단어장 CRUD 작업
- /api/wordbooks/[id]/words: 특정 단어장의 단어 CRUD 작업

### 주요 페이지:
- /login: 로그인 페이지
- /admin/wordbooks: 단어장 관리 페이지
- /admin/wordbooks/[id]/words: 단어 관리 페이지

## 폴더 구조
```
vocab-study
│  .env
│  .eslintrc.json
│  .gitignore
│  DEVELOPMENT-GUIDELINES.md
│  LICENSE
│  next-env.d.ts
│  next.config.mjs
│  package-lock.json
│  package.json
│  postcss.config.mjs
│  PROJECT-STATUS.md
│  README.md
│  SYSTEM-DESIGN.md
│  tailwind.config.ts
│  tree.txt
│  tsconfig.json
│  
│                  
├─prisma
│  │  schema.prisma
│  │  
│  └─migrations
│      │  migration_lock.toml
│      │  
│      ├─20240825151707_init
│      │      migration.sql
│      │      
│      ├─20240826055718_add_word_model
│      │      migration.sql
│      │      
│      ├─20240826061947_add_user_progress
│      │      migration.sql
│      │      
│      ├─20240826072149_add_wordbook_model
│      │      migration.sql
│      │      
│      └─20240826072820_add_user_role
│              migration.sql
│              
├─public
│      next.svg
│      vercel.svg
│      
├─scripts
│  └─data_processing
│          ebs_wordmaster_extractor.py
│          
└─src
    │  middleware.ts
    │  
    ├─app
    │  │  favicon.ico
    │  │  globals.css
    │  │  layout.tsx
    │  │  page.tsx
    │  │  
    │  ├─admin
    │  │  │  layout.tsx
    │  │  │  
    │  │  └─wordbooks
    │  │      │  page.tsx
    │  │      │  
    │  │      └─[id]
    │  │          │  page.tsx
    │  │          │  
    │  │          └─words
    │  │                  page.tsx
    │  │                  
    │  ├─api
    │  │  ├─auth
    │  │  │  ├─signup
    │  │  │  │      route.ts
    │  │  │  │      
    │  │  │  └─[...nextauth]
    │  │  │          route.ts
    │  │  │          
    │  │  ├─progress
    │  │  │      route.ts
    │  │  │      
    │  │  ├─wordbooks
    │  │  │  │  route.ts
    │  │  │  │  
    │  │  │  └─[id]
    │  │  │      │  route.ts
    │  │  │      │  
    │  │  │      └─words
    │  │  │          │  route.ts
    │  │  │          │  
    │  │  │          └─[wordId]
    │  │  │                  route.ts
    │  │  │                  
    │  │  └─words
    │  │      └─[day]
    │  │              route.ts
    │  │              
    │  ├─dashboard
    │  │      page.tsx
    │  │      
    │  ├─login
    │  │      page.tsx
    │  │      
    │  ├─signup
    │  │      page.tsx
    │  │      
    │  └─study
    │      │  page.tsx
    │      │  
    │      └─[day]
    │              page.tsx
    │              
    ├─components
    │      AddWordForm.tsx
    │      AuthProvider.tsx
    │      EditWordForm.tsx
    │      LoadingSpinner.tsx
    │      WordCard.tsx
    │      
    ├─lib
    │      prisma.ts
    │      
    ├─middleware
    │      authMiddleware.ts
    │      
    ├─schemas
    │      wordbook.ts
    │      
    ├─styles
    ├─types
    │      next-auth.d.ts
    │      
    └─utils
            auth.ts
            safeLog.ts
```

## 5. 확장 가능성
- 다양한 단어장 지원 (EBS 외 다른 단어장 추가)
- 학습 알고리즘 개선 (간격 반복 학습 등)
- 소셜 기능 (친구와 학습 진행 상황 공유)
- 모바일 앱 버전 개발