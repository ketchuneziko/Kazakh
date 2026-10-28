import { useCallback, useEffect, useMemo, useState } from "react";

const WORD = "ҒАЛАМТОР";
const MAX_MISTAKES = 6;
const ALPHABET = "АӘБВГҒДЕЁЖЗИЙКҚЛМНҢОӨПРСТУҰҮФХҺЦЧШЩЪЫІЬЭЮЯ".split("");

type GameStatus = "playing" | "won" | "lost";

function HangmanDrawing({ mistakes }: { mistakes: number }) {
  const parts = [
    <circle className="hang-part" key="head" cx="226" cy="87" r="25" />,
    <path className="hang-part" key="body" d="M226 112v76" />,
    <path className="hang-part" key="left-arm" d="m226 132-34 31" />,
    <path className="hang-part" key="right-arm" d="m226 132 34 31" />,
    <path className="hang-part" key="left-leg" d="m226 188-34 42" />,
    <path className="hang-part" key="right-leg" d="m226 188 34 42" />,
  ];

  return (
    <svg
      className="hangman-drawing"
      viewBox="0 0 320 280"
      fill="none"
      aria-hidden="true"
    >
      <g className="gallows-lines" strokeLinecap="round" strokeLinejoin="round">
        <path d="M42 252h228M90 252V34h136M90 78h136M226 34v28" />
      </g>
      <g className="person-lines" strokeLinecap="round" strokeLinejoin="round">
        {parts.slice(0, mistakes).map((part) => part)}
      </g>
    </svg>
  );
}

function RestartIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path
        d="M16.2 7.2A6.6 6.6 0 0 0 4.9 5.4L3.4 7M3.4 7V3.8M3.4 7h3.2m-2.8 5.8a6.6 6.6 0 0 0 11.3 1.8l1.5-1.6m0 0v3.2m0-3.2h-3.2"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function App() {
  const [guessedLetters, setGuessedLetters] = useState<string[]>([]);

  const wrongLetters = useMemo(
    () => guessedLetters.filter((letter) => !WORD.includes(letter)),
    [guessedLetters],
  );
  const mistakes = wrongLetters.length;
  const hasWon = [...new Set(WORD)].every((letter) => guessedLetters.includes(letter));
  const status: GameStatus = hasWon
    ? "won"
    : mistakes >= MAX_MISTAKES
      ? "lost"
      : "playing";
  const latestGuess = guessedLetters[guessedLetters.length - 1];

  const guessLetter = useCallback((letter: string) => {
    setGuessedLetters((current) => {
      const currentMistakes = current.filter((guess) => !WORD.includes(guess)).length;
      const alreadySolved = [...new Set(WORD)].every((answer) => current.includes(answer));

      if (current.includes(letter) || alreadySolved || currentMistakes >= MAX_MISTAKES) {
        return current;
      }

      return [...current, letter];
    });
  }, []);

  const restartGame = useCallback(() => {
    setGuessedLetters([]);
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey || event.metaKey || event.altKey || event.isComposing) return;

      const letter = event.key.toLocaleUpperCase("kk-KZ");
      if (!ALPHABET.includes(letter)) return;

      event.preventDefault();
      guessLetter(letter);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [guessLetter]);

  const message = (() => {
    if (status === "won") return "Жарайсың! Жасырын сөзді дұрыс таптың.";
    if (status === "lost") return `Мүмкіндік аяқталды. Дұрыс жауап: ${WORD}.`;
    if (!latestGuess) return "Әріпті таңда немесе пернетақтадан бас.";
    if (WORD.includes(latestGuess)) return `«${latestGuess}» әрпі бұл сөзде бар!`;
    return `«${latestGuess}» әрпі бұл сөзде жоқ.`;
  })();

  return (
    <div className="site-shell">
      <header className="site-header">
        <a className="brand" href="#top" aria-label="Әріпші ойынының басы">
          <span className="brand-mark" aria-hidden="true">Ә</span>
          <span className="brand-copy">
            <span className="brand-name">Әріпші</span>
            <span className="brand-caption">Қазақша сөз ойыны</span>
          </span>
        </a>

        <button className="restart-button" onClick={restartGame} type="button">
          <RestartIcon />
          <span>Қайта бастау</span>
        </button>
      </header>

      <main className="page-main" id="top">
        <section className="intro" aria-labelledby="page-title">
          <div className="intro-title">
            <p className="eyebrow"><span aria-hidden="true" />Қазақша сөз ойыны</p>
            <h1 id="page-title">Әріпші<span className="title-period">.</span></h1>
          </div>
          <div className="intro-note">
            <p className="intro-lead">Бір сөз. Алты мүмкіндік.</p>
            <p>Жасырын сөзді табу үшін қазақ әліпбиінен әріп таңда.</p>
          </div>
        </section>

        <section className="game-shell" aria-label="Әріпші сөз ойыны">
          <aside className="drawing-panel" aria-label="Қателік пен ойын суреті">
            <div className="mistake-header">
              <span className="panel-label">Қате саны</span>
              <span
                className={`mistake-count${mistakes > 0 ? " has-mistakes" : ""}`}
                aria-label={`${mistakes} қате, ${MAX_MISTAKES - mistakes} мүмкіндік қалды`}
              >
                <strong>{mistakes}</strong><span> / {MAX_MISTAKES}</span>
              </span>
            </div>

            <div className="mistake-meter" aria-hidden="true">
              {Array.from({ length: MAX_MISTAKES }, (_, index) => (
                <span
                  className={index < mistakes ? "meter-segment is-filled" : "meter-segment"}
                  key={index}
                />
              ))}
            </div>

            <div className="drawing-wrap">
              <HangmanDrawing mistakes={mistakes} />
            </div>

            <p className="drawing-caption">
              {status === "lost"
                ? "Келесі жолы міндетті түрде табасың."
                : status === "won"
                  ? "Керемет нәтиже!"
                  : "Асықпай ойлан."
              }
            </p>
          </aside>

          <div className="game-panel">
            <div className="word-heading">
              <div>
                <p className="word-category">Сандық әлем</p>
                <h2>Жасырын сөз</h2>
              </div>
              {status !== "playing" && (
                <span className={`result-mark ${status}`} aria-hidden="true">
                  {status === "won" ? "✓" : "!"}
                </span>
              )}
            </div>

            <p className="word-hint">
              Бүкіл әлемді байланыстырып, ақпарат іздеуге көмектесетін желі.
            </p>

            <div
              className="word-slots"
              role="img"
              aria-label={
                status === "playing"
                  ? "Сегіз әріптен тұратын жасырын сөз"
                  : `Жасырын сөз: ${WORD}`
              }
            >
              {WORD.split("").map((letter, index) => {
                const isRevealed = guessedLetters.includes(letter) || status === "lost";

                return (
                  <span
                    className={`letter-slot${isRevealed ? " is-revealed" : ""}`}
                    key={`${letter}-${index}`}
                    aria-hidden="true"
                  >
                    {isRevealed ? letter : ""}
                  </span>
                );
              })}
            </div>

            <div className={`game-message ${status}`} aria-live="polite" role="status">
              <span className="message-indicator" aria-hidden="true" />
              <p>{message}</p>
            </div>

            <div className="keyboard-heading">
              <h3>Әріпті таңда</h3>
              <span>Пернетақтадан да болады</span>
            </div>

            <div className="letter-grid" role="group" aria-label="Қазақ әліпбиіндегі әріптер">
              {ALPHABET.map((letter) => {
                const isGuessed = guessedLetters.includes(letter);
                const isCorrect = isGuessed && WORD.includes(letter);
                const isWrong = isGuessed && !WORD.includes(letter);

                return (
                  <button
                    className={`letter-key${isCorrect ? " is-correct" : ""}${isWrong ? " is-wrong" : ""}`}
                    disabled={isGuessed || status !== "playing"}
                    key={letter}
                    onClick={() => guessLetter(letter)}
                    type="button"
                    aria-label={`${letter} әрпін таңдау`}
                    aria-pressed={isGuessed}
                  >
                    {letter}
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        <footer className="page-footer">
          <span>Қазақ әліпбиімен ойна</span>
          <span className="footer-dot" aria-hidden="true" />
          <span>Сөзді тап та, жеңіске жет</span>
        </footer>
      </main>
    </div>
  );
}