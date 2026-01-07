// Memory Card Game Logic
(function () {
    const grid = document.querySelector('.grid');
    const cards = Array.from(document.querySelectorAll('.card'));
    const timerEl = document.querySelector('.timer');
    const movesEl = document.querySelector('.moves');
    const scoreEl = document.querySelector('.score');
    const resetBtn = document.querySelector('.reset button');
    const winBox = document.querySelector('.win-box');
    const finalTimeEl = document.querySelector('.final-time');
    const finalMovesEl = document.querySelector('.final-moves');
    const finalScoreEl = document.querySelector('.final-score');
    const playAgainBtn = document.querySelector('.play-again') || document.querySelector('.win-box button');

    if (!grid || cards.length !== 16) {
        // Page might not be ready or structure changed.
        return;
    }

    // Use emojis for fronts so we don't depend on missing image assets
    const icons = ['🍎', '🚗', '🐶', '🌟', '⚽', '🎵', '🍕', '🚀'];
    const values = shuffle([...icons, ...icons]);

    let first = null;
    let second = null;
    let lock = false;
    let moves = 0;
    let matches = 0;
    let startTime = null;
    let timerId = null;

    function init() {
    // Update reset button label to "New Game" to match requirements
    if (resetBtn) resetBtn.textContent = 'New Game';
        // Assign values and reset visuals
        values.forEach((val, i) => {
            const c = cards[i];
            c.dataset.value = val;
            c.textContent = '';
            c.style.backgroundImage = "url('images/back-card.png')";
            c.style.display = 'flex';
            c.style.alignItems = 'center';
            c.style.justifyContent = 'center';
            c.style.fontSize = '32px';
            c.style.userSelect = 'none';
            c.classList.remove('matched');
        });

        first = null;
        second = null;
        lock = false;
        moves = 0;
        matches = 0;
        startTime = null;
        clearInterval(timerId);
        timerId = null;
        updateMoves();
        updateTimer(0);
        updateScore();
        hideWin();
    }

    function shuffle(arr) {
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
    }

    function formatTime(s) {
        const mm = String(Math.floor(s / 60)).padStart(2, '0');
        const ss = String(s % 60).padStart(2, '0');
        return `${mm}:${ss}`;
    }

    function updateTimer(elapsed) {
        if (timerEl) timerEl.textContent = `Time: ${formatTime(elapsed)}`;
    }

    function startTimer() {
        if (timerId) return;
        startTime = Date.now();
        timerId = setInterval(() => {
            const elapsed = Math.floor((Date.now() - startTime) / 1000);
            updateTimer(elapsed);
            updateScore();
        }, 1000);
    }

    function stopTimer() {
        if (timerId) {
            clearInterval(timerId);
            timerId = null;
        }
    }

    function getElapsedSeconds() {
        if (!startTime) return 0;
        return Math.floor((Date.now() - startTime) / 1000);
    }

    function updateMoves() {
        if (movesEl) movesEl.textContent = `Moves: ${moves}`;
    }

    function computeScore() {
        // Simple scoring: start from 1000 and subtract time and moves weight
        const timePenalty = getElapsedSeconds();
        const movePenalty = moves * 5;
        return Math.max(0, 1000 - timePenalty * 2 - movePenalty);
    }

    function updateScore() {
        if (scoreEl) scoreEl.textContent = `Score: ${computeScore()}`;
    }

    function showFront(card) {
        card.textContent = card.dataset.value;
        card.style.backgroundImage = 'none';
        card.style.backgroundColor = '#ffffff';
    }

    function showBack(card) {
        card.textContent = '';
        card.style.backgroundImage = "url('images/back-card.png')";
        card.style.backgroundColor = '';
    }

    function onCardClick(e) {
        const card = e.currentTarget;
        if (lock || card.classList.contains('matched')) return;

        // Start timer on first flip
        if (moves === 0 && !startTime) {
            startTimer();
        }

        if (card === first) return; // ignore double click on same card

        showFront(card);

        if (!first) {
            first = card;
            return;
        }

        second = card;
        lock = true;
        moves += 1;
        updateMoves();
        updateScore();

        if (first.dataset.value === second.dataset.value) {
            first.classList.add('matched');
            second.classList.add('matched');
            first = null;
            second = null;
            lock = false;
            matches += 1;
            if (matches === 8) {
                // Win
                stopTimer();
                showWin();
            }
        } else {
            setTimeout(() => {
                showBack(first);
                showBack(second);
                first = null;
                second = null;
                lock = false;
            }, 800);
        }
    }

    function wireClicks() {
        cards.forEach(c => {
            c.addEventListener('click', onCardClick);
        });
    }

    function reset() {
        shuffle(values);
        init();
    }

    function showWin() {
        if (!winBox) return;
        const elapsed = getElapsedSeconds();
        if (finalTimeEl) finalTimeEl.textContent = formatTime(elapsed);
        if (finalMovesEl) finalMovesEl.textContent = String(moves);
        if (finalScoreEl) finalScoreEl.textContent = String(computeScore());
        winBox.style.display = 'flex';
    }

    function hideWin() {
        if (!winBox) return;
        winBox.style.display = 'none';
    }

    // Event wiring
    if (resetBtn) resetBtn.addEventListener('click', reset);
    if (playAgainBtn) playAgainBtn.addEventListener('click', () => {
        hideWin();
        reset();
    });

    wireClicks();
    init();
})();
