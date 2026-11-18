/**
 * 제1회 대구경북 오픈 피클볼 대회 안내 & 네이버 지도 연동 애플리케이션
 * 순수 Vanilla JavaScript 기반 DOM 렌더링 및 상태 관리
 */

document.addEventListener("DOMContentLoaded", () => {
  // 1. 대회 기본 설정 및 상태 데이터
  const state = {
    tournamentTitle: "제1회 대구경북 오픈 피클볼 대회",
    eventDate: "2026-12-19T09:00:00",
    eventDateDisplay: "2026년 12월 19일 (토) 09:00 ~ 18:00",
    venueName: "대구시민체육관 피클볼 전용코트",
    venueAddress: "대구광역시 북구 고성로 191",
    maxTeams: 48,
    activeTab: "overview",
    filterCategory: "ALL",
    entries: JSON.parse(localStorage.getItem("pickleball_entries")) || [
      {
        id: 1,
        category: "남자복식",
        grade: "오픈부",
        teamName: "스매시킹",
        player1: "김민수",
        player2: "박준영",
        status: "입금완료",
      },
      {
        id: 2,
        category: "혼합복식",
        grade: "일반부",
        teamName: "키친마스터",
        player1: "이서연",
        player2: "최현우",
        status: "입금완료",
      },
      {
        id: 3,
        category: "여자복식",
        grade: "초심부",
        teamName: "달구벌랠리",
        player1: "정지은",
        player2: "한소희",
        status: "입금대기",
      },
    ],
  };

  // 2. CSS 스타일 동적 주입 함수
  function injectStyles() {
    const style = document.createElement("style");
    style.textContent = `
      :root {
        --primary: #0f766e;
        --primary-dark: #115e59;
        --accent: #eab308;
        --naver: #03c75a;
        --bg: #f8fafc;
        --card: #ffffff;
        --text: #1e293b;
        --muted: #64748b;
        --border: #e2e8f0;
      }
      * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif; }
      body { background-color: var(--bg); color: var(--text); line-height: 1.6; }
      
      /* Hero Section */
      .hero {
        background: linear-gradient(135deg, #0f766e 0%, #064e3b 100%);
        color: white;
        padding: 3.5rem 1.5rem;
        text-align: center;
      }
      .badge {
        display: inline-block;
        background: rgba(234, 179, 8, 0.2);
        color: #fde047;
        border: 1px solid #fde047;
        padding: 0.3rem 0.9rem;
        border-radius: 999px;
        font-size: 0.85rem;
        font-weight: 700;
        margin-bottom: 1rem;
      }
      .hero h1 { font-size: 2.2rem; margin-bottom: 0.8rem; word-break: keep-all; }
      .hero p { color: #ccfbf1; max-width: 600px; margin: 0 auto 2rem; }
      
      /* Info Cards in Hero */
      .hero-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
        gap: 1rem;
        max-width: 960px;
        margin: 0 auto;
      }
      .hero-card {
        background: rgba(255, 255, 255, 0.12);
        backdrop-filter: blur(8px);
        border: 1px solid rgba(255, 255, 255, 0.2);
        padding: 1.2rem;
        border-radius: 12px;
        text-align: left;
        transition: transform 0.2s, background 0.2s;
      }
      .hero-card.clickable { cursor: pointer; }
      .hero-card.clickable:hover {
        transform: translateY(-3px);
        background: rgba(255, 255, 255, 0.22);
        border-color: var(--naver);
      }
      .hero-card-label { font-size: 0.8rem; color: #99f6e4; margin-bottom: 0.3rem; display: flex; justify-content: space-between; align-items: center; }
      .map-pill { background: var(--naver); color: white; font-size: 0.72rem; padding: 2px 8px; border-radius: 99px; font-weight: 700; }
      .hero-card-value { font-size: 1.05rem; font-weight: 700; }

      /* Container & Sections */
      .container { max-width: 960px; margin: 2rem auto; padding: 0 1.2rem; }
      .section-card {
        background: var(--card);
        border-radius: 16px;
        padding: 2rem;
        box-shadow: 0 4px 20px rgba(0,0,0,0.04);
        margin-bottom: 2rem;
        border: 1px solid var(--border);
      }
      .section-title { font-size: 1.35rem; font-weight: 700; margin-bottom: 1.2rem; color: var(--primary-dark); display: flex; align-items: center; gap: 0.5rem; }

      /* Tabs */
      .tab-nav { display: flex; gap: 0.5rem; border-bottom: 2px solid var(--border); margin-bottom: 1.5rem; overflow-x: auto; }
      .tab-btn {
        padding: 0.75rem 1.2rem;
        border: none;
        background: none;
        font-size: 0.95rem;
        font-weight: 600;
        color: var(--muted);
        cursor: pointer;
        border-bottom: 3px solid transparent;
        margin-bottom: -2px;
        white-space: nowrap;
      }
      .tab-btn.active { color: var(--primary); border-bottom-color: var(--primary); }

      /* Info List */
      .info-list { list-style: none; }
      .info-list li { padding: 0.85rem 0; border-bottom: 1px solid var(--border); display: flex; flex-wrap: wrap; gap: 0.5rem; }
      .info-list li:last-child { border-bottom: none; }
      .info-key { width: 130px; font-weight: 700; color: var(--muted); }
      .info-val { flex: 1; font-weight: 500; }
      .venue-link { color: var(--primary); text-decoration: underline; cursor: pointer; font-weight: 700; display: inline-flex; align-items: center; gap: 4px; }

      /* Form */
      .form-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1rem; }
      .form-group { display: flex; flex-direction: column; gap: 0.4rem; }
      .form-group label { font-size: 0.88rem; font-weight: 700; color: var(--text); }
      .form-group input, .form-group select {
        padding: 0.7rem;
        border: 1px solid #cbd5e1;
        border-radius: 8px;
        font-size: 0.95rem;
      }
      .fee-box {
        background: #f0fdfa;
        border: 1px solid #99f6e4;
        padding: 1rem;
        border-radius: 10px;
        margin: 1.2rem 0;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      .btn-primary {
        width: 100%;
        padding: 0.95rem;
        background: var(--primary);
        color: white;
        border: none;
        border-radius: 10px;
        font-size: 1rem;
        font-weight: 700;
        cursor: pointer;
        transition: background 0.2s;
      }
      .btn-primary:hover { background: var(--primary-dark); }

      /* Table */
      .table-wrap { overflow-x: auto; margin-top: 1rem; }
      table { width: 100%; border-collapse: collapse; text-align: left; font-size: 0.92rem; }
      th, td { padding: 0.85rem; border-bottom: 1px solid var(--border); }
      th { background: #f1f5f9; color: var(--muted); font-weight: 700; }
      .status-badge { padding: 0.25rem 0.6rem; border-radius: 6px; font-size: 0.8rem; font-weight: 700; }
      .status-done { background: #dcfce7; color: #166534; }
      .status-wait { background: #fef9c3; color: #854d0e; }

      /* Modal (Naver Map) */
      .modal-overlay {
        display: none;
        position: fixed;
        inset: 0;
        background: rgba(15, 23, 42, 0.65);
        z-index: 1000;
        align-items: center;
        justify-content: center;
        padding: 1rem;
      }
      .modal-overlay.open { display: flex; }
      .modal-box {
        background: white;
        width: 100%;
        max-width: 720px;
        border-radius: 16px;
        overflow: hidden;
        box-shadow: 0 20px 40px rgba(0,0,0,0.25);
        animation: modalPop 0.2s ease-out;
      }
      @keyframes modalPop { from { opacity: 0; transform: scale(0.96); } to { opacity: 1; transform: scale(1); } }
      .modal-header {
        background: var(--naver);
        color: white;
        padding: 1rem 1.4rem;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      .modal-close { background: none; border: none; color: white; font-size: 1.5rem; cursor: pointer; line-height: 1; }
      .modal-body { padding: 1.2rem; }
      .map-search-bar { display: flex; gap: 0.5rem; margin-bottom: 0.8rem; }
      .map-search-bar input { flex: 1; padding: 0.6rem 0.8rem; border: 1px solid #cbd5e1; border-radius: 8px; }
      .map-search-bar button { padding: 0.6rem 1rem; background: #1e293b; color: white; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; }
      .map-iframe { width: 100%; height: 360px; border: 1px solid var(--border); border-radius: 10px; }
      .modal-footer {
        padding: 1rem 1.4rem;
        background: #f8fafc;
        border-top: 1px solid var(--border);
        display: flex;
        flex-wrap: wrap;
        gap: 0.6rem;
        justify-content: space-between;
        align-items: center;
      }
      .btn-naver { background: var(--naver); color: white; border: none; padding: 0.65rem 1.1rem; border-radius: 8px; font-weight: 700; cursor: pointer; text-decoration: none; font-size: 0.9rem; }
      .btn-outline { background: white; border: 1px solid #cbd5e1; color: var(--text); padding: 0.65rem 1rem; border-radius: 8px; font-weight: 600; cursor: pointer; font-size: 0.9rem; }
    `;
    document.head.appendChild(style);
  }

  // 3. 탭 콘텐츠 HTML 생성기
  function getTabContentHTML() {
    if (state.activeTab === "overview") {
      return `
        <ul class="info-list">
          <li><span class="info-key">대회명</span><span class="info-val">${state.tournamentTitle}</span></li>
          <li><span class="info-key">대회일시</span><span class="info-val">${state.eventDateDisplay}</span></li>
          <li>
            <span class="info-key">대회장소</span>
            <span class="info-val">
              <span class="venue-link js-open-map">📍 ${state.venueName} (네이버 지도 보기)</span>
              <div style="font-size:0.85rem; color:var(--muted); margin-top:2px;">${state.venueAddress}</div>
            </span>
          </li>
          <li><span class="info-key">사용구</span><span class="info-val">Franklin X-40 (USAPA 공인구)</span></li>
          <li><span class="info-key">모집규모</span><span class="info-val">부문별 선착순 마감 (총 ${state.maxTeams}팀)</span></li>
        </ul>
      `;
    }
    if (state.activeTab === "rules") {
      return `
        <ul class="info-list">
          <li><span class="info-key">예선전</span><span class="info-val">조별 풀리그 (3~4팀 1조, 15점 단판 랠리/사이드아웃, 8점 코트 체인지)</span></li>
          <li><span class="info-key">본선 토너먼트</span><span class="info-val">각 조 1·2위 진출 (15점 1세트 단판, 4강부터 11점 3세트 2선승제)</span></li>
          <li><span class="info-key">복장 및 장비</span><span class="info-val">논마킹(Non-marking) 실내 전용 운동화 필수 착용, USAPA 승인 패들 사용</span></li>
        </ul>
      `;
    }
    if (state.activeTab === "prizes") {
      return `
        <ul class="info-list">
          <li><span class="info-key">우승 (각 부)</span><span class="info-val">상장 및 상금 20만 원 + 고급 카본 피클볼 패들</span></li>
          <li><span class="info-key">준우승 (각 부)</span><span class="info-val">상장 및 상금 10만 원 + 피클볼 전용 백팩</span></li>
          <li><span class="info-key">공동 3위</span><span class="info-val">상장 및 공인구 6구 세트 + 스포츠 양말</span></li>
          <li><span class="info-key">참가자 전원</span><span class="info-val">기념 티셔츠, 중식 및 생수 제공, 경품 추첨권</span></li>
        </ul>
      `;
    }
    return "";
  }

  // 4. 전체 화면 렌더링 함수
  function render() {
    const app = document.getElementById("app");
    const filteredEntries =
      state.filterCategory === "ALL"
        ? state.entries
        : state.entries.filter(
            (item) => item.category === state.filterCategory,
          );

    app.innerHTML = `
      <!-- 히어로 섹션 -->
      <header class="hero">
        <span class="badge">2026 SEASON OPEN</span>
        <h1>🏓 ${state.tournamentTitle}</h1>
        <p>코트 위의 짜릿한 랠리! 전국 피클볼 동호인 여러분을 초대합니다.</p>
        
        <div class="hero-grid">
          <div class="hero-card">
            <div class="hero-card-label">📅 대회 일정</div>
            <div class="hero-card-value">2026. 12. 19 (토) 09:00</div>
          </div>
          <div class="hero-card clickable js-open-map" title="클릭하여 네이버 지도 열기">
            <div class="hero-card-label">
              <span>📍 대회 장소</span>
              <span class="map-pill">네이버 지도</span>
            </div>
            <div class="hero-card-value" id="heroVenueText">${state.venueName}</div>
          </div>
          <div class="hero-card">
            <div class="hero-card-label">⏳ 개막 카운트다운</div>
            <div class="hero-card-value" id="countdownDisplay">계산 중...</div>
          </div>
          <div class="hero-card">
            <div class="hero-card-label">🔥 현재 접수 현황</div>
            <div class="hero-card-value">${state.entries.length} / ${state.maxTeams} 팀 신청완료</div>
          </div>
        </div>
      </header>

      <main class="container">
        <!-- 대회 요강 탭 섹션 -->
        <section class="section-card">
          <h2 class="section-title">📋 대회 요강 안내</h2>
          <div class="tab-nav">
            <button class="tab-btn ${state.activeTab === "overview" ? "active" : ""}" data-tab="overview">대회 개요</button>
            <button class="tab-btn ${state.activeTab === "rules" ? "active" : ""}" data-tab="rules">경기 방식 및 규정</button>
            <button class="tab-btn ${state.activeTab === "prizes" ? "active" : ""}" data-tab="prizes">시상 내역</button>
          </div>
          <div id="tabContent">${getTabContentHTML()}</div>
        </section>

        <!-- 온라인 참가 신청 섹션 -->
        <section class="section-card">
          <h2 class="section-title">✍️ 온라인 참가 신청</h2>
          <form id="entryForm">
            <div class="form-grid">
              <div class="form-group">
                <label>참가 종목</label>
                <select id="category" required>
                  <option value="남자복식">남자복식</option>
                  <option value="여자복식">여자복식</option>
                  <option value="혼합복식">혼합복식</option>
                </select>
              </div>
              <div class="form-group">
                <label>참가 부수(등급)</label>
                <select id="grade" required>
                  <option value="오픈부">오픈부 (상급)</option>
                  <option value="일반부">일반부 (중급)</option>
                  <option value="초심부">초심부 (입문 1년 미만)</option>
                </select>
              </div>
              <div class="form-group">
                <label>출전 종목 수 (참가비 연동)</label>
                <select id="multiEntry">
                  <option value="1">1종목 출전 (팀당 60,000원)</option>
                  <option value="2">2종목 중복 출전 (팀당 100,000원)</option>
                </select>
              </div>
              <div class="form-group">
                <label>팀명 (클럽명)</label>
                <input type="text" id="teamName" placeholder="예: 대구스매시" required />
              </div>
              <div class="form-group">
                <label>선수 1 (대표자 성명)</label>
                <input type="text" id="player1" placeholder="홍길동" required />
              </div>
              <div class="form-group">
                <label>선수 2 (파트너 성명)</label>
                <input type="text" id="player2" placeholder="김철수" required />
              </div>
            </div>

            <div class="fee-box">
              <span style="font-weight:700; color:var(--primary-dark);">예상 팀 참가비 합계</span>
              <span id="totalFeeText" style="font-size:1.25rem; font-weight:800; color:var(--primary);">60,000원</span>
            </div>

            <button type="submit" class="btn-primary">참가 신청 접수하기</button>
          </form>
        </section>

        <!-- 실시간 참가 팀 현황 섹션 -->
        <section class="section-card">
          <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:0.5rem; margin-bottom:1rem;">
            <h2 class="section-title" style="margin-bottom:0;">🏆 실시간 참가 신청 현황</h2>
            <select id="filterSelect" style="padding:0.45rem 0.8rem; border-radius:8px; border:1px solid #cbd5e1;">
              <option value="ALL" ${state.filterCategory === "ALL" ? "selected" : ""}>전체 종목 보기</option>
              <option value="남자복식" ${state.filterCategory === "남자복식" ? "selected" : ""}>남자복식</option>
              <option value="여자복식" ${state.filterCategory === "여자복식" ? "selected" : ""}>여자복식</option>
              <option value="혼합복식" ${state.filterCategory === "혼합복식" ? "selected" : ""}>혼합복식</option>
            </select>
          </div>
          <div class="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>No</th>
                  <th>종목</th>
                  <th>부수</th>
                  <th>팀명</th>
                  <th>출전 선수</th>
                  <th>상태</th>
                </tr>
              </thead>
              <tbody>
                ${filteredEntries
                  .map(
                    (item, idx) => `
                  <tr>
                    <td>${idx + 1}</td>
                    <td><strong>${item.category}</strong></td>
                    <td>${item.grade}</td>
                    <td>${item.teamName}</td>
                    <td>${item.player1} / ${item.player2}</td>
                    <td>
                      <span class="status-badge ${item.status === "입금완료" ? "status-done" : "status-wait"}">
                        ${item.status}
                      </span>
                    </td>
                  </tr>
                `,
                  )
                  .join("")}
              </tbody>
            </table>
          </div>
        </section>
      </main>

      <!-- 네이버 지도 모달 -->
      <div class="modal-overlay" id="mapModal">
        <div class="modal-box">
          <div class="modal-header">
            <strong style="font-size:1.1rem;">🗺️ 네이버 지도 - 대회 장소 안내</strong>
            <button class="modal-close" id="closeMapModal">&times;</button>
          </div>
          <div class="modal-body">
            <div class="map-search-bar">
              <input type="text" id="mapSearchInput" value="${state.venueName}" placeholder="체육관 또는 주소를 입력하세요" />
              <button type="button" id="mapSearchBtn">지도 검색</button>
            </div>
            <iframe
              id="naverMapFrame"
              class="map-iframe"
              src="https://map.naver.com/p/search/${encodeURIComponent(state.venueName)}"
              title="네이버 지도"
              loading="lazy">
            </iframe>
          </div>
          <div class="modal-footer">
            <div style="font-size:0.88rem; color:var(--muted);">
              📍 <strong id="modalAddressText">${state.venueAddress}</strong>
            </div>
            <div style="display:flex; gap:0.5rem;">
              <button type="button" class="btn-outline" id="copyAddressBtn">주소 복사</button>
              <a id="naverExternalLink" class="btn-naver" href="https://map.naver.com/p/search/${encodeURIComponent(state.venueName)}" target="_blank" rel="noopener noreferrer">
                네이버 지도 앱/웹으로 크게 보기 ↗
              </a>
            </div>
          </div>
        </div>
      </div>
    `;

    bindEvents();
  }

  // 5. 이벤트 리스너 바인딩
  function bindEvents() {
    // 탭 전환 이벤트
    document.querySelectorAll(".tab-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        state.activeTab = e.target.dataset.tab;
        render();
      });
    });

    // 네이버 지도 모달 열기 이벤트 (히어로 장소 카드 + 요강 내 장소 링크)
    document.querySelectorAll(".js-open-map").forEach((el) => {
      el.addEventListener("click", () => {
        document.getElementById("mapModal").classList.add("open");
      });
    });

    // 네이버 지도 모달 닫기
    const mapModal = document.getElementById("mapModal");
    document.getElementById("closeMapModal").addEventListener("click", () => {
      mapModal.classList.remove("open");
    });
    mapModal.addEventListener("click", (e) => {
      if (e.target === mapModal) mapModal.classList.remove("open");
    });

    // 지도 내 장소 검색 변경 기능
    document.getElementById("mapSearchBtn").addEventListener("click", () => {
      const query = document.getElementById("mapSearchInput").value.trim();
      if (!query) return;
      state.venueName = query;
      const encoded = encodeURIComponent(query);
      document.getElementById("naverMapFrame").src =
        `https://map.naver.com/p/search/${encoded}`;
      document.getElementById("naverExternalLink").href =
        `https://map.naver.com/p/search/${encoded}`;
      document.getElementById("heroVenueText").textContent = query;
      document.getElementById("modalAddressText").textContent =
        `검색된 장소: ${query}`;
    });

    // 주소 복사 기능
    document.getElementById("copyAddressBtn").addEventListener("click", () => {
      navigator.clipboard.writeText(state.venueAddress).then(() => {
        alert(`주소가 복사되었습니다:\n${state.venueAddress}`);
      });
    });

    // 참가비 실시간 계산
    const multiSelect = document.getElementById("multiEntry");
    multiSelect.addEventListener("change", (e) => {
      const fee = e.target.value === "1" ? "60,000원" : "100,000원";
      document.getElementById("totalFeeText").textContent = fee;
    });

    // 참가 신청 폼 제출
    document.getElementById("entryForm").addEventListener("submit", (e) => {
      e.preventDefault();
      const newEntry = {
        id: Date.now(),
        category: document.getElementById("category").value,
        grade: document.getElementById("grade").value,
        teamName: document.getElementById("teamName").value.trim(),
        player1: document.getElementById("player1").value.trim(),
        player2: document.getElementById("player2").value.trim(),
        status: "입금대기",
      };

      state.entries.unshift(newEntry);
      localStorage.setItem("pickleball_entries", JSON.stringify(state.entries));
      alert(
        `[${newEntry.teamName}] 팀의 ${newEntry.category}(${newEntry.grade}) 참가 신청이 접수되었습니다!`,
      );
      render();
    });

    // 종목 필터링
    document.getElementById("filterSelect").addEventListener("change", (e) => {
      state.filterCategory = e.target.value;
      render();
    });
  }

  // 6. 실시간 카운트다운 타이머
  function startCountdown() {
    const targetTime = new Date(state.eventDate).getTime();
    setInterval(() => {
      const displayEl = document.getElementById("countdownDisplay");
      if (!displayEl) return;

      const diff = targetTime - Date.now();
      if (diff <= 0) {
        displayEl.textContent = "대회 진행 중!";
        return;
      }
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const mins = Math.floor((diff / (1000 * 60)) % 60);
      displayEl.textContent = `D-${days}일 ${hours}시간 ${mins}분`;
    }, 1000);
  }

  // 초기 실행
  injectStyles();
  render();
  startCountdown();
});
