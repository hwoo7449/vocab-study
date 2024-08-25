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

## 2. 데이터베이스 구조 (Prisma 스키마로 업데이트)
```prisma
// This is your Prisma schema file,
// learn more about it in the docs: https://pris.ly/d/prisma-schema

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id            String    @id @default(cuid())
  name          String?
  email         String    @unique
  password      String
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  UserProgress  UserProgress[]
  UserStatistics UserStatistics[]
}

model Word {
  id            String    @id @default(cuid())
  day           Int
  english       String
  korean        String
  UserProgress  UserProgress[]
}

model UserProgress {
  id            String    @id @default(cuid())
  userId        String
  wordId        String
  status        String    // "완벽", "애매함", "모름" 중 하나
  masteredCount Int       @default(0)
  unsureCount   Int       @default(0)
  unknownCount  Int       @default(0)
  updatedAt     DateTime  @updatedAt
  user          User      @relation(fields: [userId], references: [id])
  word          Word      @relation(fields: [wordId], references: [id])
}

model UserStatistics {
  id                  String    @id @default(cuid())
  userId              String
  day                 Int
  totalWordsStudied   Int
  totalStudySessions  Int
  lastStudyDate       DateTime
  streak              Int
  updatedAt           DateTime  @updatedAt
  user                User      @relation(fields: [userId], references: [id])
}
```

## 3. API 엔드포인트
- POST /api/auth/signup: 회원가입
- POST /api/auth/login: 로그인
- GET /api/words/{day}: 특정 Day의 단어 목록 조회
- POST /api/progress: 사용자의 단어 학습 상태 업데이트
- GET /api/statistics/{userId}: 사용자의 학습 통계 조회

## 4. 주요 기능 구현 (진행 중)
- 사용자 인증 및 권한 관리 (NextAuth.js 사용)
- 단어 카드 표시 및 상호작용 (예정)
- 학습 진행 상황 실시간 업데이트 (예정)
- 개인별 학습 통계 생성 및 표시 (예정)

## 5. 확장 가능성
- 다양한 단어장 지원 (EBS 외 다른 단어장 추가)
- 학습 알고리즘 개선 (간격 반복 학습 등)
- 소셜 기능 (친구와 학습 진행 상황 공유)
- 모바일 앱 버전 개발