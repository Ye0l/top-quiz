# Arrow Pattern Debugger (Top Quiz)

이 프로젝트는 화살표 패턴(Omega/Arrow formation)을 연습하고 디버깅하기 위한 React 웹 애플리케이션입니다.

## 최근 변경 사항 (Mobile Layout Update)
- **모바일 레이아웃 전환**: 
  - 데스크탑에서도 모바일 앱처럼 보이도록 화면 폭을 제한(Max 480px)하고 중앙에 배치했습니다.
  - 스크롤바를 숨겨 앱과 같은 느낌을 제공합니다.
- **인터랙션 제한**:
  - **확대 차단**: 핀치 줌 및 더블 탭 확대를 방지했습니다.
  - **드래그 및 우클릭 차단**: 텍스트 선택, 이미지 드래그, 마우스 우클릭 메뉴(Context Menu)를 비활성화했습니다.

## 실행 방법
```bash
npm install
npm run dev
```

## 주요 기능
- **Debugger Mode**: 화살표 패턴의 순서를 프레임별로 확인하고 재생할 수 있습니다.
- **Quiz Mode**: 실제 기믹 처리 연습을 위한 퀴즈 모드입니다.
