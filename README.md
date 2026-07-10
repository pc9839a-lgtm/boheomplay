# 보험플레이

보험 질문 게시판형 사이트입니다.

## 공개 페이지

- `/` : 보험 질문 게시판
- `/q/[slug]` : 기존 질문형 보험 정보 페이지
- `/board/[slug]` : 사용자가 작성한 공개 질문 상세 페이지
- `/insurance/[slug]` : 보험 분야별 질문 모음
- `/case/[slug]` : 상황별 보험 점검 페이지

## 게시판 저장소

사용자가 작성한 질문은 Cloudflare KV에 저장됩니다.

필수 KV 바인딩:

```txt
BOARD_POSTS
```

공개 질문은 `/board/[slug]` 상세 페이지로 생성되어 검색엔진이 제목, 질문 내용, 답변을 읽을 수 있습니다.
비공개 질문은 상세 페이지를 만들지 않고 관리자에서만 확인합니다.

## 관리자 페이지

- `/admin/` : 관리자 전용 답변 관리 페이지
- `robots.txt`, `_headers`, `meta robots`로 검색 노출 차단
- 관리자 비밀번호는 코드에 저장하지 않고 Cloudflare Pages 환경변수로 관리

필수 환경변수:

```txt
ADMIN_PASSWORD
ADMIN_SESSION_SECRET
```

환경변수 또는 KV 바인딩 변경 후에는 Cloudflare Pages 재배포가 필요합니다.
