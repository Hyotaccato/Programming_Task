import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Bell,
  ChevronDown,
  Copy,
  CreditCard,
  Expand,
  HelpCircle,
  History,
  ImageUp,
  LayoutGrid,
  Maximize,
  Menu,
  MessageSquare,
  Minus,
  MousePointer2,
  Palette,
  Plus,
  RefreshCw,
  Search,
  Send,
  Sparkles,
  TextCursorInput,
  TrendingUp,
  Type,
  UploadCloud,
  WalletCards,
  X,
} from 'lucide-react';

const RESULT_CATEGORIES = [
  {
    id: 'layout',
    title: 'Layout',
    icon: LayoutGrid,
    accent: 'blue',
    defaultItems: ['카드 기반 구조 사용', '정보 우선순위 재정렬 (중요한 정보가 상단에 오도록 구성)'],
  },
  {
    id: 'spacing',
    title: 'Spacing',
    icon: RefreshCw,
    accent: 'indigo',
    defaultItems: ['섹션 간 간격 확대 (16px -> 24px)', '요소 간 여백 통일 (8pt grid 시스템 적용)'],
  },
  {
    id: 'typography',
    title: 'Typography',
    icon: Type,
    accent: 'green',
    defaultItems: ['H1 / H2 / Body 텍스트 계층 구조 명확화', '폰트 크기, 굵기 대비 강화로 가독성 향상'],
  },
  {
    id: 'color',
    title: 'Color',
    icon: Palette,
    accent: 'orange',
    defaultItems: ['브랜드 컬러 1~2개만 사용하여 일관성 유지', '텍스트와 배경의 대비 강화 (WCAG 기준 준수)'],
  },
  {
    id: 'uiEmphasis',
    title: 'UI Emphasis',
    icon: Sparkles,
    accent: 'pink',
    defaultItems: ['Primary CTA 버튼 강조 (색상 대비 + 크기 증가)', '불필요한 요소는 보조 색상으로 처리하여 집중도 향상'],
  },
];

const SAMPLE_FIGMA_URL = 'https://www.figma.com/design/abc123/Project?node-id=1-2';

function buildFigmaEmbedUrl(url) {
  return `https://www.figma.com/embed?embed_host=share&url=${encodeURIComponent(url)}`;
}

function parseFigmaUrl(url) {
  try {
    const parsed = new URL(url);
    const parts = parsed.pathname.split('/').filter(Boolean);
    const fileKey = parts[1] === 'design' || parts[1] === 'file' ? parts[2] : parts[1];

    if (!parsed.hostname.includes('figma.com') || !['design', 'file'].includes(parts[0]) || !fileKey || fileKey.length < 8) {
      return null;
    }

    return { parsed, fileKey };
  } catch {
    return null;
  }
}

const keywordGuides = [
  {
    match: ['토스', 'toss', '뱅킹', '금융'],
    summary: '토스 스타일은 카드 기반 구조, 넓은 여백, 높은 정보 대비, 단일 Primary CTA로 정리합니다.',
    categories: {
      layout: ['카드 기반 구조 사용', '정보 우선순위 재정렬 (중요한 정보가 상단에 오도록 구성)'],
      spacing: ['섹션 간 간격 확대 (16px -> 24px)', '요소 간 여백 통일 (8pt grid 시스템 적용)'],
      typography: ['H1 / H2 / Body 텍스트 계층 구조 명확화', '폰트 크기, 굵기 대비 강화로 가독성 향상'],
      color: ['브랜드 컬러 1~2개만 사용하여 일관성 유지', '텍스트와 배경의 대비 강화 (WCAG 기준 준수)'],
      uiEmphasis: ['Primary CTA 버튼 강조 (색상 대비 + 크기 증가)', '불필요한 요소는 보조 색상으로 처리하여 집중도 향상'],
    },
  },
  {
    match: ['깔끔', '정리', '단순', '미니멀', 'clean'],
    summary: '깔끔한 화면은 불필요한 시각 요소를 줄이고 간격, 정렬, 텍스트 계층을 먼저 통일합니다.',
    categories: {
      layout: ['동일 성격의 콘텐츠를 카드 또는 리스트 단위로 그룹화', '한 화면의 주요 행동을 1개로 제한'],
      spacing: ['8pt grid 기준으로 좌우 정렬선 통일', '붙어 보이는 섹션은 16px -> 24px로 간격 확대'],
      typography: ['제목, 본문, 보조 텍스트의 크기 차이를 명확하게 설정', '본문 line-height를 150~160%로 조정'],
      color: ['배경색은 neutral 계열로 낮추고 강조색 사용량 축소', '구분선 대신 여백과 배경 대비로 영역 분리'],
      uiEmphasis: ['중요하지 않은 아이콘/라벨의 색상 대비를 낮춤', '중복 버튼은 텍스트 링크 또는 보조 액션으로 변경'],
    },
  },
  {
    match: ['복잡', '답답', '많아', '어려워', '헷갈'],
    summary: '복잡해 보인다는 피드백은 정보 우선순위와 시각적 밀도를 낮추라는 의미로 해석합니다.',
    categories: {
      layout: ['콘텐츠 hierarchy를 Level 1~3 구조로 재정렬', 'Primary / Secondary / Tertiary 정보 우선순위 재구성'],
      spacing: ['component 내부 padding 12px -> 16px로 확대', '섹션 간 spacing 16px -> 24px로 확대'],
      typography: ['Heading / Body / Caption 계층을 명확히 분리', 'Regular(400)와 Bold(700)의 대비를 높여 스캔성 개선'],
      color: ['동시에 보이는 강조색을 2개 이하로 제한', '경고/성공/정보 색상은 상태 표현에만 사용'],
      uiEmphasis: ['Primary CTA를 제외한 액션 버튼은 secondary 스타일로 낮춤', '반복되는 장식 요소와 그림자는 제거'],
    },
  },
];

function buildResult(feedback) {
  const normalized = feedback.toLowerCase().trim();
  const matched = keywordGuides.find((guide) => guide.match.some((word) => normalized.includes(word)));

  if (!matched) {
    return {
      summary: '피드백을 화면 구조, 여백, 타이포그래피, 색상, 강조 요소로 나누어 수정 기준으로 정리했습니다.',
      categories: RESULT_CATEGORIES.reduce((acc, category) => {
        acc[category.id] = category.defaultItems;
        return acc;
      }, {}),
    };
  }

  return {
    summary: matched.summary,
    categories: RESULT_CATEGORIES.reduce((acc, category) => {
      acc[category.id] = matched.categories[category.id] ?? category.defaultItems;
      return acc;
    }, {}),
  };
}

function formatResult(feedback, result) {
  return [
    `입력 피드백: ${feedback}`,
    '',
    result.summary,
    '',
    ...RESULT_CATEGORIES.flatMap((category) => [
      `${category.title}`,
      ...(result.categories[category.id] ?? []).map((item) => `- ${item}`),
      '',
    ]),
  ].join('\n');
}

function App() {
  const [inputMode, setInputMode] = useState('figma');
  const [figmaUrl, setFigmaUrl] = useState(SAMPLE_FIGMA_URL);
  const [loadedSource, setLoadedSource] = useState({
    label: 'Mobile Banking App',
    detail: 'iPhone 14 Pro',
  });
  const [previewImage, setPreviewImage] = useState('');
  const [figmaEmbedUrl, setFigmaEmbedUrl] = useState('');
  const [feedback, setFeedback] = useState('토스처럼 만들어줘');
  const [result, setResult] = useState(() => buildResult('토스처럼 만들어줘'));
  const [history, setHistory] = useState([]);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [expandedCards, setExpandedCards] = useState(() => new Set(RESULT_CATEGORIES.map((category) => category.id)));
  const [copied, setCopied] = useState('');
  const [toast, setToast] = useState('');
  const [zoom, setZoom] = useState(78);
  const [activeTool, setActiveTool] = useState('select');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isPreviewExpanded, setIsPreviewExpanded] = useState(false);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [dragState, setDragState] = useState(null);
  const fileInputRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    const saved = window.localStorage.getItem('design-feedback-history');
    if (saved) {
      setHistory(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem('design-feedback-history', JSON.stringify(history.slice(0, 8)));
  }, [history]);

  const limitedFeedback = feedback.slice(0, 500);

  const resultText = useMemo(() => formatResult(limitedFeedback, result), [limitedFeedback, result]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return undefined;
    }

    canvas.addEventListener('wheel', handleCanvasWheel, { passive: false });
    return () => canvas.removeEventListener('wheel', handleCanvasWheel);
  }, [zoom, pan]);

  function showToast(message) {
    setToast(message);
    window.setTimeout(() => setToast(''), 1400);
  }

  function handleAnalyze() {
    if (!limitedFeedback.trim()) {
      showToast('피드백을 입력해주세요');
      return;
    }

    setIsAnalyzing(true);
    window.setTimeout(() => {
      const nextResult = buildResult(limitedFeedback);
      const entry = {
        id: crypto.randomUUID(),
        inputFeedback: limitedFeedback,
        result: nextResult,
        createdAt: new Date().toLocaleString('ko-KR', {
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
        }),
      };

      setResult(nextResult);
      setHistory((current) => [entry, ...current.filter((item) => item.inputFeedback !== limitedFeedback)].slice(0, 8));
      setIsAnalyzing(false);
      showToast('피드백을 수정 가이드로 변환했어요');
    }, 450);
  }

  function handleLoadFigma() {
    if (!figmaUrl.trim()) {
      showToast('Figma 링크를 입력해주세요');
      return;
    }

    const figmaInfo = parseFigmaUrl(figmaUrl.trim());

    if (!figmaInfo) {
      showToast('실제 공유 가능한 Figma 링크를 입력해주세요');
      return;
    }

    const nameMatch = figmaUrl.match(/figma\.com\/(?:design|file)\/[^/]+\/([^?]+)/);
    const nodeMatch = figmaUrl.match(/node-id=([^&]+)/);
    const label = nameMatch?.[1] ? decodeURIComponent(nameMatch[1]).replace(/[-_]/g, ' ') : 'Figma 디자인';
    const detail = nodeMatch?.[1] ? `node ${nodeMatch[1].replace('-', ':')}` : '선택 프레임';

    setInputMode('figma');
    setPreviewImage('');
    setFigmaEmbedUrl(buildFigmaEmbedUrl(figmaUrl.trim()));
    setLoadedSource({ label, detail });
    setPan({ x: 0, y: 0 });
    showToast('실제 Figma 화면을 불러왔어요');
  }

  function handleFileChange(event) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setPreviewImage(String(reader.result));
      setFigmaEmbedUrl('');
      setLoadedSource({ label: file.name, detail: '업로드 이미지' });
      setPan({ x: 0, y: 0 });
      showToast('이미지를 미리보기에 불러왔어요');
    };
    reader.readAsDataURL(file);
  }

  async function copyText(text, label) {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(text);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.setAttribute('readonly', '');
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        textarea.remove();
      }
      setCopied(label);
      showToast(label === 'all' ? '전체 결과를 복사했어요' : '카드 내용을 복사했어요');
      window.setTimeout(() => setCopied(''), 1200);
    } catch {
      showToast('복사 권한이 막혀 있어요');
    }
  }

  function toggleCard(cardId) {
    setExpandedCards((current) => {
      const next = new Set(current);
      if (next.has(cardId)) {
        next.delete(cardId);
      } else {
        next.add(cardId);
      }
      return next;
    });
  }

  function loadHistory(entry) {
    setFeedback(entry.inputFeedback);
    setResult(entry.result);
    setHistoryOpen(false);
    showToast('히스토리 결과를 불러왔어요');
  }

  function getBoundedZoom(nextZoom) {
    return Math.max(40, Math.min(180, Math.round(nextZoom)));
  }

  function updateZoom(nextZoom) {
    setZoom(getBoundedZoom(nextZoom));
  }

  function selectTool(tool) {
    setActiveTool(tool.id);
    showToast(`${tool.label} 도구 선택`);
  }

  function startCanvasDrag(event) {
    if (event.button !== 0) {
      return;
    }

    event.currentTarget.setPointerCapture(event.pointerId);
    setActiveTool('hand');
    setDragState({
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      originX: pan.x,
      originY: pan.y,
    });
  }

  function moveCanvasDrag(event) {
    if (!dragState || dragState.pointerId !== event.pointerId) {
      return;
    }

    setPan({
      x: dragState.originX + event.clientX - dragState.startX,
      y: dragState.originY + event.clientY - dragState.startY,
    });
  }

  function endCanvasDrag(event) {
    if (dragState?.pointerId === event.pointerId) {
      setDragState(null);
    }
  }

  function handleCanvasWheel(event) {
    event.preventDefault();

    if (event.shiftKey) {
      setPan((current) => ({
        x: current.x - event.deltaY - event.deltaX,
        y: current.y,
      }));
      return;
    }

    const rect = event.currentTarget.getBoundingClientRect();
    const nextZoom = getBoundedZoom(zoom - event.deltaY * 0.12);
    const zoomRatio = nextZoom / zoom;
    const pointerX = event.clientX - rect.left - rect.width / 2 - pan.x;
    const pointerY = event.clientY - rect.top - rect.height / 2 - pan.y;

    setPan({
      x: pan.x - pointerX * (zoomRatio - 1),
      y: pan.y - pointerY * (zoomRatio - 1),
    });
    setZoom(nextZoom);
  }

  const tools = [
    { id: 'select', label: '선택', icon: MousePointer2 },
    { id: 'hand', label: '손 도구', icon: UploadCloud },
    { id: 'comment', label: '코멘트', icon: MessageSquare },
    { id: 'search', label: '검색', icon: Search },
    { id: 'fit', label: '맞춤', icon: Maximize },
  ];

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand">
          <div className="brand-mark">
            <Sparkles size={16} strokeWidth={2.6} />
          </div>
          <h1>Design Feedback Translator</h1>
        </div>

        <nav className="top-actions" aria-label="상단 메뉴">
          <button className="nav-button" type="button" aria-label="히스토리" onClick={() => setHistoryOpen(true)}>
            <History size={18} />
            <span>히스토리</span>
          </button>
          <button className="nav-button" type="button" aria-label="도움말" onClick={() => setHelpOpen(true)}>
            <HelpCircle size={18} />
            <span>도움말</span>
          </button>
          <div className="avatar" aria-label="사용자 E">
            E
          </div>
        </nav>
      </header>

      <main className="workspace">
        <section className={isPreviewExpanded ? 'preview-panel expanded-preview' : 'preview-panel'} aria-label="디자인 미리보기">
          <div className="source-tabs">
            <button
              className={inputMode === 'figma' ? 'tab active' : 'tab'}
              type="button"
              onClick={() => setInputMode('figma')}
            >
              Figma 링크
            </button>
            <button
              className={inputMode === 'image' ? 'tab active' : 'tab'}
              type="button"
              onClick={() => setInputMode('image')}
            >
              이미지 업로드
            </button>
          </div>

          <div className="source-card">
            {inputMode === 'figma' ? (
              <>
                <input
                  aria-label="Figma 링크"
                  value={figmaUrl}
                  onChange={(event) => setFigmaUrl(event.target.value)}
                />
                <button className="dark-button" type="button" onClick={handleLoadFigma}>
                  불러오기
                </button>
              </>
            ) : (
              <>
                <button className="upload-field" type="button" onClick={() => fileInputRef.current?.click()}>
                  <ImageUp size={18} />
                  <span>{previewImage ? '업로드된 이미지 사용 중' : '디자인 이미지 선택'}</span>
                </button>
                <input ref={fileInputRef} type="file" accept="image/*" hidden onChange={handleFileChange} />
                <button className="dark-button" type="button" onClick={() => fileInputRef.current?.click()}>
                  업로드
                </button>
              </>
            )}
          </div>

          <div className="canvas-header">
            <div className="file-info">
              <div className="figma-logo" aria-hidden="true">
                <span />
                <span />
                <span />
                <span />
                <span />
              </div>
              <button className="select-button" type="button">
                {loadedSource.label}
                <ChevronDown size={14} />
              </button>
              <div className="divider" />
              <button className="select-button" type="button">
                {loadedSource.detail}
                <ChevronDown size={14} />
              </button>
            </div>

            <div className="zoom-controls">
              <button type="button" aria-label="축소" onClick={() => updateZoom(zoom - 10)}>
                <Minus size={18} />
              </button>
              <span>{zoom}%</span>
              <button type="button" aria-label="확대" onClick={() => updateZoom(zoom + 10)}>
                <Plus size={18} />
              </button>
              <button
                type="button"
                aria-label={isPreviewExpanded ? '전체화면 닫기' : '전체화면'}
                onClick={() => {
                  setIsPreviewExpanded((current) => !current);
                  showToast(isPreviewExpanded ? '전체화면을 닫았어요' : '미리보기를 크게 열었어요');
                }}
              >
                <Expand size={18} />
              </button>
            </div>
          </div>

          <div
            ref={canvasRef}
            className={dragState ? 'design-canvas is-dragging' : 'design-canvas'}
            onPointerDown={startCanvasDrag}
            onPointerMove={moveCanvasDrag}
            onPointerUp={endCanvasDrag}
            onPointerCancel={endCanvasDrag}
          >
            <div className="canvas-stage" style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom / 78})` }}>
              {figmaEmbedUrl ? (
                <iframe
                  className="figma-embed"
                  title="Figma 디자인 미리보기"
                  src={figmaEmbedUrl}
                  allowFullScreen
                />
              ) : previewImage ? (
                <div className="uploaded-preview">
                  <img src={previewImage} alt="업로드한 디자인 미리보기" />
                </div>
              ) : (
                <PhonePreview />
              )}
            </div>
            <button
              className="split-handle"
              type="button"
              aria-label="패널 크기 조정"
              onPointerDown={(event) => event.stopPropagation()}
            >
              <ChevronDown size={18} />
              <ChevronDown size={18} />
            </button>
          </div>

          <div className="tool-palette" aria-label="캔버스 도구">
            <button
              className={activeTool === 'select' ? 'tool active' : 'tool'}
              type="button"
              aria-label="선택"
              onClick={() => selectTool(tools[0])}
            >
              <MousePointer2 size={18} />
            </button>
            <button
              className={activeTool === 'hand' ? 'tool active' : 'tool'}
              type="button"
              aria-label="손 도구"
              onClick={() => selectTool(tools[1])}
            >
              <UploadCloud size={18} />
            </button>
            <button
              className={activeTool === 'comment' ? 'tool active' : 'tool'}
              type="button"
              aria-label="코멘트"
              onClick={() => selectTool(tools[2])}
            >
              <MessageSquare size={18} />
            </button>
            <div className="tool-divider" />
            <button
              className={activeTool === 'search' ? 'tool active' : 'tool'}
              type="button"
              aria-label="검색"
              onClick={() => selectTool(tools[3])}
            >
              <Search size={18} />
            </button>
            <span className="zoom-label">{zoom}%</span>
            <button
              className={activeTool === 'fit' ? 'tool active' : 'tool'}
              type="button"
              aria-label="맞춤"
              onClick={() => {
                updateZoom(78);
                setPan({ x: 0, y: 0 });
                selectTool(tools[4]);
              }}
            >
              <Maximize size={18} />
            </button>
          </div>
        </section>

        <section className="analysis-panel" aria-label="피드백 분석">
          <div className="input-block">
            <div className="section-title">피드백 입력</div>
            <div className="textarea-wrap">
              <textarea
                value={limitedFeedback}
                maxLength={500}
                onChange={(event) => setFeedback(event.target.value)}
                aria-label="디자인 피드백 입력"
                placeholder="예: 토스처럼 만들어줘"
              />
              <span>{limitedFeedback.length}/500</span>
            </div>
            <button className="primary-button" type="button" onClick={handleAnalyze} disabled={isAnalyzing}>
              {isAnalyzing ? <TextCursorInput size={16} /> : <Sparkles size={16} />}
              {isAnalyzing ? '분석 중...' : '변환하기'}
            </button>
          </div>

          <div className="result-block">
            <div className="result-heading">
              <span>
                <Sparkles size={16} />
                AI 분석 결과
              </span>
            </div>

            <div className="result-list">
              {RESULT_CATEGORIES.map((category) => (
                <ResultCard
                  key={category.id}
                  category={category}
                  items={result.categories[category.id] ?? category.defaultItems}
                  expanded={expandedCards.has(category.id)}
                  onToggle={() => toggleCard(category.id)}
                  onCopy={() =>
                    copyText(
                      [`${category.title}`, ...(result.categories[category.id] ?? []).map((item) => `- ${item}`)].join(
                        '\n',
                      ),
                      category.id,
                    )
                  }
                  copied={copied === category.id}
                />
              ))}
            </div>

            <button className="copy-all-button" type="button" onClick={() => copyText(resultText, 'all')}>
              <span>{copied === 'all' ? '복사 완료' : '전체 결과 복사하기'}</span>
              <Copy size={16} />
            </button>
          </div>
        </section>
      </main>

      {historyOpen && (
        <div className="history-layer" role="dialog" aria-modal="true" aria-label="히스토리">
          <div className="history-backdrop" onClick={() => setHistoryOpen(false)} />
          <aside className="history-panel">
            <div className="history-head">
              <div>
                <strong>히스토리</strong>
                <span>최근 변환 결과</span>
              </div>
              <button type="button" onClick={() => setHistoryOpen(false)} aria-label="닫기">
                <X size={20} />
              </button>
            </div>
            {history.length === 0 ? (
              <div className="empty-history">아직 저장된 피드백이 없습니다.</div>
            ) : (
              <div className="history-list">
                {history.map((entry) => (
                  <button key={entry.id} type="button" onClick={() => loadHistory(entry)}>
                    <span>{entry.inputFeedback}</span>
                    <small>{entry.createdAt}</small>
                  </button>
                ))}
              </div>
            )}
          </aside>
        </div>
      )}

      {helpOpen && (
        <div className="history-layer" role="dialog" aria-modal="true" aria-label="도움말">
          <div className="history-backdrop" onClick={() => setHelpOpen(false)} />
          <aside className="help-panel">
            <div className="history-head">
              <div>
                <strong>도움말</strong>
                <span>데모에서 실제로 가능한 동작</span>
              </div>
              <button type="button" onClick={() => setHelpOpen(false)} aria-label="닫기">
                <X size={20} />
              </button>
            </div>
            <ul className="help-list">
              <li>피드백을 입력하고 변환하기를 누르면 카테고리별 수정 가이드가 바뀝니다.</li>
              <li>Figma 링크 불러오기는 공유 가능한 실제 Figma 화면을 좌측 프리뷰에 표시합니다.</li>
              <li>이미지 업로드는 선택한 디자인 이미지를 좌측 프리뷰에 표시합니다.</li>
              <li>복사 버튼은 카드별 또는 전체 결과를 클립보드에 복사합니다.</li>
              <li>히스토리는 최근 변환 결과를 LocalStorage에 저장합니다.</li>
            </ul>
          </aside>
        </div>
      )}

      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}

function ResultCard({ category, items, expanded, onToggle, onCopy, copied }) {
  const Icon = category.icon;

  return (
    <article className={expanded ? 'result-card expanded' : 'result-card collapsed'}>
      <button className={`card-icon ${category.accent}`} type="button" aria-label={`${category.title} 카테고리`}>
        <Icon size={22} strokeWidth={2.6} />
      </button>
      <div className="card-content">
        <div className="card-topline">
          <h3>{category.title}</h3>
          <div className="card-actions">
            <button type="button" onClick={onCopy}>
              <Copy size={15} />
              <span>{copied ? '완료' : '복사'}</span>
            </button>
            <button type="button" onClick={onToggle} aria-label={expanded ? '접기' : '펼치기'}>
              <ChevronDown className={expanded ? 'chevron open' : 'chevron'} size={18} />
            </button>
          </div>
        </div>
        {expanded && (
          <ul>
            {items.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        )}
      </div>
    </article>
  );
}

function PhonePreview() {
  return (
    <div className="phones">
      <div className="phone">
        <div className="status-row">
          <span>9:41</span>
          <span className="signal">•••</span>
        </div>
        <div className="phone-nav">
          <Menu size={17} />
          <Bell size={17} />
        </div>
        <div className="greeting">
          <div className="portrait" />
          <div>
            <p>안녕하세요, 이효은님</p>
            <h2>오늘도 좋은 하루<br />보내세요!</h2>
          </div>
        </div>

        <div className="balance-card">
          <div className="balance-top">
            <span>내 계좌</span>
            <strong>▲ 5,000원</strong>
          </div>
          <h3>1,234,567원</h3>
          <div className="wave" />
        </div>

        <div className="quick-section">
          <h4>빠른 메뉴</h4>
          <div className="quick-grid">
            <QuickItem icon={Send} label="송금" />
            <QuickItem icon={CreditCard} label="카드" />
            <QuickItem icon={WalletCards} label="대출" />
            <QuickItem icon={TrendingUp} label="투자" />
          </div>
        </div>

        <div className="history-preview">
          <div className="mini-title">
            <h4>최근 거래 내역</h4>
            <span>더보기 ›</span>
          </div>
          <div className="transaction">
            <div className="store-logo">S</div>
            <div>
              <strong>스타벅스</strong>
              <span>카페</span>
            </div>
            <div className="amount">
              <strong>-5,200원</strong>
              <span>오늘 08:45</span>
            </div>
          </div>
        </div>
      </div>

      <div className="phone second">
        <div className="status-row faded">
          <span>9:41</span>
          <span className="signal">•••</span>
        </div>
        <div className="phone-nav">
          <span className="back-arrow">‹</span>
          <Plus size={19} />
        </div>
        <h2 className="phone-title">카드</h2>
        <div className="black-card">
          <span>toss bank</span>
          <small>•••• •••• •••• 1234</small>
          <strong>이효은</strong>
          <b>VISA</b>
        </div>

        <div className="budget">
          <span>이번 달 사용 금액</span>
          <strong>567,000원</strong>
          <div className="progress">
            <i />
          </div>
          <div className="budget-bottom">
            <span>이번 달 예산</span>
            <span>1,000,000원</span>
          </div>
        </div>

        <div className="spend-list">
          <SpendItem color="blue" label="교통" amount="120,000원" />
          <SpendItem color="orange" label="카페" amount="78,000원" />
          <SpendItem color="mint" label="쇼핑" amount="250,000원" />
          <SpendItem color="purple" label="기타" amount="119,000원" />
        </div>
      </div>
    </div>
  );
}

function QuickItem({ icon: Icon, label }) {
  return (
    <div className="quick-item">
      <div>
        <Icon size={18} strokeWidth={2.4} />
      </div>
      <span>{label}</span>
    </div>
  );
}

function SpendItem({ color, label, amount }) {
  return (
    <div className="spend-item">
      <div className={`spend-dot ${color}`}>{label.slice(0, 1)}</div>
      <span>{label}</span>
      <strong>{amount}</strong>
    </div>
  );
}

export default App;
