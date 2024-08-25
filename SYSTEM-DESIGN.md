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

## 2. 데이터베이스 구조
### 사용자 테이블 (users)
- id: 고유 식별자
- username: 사용자 이름
- email: 이메일 주소
- password_hash: 암호화된 비밀번호
- created_at: 계정 생성 시간
- updated_at: 계정 정보 수정 시간

### 단어 테이블 (words)
- id: 고유 식별자
- day: 학습 일차
- english: 영어 단어
- korean: 한국어 뜻

### 사용자 학습 진행 테이블 (user_progress)
- id: 고유 식별자
- user_id: 사용자 ID (외래 키)
- word_id: 단어 ID (외래 키)
- status: 현재 학습 상태 (완벽, 애매함, 모름)
- mastered_count: '완벽' 상태를 선택한 횟수
- unsure_count: '애매함' 상태를 선택한 횟수
- unknown_count: '모름' 상태를 선택한 횟수
- updated_at: 상태 업데이트 시간

### 사용자 통계 테이블 (user_statistics)
- id: 고유 식별자
- user_id: 사용자 ID (외래 키)
- day: 학습 일차
- total_words_studied: 총 학습한 단어 수
- total_study_sessions: 총 학습 세션 수
- last_study_date: 마지막 학습 날짜
- streak: 연속 학습 일수
- updated_at: 통계 업데이트 시간

## 3. API 엔드포인트
- POST /api/auth/signup: 회원가입
- POST /api/auth/login: 로그인
- GET /api/words/{day}: 특정 Day의 단어 목록 조회
- POST /api/progress: 사용자의 단어 학습 상태 업데이트
- GET /api/statistics/{userId}: 사용자의 학습 통계 조회

## 4. 주요 기능 구현
- 사용자 인증 및 권한 관리
- 단어 카드 표시 및 상호작용
- 학습 진행 상황 실시간 업데이트
- 개인별 학습 통계 생성 및 표시

## 5. 확장 가능성
- 다양한 단어장 지원 (EBS 외 다른 단어장 추가)
- 학습 알고리즘 개선 (간격 반복 학습 등)
- 소셜 기능 (친구와 학습 진행 상황 공유)
- 모바일 앱 버전 개발