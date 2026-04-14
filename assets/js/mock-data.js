window.MOCK_BOOTSTRAP_DATA = {
  settings: {
    site_name: '보험플레이',
    hero_tag_1: '기존 보험 점검',
    hero_tag_2: '무료 보장분석',
    hero_tag_3: '1:1 맞춤 상담',
    hero_title: '보험료는 계속 나가는데,\n뭐가 잘 들어가 있는지 헷갈리시나요?',
    hero_subtitle: '보험플레이는 특정 상품만 권하는 상담이 아니라,\n기존 보험 점검부터 실손 유지 여부, 암보험·운전자보험·가족보장 우선순위까지\n내 상황에 맞게 한 번에 정리해드립니다.',
    identity_title: '보험플레이는\n상품을 밀어넣기보다 먼저 정리하는 상담을 합니다.',
    identity_desc: '보험 상담이 어려운 이유는 상품이 많아서가 아니라,\n내 보험이 지금 어떤 상태인지 알기 어렵기 때문입니다.\n\n보험플레이는 기존 보험이 있다면 중복과 부족을 먼저 보고,\n새로 준비해야 한다면 지금 꼭 필요한 보장부터 우선순위를 정리합니다.',
    hero_image: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=1800&q=80'
  },

  products: [
    {
      product_id: 'INS001',
      category: '건강보험',
      title: '암보험 상담',
      subtitle: '진단비 구조부터 다시 점검',
      summary: '기존 암보험이 있다면 중복 보장과 부족한 진단비를 먼저 보고, 새로 준비해야 한다면 꼭 필요한 보장부터 정리합니다.',
      target: '암보험이 이미 있거나 새로 준비하려는 30~50대',
      point: '진단비 구조 · 유사암 · 재진단 우선 확인',
      thumbnail_url: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?auto=format&fit=crop&w=1200&q=80',
      description: '암보험은 단순히 가입 여부보다 진단비 구조, 유사암 범위, 재진단, 갱신 여부를 함께 봐야 합니다. 보험플레이는 현재 구조를 먼저 보고 더 필요한 보장과 줄여도 되는 부분을 정리합니다.',
      point_1: '기존 암보험 중복 담보 확인',
      point_2: '진단비 우선순위 정리',
      point_3: '납입 여력에 맞는 방향 점검'
    },
    {
      product_id: 'INS002',
      category: '생활보장',
      title: '운전자보험 상담',
      subtitle: '사고 비용보장 중심으로 정리',
      summary: '자동차보험으로 부족한 벌금, 교통사고처리지원금, 변호사선임비용 중심으로 꼭 필요한 구조를 상담합니다.',
      target: '차량 운전이 잦은 직장인 · 자영업자 · 가족 운전자',
      point: '자동차보험과 역할 구분부터 점검',
      thumbnail_url: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80',
      description: '운전자보험은 자동차보험과 다르게 사고 이후 실제 부담이 큰 비용을 대비하는 구조입니다. 중복되는 특약은 줄이고 필요한 비용보장부터 정리하는 방향으로 봅니다.',
      point_1: '자동차보험과 역할 구분',
      point_2: '중복 특약 최소화',
      point_3: '필수 담보 우선 정리'
    },
    {
      product_id: 'INS003',
      category: '실손/종합',
      title: '실손보험 점검',
      subtitle: '유지할지 방향부터 판단',
      summary: '실손은 무조건 바꾸는 것이 아니라 현재 세대, 보험료, 병력, 다른 보장과의 조합을 함께 보고 유지 방향부터 정리합니다.',
      target: '기존 실손보험이 있어 유지 여부가 고민인 분',
      point: '실손 세대 · 보험료 · 종합보장 연계 확인',
      thumbnail_url: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=1200&q=80',
      description: '실손보험은 세대별 차이가 크기 때문에 단순 비교보다 현재 실손을 유지할 가치가 있는지 먼저 보는 것이 중요합니다. 보험플레이는 실손과 종합보험을 함께 보며 방향을 정리합니다.',
      point_1: '실손 세대 확인',
      point_2: '종합보험과의 조합 점검',
      point_3: '유지 / 변경 방향 정리'
    },
    {
      product_id: 'INS004',
      category: '가족보장',
      title: '어린이보험 상담',
      subtitle: '성장기 보장 우선순위 점검',
      summary: '입원, 수술, 진단비, 후유장해 등 자녀 연령에 맞는 구조인지 먼저 보고 과한 특약보다 핵심 보장을 중심으로 정리합니다.',
      target: '예비부모 · 어린 자녀가 있는 가정',
      point: '연령대별 핵심보장과 과한 특약 구분',
      thumbnail_url: 'https://images.unsplash.com/photo-1516627145497-ae6968895b74?auto=format&fit=crop&w=1200&q=80',
      description: '어린이보험은 가입 시기와 담보 구성에 따라 효율 차이가 큽니다. 부모 입장에서 복잡하게 느껴지는 부분을 줄이고 성장기 핵심 보장을 중심으로 방향을 정리합니다.',
      point_1: '연령대별 보장 비교',
      point_2: '불필요 특약 최소화',
      point_3: '부모보험과 함께 점검'
    }
  ],

  reviews: [
    {
      category: '암보험',
      title: '기존 보험 4개 중 중복 담보가 많다는 걸 처음 알았어요',
      summary: '무조건 새로 가입하라고 하지 않고, 지금 있는 보험부터 보고 겹치는 부분과 부족한 진단비를 나눠 설명해줘서 훨씬 명확했습니다.',
      thumbnail_url: 'https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=1200&q=80'
    },
    {
      category: '실손점검',
      title: '실손은 유지하고 다른 보장만 정리하는 방향이 더 맞다고 설명받았어요',
      summary: '세대 차이와 보험료를 기준으로 왜 유지가 유리한지 이해하기 쉽게 설명해줘서, 괜히 바꾸지 않고 방향을 잡을 수 있었습니다.',
      thumbnail_url: 'https://images.unsplash.com/photo-1556740749-887f6717d7e4?auto=format&fit=crop&w=1200&q=80'
    },
    {
      category: '가족보장',
      title: '부부 보험, 아이 보험까지 한 번에 보니 어디가 비어 있는지 바로 보였어요',
      summary: '가족 보험을 따로따로 보지 않고 우선순위부터 정리해줘서 무엇을 먼저 준비해야 할지 훨씬 선명해졌습니다.',
      thumbnail_url: 'https://images.unsplash.com/photo-1516534775068-ba3e7458af70?auto=format&fit=crop&w=1200&q=80'
    }
  ],

  targets: [
    {
      badge: '추천',
      title: '보험이 여러 개라 뭐가 들어 있는지 헷갈리는 분',
      description: '여러 보험에 나뉜 보장을 한 번에 비교해서 중복과 부족을 정리해드립니다.'
    },
    {
      badge: '추천',
      title: '실손보험을 유지할지 고민 중인 분',
      description: '현재 실손 세대와 보험료를 기준으로 유지 방향부터 현실적으로 점검해드립니다.'
    },
    {
      badge: '추천',
      title: '부모님 보험을 대신 정리해야 하는 분',
      description: '연령과 건강 상태를 기준으로 가능한 보장과 우선순위를 정리해드립니다.'
    },
    {
      badge: '추천',
      title: '보험료 부담이 커서 구조를 다시 보고 싶은 분',
      description: '유지 가치가 있는 담보와 줄여도 되는 특약을 나눠서 상담해드립니다.'
    }
  ],

  faqs: [
    {
      question: '상담 신청하면 바로 가입해야 하나요?',
      answer: '아니요. 바로 가입을 결정하지 않아도 됩니다. 먼저 현재 상황과 필요한 보장을 정리하는 상담부터 진행됩니다.'
    },
    {
      question: '기존 보험이 있어도 상담 가능한가요?',
      answer: '가능합니다. 오히려 기존 보험이 있을수록 중복 담보와 부족한 보장을 함께 보는 점검 상담이 중요합니다.'
    },
    {
      question: '실손보험은 무조건 유지하는 게 좋은가요?',
      answer: '상황에 따라 다릅니다. 현재 세대, 보험료, 병력, 다른 보장과의 조합을 같이 보고 판단하는 것이 중요합니다.'
    },
    {
      question: '상담비가 있나요?',
      answer: '기본 상담 접수와 초기 보장 점검은 무료로 안내하는 방향으로 운영할 수 있습니다. 실제 운영 정책에 맞게 문구를 조정하면 됩니다.'
    }
  ]
};
