import { SITE } from './_content.js';

const KLIA = 'https://www.klia.or.kr/klia/company/member/list.do';
const DATE = '2026-07-15';
const BASE = 'https://boheomplay.pagero.kr';
const esc = (value = '') => String(value).replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
const safeJson = (value) => JSON.stringify(value).replace(/&/g, '\\u0026').replace(/</g, '\\u003c').replace(/>/g, '\\u003e');
const paragraphs = (items) => items.map((item) => `<p>${esc(item)}</p>`).join('');

export const dailyQuestions20260715 = [
  {
    slug: 'ibk-pension-annuity-start-payment-check', no: 1047, cs: 'ibk-pension', cn: 'IBK연금보험', url: 'https://www.ibki.co.kr',
    title: 'IBK연금보험 연금 개시 전에 지급개시일과 지급계좌를 무엇부터 확인해야 하나요?',
    intent: 'IBK연금보험 연금 지급개시일 지급주기 지급계좌 사전 확인',
    q: ['IBK연금보험 계약의 연금 개시 시점이 가까워졌다는 안내를 받았습니다. 가입할 때 정한 날짜가 오래전이라 현재 계약에 어떤 지급개시일이 등록돼 있는지 정확히 기억나지 않습니다.', '매월 받는 방식인지 다른 지급주기를 선택한 상태인지, 예전에 등록한 계좌가 그대로 사용되는지도 확인하고 싶습니다.', '연금 지급이 시작되기 전에 계약자가 준비해야 할 신청 절차와 확인할 항목이 무엇인지 궁금합니다.'],
    a: ['연금 지급은 계약의 연금개시일, 연금 지급형태, 지급주기와 계약상 수령인 정보에 따라 처리됩니다. 같은 연금보험이라도 가입 시점과 선택한 형태에 따라 지급 조건이 다를 수 있습니다.', '지급개시일이 다가오면 현재 계약에 등록된 지급계좌와 연락처가 유효한지 확인하고, 별도의 연금개시 신청이나 본인확인 자료가 필요한지 공식 안내를 확인해야 합니다.', 'IBK연금보험 공식 홈페이지 또는 고객센터에서 계약번호를 기준으로 연금개시일, 지급주기, 수령인, 지급계좌와 준비서류를 확인하고 처리 완료 여부를 남겨두는 편이 안전합니다.'],
    p: '연금 개시 전에는 예상 수령액보다 계약에 등록된 개시일·지급형태·수령계좌가 현재 의사와 일치하는지 먼저 확인해야 합니다.',
    c: ['계약의 연금개시일과 최초 지급 예정일', '종신형·확정형 등 선택된 연금 지급형태', '월·분기·연 등 등록된 지급주기', '연금 수령인과 지급계좌 명의', '연금개시 신청 및 본인확인 서류 필요 여부'],
    z: 'IBK연금보험 공식 계약조회에서 개시 조건을 확인한 뒤, 변경이나 신청이 필요하면 최초 지급일 전에 공식 절차로 처리하세요.'
  },
  {
    slug: 'kyobo-lifeplanet-electronic-policy-documents', no: 1046, cs: 'kyobo-lifeplanet', cn: '교보라이프플래닛', url: 'https://www.lifeplanet.co.kr',
    title: '교보라이프플래닛 온라인 보험의 전자청약서와 약관을 다시 확인하려면 어떻게 하나요?',
    intent: '교보라이프플래닛 전자청약서 상품설명서 약관 재확인 방법',
    q: ['교보라이프플래닛에서 온라인으로 가입한 보험이 있는데 가입 당시 받은 이메일과 파일을 찾지 못하고 있습니다.', '현재 보장내용을 확인하려고 전자청약서, 상품설명서와 약관을 다시 보고 싶지만 계약조회 화면에서 어떤 문서를 봐야 하는지 헷갈립니다.', '가입 당시 문서와 현재 홈페이지에 공개된 약관이 다를 수 있는지, 계약 기준 문서를 어떻게 확인해야 하나요?'],
    a: ['보험계약의 적용 기준은 일반적으로 가입 당시 교부된 청약서, 상품설명서와 해당 계약에 적용되는 약관을 함께 확인해야 합니다. 현재 판매 페이지의 안내만으로 과거 계약 내용을 판단하면 차이가 생길 수 있습니다.', '전자문서를 다시 받을 때는 단순 상품 안내가 아니라 본인의 계약번호와 가입일이 연결된 문서인지 확인해야 합니다. 계약 변경 이력이 있다면 변경 전후 내역도 함께 살펴봐야 합니다.', '교보라이프플래닛 공식 계약조회나 고객지원에서 전자청약서, 보험증권, 상품설명서와 적용 약관의 재확인 또는 발급 방법을 확인하세요.'],
    p: '현재 공개된 상품 페이지보다 내 계약번호와 가입일에 적용되는 전자문서를 기준으로 확인하는 것이 핵심입니다.',
    c: ['계약번호와 가입일', '전자청약서와 보험증권의 계약자·피보험자 정보', '가입 당시 상품설명서의 주요 내용', '계약에 적용되는 약관의 명칭과 시행일', '계약 변경·특약 변경 이력'],
    z: '교보라이프플래닛 공식 경로에서 계약별 문서를 다시 확인하고, 문서의 상품명·가입일·약관 시행일이 계약정보와 일치하는지 살펴보세요.'
  },
  {
    slug: 'hanwha-life-policy-loan-limit-rate-check', no: 1045, cs: 'hanwha-life', cn: '한화생명', url: 'https://www.hanwhalife.com',
    title: '한화생명 보험계약대출 가능금액과 적용이율은 어디서 확인해야 하나요?',
    intent: '한화생명 보험계약대출 가능금액 적용이율 이자납입일 확인',
    q: ['한화생명 보험계약을 유지하면서 보험계약대출을 이용할 수 있는지 알아보고 있습니다.', '앱에 표시되는 가능금액이 해지환급금 전부인지 일부인지, 실제 신청 시 적용되는 이율과 이자 납입일도 궁금합니다.', '대출을 받기 전에 계약 보장과 해지환급금에 어떤 영향을 줄 수 있는지 무엇을 확인해야 하나요?'],
    a: ['보험계약대출 가능금액은 계약의 해지환급금 범위와 회사의 계약별 기준에 따라 산정될 수 있어 계약마다 다릅니다. 화면에 보이는 한도와 실제 실행 가능금액이 같은지도 신청 시점에 확인해야 합니다.', '적용이율, 이자 납입 방식, 미납 이자의 처리와 상환 방법은 대출 실행 전에 확인해야 합니다. 대출 원리금이 남아 있으면 보험금이나 해지환급금 지급 시 공제될 수 있는지도 약관과 공식 안내를 살펴봐야 합니다.', '한화생명 공식 계약대출 조회에서 대상 계약, 가능금액, 적용이율, 이자 납입일과 상환 조건을 확인하고 필요한 금액만 신청 여부를 판단하세요.'],
    p: '가능한 한도보다 실제 필요한 금액과 이자·상환 조건, 계약금 지급 시 공제 가능성을 함께 확인해야 합니다.',
    c: ['대출 대상 계약과 현재 계약 상태', '신청 당일의 실제 가능금액', '적용이율과 이율 변동 기준', '이자 납입일·납입 방식·미납 처리', '보험금·해지환급금 지급 시 원리금 공제 기준'],
    z: '한화생명 공식 조회에서 계약별 대출 조건을 확인하고, 실행 전 화면의 금액과 이율을 저장해 실제 처리 결과와 비교하세요.'
  },
  {
    slug: 'abl-life-premium-payment-deferral-check', no: 1044, cs: 'abl-life', cn: 'ABL생명', url: 'https://www.abllife.co.kr',
    title: 'ABL생명 보험료 납입유예나 납입중지가 가능한 계약인지 어떻게 확인하나요?',
    intent: 'ABL생명 보험료 납입유예 납입중지 가능 여부와 계약 영향 확인',
    q: ['최근 소득이 줄어 ABL생명 보험료를 일정 기간 쉬어 갈 수 있는 방법이 있는지 알아보고 있습니다.', '납입유예나 납입중지라는 제도가 모든 보험계약에 적용되는지, 신청하면 보장이 그대로 유지되는지도 모르겠습니다.', '보험료를 미납하기 전에 계약에서 가능한 방법과 이후 적립금·보장 상태를 어떻게 확인해야 하나요?'],
    a: ['보험료 납입유예나 납입중지 가능 여부는 상품 구조, 가입 시점, 적립금과 특약 조건에 따라 달라질 수 있습니다. 모든 계약에 같은 방식으로 적용되는 기능은 아닙니다.', '일부 계약에서 관련 기능을 이용할 수 있더라도 적립금에서 위험보험료 등이 차감되거나 보장기간과 계약 유지에 영향을 줄 수 있으므로 단순 미납과 구분해야 합니다.', 'ABL생명 공식 계약조회와 변경 안내에서 해당 계약에 선택 가능한 제도가 있는지, 신청 조건과 종료 시점, 보장 및 적립금 변화를 계약번호 기준으로 확인하세요.'],
    p: '보험료를 내지 않는다는 결과만 보지 말고 공식 신청 여부와 그 기간 동안 보장·적립금이 어떻게 처리되는지 확인해야 합니다.',
    c: ['해당 계약의 납입유예·납입중지 기능 존재 여부', '신청 가능한 시점과 최대 기간', '유예 기간 중 보장 유지 조건', '적립금에서 차감되는 비용 여부', '유예 종료 후 보험료 납입 재개 방법'],
    z: '임의로 미납하지 말고 ABL생명 공식 창구에서 계약별 가능 여부와 영향을 확인한 뒤 안내된 절차로 신청하세요.'
  },
  {
    slug: 'samsung-life-claim-review-additional-documents', no: 1043, cs: 'samsung-life', cn: '삼성생명', url: 'https://www.samsunglife.com',
    title: '삼성생명 보험금 청구 후 추가서류 요청과 심사 진행상태는 어디서 확인하나요?',
    intent: '삼성생명 보험금 청구 심사 진행상태 추가서류 요청 확인',
    q: ['삼성생명에 보험금을 청구한 뒤 접수 완료 안내는 받았지만 지급 여부가 아직 표시되지 않습니다.', '심사 중 추가서류가 필요하면 문자나 앱으로만 안내되는지, 병원에서 다시 발급받아야 할 자료가 있는지 걱정됩니다.', '청구 건의 현재 단계와 추가서류 제출기한, 최종 처리 결과를 어떤 순서로 확인해야 하나요?'],
    a: ['보험금 청구가 접수된 뒤에는 서류 확인, 계약 담보와 지급사유 검토, 필요 시 추가 확인 등의 절차가 진행될 수 있습니다. 접수 완료와 지급 결정은 다른 단계입니다.', '추가서류 요청이 있다면 요청 문서의 정확한 명칭, 대상 진료일, 제출 방법과 기한을 확인해야 합니다. 이미 제출한 문서와 중복되는지 문의한 뒤 발급하면 불필요한 비용을 줄일 수 있습니다.', '삼성생명 공식 보험금 청구조회에서 접수번호, 심사 단계, 추가서류 요청과 처리 결과를 확인하고, 안내가 불명확하면 공식 고객센터에 접수번호로 확인하세요.'],
    p: '청구일만 보는 것보다 접수번호별 심사 단계와 추가서류의 정확한 명칭·제출기한을 확인하는 것이 중요합니다.',
    c: ['보험금 청구 접수번호와 접수일', '현재 심사 단계와 담당 안내 채널', '추가서류의 정확한 명칭과 대상 진료일', '추가서류 제출 방법과 제출기한', '지급·부지급·일부지급 결정 안내와 사유'],
    z: '삼성생명 공식 청구조회에서 상태를 확인하고, 추가서류가 표시되면 요청 내용을 확인한 뒤 필요한 자료만 제출하세요.'
  },
  {
    slug: 'heungkuk-life-reduced-paid-up-conversion-check', no: 1042, cs: 'heungkuk-life', cn: '흥국생명', url: 'https://www.heungkuklife.co.kr',
    title: '흥국생명 보험을 감액완납으로 바꾸면 보장금액과 특약은 어떻게 확인해야 하나요?',
    intent: '흥국생명 감액완납 전환 후 보장금액 특약 계약상태 확인',
    q: ['흥국생명 보험료가 부담돼 해지 대신 감액완납으로 바꿀 수 있다는 말을 들었습니다.', '감액완납으로 전환하면 앞으로 보험료를 내지 않아도 되는 대신 주계약 보장금액이 줄어드는 것인지, 특약은 그대로 남는지 궁금합니다.', '전환 신청 전에 현재 계약과 전환 후 계약을 어떤 항목으로 비교해야 하나요?'],
    a: ['감액완납 가능 여부와 전환 방식은 계약의 상품 구조, 가입 시점, 해지환급금과 약관 조건에 따라 달라질 수 있습니다. 계약에 따라 신청 자체가 불가능할 수도 있습니다.', '전환이 가능하더라도 주계약 보험가입금액이 줄거나 일부 특약이 종료될 수 있고, 해지환급금과 향후 배당·적립 관련 내용도 달라질 수 있습니다.', '흥국생명 공식 계약변경 안내에서 현재 계약의 감액완납 가능 여부를 확인하고, 전환 전후 보장금액·특약·보험기간을 서면이나 변경 예상내역으로 비교하세요.'],
    p: '보험료 납입 종료 여부보다 전환 후 남는 주계약 보장과 종료되는 특약을 계약별로 확인해야 합니다.',
    c: ['현재 계약의 감액완납 가능 여부', '전환 후 주계약 보험가입금액', '유지·종료되는 특약 목록', '보험기간과 만기 조건의 변화', '해지환급금·적립금 관련 변경 내용'],
    z: '흥국생명 공식 안내에서 전환 예상내역을 받은 뒤, 필요한 보장이 줄어드는지 확인하고 신청 여부를 결정하세요.'
  },
  {
    slug: 'kyobo-life-premium-payment-frequency-change', no: 1041, cs: 'kyobo-life', cn: '교보생명', url: 'https://www.kyobo.com',
    title: '교보생명 보험료 납입주기를 월납에서 연납으로 바꿀 수 있나요?',
    intent: '교보생명 보험료 납입주기 월납 연납 변경 가능 여부 적용시점 확인',
    q: ['교보생명 보험료를 매달 내고 있는데 관리가 번거로워 한 번에 납부하는 방식으로 바꿀 수 있는지 알아보고 있습니다.', '월납에서 연납이나 다른 납입주기로 변경할 수 있는 계약인지, 변경하면 다음 보험료가 언제 청구되는지도 모르겠습니다.', '납입주기 변경 전에 보험료와 적용 회차, 자동이체 설정을 어떻게 확인해야 하나요?'],
    a: ['보험료 납입주기 변경 가능 여부는 상품과 계약 조건, 납입 상태에 따라 달라질 수 있습니다. 모든 계약에서 월납·연납을 자유롭게 바꿀 수 있는 것은 아닙니다.', '변경이 가능하다면 신청일과 보험료 납입기일에 따라 적용 회차가 달라질 수 있고, 이미 청구된 보험료나 자동이체 예약 건이 별도로 처리될 수 있습니다.', '교보생명 공식 계약변경 안내에서 선택 가능한 납입주기, 변경 후 보험료, 최초 적용일과 자동이체 처리 여부를 계약번호 기준으로 확인하세요.'],
    p: '납입주기 선택보다 변경 후 첫 보험료의 금액과 납입일, 기존 자동이체 처리 여부를 함께 확인해야 합니다.',
    c: ['계약상 변경 가능한 납입주기', '현재 납입 상태와 미납 보험료 여부', '변경 후 납입보험료와 최초 적용일', '이미 예약된 자동이체의 처리 여부', '변경 취소 또는 재변경 가능 조건'],
    z: '교보생명 공식 창구에서 변경 예상내역과 적용 회차를 확인한 뒤 기존 계좌의 출금 예정 내역도 함께 점검하세요.'
  },
  {
    slug: 'im-life-insurance-period-payment-period-check', no: 1040, cs: 'im-life', cn: 'iM라이프생명', url: 'https://www.dgbfnlife.com',
    title: 'iM라이프생명 보험기간과 보험료 납입기간이 다르게 표시되면 무엇을 확인해야 하나요?',
    intent: 'iM라이프생명 보험기간 납입기간 차이와 계약 보장종료일 확인',
    q: ['iM라이프생명 계약조회에서 보험기간과 보험료 납입기간이 서로 다르게 표시돼 의미를 정확히 알고 싶습니다.', '보험료 납입이 먼저 끝난 뒤에도 보장이 계속되는 것인지, 주계약과 특약의 종료일이 각각 다른지도 궁금합니다.', '완납 시점과 실제 보장 종료 시점을 구분하려면 계약조회에서 어떤 항목을 확인해야 하나요?'],
    a: ['보험료 납입기간은 보험료를 내는 기간이고 보험기간은 약관상 보장이 적용되는 기간을 뜻하므로 서로 다를 수 있습니다. 납입이 끝났다고 계약의 모든 보장이 종료되는 것은 아닙니다.', '주계약과 특약은 각각 납입기간과 보험기간이 다를 수 있으며, 갱신형 특약은 갱신 시 보험료 납입이 이어질 수 있어 개별 담보 기준으로 확인해야 합니다.', 'iM라이프생명 공식 계약조회에서 주계약과 특약별 납입종료일, 보험기간, 갱신 여부와 현재 계약 상태를 확인하세요.'],
    p: '계약 전체의 완납 표시만 보지 말고 주계약과 각 특약의 납입종료일·보장종료일을 따로 확인해야 합니다.',
    c: ['주계약의 보험기간과 납입기간', '특약별 보험기간과 납입기간', '갱신형 특약의 갱신일과 갱신보험료', '현재 납입 완료·납입 중·실효 등 계약 상태', '만기 또는 보장 종료 예정일'],
    z: 'iM라이프생명 공식 계약조회에서 담보별 기간을 확인하고, 완납 후에도 납입되는 항목이 있다면 갱신형 특약 여부를 확인하세요.'
  },
  {
    slug: 'miraeasset-life-variable-partial-withdrawal-impact', no: 1039, cs: 'miraeasset-life', cn: '미래에셋생명', url: 'https://life.miraeasset.com',
    title: '미래에셋생명 변액보험 중도인출 전에 적립금과 보장 영향을 어떻게 확인하나요?',
    intent: '미래에셋생명 변액보험 중도인출 적립금 보장 계약유지 영향 확인',
    q: ['미래에셋생명 변액보험에 쌓인 적립금 중 일부를 중도인출할 수 있는지 알아보고 있습니다.', '중도인출을 하면 펀드 적립금만 줄어드는지, 사망보험금이나 계약 유지에도 영향을 줄 수 있는지 걱정됩니다.', '신청 가능한 금액과 수수료, 인출 후 계약 상태를 어떤 자료로 확인해야 하나요?'],
    a: ['변액보험 중도인출 가능 여부와 한도는 계약 약관, 적립금, 이미 인출한 금액과 계약 상태에 따라 달라질 수 있습니다. 화면에 표시된 적립금 전부를 인출할 수 있다는 뜻은 아닙니다.', '중도인출 뒤에는 투자 적립금이 줄고 향후 수익 변동의 기준금액도 달라질 수 있습니다. 계약에 따라 보장 유지에 필요한 적립금이나 보험금 계산에 영향을 줄 수 있어 인출 후 예상내역을 확인해야 합니다.', '미래에셋생명 공식 변액보험 계약조회에서 인출 가능금액, 수수료 여부, 인출 후 적립금과 보장 관련 예상내역을 확인하고 약관상 조건을 함께 살펴보세요.'],
    p: '인출 가능금액보다 인출 후 남는 적립금과 계약 유지·보험금 계산에 미치는 영향을 먼저 확인해야 합니다.',
    c: ['현재 특별계정 적립금과 인출 가능금액', '최소 잔존 적립금 등 약관상 제한', '중도인출 수수료 또는 횟수 제한', '인출 후 사망보험금·보장 관련 영향', '인출 처리일과 펀드 기준가격 적용 방식'],
    z: '미래에셋생명 공식 조회에서 인출 전후 예상내역을 비교하고, 계약 유지에 필요한 조건을 확인한 뒤 신청하세요.'
  },
  {
    slug: 'kdb-life-surrender-value-estimate-difference', no: 1038, cs: 'kdb-life', cn: 'KDB생명', url: 'https://www.kdblife.co.kr',
    title: 'KDB생명 해지환급금 예상액과 실제 지급액이 달라질 수 있는 이유는 무엇인가요?',
    intent: 'KDB생명 해지환급금 예상액 실제 지급액 차이와 공제내역 확인',
    q: ['KDB생명 계약을 정리할지 고민하면서 홈페이지에서 해지환급금 예상액을 확인했습니다.', '조회한 금액이 오늘 바로 해지할 때 실제로 받는 금액과 같은지, 보험계약대출이나 미납 보험료가 있으면 얼마나 달라지는지 궁금합니다.', '해지 신청 전에 예상액의 기준일과 공제내역, 보장 종료 시점을 무엇으로 확인해야 하나요?'],
    a: ['해지환급금 조회액은 조회 기준일의 계약 상태와 회사 계산 기준에 따른 예상액일 수 있습니다. 실제 지급액은 해지 처리일, 납입 상태와 계약 관련 채무 등에 따라 달라질 수 있습니다.', '보험계약대출 원리금, 미납 보험료나 기타 계약상 공제항목이 있다면 지급액에서 차감될 수 있습니다. 변액보험 등 일부 계약은 처리 시점의 기준가격에 따라 금액이 변동될 수도 있습니다.', 'KDB생명 공식 계약조회에서 예상액의 기준일, 공제 예정액과 실제 해지 신청 단계의 지급 예정액을 확인하고, 해지 즉시 보장이 종료되는 시점도 함께 확인하세요.'],
    p: '조회 화면의 총 예상액보다 기준일과 공제항목, 실제 해지 처리일의 지급 예정액을 확인하는 것이 중요합니다.',
    c: ['해지환급금 예상액의 조회 기준일', '보험계약대출 원금·이자 공제 여부', '미납 보험료와 기타 공제항목', '변액 등 금액 변동 가능 계약 여부', '해지 처리일과 보장 종료 시점'],
    z: 'KDB생명 공식 해지 예상조회에서 공제내역을 확인하고, 해지 신청 최종 단계의 지급 예정액과 보장 종료일을 확인한 뒤 결정하세요.'
  }
];

export const dailyBoardPosts20260715 = dailyQuestions20260715.map((item) => ({
  id: `daily-20260715-${item.slug}`,
  slug: item.slug,
  no: item.no,
  category: item.cn,
  title: item.title,
  message: item.q.join(' '),
  nickname: '익명',
  status: '답변완료',
  time: '2026.07.15',
  href: `/q/${item.slug}`,
  answer: '상세 답변이 등록되었습니다.'
}));

export function renderDailyQuestionPage20260715(item) {
  const canonical = `${BASE}/q/${item.slug}`;
  const related = dailyQuestions20260715.filter((candidate) => candidate.slug !== item.slug).slice(0, 4);
  const answerText = [...item.a, item.p, ...item.c, item.z].join('\n');
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'QAPage',
    mainEntity: {
      '@type': 'Question',
      name: item.title,
      text: item.q.join('\n\n'),
      answerCount: 1,
      acceptedAnswer: {
        '@type': 'Answer',
        text: answerText,
        dateCreated: DATE,
        author: { '@type': 'Organization', name: SITE.name }
      }
    }
  };

  return `<!doctype html><html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(item.title)} | ${esc(SITE.name)}</title><meta name="description" content="${esc(item.q.join(' ').slice(0, 155))}"><meta name="robots" content="index,follow,max-image-preview:large"><link rel="canonical" href="${canonical}"><meta property="og:type" content="article"><meta property="og:site_name" content="${esc(SITE.name)}"><meta property="og:title" content="${esc(item.title)} | ${esc(SITE.name)}"><meta property="og:description" content="${esc(item.q.join(' ').slice(0, 155))}"><meta property="og:url" content="${canonical}"><meta property="og:image" content="${BASE}/og-image"><meta name="twitter:card" content="summary_large_image"><link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/static/pretendard.css"><link rel="stylesheet" href="/assets/css/styles.css?v=20260715"><style>body{background:#fff;color:#111}.m{max-width:900px;margin:auto;padding:55px 20px 85px}.crumb,.meta{color:#777;font-size:13px}h1{font-size:clamp(34px,5vw,56px);line-height:1.12;letter-spacing:-.065em}.q{font-size:18px;line-height:1.9;padding-bottom:34px;border-bottom:1px solid #e5e5e5}.a{margin-top:38px;font-size:17px;line-height:1.9}.point,.notice,.sources{padding:19px;border:1px solid #e5e5e5;background:#fafafa;margin:24px 0}li{margin:9px 0}.links{display:grid;gap:9px;margin-top:18px}.links a,.company{padding:14px;border:1px solid #ddd;color:#111;text-decoration:none;font-weight:800}.company{display:inline-block;margin-top:12px}@media(max-width:650px){.m{padding-top:36px}.q,.a{font-size:16px}}</style><script type="application/ld+json">${safeJson(schema)}</script></head><body><header class="site-header"><div class="wrap header-inner"><a class="brand" href="/">보험플레이</a><nav class="nav"><a href="/company/">생명보험회사</a><a href="/#board">질문게시판</a></nav></div></header><main class="m"><div class="crumb"><a href="/">홈</a> / <a href="/company/${esc(item.cs)}">${esc(item.cn)}</a> / 계약관리</div><article><div class="meta">${esc(item.cn)} · 정보성 질문 · 공식 확인 ${DATE}</div><h1>${esc(item.title)}</h1><div class="q">${paragraphs(item.q)}<a class="company" href="/company/${esc(item.cs)}">${esc(item.cn)} 정보 페이지</a></div><div class="a">${paragraphs(item.a)}<div class="point">${esc(item.p)}</div><h2>확인할 사항</h2><ul>${item.c.map((value) => `<li>${esc(value)}</li>`).join('')}</ul><h2>결론</h2><p>${esc(item.z)}</p><div class="sources"><strong>공식 경로 확인</strong><br><a href="${esc(item.url)}" target="_blank" rel="noopener noreferrer nofollow">${esc(item.cn)} 공식 홈페이지</a> · <a href="${KLIA}" target="_blank" rel="noopener noreferrer nofollow">생명보험협회 회원사 안내</a><br>확인일: ${DATE}</div><div class="notice">일반적인 계약 관리 정보이며 해당 회사의 공식 광고나 가입 권유가 아닙니다. 실제 처리 기준은 계약 내용·약관·회사 공식 안내를 확인하세요.</div></div></article><section><h2>관련 질문</h2><div class="links">${related.map((candidate) => `<a href="/q/${esc(candidate.slug)}">${esc(candidate.title)}</a>`).join('')}</div></section></main><footer class="footer"><div class="wrap footer-inner"><p><strong>${esc(SITE.company)}</strong> · 대표 ${esc(SITE.owner)} · 사업자번호 ${esc(SITE.businessNumber)}</p><nav><a href="/insurance-notice/">보험정보 이용안내</a><a href="/privacy/">개인정보처리방침</a><a href="/terms/">이용약관</a></nav></div></footer></body></html>`;
}
