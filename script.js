document.addEventListener("DOMContentLoaded", () => {
  const cells = document.querySelectorAll(".cell");
  const resetButton = document.getElementById("reset");
  const modeRadios = document.querySelectorAll("input[name='mode']");
  const startButton = document.getElementById("start");
  const gameContainer = document.getElementById("game");
  const setupContainer = document.getElementById("setup");
  const statusDisplay = document.getElementById("status");
  const turnDisplay = document.getElementById("turn");
  const scoreXDisplay = document.getElementById("scoreX");
  const scoreODisplay = document.getElementById("scoreO");
  const difficultyContainer = document.getElementById("difficultyContainer");
  const difficultyRadios = document.querySelectorAll(
    "input[name='difficulty']"
  );

  let currentPlayer = "X";
  let board = ["", "", "", "", "", "", "", "", ""];
  let gameActive = true;
  let gameMode = "pvp"; // Default to player vs player
  let difficulty = "easy"; // Default difficulty
  let scoreX = localStorage.getItem("scoreX")
    ? parseInt(localStorage.getItem("scoreX"))
    : 0;
  let scoreO = localStorage.getItem("scoreO")
    ? parseInt(localStorage.getItem("scoreO"))
    : 0;

  scoreXDisplay.textContent = scoreX;
  scoreODisplay.textContent = scoreO;

  const winningConditions = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];

  // Event listener for mode selection
  modeRadios.forEach((radio) => {
    radio.addEventListener("change", () => {
      gameMode = radio.value;
      if (gameMode === "pvc") {
        difficultyContainer.style.display = "block";
      } else {
        difficultyContainer.style.display = "none";
      }
    });
  });

  // Event listener for difficulty selection
  difficultyRadios.forEach((radio) => {
    radio.addEventListener("change", () => {
      difficulty = radio.value;
    });
  });

  // Handle cell click
  function handleCellClick(e) {
    const cell = e.target;
    const cellIndex = cell.getAttribute("data-index");

    if (
      board[cellIndex] !== "" ||
      !gameActive ||
      (gameMode === "pvc" && currentPlayer === "O")
    ) {
      return;
    }

    updateCell(cell, cellIndex);
    checkResult();
  }

  // Update cell on the board
  function updateCell(cell, index) {
    board[index] = currentPlayer;
    cell.textContent = currentPlayer;
  }

  // Switch player turn
  function changePlayer() {
    currentPlayer = currentPlayer === "X" ? "O" : "X";
    turnDisplay.textContent = `Player ${currentPlayer}'s turn`;
  }

  // Check game result
  function checkResult() {
    let roundWon = false;

    // Check winning conditions
    for (let i = 0; i < winningConditions.length; i++) {
      const winCondition = winningConditions[i];
      let a = board[winCondition[0]];
      let b = board[winCondition[1]];
      let c = board[winCondition[2]];

      if (a === "" || b === "" || c === "") {
        continue;
      }

      if (a === b && b === c) {
        roundWon = true;
        break;
      }
    }

    // If someone won
    if (roundWon) {
      gameActive = false;
      statusDisplay.textContent = `Player ${currentPlayer} has won!`;
      updateScore(currentPlayer);
      showPopup(`${currentPlayer} wins!`, resetGame);
      return;
    }

    // If it's a draw
    if (!board.includes("")) {
      gameActive = false;
      statusDisplay.textContent = `It's a draw!`;
      showPopup("It's a draw!", resetGame);
      return;
    }

    // Switch player
    changePlayer();

    // If playing against computer and it's computer's turn
    if (gameMode === "pvc" && currentPlayer === "O" && gameActive) {
      setTimeout(computerMove, 500);
    }
  }

  // Computer move based on difficulty
  function computerMove() {
    let cellIndex;

    if (difficulty === "easy") {
      cellIndex = getRandomMove();
    } else if (difficulty === "hard") {
      cellIndex = getBestMove(false);
    } else if (difficulty === "pro") {
      cellIndex = getBestMove(true);
    }

    const cell = cells[cellIndex];
    updateCell(cell, cellIndex);
    checkResult();
  }

  // Get a random move for easy difficulty
  function getRandomMove() {
    let emptyCells = [];
    board.forEach((cell, index) => {
      if (cell === "") {
        emptyCells.push(index);
      }
    });
    return emptyCells[Math.floor(Math.random() * emptyCells.length)];
  }

  // Get the best move using minimax algorithm
  function getBestMove(professional) {
    let bestScore = -Infinity;
    let move;
    for (let i = 0; i < board.length; i++) {
      if (board[i] === "") {
        board[i] = "O";
        let score = minimax(board, 0, false, professional);
        board[i] = "";
        if (score > bestScore) {
          bestScore = score;
          move = i;
        }
      }
    }
    return move;
  }

  // Scores for minimax algorithm
  const scores = {
    O: 1,
    X: -1,
    tie: 0,
  };

  // Minimax algorithm for computer move calculation
  function minimax(board, depth, isMaximizing, professional) {
    let result = checkWinner();
    if (result !== null) {
      return scores[result];
    }

    if (professional && depth >= 2) {
      return 0;
    }

    if (isMaximizing) {
      let bestScore = -Infinity;
      for (let i = 0; i < board.length; i++) {
        if (board[i] === "") {
          board[i] = "O";
          let score = minimax(board, depth + 1, false, professional);
          board[i] = "";
          bestScore = Math.max(score, bestScore);
        }
      }
      return bestScore;
    } else {
      let bestScore = Infinity;
      for (let i = 0; i < board.length; i++) {
        if (board[i] === "") {
          board[i] = "X";
          let score = minimax(board, depth + 1, true, professional);
          board[i] = "";
          bestScore = Math.min(score, bestScore);
        }
      }
      return bestScore;
    }
  }

  // Check if there is a winner
  function checkWinner() {
    for (let i = 0; i < winningConditions.length; i++) {
      const [a, b, c] = winningConditions[i];
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        return board[a];
      }
    }
    if (!board.includes("")) {
      return "tie";
    }
    return null;
  }

  // Update score and store in localStorage
  function updateScore(player) {
    if (player === "X") {
      scoreX++;
      localStorage.setItem("scoreX", scoreX);
      scoreXDisplay.textContent = scoreX;
    } else {
      scoreO++;
      localStorage.setItem("scoreO", scoreO);
      scoreODisplay.textContent = scoreO;
    }
  }

  // Reset the game
  function resetGame() {
    board = ["", "", "", "", "", "", "", "", ""];
    cells.forEach((cell) => (cell.textContent = ""));
    gameActive = true;
    currentPlayer = "X";
    statusDisplay.textContent = "";
    turnDisplay.textContent = `Player ${currentPlayer}'s turn`;
  }

  // Start the game
  function startGame() {
    gameMode = document.querySelector("input[name='mode']:checked").value;
    difficulty = document.querySelector(
      "input[name='difficulty']:checked"
    ).value;
    setupContainer.style.display = "none";
    gameContainer.style.display = "block";
    resetGame();
  }

  // Show popup message for a few seconds
  function showPopup(message, callback) {
    const popup = document.createElement("div");
    popup.classList.add("popup");
    popup.textContent = message;
    document.body.appendChild(popup);
    setTimeout(() => {
      document.body.removeChild(popup);
      if (typeof callback === "function") {
        callback();
      }
    }, 3000);
  }

  // Event listeners
  cells.forEach((cell) => cell.addEventListener("click", handleCellClick));
  resetButton.addEventListener("click", resetGame);
  startButton.addEventListener("click", startGame);
});
