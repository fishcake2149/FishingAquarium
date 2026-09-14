# Project Structure

이 문서는 현재 HTML 프로토타입을 유지하면서 향후 Unity 프로젝트로 옮기기 위한 기준 구조를 정리합니다.

## 현재 단계

`prototype/` 폴더는 플레이 가능한 통합 HTML 프로토타입을 보관합니다. 이 파일은 빠른 기능 검증과 밸런스 테스트용이며, 아직 Unity용 모듈 구조로 분리된 상태는 아닙니다.

현재 프로토타입에 들어 있는 주요 시스템:

- 아쿠아리움 이동 및 메인 수조 전시
- 방문객 AI와 입장료
- 낚시마을 이동
- 캐스팅/입질/360° 낚시
- 1버튼 Catch Bar 관성 조작
- 물고기 획득, 인벤토리, 도감
- 낚싯대, 미끼, 얼음 폭탄
- 낚시 상점 및 판매
- localStorage 저장/초기화

## Unity 전환 시 목표 구조

```text
FishingAquarium/
├─ Assets/
│  ├─ Scripts/
│  │  ├─ Core/
│  │  ├─ Fishing/
│  │  ├─ Aquarium/
│  │  ├─ Quest/
│  │  ├─ NPC/
│  │  ├─ Time/
│  │  ├─ Economy/
│  │  └─ Data/
│  ├─ Scenes/
│  ├─ Prefabs/
│  ├─ Art/
│  ├─ UI/
│  └─ ScriptableObjects/
├─ Packages/
├─ ProjectSettings/
├─ prototype/
├─ docs/
└─ README.md
```

## 데이터 중심 설계

프로토타입에서 하드코딩되어 있는 값은 Unity에서 가능한 한 데이터로 분리합니다.

예시:

- 생물: `CreatureData`
- 지역: `RegionData`
- 낚싯대: `RodData`
- 미끼/소모품: `ItemData`
- 수조: `TankData`
- 퀘스트: `QuestData`
- 퀘스트 단계: `QuestStep`
- 대화: `DialogueData`
- 상호작용 조건: `InteractionCondition`
- 보상/월드 변화: `Reward`, `WorldChange`

이렇게 해두면 대화 순서, 퀘스트 목적지, 생물 확률, 가격 등을 바꿀 때 시스템 코드를 다시 뜯지 않아도 됩니다.

## 반드시 보존할 낚시 조작

Catch Bar는 정지형 조작으로 바꾸지 않습니다.

- 입력 없음: 자동으로 왼쪽/반시계 방향 이동
- 버튼 홀드: 관성을 거쳐 오른쪽/시계 방향으로 전환
- 버튼 해제: 멈추지 않고 관성을 거쳐 다시 왼쪽으로 전환
- 양방향 가속은 대칭
- 359°와 1° 사이를 자연스럽게 연결

현재 기준 가속 설정은 프로토타입의 `BAR_ACCEL_CONFIG`를 기준값으로 삼습니다.

## 리팩터링 순서

1. 현재 HTML 프로토타입은 기능 보존용 기준판으로 유지
2. 생물/장비/상점/밸런스 데이터를 코드 상단의 중앙 설정으로 모으기
3. 낚시, 아쿠아리움, 방문객, 상점, 저장 시스템의 책임을 구분하기
4. 퀘스트와 시간/날씨 시스템은 새 기능 추가 시 데이터 중심으로 구현하기
5. Unity 프로젝트 생성 후 각 시스템을 C# 컴포넌트와 ScriptableObject 구조로 옮기기

중요: 구조 정리는 기존 기능을 지우거나 조작감을 바꾸기 위한 작업이 아니라, 이후 기능 추가 시 망가지지 않게 만드는 작업입니다.
