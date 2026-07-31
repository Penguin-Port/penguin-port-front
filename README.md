# PenguinPort-FE

[Web] Penguin Port 서비스의 프론트엔드 프로젝트입니다.

## 기술 스택

| 영역 | 사용 기술 |
| --- | --- |
| 빌드 도구 | Vite 8 |
| UI | React 19 |
| 언어 | TypeScript 6 |
| 린트 | Oxlint |
| 패키지 관리 | npm |

## 시작하기

### 요구 사항

- Node.js
- npm

### 설치 및 실행

```bash
# 저장소 복제
git clone https://github.com/Penguin-Port/penguin-port-front.git
cd penguin-port-front

# 의존성 설치
npm install

# 개발 서버 실행
npm run dev
```

개발 서버는 기본적으로 [http://localhost:5173](http://localhost:5173)에서 실행됩니다.

## 스크립트

| 명령 | 설명 |
| --- | --- |
| `npm run dev` | 개발 서버 실행 |
| `npm run build` | 타입 검사 및 프로덕션 빌드 |
| `npm run preview` | 프로덕션 빌드 결과 미리보기 |
| `npm run lint` | Oxlint를 이용한 코드 검사 |

## 프로젝트 구조

```text
penguin-port-front/
├── public/             # 정적 파일
├── src/
│   ├── assets/         # 이미지 등 프로젝트 에셋
│   ├── App.tsx         # 루트 컴포넌트
│   ├── App.css         # App 컴포넌트 스타일
│   ├── index.css       # 전역 스타일
│   └── main.tsx        # 애플리케이션 진입점
├── index.html          # HTML 진입점
├── package.json        # 의존성 및 npm 스크립트
├── tsconfig.json       # TypeScript 설정
└── vite.config.ts      # Vite 설정
```

## Convention

### Branch Strategy

- **`main`** — 배포 가능한 안정 버전을 관리하는 브랜치
- **`develop`** — 개발 내용을 통합하는 브랜치
- 기능 브랜치는 `develop`에서 생성하고, 작업 완료 후 `develop`을 대상으로 PR을 생성합니다.
- 배포할 변경사항이 준비되면 `develop`에서 `main`을 대상으로 PR을 생성합니다.

```text
main
  └── develop
        ├── feature/기능명
        ├── fix/수정명
        └── chore/작업명
```

### Commit Message

커밋 메시지는 `[type]: 설명` 형식을 사용합니다.

| type | 설명 |
| --- | --- |
| `feat` | 새로운 기능 추가 |
| `fix` | 버그 수정 |
| `chore` | 설정, 패키지 등 기타 작업 |
| `refactor` | 기능 변경 없는 코드 개선 |
| `style` | 코드 포맷 또는 UI 스타일 변경 |
| `docs` | 문서 변경 |
| `test` | 테스트 추가 또는 수정 |

```text
feat: 로그인 페이지 구현
fix: 버튼 클릭 이벤트 오류 수정
docs: README 실행 방법 추가
```

## 빌드

```bash
npm run build
```

빌드 결과물은 `dist/` 디렉터리에 생성됩니다.
