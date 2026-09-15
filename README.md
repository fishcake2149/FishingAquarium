# FishingAquarium

2D 도트 낚시 + 아쿠아리움 경영 게임 프로젝트입니다.

## 현재 프로토타입

최신 통합 프로토타입은 `prototype/v2/index.html`이며, 루트 `index.html`도 최신 v2로 이동합니다.

기존 프로토타입은 회귀 비교용으로 유지합니다.
- `prototype/aquarium_fishing_prototype_reset_button.html`
- 개편 직전 백업 브랜치: `backup/pre-refactor-20260915`

v2에는 16:9 화면, WASD+좌클릭, Grid 월드/NPC 경로 탐색, 자유 이동 플레이어, 카메라 클램프, 실제 수심 3단계 물색, 왕복 캐스팅, 찌 착수 수심 판정, 연못 생물 14종, 360도 낚시 오버레이, 종별 스택 9칸 가방, 도감 크기 기록, 장비, 시간/날씨, 상점/판매, 수조 전시, 방문객/정산, 관리자실, 저장 기능이 통합되어 있습니다.

비단잉어는 현재 일반 출현 목록에 포함하지 않았으며 이후 연못 지역 보스/스토리로 별도 구현합니다.

## 즉시 테스트 배포

`.github/workflows/pages.yml`에 GitHub Pages 자동 배포를 구성했습니다. 최초 Pages 사이트 생성은 GitHub Actions 토큰이 직접 활성화하지 못했으므로, 저장소 `Settings → Pages`에서 Build and deployment Source를 **GitHub Actions**로 한 번 지정해야 합니다. 이후에는 `main`의 v2가 갱신될 때 같은 Pages 주소로 자동 배포됩니다.

자세한 구현/검증 상태는 `docs/V2_IMPLEMENTATION_STATUS.md`를 참고하세요.

## 저장소 구조

```text
FishingAquarium/
├─ index.html
├─ prototype/
│  ├─ v2/
│  │  ├─ index.html
│  │  ├─ styles.css
│  │  └─ game-source.js
│  └─ aquarium_fishing_prototype_reset_button.html
├─ docs/
└─ .github/workflows/
```

## 개발 원칙

- 새 기능을 추가해도 이미 정상 작동하던 핵심 기능을 잃지 않습니다.
- Catch Bar는 입력하지 않을 때 자동 반시계 방향, 좌클릭 홀드 시 관성을 거쳐 시계 방향으로 전환되는 1버튼 구조를 유지합니다.
- 월드/배치/NPC는 Grid 기반, 플레이어는 자유 이동을 유지합니다.
- 생물/아이템/시간/날씨/낚시 밸런스는 중앙 데이터로 관리합니다.
- 최종 Unity/C# 및 ScriptableObject 계열 데이터 구조로 옮기기 쉽게 설계합니다.
