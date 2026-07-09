# 보험플레이 SEO 자동 페이지 사이트

보험플레이는 보험 질문형 키워드 SEO와 상담 전환을 위한 정적/서버 렌더링 혼합 사이트입니다.

## 구조

- `index.html` : 메인 랜딩
- `functions/_content.js` : 카테고리, 질문, 상황별 페이지 데이터
- `functions/q/[slug].js` : 질문 상세 페이지 자동 렌더링
- `functions/insurance/[slug].js` : 카테고리 허브 페이지 자동 렌더링
- `functions/case/[slug].js` : 상황별 전환 페이지 자동 렌더링
- `functions/sitemap.xml.js` : sitemap.xml 자동 생성
- `assets/css/styles.css` : 전체 디자인
- `assets/js/main.js` : 메뉴, 상담폼, 개인정보 모달, 추적 필드

## 질문 추가 방법

`functions/_content.js`의 `questions` 배열에 아래 형식으로 항목을 추가하면 `/q/slug` 페이지가 자동 생성됩니다.

```js
{
  slug: 'example-question-slug',
  category: 'silbi',
  title: '질문 제목',
  keyword: '노릴 키워드',
  audience: '대상자',
  summary: ['요약1', '요약2', '요약3'],
  checks: ['체크1', '체크2', '체크3'],
  cta: '상담 CTA'
}
```

## 주의

보험 콘텐츠는 보험료, 보장 내용, 가입 가능 여부를 단정하지 않아야 합니다. 특정 상품 추천보다 상담 전 확인 기준과 체크리스트 중심으로 운영합니다.
