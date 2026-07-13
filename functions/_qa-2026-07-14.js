import { SITE } from './_content.js';

const KLIA = 'https://www.klia.or.kr/klia/company/member/list.do';
const DATE = '2026-07-14';
const BASE = 'https://boheomplay.pagero.kr';
const esc = (value = '') => String(value).replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
const safeJson = (value) => JSON.stringify(value).replace(/&/g, '\\u0026').replace(/</g, '\\u003c').replace(/>/g, '\\u003e');
const paragraphs = (items) => items.map((item) => `<p>${esc(item)}</p>`).join('');

export const dailyQuestions20260714 = [
  {
    slug: 'metlife-korea-contact-info-update', no: 1037, cs: 'metlife-korea', cn: '메트라이프생명', url: 'https://www.metlife.co.kr',
    title: '메트라이프생명 이사 후 주소와 휴대전화번호를 바꾸면 기존 안내도 다시 받을 수 있나요?',
    intent: '메트라이프생명 계약자 주소 연락처 변경과 안내 수신 상태 확인',
    q: ['최근 이사하면서 주소가 바뀌었고 휴대전화번호도 새 번호로 변경했습니다. 메트라이프생명 계약에는 예전 정보가 남아 있는 것 같습니다.', '보험료 납입 안내와 계약 관련 우편이 이전 주소로 갈까 걱정되고, 앱에서 정보를 바꾸면 모든 계약에 한 번에 반영되는지도 모르겠습니다.', '주소와 연락처를 변경할 때 계약자 정보와 수익자 정보가 따로 처리되는지, 변경 뒤 무엇을 확인해야 하나요?'],
    a: ['주소와 연락처 변경은 계약 관련 안내를 제때 받기 위해 확인해야 하는 기본 계약관리 업무입니다. 다만 로그인 정보 변경과 보험계약상 고객정보 변경이 같은 절차인지 여부는 이용 채널에 따라 다를 수 있습니다.', '계약이 여러 건이라면 변경 신청이 전체 계약에 반영됐는지, 우편·문자·전자문서 수신 설정이 각각 유지되는지 확인해야 합니다. 수익자나 피보험자의 정보는 계약자 정보와 별도로 관리될 수 있습니다.', '메트라이프생명 공식 홈페이지나 고객센터에서 본인확인 방식과 변경 가능 항목을 확인하고, 처리 완료 화면 또는 안내 메시지에서 실제 반영 범위를 확인하는 편이 안전합니다.'],
    p: '정보를 입력한 사실보다 어느 계약과 어느 안내 채널에 반영됐는지를 확인하는 것이 핵심입니다.',
    c: ['현재 등록된 계약자 주소와 휴대전화번호', '보유 계약 전체에 변경이 반영되는지', '우편·문자·전자문서 수신 설정', '피보험자·수익자 정보의 별도 변경 필요 여부', '변경 완료일과 이후 발송 예정 안내'],
    z: '메트라이프생명 공식 계약조회에서 변경 결과를 확인하고, 일부 계약만 다르게 표시되면 계약번호별로 공식 창구에 확인하세요.'
  },
  {
    slug: 'kb-life-certificate-document-issue', no: 1036, cs: 'kb-life', cn: 'KB라이프생명', url: 'https://www.kblife.co.kr',
    title: 'KB라이프생명 보험료 납입확인서와 보험증권 사본은 각각 어디서 발급하나요?',
    intent: 'KB라이프생명 보험료 납입확인서와 보험증권 사본 발급 경로 확인',
    q: ['회사 제출용으로 보험료 납입확인서가 필요하고, 가족에게 계약 내용을 설명하려고 보험증권 사본도 다시 받아야 합니다.', '두 서류가 같은 메뉴에서 발급되는지, 전자문서로 받은 파일을 제출해도 되는지 모르겠습니다.', '계약자가 아닌 피보험자도 발급할 수 있는지와 발급 전에 확인할 내용을 알고 싶습니다.'],
    a: ['보험료 납입확인서와 보험증권 사본은 확인하는 정보와 사용 목적이 다르므로 발급 메뉴와 본인확인 요건이 다를 수 있습니다. 제출처가 요구하는 발급 기간과 문서 형식도 먼저 확인해야 합니다.', '계약 관련 제증명은 계약자의 조회 권한을 기준으로 제공될 수 있으며, 피보험자나 가족이 요청할 때는 별도의 동의나 위임 절차가 필요할 수 있습니다.', 'KB라이프생명 공식 홈페이지의 계약조회·제증명 발급 안내에서 문서명을 정확히 확인하고, 출력본·전자문서·팩스 등 허용되는 수령 방식을 확인하세요.'],
    p: '필요한 서류의 정확한 명칭과 제출처가 요구하는 기간·형식을 먼저 맞춰야 재발급을 줄일 수 있습니다.',
    c: ['필요 서류가 납입확인서인지 보험증권인지', '제출 대상 기간과 계약번호', '계약자 본인 발급 여부', '전자문서·출력·팩스 수령 가능 여부', '제출처의 원본 또는 발급일 요건'],
    z: 'KB라이프생명 공식 제증명 메뉴에서 문서명과 발급 범위를 확인한 뒤 제출처 요구사항에 맞는 방식으로 발급하세요.'
  },
  {
    slug: 'shinhan-life-policy-loan-partial-repayment', no: 1035, cs: 'shinhan-life', cn: '신한라이프생명', url: 'https://www.shinhanlife.co.kr',
    title: '신한라이프생명 보험계약대출을 일부 상환하면 다음 이자 납입액은 어떻게 확인하나요?',
    intent: '신한라이프생명 보험계약대출 일부 상환 후 잔액과 이자 확인',
    q: ['신한라이프생명 보험계약대출 잔액 중 일부를 먼저 갚으려고 합니다. 전액 상환이 아니라 일부 상환이라 이후 이자가 어떻게 달라지는지 궁금합니다.', '상환 신청일과 실제 처리일이 다르면 어느 시점의 잔액을 기준으로 이자가 계산되는지도 모르겠습니다.', '일부 상환 뒤 계약대출 잔액, 다음 이자 납입일, 자동이체 금액을 어디서 확인해야 하나요?'],
    a: ['보험계약대출 일부 상환 뒤에는 원금 잔액과 처리일을 기준으로 이후 이자 내역이 달라질 수 있습니다. 신청 화면의 예상 금액만 보고 끝내지 말고 실제 처리 결과를 확인해야 합니다.', '이자 납입 방식이 자동이체인지 별도 납부인지, 미납 이자가 함께 처리됐는지에 따라 다음 청구 내역이 다르게 보일 수 있습니다. 계약별 대출이 여러 건이면 어느 계약에 상환됐는지도 확인해야 합니다.', '신한라이프생명 공식 계약대출 조회에서 상환 처리일, 남은 원금, 미납 이자, 다음 이자 납입 정보를 확인하고 불명확하면 공식 고객센터에서 계약번호별 내역을 확인하세요.'],
    p: '일부 상환 금액보다 상환 처리일과 남은 원금·미납 이자가 정확히 반영됐는지 확인하는 것이 중요합니다.',
    c: ['상환 대상 계약번호와 대출 건', '일부 상환 처리일', '상환 후 남은 원금', '미납 이자 포함 여부', '다음 이자 납입일과 납입 방식'],
    z: '신한라이프생명 공식 조회 화면에서 상환 완료 내역과 다음 이자 정보를 함께 확인하세요.'
  },
  {
    slug: 'chubb-life-legal-name-change-contract', no: 1034, cs: 'chubb-life', cn: '처브라이프생명', url: 'https://www.chubblife.co.kr',
    title: '처브라이프생명 개명 후 보험계약 이름을 정정하려면 어떤 자료를 준비해야 하나요?',
    intent: '처브라이프생명 개명 후 계약자 이름 정정과 본인확인 자료 확인',
    q: ['법원 절차를 거쳐 개명했고 주민등록증과 은행 계좌 이름도 새 이름으로 바꿨습니다. 처브라이프생명 보험계약에는 이전 이름이 남아 있습니다.', '보험료 출금 계좌와 계약자 이름이 다르게 표시되면 납입이나 보험금 청구 때 문제가 생길까 걱정됩니다.', '개명 사실을 반영하려면 어떤 본인확인 자료가 필요한지, 계약자와 피보험자 이름을 각각 확인해야 하는지 궁금합니다.'],
    a: ['개명 후 계약정보 정정은 단순 연락처 변경과 달리 본인확인 자료와 변경 사실을 증명하는 서류가 필요할 수 있습니다. 계약상 지위가 여러 개라면 계약자·피보험자·수익자 정보가 각각 어떻게 등록돼 있는지 확인해야 합니다.', '보험료 출금 계좌, 전자서명 인증정보, 보험금 수령 계좌 등 다른 정보도 이전 이름으로 남아 있을 수 있으므로 한 항목만 바꾸고 끝내지 않는 것이 좋습니다.', '처브라이프생명 공식 고객지원에서 개명에 필요한 서류와 접수 방법을 확인한 뒤, 변경 완료 후 계약조회와 납입정보에 새 이름이 반영됐는지 확인하세요.'],
    p: '개명 사실의 증명뿐 아니라 계약·납입·수령 관련 정보가 같은 이름으로 정정됐는지 확인해야 합니다.',
    c: ['현재 계약자·피보험자·수익자 이름', '개명 사실을 확인할 수 있는 공식 서류', '신분증과 본인인증 정보', '보험료 출금·보험금 수령 계좌 명의', '변경 완료 후 모든 계약의 반영 여부'],
    z: '처브라이프생명 공식 안내에 따른 자료로 정정하고, 처리 후 계약별 이름과 계좌 명의를 다시 확인하세요.'
  },
  {
    slug: 'hana-life-paid-up-status-check', no: 1033, cs: 'hana-life', cn: '하나생명', url: 'https://www.hanalife.co.kr',
    title: '하나생명 보험료 납입기간이 끝났는데 계약이 완납 상태인지 어디서 확인하나요?',
    intent: '하나생명 보험료 납입 종료 후 완납 상태와 보장기간 확인',
    q: ['하나생명 보험의 납입기간이 끝난 것으로 알고 있는데 최근에는 보험료가 출금되지 않아 실제로 완납된 것인지 확인하고 싶습니다.', '보험료 납입이 끝나도 보장은 계속된다고 들었지만, 주계약과 특약의 보장기간이 각각 같은지는 모르겠습니다.', '계약조회에서 어떤 항목을 보면 완납 여부와 앞으로 남은 보장기간을 확인할 수 있나요?'],
    a: ['보험료 납입기간 종료와 보험계약의 보장 종료는 같은 의미가 아닐 수 있습니다. 납입기간, 보험기간, 특약별 만기와 계약 상태를 나눠서 확인해야 합니다.', '일부 특약은 주계약과 납입기간이나 보험기간이 다를 수 있고, 갱신형 특약이 포함된 경우 이후 납입이 계속될 가능성도 계약별로 확인해야 합니다.', '하나생명 공식 계약조회에서 최종 납입월, 납입 상태, 주계약과 특약의 보험기간, 갱신 여부를 확인하고 표시가 불명확하면 계약번호별 안내를 받으세요.'],
    p: '보험료가 더 이상 출금되지 않는다는 사실만으로 모든 담보가 완납·유지 상태라고 단정하면 안 됩니다.',
    c: ['주계약의 납입기간과 보험기간', '특약별 납입기간과 만기', '갱신형 특약 포함 여부', '최종 정상 납입월과 계약 상태', '앞으로 발생할 수 있는 추가 납입 항목'],
    z: '하나생명 공식 계약조회에서 주계약과 특약을 구분해 완납 상태와 남은 보장기간을 확인하세요.'
  },
  {
    slug: 'bnp-cardif-variable-report-reading', no: 1032, cs: 'bnp-paribas-cardif-life', cn: 'BNP파리바카디프생명', url: 'https://www.cardif.co.kr',
    title: 'BNP파리바카디프생명 변액보험 운용보고서에서 펀드별 적립금과 수익률을 어떻게 구분해 보나요?',
    intent: 'BNP파리바카디프생명 변액보험 운용보고서 적립금 수익률 확인',
    q: ['BNP파리바카디프생명 변액보험 운용보고서를 받았는데 펀드별 적립금과 수익률 항목이 많아 이해하기 어렵습니다.', '계약 전체 수익률과 개별 펀드 수익률이 다르게 표시되고, 납입한 보험료와 현재 적립금도 단순 비교하기 어려워 보입니다.', '보고서에서 어떤 항목을 순서대로 확인해야 현재 계약의 운용 상태를 오해하지 않을 수 있나요?'],
    a: ['변액보험 운용보고서에서는 납입보험료 전체와 특별계정에 실제 투입된 금액, 펀드별 적립금, 기간별 수익률을 구분해서 봐야 합니다. 각 수치는 같은 기준으로 계산되지 않을 수 있습니다.', '개별 펀드 수익률이 높더라도 계약 전체 적립금은 사업비, 위험보험료, 펀드 편입 시점과 배분 비율 등의 영향을 받을 수 있습니다. 단기간 수익률만으로 계약 전체 성과를 판단하기 어렵습니다.', 'BNP파리바카디프생명 공식 변액보험 관리·투자 리포트에서 기준일, 펀드명, 적립금 배분, 기간별 성과와 비용 관련 항목을 확인하고 계약조회 수치와 함께 보세요.'],
    p: '보고서의 수익률은 기준 기간과 계산 대상이 다를 수 있으므로 계약 전체와 펀드별 수치를 분리해서 봐야 합니다.',
    c: ['보고서 기준일과 조회 기간', '납입보험료와 특별계정 투입금액', '펀드별 적립금과 배분 비율', '개별 펀드 수익률과 계약 전체 수익률', '사업비·위험보험료 등 적립금 차이 요인'],
    z: 'BNP파리바카디프생명 공식 보고서의 기준일과 항목 정의를 확인한 뒤 계약 전체 수치를 함께 비교하세요.'
  },
  {
    slug: 'fubon-hyundai-life-reinstatement-coverage-date', no: 1031, cs: 'fubon-hyundai-life', cn: '푸본현대생명', url: 'https://www.fubonhyundai.com',
    title: '푸본현대생명 실효 계약을 부활한 뒤 보장이 언제부터 다시 적용되는지 어떻게 확인하나요?',
    intent: '푸본현대생명 실효 계약 부활 후 계약 상태와 보장 적용일 확인',
    q: ['보험료 미납으로 실효됐던 푸본현대생명 계약을 최근 부활 신청했고 미납 보험료도 납부했습니다.', '납부가 완료됐다는 안내는 받았지만 부활 심사가 끝난 것인지, 보장이 다시 적용되는 날짜가 언제인지 모르겠습니다.', '부활 처리 뒤 계약 상태와 보장 적용일을 확인할 때 어떤 항목을 봐야 하나요?'],
    a: ['미납 보험료를 납부한 사실과 계약 부활이 최종 승인된 사실은 구분해서 확인해야 합니다. 계약에 따라 추가 확인이나 심사 절차가 있을 수 있습니다.', '부활 신청일, 승인일, 계약 상태 변경일과 사고 발생일의 관계는 약관과 실제 처리 결과를 기준으로 확인해야 하므로 임의로 보장 재개 시점을 추정하면 안 됩니다.', '푸본현대생명 공식 계약조회나 고객센터에서 부활 승인 여부, 정상 계약 표시, 처리일과 보장 관련 안내를 계약번호별로 확인하세요.'],
    p: '미납금 납부 완료보다 계약이 정상 상태로 최종 변경됐는지와 공식 처리일을 확인하는 것이 우선입니다.',
    c: ['실효일과 부활 신청일', '미납 보험료 납부 완료 여부', '추가 심사·서류 요구 여부', '부활 승인일과 현재 계약 상태', '부활 전후 사고에 대한 약관상 기준'],
    z: '푸본현대생명 공식 창구에서 부활 승인과 계약 상태 변경일을 확인한 뒤 보장 적용 기준을 약관으로 확인하세요.'
  },
  {
    slug: 'lina-life-cooling-off-check', no: 1030, cs: 'lina-life', cn: '라이나생명', url: 'https://www.lina.co.kr',
    title: '라이나생명 보험 청약철회를 신청할 수 있는 기간과 환급 내역은 어디서 확인하나요?',
    intent: '라이나생명 보험 청약철회 가능 여부와 환급 처리 확인',
    q: ['최근 라이나생명 보험에 가입했는데 계약 내용을 다시 살펴본 뒤 청약철회를 검토하고 있습니다.', '청약일, 증권 수령일, 첫 보험료 납입일 중 어떤 날짜가 기준이 되는지 모르겠고, 계약 방식에 따라 절차가 다른지도 궁금합니다.', '청약철회 가능 여부와 신청 뒤 환급되는 금액, 처리 완료 여부를 어디서 확인해야 하나요?'],
    a: ['청약철회 가능 여부는 계약 체결 방식, 관련 날짜, 계약 유형과 법령·약관상 예외 여부를 함께 확인해야 합니다. 특정 날짜만 기억해 임의로 가능 여부를 단정하면 안 됩니다.', '철회 신청이 접수됐더라도 처리 완료 여부와 보험료 반환 내역을 별도로 확인해야 하며, 이미 발생한 계약 관련 안내나 자동이체 예정 건이 남아 있는지도 살펴봐야 합니다.', '라이나생명 공식 계약조회와 고객지원에서 해당 계약의 청약일·증권 수령 관련 기록, 철회 접수 방법, 처리 상태와 반환 내역을 확인하세요.'],
    p: '청약철회는 날짜 계산보다 해당 계약이 철회 대상인지와 접수 완료·환급 처리까지 확인하는 것이 중요합니다.',
    c: ['청약일과 증권 수령 관련 기록', '가입 채널과 계약 유형', '약관상 청약철회 대상·예외 여부', '철회 접수일과 접수번호', '보험료 반환 금액과 처리 완료일'],
    z: '라이나생명 공식 창구에서 계약별 철회 가능 여부와 접수 결과를 확인하고 처리 완료 내역을 보관하세요.'
  },
  {
    slug: 'aia-life-designated-claim-agent-registration', no: 1029, cs: 'aia-life', cn: 'AIA생명', url: 'https://www.aia.co.kr',
    title: 'AIA생명 지정대리청구인을 등록하면 어떤 경우에 대신 보험금을 청구할 수 있나요?',
    intent: 'AIA생명 지정대리청구인 등록 대상과 대리 청구 조건 확인',
    q: ['부모님 AIA생명 계약을 확인하다가 지정대리청구인 제도를 알게 됐습니다. 부모님이 직접 청구하기 어려운 상황에 대비해 미리 등록할 수 있는지 궁금합니다.', '가족이면 누구나 등록할 수 있는지, 계약자와 피보험자가 다르면 누구의 동의가 필요한지도 모르겠습니다.', '등록했다고 해서 모든 보험금을 대신 청구할 수 있는지와 실제 청구 때 필요한 자료를 어떻게 확인해야 하나요?'],
    a: ['지정대리청구인 제도는 피보험자가 특정 사유로 직접 보험금을 청구하기 어려운 상황을 대비하는 절차로 운영될 수 있지만, 적용 계약과 청구 사유는 약관과 회사 안내를 확인해야 합니다.', '등록 가능한 사람의 범위, 계약자·피보험자의 동의, 등록 시점과 필요 서류가 계약 구조에 따라 달라질 수 있습니다. 등록 사실만으로 모든 보험금 청구 권한이 생긴다고 단정하면 안 됩니다.', 'AIA생명 공식 고객지원에서 해당 계약의 지정대리청구인 등록 가능 여부와 적용 범위, 등록·변경 서류, 실제 청구 시 추가 자료를 확인하세요.'],
    p: '등록 가능 여부와 실제 대리 청구가 허용되는 상황은 서로 다른 기준이므로 각각 확인해야 합니다.',
    c: ['해당 계약의 제도 적용 여부', '등록 가능한 가족·관계 범위', '계약자와 피보험자의 동의 요건', '등록·변경에 필요한 서류', '실제 대리 청구 사유와 추가 증빙'],
    z: 'AIA생명 공식 안내에서 계약별 등록 가능 범위와 대리 청구 조건을 확인한 뒤 필요한 동의와 서류를 준비하세요.'
  },
  {
    slug: 'nh-life-premium-waiver-claim-check', no: 1028, cs: 'nh-life', cn: 'NH농협생명', url: 'https://www.nhlife.co.kr',
    title: 'NH농협생명 보험료 납입면제 여부를 확인하려면 진단서만 제출하면 되나요?',
    intent: 'NH농협생명 보험료 납입면제 조건과 심사 서류 확인',
    q: ['최근 질병 진단을 받아 NH농협생명 계약의 보험료 납입면제 대상인지 확인하려고 합니다.', '보험증권에는 납입면제 관련 문구가 있지만 어떤 진단 상태를 기준으로 하는지 이해하기 어렵고, 진단서만 제출하면 되는지도 모르겠습니다.', '납입면제 신청 전에 약관과 계약조회에서 무엇을 확인하고 어떤 서류를 준비해야 하나요?'],
    a: ['보험료 납입면제는 단순히 진단명이 있다는 사실만으로 결정되지 않을 수 있습니다. 주계약과 특약의 약관에서 정한 발생 사유, 진단 기준, 계약 상태를 함께 확인해야 합니다.', '진단서 외에도 검사 결과, 진료기록, 사고나 치료 경과를 확인하는 자료가 요구될 수 있으며 실제 필요 서류는 신청 사유와 계약에 따라 달라질 수 있습니다.', 'NH농협생명 공식 보험금·계약관리 안내에서 납입면제 관련 약관 조항과 구비서류를 확인하고, 신청 접수 후 심사 결과와 적용 시작 회차를 확인하세요.'],
    p: '진단서 제출 여부보다 해당 계약의 약관상 납입면제 사유와 진단 기준에 해당하는지가 핵심입니다.',
    c: ['주계약·특약의 납입면제 조항', '진단명과 약관상 진단 기준', '진단서 외 추가 검사·진료 자료', '현재 계약 상태와 보험료 납입 상황', '승인 시 적용되는 보험료 회차'],
    z: 'NH농협생명 공식 약관과 구비서류 안내를 확인한 뒤 접수하고, 심사 결과와 적용 회차를 서면 또는 계약조회로 확인하세요.'
  }
];

export const dailyBoardPosts20260714 = dailyQuestions20260714.map((item) => ({
  id: `auto-20260714-${item.no}`,
  slug: item.slug,
  no: item.no,
  category: '기타',
  title: item.title,
  message: item.q.join(' '),
  nickname: '익명',
  status: '답변완료',
  time: '2026.07.14',
  href: `/q/${item.slug}`,
  answer: '상세 답변이 등록되었습니다.'
}));

export function renderDailyQuestionPage20260714(item) {
  const canonical = `${BASE}/q/${item.slug}`;
  const related = dailyQuestions20260714.filter((candidate) => candidate.slug !== item.slug).slice(0, 4);
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

  return `<!doctype html><html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(item.title)} | ${esc(SITE.name)}</title><meta name="description" content="${esc(item.q.join(' ').slice(0, 155))}"><meta name="robots" content="index,follow,max-image-preview:large"><link rel="canonical" href="${canonical}"><meta property="og:type" content="article"><meta property="og:site_name" content="${esc(SITE.name)}"><meta property="og:title" content="${esc(item.title)} | ${esc(SITE.name)}"><meta property="og:description" content="${esc(item.q.join(' ').slice(0, 155))}"><meta property="og:url" content="${canonical}"><meta property="og:image" content="${BASE}/og-image"><link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/static/pretendard.css"><link rel="stylesheet" href="/assets/css/styles.css?v=20260714"><style>body{background:#fff;color:#111}.m{max-width:900px;margin:auto;padding:55px 20px 85px}.crumb,.meta{color:#777;font-size:13px}h1{font-size:clamp(34px,5vw,56px);line-height:1.12;letter-spacing:-.065em}.q{font-size:18px;line-height:1.9;padding-bottom:34px;border-bottom:1px solid #e5e5e5}.a{margin-top:38px;font-size:17px;line-height:1.9}.point,.notice,.sources{padding:19px;border:1px solid #e5e5e5;background:#fafafa;margin:24px 0}li{margin:9px 0}.links{display:grid;gap:9px;margin-top:18px}.links a,.company{padding:14px;border:1px solid #ddd;color:#111;text-decoration:none;font-weight:800}.company{display:inline-block;margin-top:12px}@media(max-width:650px){.m{padding-top:36px}.q,.a{font-size:16px}}</style><script type="application/ld+json">${safeJson(schema)}</script></head><body><header class="site-header"><div class="wrap header-inner"><a class="brand" href="/">보험플레이</a><nav class="nav"><a href="/company/">생명보험회사</a><a href="/#board">질문게시판</a></nav></div></header><main class="m"><div class="crumb"><a href="/">홈</a> / <a href="/company/${esc(item.cs)}">${esc(item.cn)}</a> / 계약관리</div><article><div class="meta">${esc(item.cn)} · 정보성 질문 · 공식 확인 ${DATE}</div><h1>${esc(item.title)}</h1><div class="q">${paragraphs(item.q)}<a class="company" href="/company/${esc(item.cs)}">${esc(item.cn)} 정보 페이지</a></div><div class="a">${paragraphs(item.a)}<div class="point">${esc(item.p)}</div><h2>확인할 사항</h2><ul>${item.c.map((value) => `<li>${esc(value)}</li>`).join('')}</ul><p>${esc(item.z)}</p><div class="sources"><strong>공식 경로 확인</strong><br><a href="${esc(item.url)}" target="_blank" rel="noopener noreferrer nofollow">${esc(item.cn)} 공식 홈페이지</a> · <a href="${KLIA}" target="_blank" rel="noopener noreferrer nofollow">생명보험협회 회원사 안내</a><br>확인일: ${DATE}</div><div class="notice">일반적인 계약 관리 정보이며 해당 회사의 공식 광고나 가입 권유가 아닙니다. 실제 처리 기준은 계약 내용·약관·회사 공식 안내를 확인하세요.</div></div></article><section><h2>관련 질문</h2><div class="links">${related.map((candidate) => `<a href="/q/${esc(candidate.slug)}">${esc(candidate.title)}</a>`).join('')}</div></section></main><footer class="footer"><div class="wrap footer-inner"><p><strong>${esc(SITE.company)}</strong> · 대표 ${esc(SITE.owner)} · 사업자번호 ${esc(SITE.businessNumber)}</p><nav><a href="/insurance-notice/">보험정보 이용안내</a><a href="/privacy/">개인정보처리방침</a><a href="/terms/">이용약관</a></nav></div></footer></body></html>`;
}
