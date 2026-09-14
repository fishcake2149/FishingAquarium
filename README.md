# FishingAquarium

2D 도트 낚시 + 아쿠아리움 경영 게임 프로젝트입니다.

## 현재 상태

현재는 게임의 핵심 조작감과 시스템을 빠르게 검증하기 위한 HTML 프로토타입 단계입니다.

플레이 가능한 최신 프로토타입:
- `prototype/aquarium_fishing_prototype_reset_button.html`

## 저장소 구조

```text
FishingAquarium/
├─ prototype/                 # 현재 플레이 가능한 HTML 프로토타입
├─ docs/                      # 게임 설계와 코드 구조 문서
└─ README.md
```

Unity 프로젝트를 실제로 시작하면 루트에 `Assets/`, `Packages/`, `ProjectSettings/`를 추가하고, HTML 프로토타입은 참고/밸런스 테스트용으로 유지합니다.

## 개발 원칙

- 기존에 합의한 핵심 조작감과 기능은 새 기능을 추가해도 유지합니다.
- 낚시 Catch Bar는 입력하지 않을 때 자동으로 왼쪽으로 움직이고, 입력하면 관성을 거쳐 오른쪽으로 전환되는 1버튼 구조를 유지합니다.
- 퀘스트, 생물, 지역, 대화 등은 Unity 이전을 고려해 데이터 중심으로 설계합니다.
- 프로토타입에서 검증한 값과 기능은 가능한 한 중앙 설정으로 옮겨 Unity에서도 재사용하기 쉽게 만듭니다.

자세한 구조 계획은 `docs/PROJECT_STRUCTURE.md`를 참고하세요.
