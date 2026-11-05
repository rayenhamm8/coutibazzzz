
"use strict";

/* ==========================================
   TAYSON.exe — INTERACTION ENGINE

   PERSONALIZATION GUIDE:
   1. Change the messages in CONFIG.
   2. Change quiz questions and answers.
   3. Put your photos in the images folder.
   4. Add your music to music/our-song.mp3.
========================================== */

/* ==========================================
   1. PERSONALIZATION
========================================== */

const CONFIG = {
  // Change these romantic messages.
  letter:
    "Ya Tayson, ma naarefch kifeh nabda ama nheb n9olek elli enti wa7da men ahla haja saretli. N7eb dh7ektik, details sghar mte3ek, w kol moment naadih maak. Signed, your Couti ❤️",

  messages: [
    "Surprise! Couti yhebik barcha. ❤️",
    "Your smile is literally my favorite notification.",
    "Ya Tayson, enti special akther melli tetkhayli.",
    "One more reason to smile: Couti. Hehe. ♡",
    "If I could choose again, I'd still choose you."
  ],

  // CUSTOMIZE THE QUIZ HERE.
  // correct = zero-based index of the correct answer.
  questions: [
    {
      question: "Chnowa akther haja n7ebha fik?",
      answers: [
        "Dh7ektik w personality mte3ek ❤️",
        "Ki takli pizza bla ma taatini",
        "Ki t9oli goodnight"
      ],
      correct: 0,
      feedback: "Exactly! Kifeh ma n7ebech dh7ektik? 🥹"
    },
    {
      question: "Chkoun yghir akther, Couti wala Tayson?",
      answers: [
        "Tayson, obviously 👀",
        "Couti, 100%",
        "Zouzna, barcha barcha"
      ],
      correct: 2,
      feedback: "Hahaha, jealousy level: professional. 😂"
    },
    {
      question: "Win nheb nemchi m3ak fi date?",
      answers: [
        "A romantic place, just us two",
        "To the moon 🌙",
        "Any place, as long as you're there"
      ],
      correct: 2,
      feedback: "The location doesn't matter. It's you. ❤️"
    },
    {
      question: "Chnowa akther haja tdhakni fik?",
      answers: [
        "Your random jokes",
        "Your cute reactions",
        "Literally everything you do"
      ],
      correct: 2,
      feedback: "Correct! You're unintentionally hilarious. 🤭"
    },
    {
      question: "Ken aandna nhar kemel maa baadhna, chnowa naamlou?",
      answers: [
        "A romantic adventure",
        "Food, movies and cuddles",
        "Whatever we want, together"
      ],
      correct: 2,
      feedback: "Best answer. A whole day with you sounds perfect. ❤️"
    }
  ],

  // Customize the four captions for your real photos.
  photos: [
    {
      src: "./WhatsApp Image 2026-11-05 at 21.20.39 (1).jpeg",
      caption: "My favorite view. ♡"
    },
    {
      src:"./WhatsApp Image 2026-11-05 at 21.20.39 (2).jpeg" ,
      caption: "Hedhi men ahla moments."
    },
    {
      src: "./WhatsApp Image 2026-11-05 at 21.20.39 (3).jpeg",
      caption: "Just you being you. ❤️"
    },
    {
      src: "./WhatsApp Image 2026-11-05 at 21.20.39.jpeg",
      caption: "And many more to come."
    }
  ],

  // Set to true to attempt playing your local music.
  musicEnabled: true,

  // Number of celebratory confetti pieces.
  confettiCount: 180
};


/* ==========================================
   2. DOM ELEMENTS
========================================== */

const $ = (selector) => document.querySelector(selector);

const scenes = [...document.querySelectorAll(".scene")];
const progressFill = $("#progressFill");
const music = $("#backgroundMusic");
const musicToggle = $("#musicToggle");
const particles = $("#particles");

let currentScene = 0;
let musicPlaying = false;
let quizIndex = 0;
let quizScore = 0;
let selectedAnswer = null;
let toastTimeout = null;
let letterTypingTimer = null;
let letterOpened = false;


/* ==========================================
   3. REDUCED MOTION
========================================== */

const reducedMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)"
).matches;


/* ==========================================
   4. SCENE NAVIGATION
========================================== */

function goToScene(index) {
  if (index < 0 || index >= scenes.length) return;
  if (index === currentScene) return;

  const previous = scenes[currentScene];
  const next = scenes[index];

  previous.classList.remove("active");
  previous.classList.add("leaving");

  currentScene = index;

  next.classList.remove("leaving");
  next.classList.add("active");

  progressFill.style.width =
    `${(index / (scenes.length - 1)) * 100}%`;

  // Remove old scene state after its transition.
  window.setTimeout(() => {
    if (previous !== next) {
      previous.classList.remove("leaving");
    }
  }, reducedMotion ? 10 : 700);

  window.scrollTo({
    top: 0,
    behavior: reducedMotion ? "instant" : "smooth"
  });

  if (index === 4) {
    createHeartBurst(window.innerWidth / 2, window.innerHeight / 2, 15);
  }
}

// All navigation buttons use data-next.
document.querySelectorAll("[data-next]").forEach(button => {
  button.addEventListener("click", () => {
    const destination = Number(button.dataset.next);
    goToScene(destination);
  });
});

// Start button.
$("#startBtn").addEventListener("click", () => {
  goToScene(1);
  startMusic();
});

// Logo takes you back to the beginning.
$("#homeLink").addEventListener("click", event => {
  event.preventDefault();
  goToScene(0);
});

// Initialize progress.
progressFill.style.width = "0%";


/* ==========================================
   5. BACKGROUND PARTICLES
========================================== */

function createBackgroundParticles() {
  if (reducedMotion) return;

  const symbols = ["♡", "✦", "♥", "✧", "·"];

  for (let i = 0; i < 22; i++) {
    const particle = document.createElement("span");

    particle.className = "particle";
    particle.textContent =
      symbols[Math.floor(Math.random() * symbols.length)];

    particle.style.left = `${Math.random() * 100}%`;
    particle.style.setProperty(
      "--duration",
      `${9 + Math.random() * 12}s`
    );
    particle.style.setProperty(
      "--delay",
      `${Math.random() * 12}s`
    );
    particle.style.setProperty(
      "--size",
      `${10 + Math.random() * 14}px`
    );

    particles.appendChild(particle);
  }
}

createBackgroundParticles();


/* ==========================================
   6. MUSIC CONTROL

   Add your own MP3 file at:
   music/our-song.mp3

   Browsers require user interaction before
   audio can start. We start after START.
========================================== */

async function startMusic() {
  if (!CONFIG.musicEnabled || !music) return;

  try {
    await music.play();
    musicPlaying = true;
    updateMusicButton();
  } catch (error) {
    // Music is optional. The website works without it.
    musicPlaying = false;
    updateMusicButton();
  }
}

function updateMusicButton() {
  musicToggle.textContent = musicPlaying ? "♫" : "♪";
  musicToggle.setAttribute(
    "aria-label",
    musicPlaying ? "Mute music" : "Play music"
  );

  musicToggle.style.background = musicPlaying
    ? "rgba(250,145,182,.17)"
    : "rgba(255,231,241,.055)";
}

musicToggle.addEventListener("click", async () => {
  if (!CONFIG.musicEnabled) {
    showToast("Add your song in music/our-song.mp3 ♡");
    return;
  }

  if (musicPlaying) {
    music.pause();
    musicPlaying = false;
    updateMusicButton();
  } else {
    await startMusic();
  }
});

updateMusicButton();


/* ==========================================
   7. PHOTO GALLERY & LIGHTBOX
========================================== */

// Apply captions and sources from CONFIG.
// Replace the four image files with your own.
const photoButtons = [...document.querySelectorAll(".polaroid")];

photoButtons.forEach((button, index) => {
  const photo = CONFIG.photos[index];
  if (!photo) return;

  const img = button.querySelector("img");
  const caption = button.querySelector(".photo-caption");

  img.src = photo.src;
  caption.textContent = photo.caption;

  // Keep the placeholder visible if a photo is missing.
  img.addEventListener("error", () => {
    img.style.display = "none";
  });

  img.addEventListener("load", () => {
    img.style.display = "block";
  });
});

const lightbox = $("#lightbox");
const lightboxImage = $("#lightboxImage");
const lightboxCaption = $("#lightboxCaption");
const lightboxCounter = $("#lightboxCounter");

function openPhoto(index) {
  const photo = CONFIG.photos[index];
  if (!photo) return;

  lightboxImage.src = photo.src;
  lightboxImage.alt = photo.caption;
  lightboxCaption.textContent = photo.caption;

  lightboxCounter.textContent =
    `MEMORY ${String(index + 1).padStart(2, "0")} / ${String(CONFIG.photos.length).padStart(2, "0")}`;

  lightbox.classList.add("open");
  lightbox.setAttribute("aria-hidden", "false");

  createHeartBurst(
    window.innerWidth / 2,
    window.innerHeight / 2,
    12
  );
}

function closeLightbox() {
  lightbox.classList.remove("open");
  lightbox.setAttribute("aria-hidden", "true");
  lightboxImage.src = "";
}

photoButtons.forEach(button => {
  button.addEventListener("click", () => {
    openPhoto(Number(button.dataset.photo));
  });
});

$("#lightboxClose").addEventListener("click", closeLightbox);

lightbox.addEventListener("click", event => {
  if (event.target === lightbox) {
    closeLightbox();
  }
});


/* ==========================================
   8. SECRET ROMANTIC MESSAGES
========================================== */

let secretMessageIndex = 0;

function showToast(message) {
  const toast = $("#toast");

  toast.textContent = message;
  toast.classList.add("show");

  clearTimeout(toastTimeout);

  toastTimeout = window.setTimeout(() => {
    toast.classList.remove("show");
  }, 3000);
}

// The tiny heart in the secret note is clickable.
$(".secret-note span").style.cursor = "pointer";

$(".secret-note span").addEventListener("click", () => {
  const message = CONFIG.messages[
    secretMessageIndex % CONFIG.messages.length
  ];

  secretMessageIndex++;

  showToast(message);

  createHeartBurst(
    window.innerWidth / 2,
    window.innerHeight / 2,
    8
  );
});

// A few secret clickable hearts around the page.
document.querySelectorAll(".brand-icon, .brand-dot").forEach(element => {
  element.style.cursor = "pointer";

  element.addEventListener("click", () => {
    const message = CONFIG.messages[
      secretMessageIndex % CONFIG.messages.length
    ];

    secretMessageIndex++;
    showToast(message);
  });
});


/* ==========================================
   9. HEART BURST ANIMATION
========================================== */

function createHeartBurst(x, y, count = 15) {
  if (reducedMotion) return;

  const symbols = ["♥", "♡", "✦", "✧"];

  for (let i = 0; i < count; i++) {
    const heart = document.createElement("span");

    heart.className = "burst-heart";
    heart.textContent =
      symbols[Math.floor(Math.random() * symbols.length)];

    heart.style.left = `${x}px`;
    heart.style.top = `${y}px`;

    heart.style.setProperty(
      "--x",
      `${(Math.random() - 0.5) * 240}px`
    );

    heart.style.setProperty(
      "--y",
      `${(Math.random() - 0.5) * 240}px`
    );

    document.body.appendChild(heart);

    heart.addEventListener("animationend", () => {
      heart.remove();
    }, { once: true });
  }
}


/* ==========================================
   10. LOVE QUIZ
========================================== */

const questionCounter = $("#questionCounter");
const scoreCounter = $("#scoreCounter");
const questionText = $("#questionText");
const answersContainer = $("#answers");
const quizProgress = $("#quizProgress");
const quizFeedback = $("#quizFeedback");
const quizNext = $("#quizNext");

function initializeQuiz() {
  quizIndex = 0;
  quizScore = 0;
  selectedAnswer = null;

  $("#quizResult").classList.add("hidden");
  $(".quiz-card").classList.remove("hidden");

  renderQuestion();
}

function renderQuestion() {
  const question = CONFIG.questions[quizIndex];

  if (!question) {
    finishQuiz();
    return;
  }

  selectedAnswer = null;

  questionCounter.textContent =
    `QUESTION ${String(quizIndex + 1).padStart(2, "0")} / ${String(CONFIG.questions.length).padStart(2, "0")}`;

  scoreCounter.textContent = `SCORE: ${quizScore}`;

  questionText.textContent = question.question;

  quizProgress.style.width =
    `${(quizIndex / CONFIG.questions.length) * 100}%`;

  answersContainer.innerHTML = "";
  quizFeedback.textContent = "";
  quizNext.disabled = true;

  question.answers.forEach((answer, index) => {
    const button = document.createElement("button");

    button.className = "answer-btn";
    button.textContent = answer;
    button.type = "button";

    button.addEventListener("click", () => {
      selectAnswer(index);
    });

    answersContainer.appendChild(button);
  });

  quizNext.querySelector("span").textContent =
    quizIndex === CONFIG.questions.length - 1
      ? "SEE MY RESULTS"
      : "NEXT QUESTION";
}

function selectAnswer(index) {
  if (selectedAnswer !== null) return;

  selectedAnswer = index;

  const question = CONFIG.questions[quizIndex];
  const correct = index === question.correct;

  if (correct) {
    quizScore++;
  }

  const buttons = [...answersContainer.children];

  buttons.forEach((button, buttonIndex) => {
    button.disabled = true;

    if (buttonIndex === index) {
      button.classList.add("selected");
    }

    if (buttonIndex === question.correct) {
      button.classList.add("correct");
    }
  });

  if (correct) {
    quizFeedback.textContent = question.feedback;
    createHeartBurst(
      window.innerWidth / 2,
      window.innerHeight / 2,
      6
    );
  } else {
    const funnyMessages = [
      "Hmmm... interesting answer. Couti is watching. 👀",
      "Not quite! Ama mazelna n7ebouk. 😂",
      "Wrong answer, but cute attempt. ❤️"
    ];

    quizFeedback.textContent =
      funnyMessages[Math.floor(Math.random() * funnyMessages.length)];
  }

  scoreCounter.textContent = `SCORE: ${quizScore}`;

  quizNext.disabled = false;
}

quizNext.addEventListener("click", () => {
  if (selectedAnswer === null) return;

  quizIndex++;

  if (quizIndex >= CONFIG.questions.length) {
    finishQuiz();
  } else {
    renderQuestion();
  }
});

function finishQuiz() {
  $(".quiz-card").classList.add("hidden");

  const result = $("#quizResult");
  const title = $("#resultTitle");
  const message = $("#resultMessage");

  const percentage = quizScore / CONFIG.questions.length;

  if (percentage === 1) {
    title.textContent = "PERFECT SCORE! 🥹";
    message.textContent =
      "Ya Tayson, enti taaref Couti akther men rou7ou. 5/5! Win nal9a wa7da kifek?";
  } else if (percentage >= 0.6) {
    title.textContent = "Pretty good, madame! ❤️";
    message.textContent =
      `You got ${quizScore}/${CONFIG.questions.length}! Couti proud of you. Mazel fama barcha memories bech taarefihom.`;
  } else {
    title.textContent = "We need more dates together! 🤭";
    message.textContent =
      `You got ${quizScore}/${CONFIG.questions.length}. It's okay, ya Tayson. The best way to learn about Couti is to spend more time together. ❤️`;
  }

  result.classList.remove("hidden");

  quizProgress.style.width = "100%";

  createHeartBurst(
    window.innerWidth / 2,
    window.innerHeight / 2,
    25
  );
}

$("#restartQuiz").addEventListener("click", initializeQuiz);

// Start the quiz.
initializeQuiz();


/* ==========================================
   11. INTERACTIVE LOVE LETTER
========================================== */

const envelope = $("#envelope");
const letterMessage = $("#letterMessage");
const typedLetter = $("#typedLetter");
const envelopeHint = $("#envelopeHint");

function openLetter() {
  if (letterOpened) return;

  letterOpened = true;

  envelope.classList.add("open");
  envelopeHint.textContent = "A MESSAGE FROM YOUR COUTI ♡";

  // Reveal the message after the envelope opens.
  window.setTimeout(() => {
    letterMessage.classList.remove("hidden");
    typeLetter(CONFIG.letter);
  }, reducedMotion ? 10 : 850);

  createHeartBurst(
    window.innerWidth / 2,
    window.innerHeight / 2,
    15
  );
}

function typeLetter(message) {
  clearInterval(letterTypingTimer);

  typedLetter.textContent = "";

  let characterIndex = 0;

  if (reducedMotion) {
    typedLetter.textContent = message;
    return;
  }

  letterTypingTimer = window.setInterval(() => {
    typedLetter.textContent += message[characterIndex];

    characterIndex++;

    if (characterIndex >= message.length) {
      clearInterval(letterTypingTimer);
      letterTypingTimer = null;
    }
  }, 36);
}

envelope.addEventListener("click", openLetter);

// Don't let someone reach the next scene before opening the letter
// accidentally; opening remains optional and the navigation works.
document.querySelector(".letter-next").addEventListener("click", () => {
  if (!letterOpened) {
    openLetter();
  }
});


/* ==========================================
   12. FINAL PROPOSAL
========================================== */

const yesButton = $("#yesBtn");
const maybeButton = $("#maybeBtn");
const maybeMessage = $("#maybeMessage");
const successMessage = $("#successMessage");
const proposalButtons = $("#proposalButtons");

let proposalAccepted = false;

maybeButton.addEventListener("click", () => {
  if (proposalAccepted) return;

  maybeMessage.classList.remove("hidden");

  maybeMessage.animate(
    [
      { opacity: 0, transform: "translateY(10px)" },
      { opacity: 1, transform: "translateY(0)" }
    ],
    {
      duration: reducedMotion ? 1 : 450,
      easing: "ease-out"
    }
  );

  createHeartBurst(
    maybeButton.getBoundingClientRect().left +
      maybeButton.offsetWidth / 2,
    maybeButton.getBoundingClientRect().top,
    8
  );
});

yesButton.addEventListener("click", () => {
  if (proposalAccepted) return;

  proposalAccepted = true;

  // Keep the MAYBE option available until she chooses YES.
  proposalButtons.classList.add("hidden");
  maybeMessage.classList.add("hidden");

  successMessage.classList.remove("hidden");

  createHeartBurst(
    window.innerWidth / 2,
    window.innerHeight / 2,
    80
  );

  launchConfetti();

  // Make the entire celebration feel alive.
  document.body.classList.add("celebrating");

  showToast("Couti is officially the happiest boy alive! ❤️");
});


/* ==========================================
   13. CONFETTI CELEBRATION
========================================== */

function launchConfetti() {
  if (reducedMotion) return;

  const container = $("#confetti");
  const colors = [
    "#fa91b6",
    "#ffc1d5",
    "#f45c79",
    "#fff0e5",
    "#c66c94",
    "#ffffff"
  ];

  for (let i = 0; i < CONFIG.confettiCount; i++) {
    const piece = document.createElement("span");

    piece.className = "confetti-piece";

    const heartShape = Math.random() > 0.45;

    piece.textContent = heartShape
      ? "♥"
      : "";

    if (!heartShape) {
      piece.style.width = `${4 + Math.random() * 7}px`;
      piece.style.height = `${7 + Math.random() * 10}px`;
      piece.style.background =
        colors[Math.floor(Math.random() * colors.length)];
    } else {
      piece.style.color =
        colors[Math.floor(Math.random() * colors.length)];
      piece.style.fontSize = `${12 + Math.random() * 18}px`;
    }

    piece.style.left = `${Math.random() * 100}vw`;

    piece.style.setProperty(
      "--fall",
      `${2.5 + Math.random() * 3.5}s`
    );

    piece.style.setProperty(
      "--drift",
      `${(Math.random() - 0.5) * 250}px`
    );

    piece.style.animationDelay = `${Math.random() * 1.2}s`;

    container.appendChild(piece);

    piece.addEventListener("animationend", () => {
      piece.remove();
    }, { once: true });
  }
}


/* ==========================================
   14. CUSTOM DESKTOP CURSOR
========================================== */

const cursor = $("#cursor");

if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
  document.addEventListener("mousemove", event => {
    cursor.style.opacity = "1";
    cursor.style.transform =
      `translate(${event.clientX - 4}px, ${event.clientY - 4}px)`;
  });

  document.addEventListener("mouseleave", () => {
    cursor.style.opacity = "0";
  });

  document.querySelectorAll("button, a").forEach(element => {
    element.addEventListener("mouseenter", () => {
      cursor.style.transform += " scale(2)";
    });

    element.addEventListener("mouseleave", () => {
      cursor.style.transform = cursor.style.transform.replace(
        " scale(2)",
        ""
      );
    });
  });
}


/* ==========================================
   15. KEYBOARD ACCESSIBILITY
========================================== */

document.addEventListener("keydown", event => {
  if (event.key === "Escape") {
    closeLightbox();
  }
});


/* ==========================================
   16. INITIALIZATION
========================================== */

console.log(
  "%c TAYSON.exe ♥ ",
  "background:#49152e;color:#ffc1d5;font-size:18px;padding:12px;font-weight:bold;"
);

console.log(
  "%cBuilt with 100% love by Couti.",
  "color:#fa91b6;font-size:12px;"
);
