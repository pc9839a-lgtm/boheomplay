import { SITE } from './_content.js';

const KAKAO_URL = 'https://open.kakao.com/o/sjY0EnDi';
const UPDATED_AT = '2026-07-12';

const esc = (value = '') => String(value).replace(/[&<>"']/g, (char) => ({
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;'
}[char]));

const nl = (value = '') => esc(value).replace(/\n/g, '<br/>');
const absolute = (path) => `https://boheomplay.pagero.kr${path}`;
const safeJson = (value) => JSON.stringify(value)
  .replace(/&/g, '\\u0026')
  .replace(/</g, '\\u003c')
  .replace(/>/g, '\\u003e');

export const extraQuestions = [
  {
    id: 'seed-1017', no: 1017, slug: 'silbi-4th-generation-switch', category: '실비보험',
    title: '4세대 실비로 바꾸면 보험료가 정말 많이 내려가나요?',
    time: '25분 전',
    listMessage: '2세대 실비를 유지 중인데 갱신 보험료가 부담됩니다. 4세대로 바꾸면 월 보험료는 낮아진다고 하는데 병원을 자주 이용하면 오히려 손해일 수 있다는 말도 있어 고민입니다.',
    question: '현재 2세대 실비보험을 유지하고 있습니다. 처음 가입했을 때보다 보험료가 많이 올라서 4세대 실비 전환을 알아보고 있습니다.\n보험료는 확실히 낮아질 수 있다고 들었지만, 도수치료와 주사치료를 가끔 받고 있어 비급여 자기부담이 커질까 걱정됩니다.\n한 번 전환하면 예전 실비로 돌아가기 어렵다는 이야기도 있어 선뜻 결정하지 못하고 있습니다.\n보험료만 비교해서 4세대로 바꿔도 되는지, 어떤 내용을 먼저 확인해야 하는지 궁금합니다.',
    lead: '4세대 실비 전환은 월 보험료만 비교해서 결정하기 어렵습니다. 기존 실비와 4세대 실비는 자기부담금, 급여·비급여 보장 방식, 비급여 이용량에 따른 보험료 변동 구조가 다르기 때문입니다.\n\n병원을 거의 이용하지 않는 사람에게는 보험료 절감 효과가 클 수 있지만, 비급여 치료를 자주 이용한다면 실제 본인 부담액까지 계산해봐야 합니다.',
    point: '전환 판단의 핵심은 “지금 내는 보험료”가 아니라 앞으로 예상되는 보험료와 의료비 본인 부담액의 합계입니다.',
    bullets: [
      '현재 실비가 몇 세대인지와 최근 갱신 전후 보험료를 먼저 확인해야 합니다.',
      '최근 1~3년 동안 도수치료, 비급여 주사, MRI 등 비급여 이용 빈도와 청구 금액을 확인합니다.',
      '4세대 전환 후 통원·입원 시 자기부담금이 어떻게 달라지는지 비교해야 합니다.',
      '보험료가 부담되는 원인이 실비인지, 종합보험의 갱신형 특약인지도 함께 봐야 합니다.',
      '전환 후 다시 기존 계약 조건으로 돌아갈 수 있는지는 반드시 해당 보험사 안내와 약관으로 확인해야 합니다.'
    ],
    close: '병원 이용이 적고 기존 실비 갱신 보험료가 크게 부담된다면 4세대 전환을 검토할 수 있습니다. 반대로 비급여 치료를 정기적으로 이용하고 있다면 보험료가 낮아지는 것만 보고 전환하면 실제 지출이 늘 수 있습니다.\n\n최근 청구 내역과 현재 보험료, 예상 자기부담금을 함께 놓고 비교한 뒤 결정하는 편이 안전합니다.'
  },
  {
    id: 'seed-1016', no: 1016, slug: 'old-silbi-vs-new-silbi', category: '실비보험',
    title: '2009년에 가입한 실비는 무조건 유지하는 게 맞나요?',
    time: '42분 전',
    listMessage: '오래된 실비는 무조건 좋다고 들어 유지하고 있지만 보험료가 계속 오르고 있습니다. 현재 보장과 새 실비의 차이를 모르겠고, 언제까지 유지해야 할지 궁금합니다.',
    question: '2009년쯤 가입한 실비보험을 지금까지 유지하고 있습니다. 주변에서는 옛날 실비는 조건이 좋아서 절대 해지하면 안 된다고 합니다.\n그런데 갱신 때마다 보험료가 오르고 있고, 종합보험 안에 붙어 있어 다른 특약까지 함께 내다보니 부담이 큽니다.\n병원은 1년에 몇 번 정도만 가고 큰 치료를 받은 적은 없습니다.\n오래된 실비라는 이유만으로 계속 유지하는 게 맞는지, 새 실비와 비교할 때 어떤 부분을 봐야 하는지 알고 싶습니다.',
    lead: '오래된 실비가 현재 상품보다 유리한 부분이 있을 수는 있지만, 가입 시기만으로 무조건 유지해야 한다고 단정할 수는 없습니다. 보장 범위가 넓더라도 보험료가 지속해서 오르고 실제 의료 이용이 적다면 유지 비용이 더 크게 느껴질 수 있습니다.\n\n반대로 최근 병력이 있거나 향후 의료비 지출 가능성이 높다면 해지 후 재가입이 어려워질 수 있어 더 신중해야 합니다.',
    point: '오래된 실비의 가치는 보장 범위, 현재 보험료, 병원 이용량, 재가입 가능성을 함께 봐야 판단할 수 있습니다.',
    bullets: [
      '실비 가입 연도와 약관상 자기부담금, 통원 한도, 비급여 보장 범위를 확인합니다.',
      '최근 3년간 낸 실비보험료와 실제 돌려받은 보험금을 비교해 유지 비용을 봅니다.',
      '종합보험에 실비가 묶여 있다면 실비만 남기거나 다른 특약을 조정할 수 있는지 확인합니다.',
      '최근 진료, 검사, 약 복용 이력이 있다면 새 실비 가입 가능성을 먼저 확인해야 합니다.',
      '보험료 인상이 일시적인지 앞으로도 계속 부담될 수준인지 장기 납입 가능성을 봐야 합니다.'
    ],
    close: '오래된 실비가 좋은 조건을 갖고 있더라도 생활비를 압박할 정도로 보험료가 높다면 다른 특약 조정이나 전환 가능성을 함께 검토해야 합니다.\n\n해지부터 결정하지 말고 현재 계약의 실비 보장과 부가 특약을 나눠서 본 뒤, 남길 보장과 줄일 비용을 구분하는 것이 좋습니다.'
  },
  {
    id: 'seed-1015', no: 1015, slug: 'cancer-diagnosis-money-amount', category: '암보험',
    title: '암진단비 5천만 원이면 충분한 편인가요?',
    time: '1시간 전',
    listMessage: '기존 보험과 새로 알아본 보험을 합치면 일반암 진단비가 5천만 원 정도 됩니다. 치료비뿐 아니라 일을 쉬는 기간까지 고려하면 충분한지 모르겠습니다.',
    question: '현재 가입한 보험을 확인해보니 일반암 진단비가 총 3천만 원 정도 있습니다. 추가로 2천만 원을 더 가입하면 5천만 원이 됩니다.\n보험 상담에서는 5천만 원 이상은 있어야 한다는 말도 듣고, 너무 많이 가입할 필요는 없다는 말도 들어 기준을 모르겠습니다.\n저는 맞벌이지만 대출이 있고, 제가 일을 쉬게 되면 가계에 부담이 생길 수 있습니다.\n암진단비를 정할 때 치료비 외에 무엇을 계산해야 하는지 궁금합니다.',
    lead: '암진단비는 치료비만을 위한 보장이 아닙니다. 치료 기간 중 줄어드는 소득, 대출과 생활비, 보호자의 돌봄 비용 등 현금이 필요한 상황에 대비하는 성격도 큽니다.\n\n따라서 모든 사람에게 5천만 원이 충분하거나 부족하다고 말할 수 없고, 현재 소득과 고정비, 기존 보장, 보험료 유지 가능성을 함께 봐야 합니다.',
    point: '적정 암진단비는 금액 자체보다 진단 후 1~2년 동안 필요한 생활자금을 얼마나 확보할 수 있는지가 중요합니다.',
    bullets: [
      '기존 보험의 일반암, 유사암, 소액암 진단비가 각각 얼마인지 구분해서 확인합니다.',
      '본인 소득이 중단될 경우 매월 필요한 생활비와 대출 상환액을 계산합니다.',
      '회사 복지, 단체보험, 배우자 소득, 비상자금 등 이미 확보된 자원을 함께 봅니다.',
      '갱신형 진단비는 장기적으로 보험료가 오를 수 있어 유지 가능성을 확인해야 합니다.',
      '진단비를 무리하게 늘려 월 보험료가 부담되면 중도 해지 가능성이 커질 수 있습니다.'
    ],
    close: '일반암 진단비 5천만 원은 많은 사람이 검토하는 수준일 수 있지만, 충분한지는 개인 상황에 따라 다릅니다. 대출과 가족 부양 부담이 크다면 더 필요할 수 있고, 비상자금과 단체보험이 충분하다면 적게 준비해도 될 수 있습니다.\n\n현재 보장 총액과 월 고정비를 같이 계산해 부족한 부분만 보완하는 것이 보험료 낭비를 줄이는 방법입니다.'
  },
  {
    id: 'seed-1014', no: 1014, slug: 'general-cancer-similar-cancer-difference', category: '암보험',
    title: '일반암 5천만 원인데 유사암은 1천만 원이면 괜찮나요?',
    time: '1시간 전',
    listMessage: '암보험 증권을 보니 일반암은 5천만 원인데 갑상선암 같은 유사암은 1천만 원만 지급된다고 적혀 있습니다. 왜 보장금액이 다른지 궁금합니다.',
    question: '암보험을 확인해보니 일반암 진단비는 5천만 원인데 유사암 진단비는 1천만 원으로 되어 있습니다.\n갑상선암이나 기타피부암처럼 비교적 치료가 잘 되는 암이라서 적게 지급된다는 설명을 들었습니다.\n그렇다고 해도 수술이나 치료를 받으면 일을 쉬어야 할 수 있는데 1천만 원이면 너무 적은 건 아닌지 걱정됩니다.\n일반암, 유사암, 소액암을 구분해서 봐야 하는 이유와 적정 금액을 알고 싶습니다.',
    lead: '암보험은 약관에서 정한 암의 분류에 따라 진단비가 다르게 지급될 수 있습니다. 일반암 진단비가 크게 보이더라도 실제 진단명이 유사암이나 소액암으로 분류되면 더 낮은 금액이 지급될 수 있습니다.\n\n분류 기준은 상품과 가입 시기에 따라 차이가 있을 수 있으므로 단순히 총 암진단비만 보면 실제 보장을 오해하기 쉽습니다.',
    point: '암보험은 총액보다 어떤 암이 어떤 분류에 들어가고 각각 얼마가 지급되는지를 확인해야 합니다.',
    bullets: [
      '약관에서 유사암으로 분류하는 질병의 범위를 먼저 확인합니다.',
      '일반암 진단비 대비 유사암 진단비 지급 비율과 가입 한도를 확인합니다.',
      '소액암이나 특정암이 별도로 분류되어 일반암보다 적게 지급되는지 봅니다.',
      '재진단암, 전이암, 원발암 등 추가 담보는 지급 조건이 다르므로 별도로 확인합니다.',
      '기존 계약과 추가 계약의 암 분류 기준이 서로 다를 수 있어 각각 약관을 봐야 합니다.'
    ],
    close: '유사암 1천만 원이 충분한지는 치료 방식과 소득 공백, 기존 저축에 따라 다릅니다. 다만 일반암 5천만 원이라는 숫자만 보고 전체 암 보장이 충분하다고 판단해서는 안 됩니다.\n\n현재 가입한 상품의 암 분류표와 지급 금액을 확인한 뒤 부족한 분류만 보완하는 방식이 효율적입니다.'
  },
  {
    id: 'seed-1013', no: 1013, slug: 'high-blood-pressure-insurance', category: '유병자보험',
    title: '고혈압약만 복용 중이면 일반보험 가입도 가능한가요?',
    time: '2시간 전',
    listMessage: '고혈압약을 3년째 복용하고 있고 수치는 안정적입니다. 입원이나 합병증은 없는데 유병자보험이 아닌 일반보험도 심사가 가능한지 궁금합니다.',
    question: '고혈압 진단을 받고 3년째 약을 복용하고 있습니다. 약을 먹으면 혈압은 정상 범위로 유지되고 있고 입원이나 수술 이력은 없습니다.\n보험을 알아보니 고혈압이 있으면 유병자보험만 가능하다는 곳도 있고 일반보험 심사를 해볼 수 있다는 곳도 있습니다.\n암보험과 뇌·심장 진단비를 준비하고 싶은데 일반심사를 먼저 보는 것이 맞을까요?\n어떤 자료와 조건을 기준으로 가입 가능성을 판단하는지 궁금합니다.',
    lead: '고혈압약을 복용한다고 해서 모든 일반보험 가입이 불가능한 것은 아닙니다. 보험사는 진단 시점, 최근 혈압 수치, 복용 약, 합병증 여부, 추가 질환을 종합적으로 심사합니다.\n\n같은 고혈압이라도 약 한 가지로 안정적으로 관리되는 경우와 여러 약을 복용하거나 심혈관 합병증이 있는 경우의 결과는 다를 수 있습니다.',
    point: '고혈압 심사에서는 약 복용 사실보다 현재 조절 상태와 합병증 여부가 더 중요하게 작용할 수 있습니다.',
    bullets: [
      '최근 혈압 수치와 건강검진 결과를 확인합니다.',
      '고혈압 진단 시점, 복용 약 종류, 용량 변경 여부를 정리합니다.',
      '심장, 신장, 뇌혈관 질환이나 당뇨 등 동반 질환이 있는지 봅니다.',
      '최근 입원·수술·추가검사 권유 이력이 있으면 정확히 고지해야 합니다.',
      '일반심사 가능성을 먼저 확인하고 조건이 불리할 때 유병자보험을 비교하는 편이 좋습니다.'
    ],
    close: '혈압이 안정적으로 관리되고 합병증이나 최근 입원 이력이 없다면 일반보험 심사를 검토할 여지가 있습니다. 다만 뇌·심장 담보는 암 담보보다 심사가 더 까다로울 수 있습니다.\n\n최근 처방전과 건강검진 결과를 기준으로 일반심사와 간편심사를 함께 비교하면 불필요하게 비싼 보험료를 피할 수 있습니다.'
  },
  {
    id: 'seed-1012', no: 1012, slug: 'colon-polyp-insurance-after-removal', category: '유병자보험',
    title: '대장용종 제거한 지 6개월 됐는데 보험 가입할 수 있나요?',
    time: '2시간 전',
    listMessage: '건강검진 대장내시경에서 용종 2개를 제거했고 조직검사는 양성이었습니다. 6개월이 지난 지금 일반보험 가입이 가능한지 알고 싶습니다.',
    question: '6개월 전 건강검진 대장내시경에서 용종 두 개를 제거했습니다. 조직검사 결과는 양성이라고 들었고 추가 치료는 없었습니다.\n병원에서는 몇 년 뒤 다시 내시경을 받으라고 했고 현재 복용하는 약도 없습니다.\n암보험을 알아보는 중인데 용종 제거 이력 때문에 가입이 거절되거나 대장 관련 보장이 제외될 수 있다는 말을 들었습니다.\n어느 정도 시간이 지나야 가입이 가능한지, 어떤 서류를 준비해야 하는지 궁금합니다.',
    lead: '대장용종 제거 이력은 제거했다는 사실만으로 결정되지 않습니다. 용종의 개수와 크기, 조직검사 결과, 완전 제거 여부, 추적검사 계획을 함께 봅니다.\n\n조직검사가 양성이고 추가 치료가 필요하지 않더라도 제거 시점이 최근이라면 보험사에서 일정 기간 경과를 보거나 관련 서류를 요구할 수 있습니다.',
    point: '대장용종 심사의 핵심은 제거 후 경과 기간보다 조직검사 결과와 추가검사 필요 여부입니다.',
    bullets: [
      '내시경 검사 결과지와 용종 제거 기록을 준비합니다.',
      '조직검사 결과가 선종인지, 과형성 용종인지 등 정확한 진단명을 확인합니다.',
      '용종의 개수와 크기, 완전 제거 여부를 확인합니다.',
      '추적 내시경 권고 시기와 추가검사 또는 치료 권유가 있었는지 봅니다.',
      '보험사별 심사 기준이 달라 일반심사, 부담보, 간편심사 결과를 비교할 수 있습니다.'
    ],
    close: '양성 용종을 완전히 제거했고 추가 치료가 없다면 보험 가입을 검토할 수 있지만, 제거 후 6개월이라는 기간만으로 결과를 확정할 수는 없습니다.\n\n검사 결과지와 조직검사지를 기준으로 심사를 받아보면 가입 가능 여부와 대장 관련 보장 조건을 더 정확하게 확인할 수 있습니다.'
  },
  {
    id: 'seed-1011', no: 1011, slug: 'baby-insurance-when-to-join', category: '태아보험',
    title: '태아보험은 임신 몇 주 전에 가입해야 하나요?',
    time: '3시간 전',
    listMessage: '현재 임신 11주이고 1차 기형아 검사를 앞두고 있습니다. 검사를 받은 뒤 가입해도 되는지, 가입 시기를 놓치면 제한이 생기는지 궁금합니다.',
    question: '현재 임신 11주이고 곧 1차 기형아 검사를 받을 예정입니다. 검사 결과를 확인한 뒤 태아보험을 가입하려고 했는데 주변에서는 검사 전에 준비하는 것이 좋다고 합니다.\n너무 빨리 가입하면 불필요한 특약을 많이 넣게 될까 걱정되고, 늦게 가입하면 가입 가능한 담보가 줄어들 수 있다는 말도 들었습니다.\n산모는 특별한 병력이 없고 현재까지 검사 결과도 정상입니다.\n태아보험은 보통 어떤 시점에 준비하고, 가입 전에 무엇을 확인해야 하나요?',
    lead: '태아보험은 임신 주수와 산전검사 결과에 따라 가입 가능 담보와 심사 조건이 달라질 수 있습니다. 특정 주수를 기준으로 모든 보험사가 동일하게 제한하는 것은 아니므로 상품별 기준을 확인해야 합니다.\n\n검사 전에 무조건 가입해야 한다기보다 현재 임신 주수, 산모의 병력, 산전검사 일정, 필요한 보장을 함께 고려해 준비하는 것이 좋습니다.',
    point: '태아보험 가입 시기는 빠르기만 한 것보다 산전검사 일정과 원하는 태아 관련 담보의 가입 가능 기간을 맞추는 것이 중요합니다.',
    bullets: [
      '현재 임신 주수와 예정된 산전검사 일정을 확인합니다.',
      '산모의 질환, 약 복용, 임신 관련 진료 이력이 고지 대상인지 봅니다.',
      '선천이상, 저체중아, 신생아 질환 등 원하는 태아 관련 담보의 가입 가능 시기를 확인합니다.',
      '출생 후 자녀보험으로 이어지는 보장과 납입 기간을 함께 봅니다.',
      '특약 수를 늘리기보다 출생 전후에 실제 필요한 보장부터 우선순위를 정합니다.'
    ],
    close: '임신 11주라면 여러 상품을 비교해볼 수 있는 시기일 가능성이 있지만, 정확한 가입 가능 여부는 산모 상태와 보험사 기준에 따라 달라집니다.\n\n검사 결과가 나온 뒤 조건이 달라질 수 있으므로 현재 상태에서 가능한 보장과 검사 후 선택지를 함께 비교해 결정하는 것이 좋습니다.'
  },
  {
    id: 'seed-1010', no: 1010, slug: 'driver-insurance-needed', category: '운전자보험',
    title: '자동차보험이 있는데 운전자보험도 따로 필요한가요?',
    time: '4시간 전',
    listMessage: '자동차보험은 매년 가입하고 있지만 운전자보험은 없습니다. 사고가 났을 때 벌금이나 변호사 비용은 자동차보험에서 처리되지 않는지 궁금합니다.',
    question: '자동차보험은 매년 가입하고 있는데 운전자보험은 따로 없습니다. 자동차보험이 있으면 사고 처리가 다 되는 줄 알았는데, 형사사고가 나면 벌금이나 변호사 선임비용은 별도라고 들었습니다.\n운전을 자주 하지는 않지만 출퇴근과 주말 이동에 차를 사용합니다.\n운전자보험 광고를 보면 담보가 계속 바뀐다고 해서 무엇이 필요한지 모르겠습니다.\n자동차보험과 운전자보험의 역할이 어떻게 다르고, 가입한다면 어떤 담보를 봐야 하나요?',
    lead: '자동차보험과 운전자보험은 보장하는 목적이 다릅니다. 자동차보험은 주로 사고로 인한 상대방의 인적·물적 피해와 차량 손해를 보상하는 역할을 하고, 운전자보험은 운전자 본인의 형사·행정상 비용을 대비하는 담보를 중심으로 구성됩니다.\n\n다만 모든 사고에서 운전자보험이 지급되는 것은 아니며, 담보별 지급 조건과 면책사항을 확인해야 합니다.',
    point: '운전자보험은 자동차보험의 대체재가 아니라 형사적 비용 보장을 보완하는 역할입니다.',
    bullets: [
      '교통사고처리지원금의 지급 대상 사고와 한도를 확인합니다.',
      '변호사선임비용은 지급 시점과 대상 사건의 조건을 확인해야 합니다.',
      '벌금 담보는 대인과 대물 구분, 한도를 확인합니다.',
      '기존 종합보험이나 오래된 운전자보험에 같은 담보가 있는지 중복 여부를 봅니다.',
      '음주, 무면허, 도주 등 약관상 보장되지 않는 사고 조건을 확인해야 합니다.'
    ],
    close: '운전 빈도가 낮더라도 사고의 형사적 책임 가능성이 없어지는 것은 아닙니다. 다만 필요 이상의 특약을 많이 넣기보다 핵심 비용 담보를 중심으로 유지 가능한 보험료로 구성하는 편이 좋습니다.\n\n기존 보험에 운전자 관련 특약이 있는지 먼저 확인한 뒤 부족한 부분만 보완하면 중복 가입을 피할 수 있습니다.'
  },
  {
    id: 'seed-1009', no: 1009, slug: 'dental-insurance-implant', category: '치아보험',
    title: '임플란트 예정인데 지금 치아보험 가입해도 보장되나요?',
    time: '5시간 전',
    listMessage: '치과에서 어금니 상태가 좋지 않아 나중에 임플란트가 필요할 수 있다고 들었습니다. 지금 가입하면 해당 치아도 보장받을 수 있는지 궁금합니다.',
    question: '최근 치과 검진에서 어금니 한 개의 상태가 좋지 않아 당장은 아니지만 나중에 임플란트가 필요할 수 있다는 설명을 들었습니다.\n치아보험이 없는 상태라 지금이라도 가입하려고 합니다.\n이미 치료 권유를 받은 치아는 가입 후에도 보장이 안 될 수 있다는 말과 면책기간만 지나면 된다는 말이 달라 헷갈립니다.\n치아보험 가입 전 어떤 진료 이력을 고지해야 하고, 임플란트 보장은 어떤 조건을 확인해야 하나요?',
    lead: '치아보험은 가입 직후 모든 치료를 보장하는 상품이 아닙니다. 면책기간과 감액기간이 있을 수 있고, 가입 전에 이미 진단받거나 치료를 권유받은 치아는 보장에서 제외될 가능성이 있습니다.\n\n따라서 예정된 임플란트 비용만 보고 가입하기보다 최근 치과 진료 이력과 약관상 보장 개시 조건을 먼저 확인해야 합니다.',
    point: '이미 치료 필요성을 확인한 치아는 보험 가입 시점보다 진단·치료 권유 시점이 중요할 수 있습니다.',
    bullets: [
      '최근 치과 진료, 엑스레이, 치료 권유 내용을 정확히 확인합니다.',
      '가입 전 고지해야 하는 충치, 치주질환, 발치 권유, 보철 치료 이력을 봅니다.',
      '임플란트 보장의 면책기간, 감액기간, 연간 개수 제한을 확인합니다.',
      '보존치료와 보철치료의 지급 기준과 금액을 구분해서 봅니다.',
      '예상 보험료 총액과 실제 받을 수 있는 보장 금액을 비교해야 합니다.'
    ],
    close: '이미 임플란트 가능성을 설명받은 치아가 있다면 새로 가입한 보험에서 해당 치료가 보장된다고 단정하기 어렵습니다. 고지 누락은 나중에 지급 문제로 이어질 수 있으므로 진료 이력을 정확히 알려야 합니다.\n\n치아보험은 향후 다른 치아의 치료비 대비까지 포함해 장기적으로 보험료 대비 효율을 따져보는 것이 좋습니다.'
  },
  {
    id: 'seed-1008', no: 1008, slug: 'remodeling-not-always-cancel', category: '보험료',
    title: '보험 리모델링은 기존 보험을 전부 해지하는 건가요?',
    time: '6시간 전',
    listMessage: '리모델링 상담을 받았는데 기존 보험을 정리하고 새 보험으로 바꾸자는 제안을 받았습니다. 오래된 보험까지 전부 해지해도 되는지 불안합니다.',
    question: '보험 리모델링 상담을 받았는데 현재 가입한 종합보험 두 개를 해지하고 새 보험 하나로 바꾸자는 제안을 받았습니다.\n기존 보험은 가입한 지 10년이 넘었고 실비와 암진단비, 수술비가 들어 있습니다.\n새 보험은 보장이 더 좋아 보이지만 다시 면책기간이 생기고 지금 병력 때문에 조건이 달라질까 걱정됩니다.\n리모델링은 원래 기존 보험을 전부 해지하는 것인지, 안전하게 점검하는 순서가 궁금합니다.',
    lead: '보험 리모델링은 기존 보험을 모두 해지하고 새로 가입하는 작업이 아닙니다. 현재 계약에서 유지할 가치가 있는 보장과 중복되거나 부담이 큰 특약을 구분하는 과정이 먼저입니다.\n\n새 보험의 보장이 좋아 보여도 가입 심사, 면책·감액기간, 보험료 변동, 기존 계약의 유리한 조건을 함께 비교하지 않으면 오히려 보장 공백이 생길 수 있습니다.',
    point: '좋은 리모델링은 새 보험 가입보다 기존 보험을 해지하지 않고 분석하는 단계에서 시작합니다.',
    bullets: [
      '기존 실비와 오래된 진단비의 가입 시기, 보장 범위, 갱신 조건을 확인합니다.',
      '새 보험이 정상적으로 승인되고 보장 조건이 확정되기 전에 기존 보험을 해지하지 않습니다.',
      '새 계약의 면책기간과 감액기간 동안 생길 수 있는 보장 공백을 확인합니다.',
      '중복되는 입원일당, 수술비, 갱신형 특약 등 보험료 부담 원인을 구분합니다.',
      '해지 외에도 특약 삭제, 감액, 납입 방식 조정이 가능한지 확인합니다.'
    ],
    close: '기존 보험 전체 해지는 되돌리기 어려운 결정입니다. 특히 최근 병력이나 검사 이력이 있다면 새 보험 조건이 예상과 다를 수 있습니다.\n\n유지할 보험, 줄일 특약, 새로 보완할 보장을 세 단계로 나눠 비교한 뒤 변경하는 것이 안전합니다.'
  }
];

export const extraBoardPosts = extraQuestions.map((item) => ({
  id: item.id,
  slug: item.slug,
  no: item.no,
  category: item.category,
  title: item.title,
  message: item.listMessage,
  nickname: '익명',
  status: '답변완료',
  time: item.time,
  href: `/q/${item.slug}`,
  answer: '상세 답변이 등록되었습니다.'
}));

function relatedLinks(current) {
  return extraQuestions
    .filter((item) => item.slug !== current.slug)
    .sort((a, b) => Number(b.category === current.category) - Number(a.category === current.category))
    .slice(0, 6);
}

export function renderExtraQuestionPage(item) {
  const path = `/q/${item.slug}`;
  const canonical = absolute(path);
  const description = item.lead.replace(/\s+/g, ' ').slice(0, 155);
  const answerText = `${item.lead}\n\n${item.point}\n\n${item.bullets.join('\n')}\n\n${item.close}`;
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'QAPage',
    mainEntity: {
      '@type': 'Question',
      name: item.title,
      text: item.question,
      answerCount: 1,
      acceptedAnswer: {
        '@type': 'Answer',
        text: answerText,
        dateCreated: UPDATED_AT,
        author: { '@type': 'Organization', name: SITE.name }
      }
    }
  };
  const related = relatedLinks(item);

  return `<!DOCTYPE html><html lang="ko"><head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1.0"/><title>${esc(item.title)} | ${esc(SITE.name)}</title><meta name="description" content="${esc(description)}"/><meta name="robots" content="index,follow,max-image-preview:large"/><link rel="canonical" href="${canonical}"/><meta property="og:locale" content="ko_KR"/><meta property="og:type" content="article"/><meta property="og:site_name" content="${esc(SITE.name)}"/><meta property="og:title" content="${esc(item.title)} | ${esc(SITE.name)}"/><meta property="og:description" content="${esc(description)}"/><meta property="og:url" content="${canonical}"/><meta property="og:image" content="https://boheomplay.pagero.kr/og-image"/><meta name="twitter:card" content="summary_large_image"/><link rel="preconnect" href="https://cdn.jsdelivr.net"/><link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/static/pretendard.css"/><link rel="stylesheet" href="/assets/css/styles.css?v=20260712-extra-qa"/><style>
body{background:#fff;color:#111}.qa-main{padding:58px 0 84px}.qa-wrap{max-width:920px;margin:0 auto;padding:0 20px}.crumb{margin-bottom:30px;color:#777;font-size:13px;font-weight:700}.crumb a{color:#555;text-decoration:none}.question{padding-bottom:36px;border-bottom:1px solid #e5e5e5}.meta{display:flex;gap:10px;flex-wrap:wrap;margin-bottom:18px;color:#777;font-size:13px}.question h1{margin:0;font-size:clamp(34px,5.2vw,58px);line-height:1.12;letter-spacing:-.07em}.question-body{margin-top:30px;font-size:18px;line-height:1.95;color:#222}.answer{display:grid;grid-template-columns:56px minmax(0,1fr);gap:18px;margin-top:42px;padding-left:16px}.avatar{width:42px;height:42px;border-radius:50%;display:grid;place-items:center;background:#111;color:#fff;font-weight:900}.answer-meta{margin-bottom:17px}.answer-meta strong{display:block;font-size:15px}.answer-meta span{display:block;margin-top:3px;color:#777;font-size:13px}.answer-content{font-size:17px;line-height:1.95}.answer-content p{margin:0 0 21px}.point{margin:25px 0;padding:21px 23px;border:1px solid #e5e5e5;background:#f7f7f7;font-weight:900;line-height:1.75}.answer-content h2{margin:30px 0 12px;font-size:19px}.answer-content ul{margin:0 0 26px;padding-left:21px}.answer-content li{margin:9px 0}.notice{margin-top:28px;padding:18px 20px;border:1px solid #e5e5e5;background:#fafafa;color:#555;font-size:14px}.contact{margin-top:22px;padding:20px 22px;background:#111;color:#fff;display:flex;align-items:center;justify-content:space-between;gap:14px}.contact a{padding:12px 17px;border-radius:999px;background:#fff;color:#111;text-decoration:none;font-weight:900;white-space:nowrap}.related{margin-top:56px;padding-top:31px;border-top:1px solid #e5e5e5}.related h2{margin:0 0 17px;font-size:23px}.related-list{display:grid;gap:10px}.related-list a{display:block;padding:15px 16px;border:1px solid #e5e5e5;color:#111;text-decoration:none;font-weight:750}.related-list a:hover{background:#f7f7f7}@media(max-width:720px){.qa-main{padding:40px 0 66px}.question-body,.answer-content{font-size:16px}.answer{grid-template-columns:1fr;padding-left:0}.contact{display:block}.contact a{display:flex;margin-top:14px;justify-content:center}}
</style><script type="application/ld+json">${safeJson(schema)}</script></head><body><header class="site-header"><div class="wrap header-inner"><a class="brand" href="/">${esc(SITE.name)}</a><nav class="nav"><a href="/#board">질문게시판</a><a href="/#write">질문남기기</a></nav></div></header><main class="qa-main"><div class="qa-wrap"><div class="crumb"><a href="/">홈</a> / <a href="/#board">질문게시판</a> / ${esc(item.category)}</div><article class="question"><div class="meta"><span>${esc(item.category)}</span><span>익명</span><span>업데이트 ${UPDATED_AT}</span><span>답변완료</span></div><h1>${esc(item.title)}</h1><div class="question-body">${nl(item.question)}</div></article><article class="answer"><div class="avatar">보</div><div><div class="answer-meta"><strong>${esc(SITE.name)} 답변</strong><span>업데이트 ${UPDATED_AT}</span></div><div class="answer-content"><p>${nl(item.lead)}</p><div class="point">${esc(item.point)}</div><h2>먼저 확인할 부분</h2><ul>${item.bullets.map((bullet) => `<li>${esc(bullet)}</li>`).join('')}</ul><p>${nl(item.close)}</p><div class="notice">본 답변은 일반적인 정보 제공 목적입니다. 실제 가입 가능 여부와 보장 내용은 개인의 병력, 계약 조건, 보험사 심사 및 약관에 따라 달라질 수 있습니다.</div><div class="contact"><strong>내 보험 기준으로 바로 묻기</strong><a href="${KAKAO_URL}" target="_blank" rel="noopener noreferrer">오픈카톡 문의</a></div></div></div></article><section class="related"><h2>관련 질문</h2><div class="related-list">${related.map((relatedItem) => `<a href="/q/${relatedItem.slug}">${esc(relatedItem.title)}</a>`).join('')}</div></section></div></main><footer class="footer"><div class="wrap footer-inner"><p><strong>${esc(SITE.company)}</strong> · 대표 ${esc(SITE.owner)} · 사업자번호 ${esc(SITE.businessNumber)}</p><nav><a href="/privacy/">개인정보처리방침</a><a href="/terms/">이용약관</a></nav></div></footer></body></html>`;
}
