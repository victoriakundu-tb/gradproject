// --- Simple Poker Hand Evaluation ---
function getHandRank(cards) {
  // Only checks for pairs, three/four of a kind, and high card for demo purposes
  const valueCount = {};
  for (const card of cards) {
    valueCount[card.value] = (valueCount[card.value] || 0) + 1;
  }
  const counts = Object.values(valueCount).sort((a, b) => b - a);
  if (counts[0] === 4) return {rank: 7, name: 'Four of a Kind'};
  if (counts[0] === 3 && counts[1] === 2) return {rank: 6, name: 'Full House'};
  if (counts[0] === 3) return {rank: 3, name: 'Three of a Kind'};
  if (counts[0] === 2 && counts[1] === 2) return {rank: 2, name: 'Two Pair'};
  if (counts[0] === 2) return {rank: 1, name: 'Pair'};
  return {rank: 0, name: 'High Card'};
}
// Poker game starter script
document.getElementById('poker-game').innerHTML = `
  <h3>Texas Hold’em Poker (Demo)</h3>
  <button id="start-game">Start Game</button>
  <div id="game-area" style="margin-top:1.5rem;"></div>
`;


// --- Poker Deck Logic ---
const SUITS = ['♠', '♥', '♦', '♣'];
const VALUES = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

function createDeck() {
  const deck = [];
  for (const suit of SUITS) {
    for (const value of VALUES) {
      deck.push({ value, suit });
    }
  }
  return deck;
}

function shuffle(deck) {
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}

function deal(deck, count) {
  // Remove and return 'count' cards from the deck
  return Array.from({ length: count }, () => deck.pop());
}

function draw(deck) {
  // Remove and return one card from the deck
  return deck.pop();
}

  function renderHand(hand, label, className = '') {
    return `<div class="${className}">${hand.map(card => `<span style="display:inline-block;min-width:2.2em;background:#fffbe6;color:#222;border-radius:0.3em;padding:0.2em 0.5em;margin:0 0.1em;font-weight:bold;border:1.5px solid #bfa76f;box-shadow:0 1px 2px #0002;">${card.value}${card.suit}</span>`).join(' ')}</div>`;
  }



document.getElementById('start-game').onclick = function() {
  let deck = shuffle(createDeck());
  // Store player and computer hands using deal()
  let playerHand = deal(deck, 2);
  let computerHand = deal(deck, 2);
  let community = deal(deck, 5);
  let pot = 0;
  let playerChips = 100;
  let computerChips = 100;
  let bet = 0;
  let round = 0; // 0: pre-flop, 1: flop, 2: turn, 3: river, 4: showdown
  let playerFolded = false;
  let gameOver = false;

  function renderGame() {
    if (gameOver) {
      document.getElementById('game-area').innerHTML += '<div style="margin-top:1em;"><em>Game over. Click "Start Game" to play again.</em></div>';
      return;
    }
    // Reveal community cards in stages: flop (3), turn (4), river (5)
    let cardsToShow = 0;
    if (round === 0) cardsToShow = 0; // pre-flop
    else if (round === 1) cardsToShow = 3; // flop
    else if (round === 2) cardsToShow = 4; // turn
    else if (round >= 3) cardsToShow = 5; // river & showdown
    let communityToShow = community.slice(0, cardsToShow);
    let computerHandRevealed = window.computerHandRevealed || false;
    document.getElementById('game-area').innerHTML = `
      <div class="table-icon table-icon-computer" style="text-align:center;margin-bottom:0.5em;">
        <span style="font-size:2em;">&#129302;</span><br>
        <span style="font-size:0.95em;color:#888;">Computer</span>
        <span class='table-chip'>$${computerChips}</span>
      </div>
      <div class="table-container">
        <div class="table-computer">${
          computerHandRevealed
            ? renderHand(computerHand, '', 'table-cards')
            : renderHand([{value:'?',suit:'?'},{value:'?',suit:'?'}], '', 'table-cards')
        }</div>
        <div class="table-pot">Pot: $${pot}</div>
        <div class="table-label" style="position:absolute;top:50%;left:0;transform:translateY(-50%) rotate(-90deg);font-size:0.8em;opacity:0.7;">Community</div>
        <div class="table-cards">${renderHand(communityToShow, '', 'table-cards')}</div>
        <div class="table-player">${renderHand(playerHand, '', 'table-cards')}</div>
      </div>
      <div class="table-icon table-icon-player" style="text-align:center;margin-top:1.5em;">
        <span style="font-size:2em;">&#128100;</span><br>
        <span style="font-size:0.95em;color:#888;">Player</span>
        <span class='table-chip'>$${playerChips}</span>
      </div>
      <div class="table-controls" id="bet-controls"></div>
      <button id="reveal" class="table-btn">Reveal Computer Hand</button>
    `;
    document.getElementById('reveal').onclick = function() {
      window.computerHandRevealed = true;
      renderGame();
    };
    renderBetControls();
  }

  function renderBetControls() {
    if (playerFolded || round === 4) {
      // Showdown: evaluate hands
      let result = '';
      if (playerFolded) {
        result += `<div style="margin-top:1em;"><span style="color:red;">You folded. Computer wins the pot!</span></div>`;
        computerChips += pot;
      } else {
        const playerBest = getHandRank([...playerHand, ...community]);
        const computerBest = getHandRank([...computerHand, ...community]);
        result += `<div style="margin-top:1em;"><strong>Showdown!</strong><br>`;
        result += `Your best: ${playerBest.name}<br>`;
        result += `Computer best: ${computerBest.name}<br>`;
        if (playerBest.rank > computerBest.rank) {
          result += '<span style="color:limegreen;">You win the pot!</span>';
          playerChips += pot;
        } else if (playerBest.rank < computerBest.rank) {
          result += '<span style="color:red;">Computer wins the pot!</span>';
          computerChips += pot;
        } else {
          result += '<span style="color:gold;">It\'s a tie!</span>';
          playerChips += pot / 2;
          computerChips += pot / 2;
        }
        result += '</div>';
      }
      pot = 0;
      gameOver = true;
      document.getElementById('bet-controls').innerHTML = result + '<em>Round over. Click "Start Game" to play again.</em>';
      return;
    }
    let controls = '';
    if (bet === 0) {
      controls += `<button id="check">Check</button> <button id="bet">Bet $10</button>`;
    } else {
      controls += `<button id="call">Call ($${bet})</button> <button id="raise">Raise $10</button>`;
    }
    controls += ` <button id="fold">Fold</button> <button id="next">Next Round</button>`;
    document.getElementById('bet-controls').innerHTML = controls;

    if (bet === 0) {
      document.getElementById('check').onclick = function() {
        nextRound();
        renderGame();
      };
      document.getElementById('bet').onclick = function() {
        if (playerChips >= 10) {
          playerChips -= 10;
          pot += 10;
          bet = 10;
          // Wait for computer to act on next round or after player calls/raises
          renderGame();
        }
      };
    } else {
      document.getElementById('call').onclick = function() {
        if (playerChips >= bet) {
          playerChips -= bet;
          pot += bet;
          bet = 0;
          nextRound();
          renderGame();
        }
      };
      document.getElementById('raise').onclick = function() {
        if (playerChips >= bet + 10) {
          playerChips -= (bet + 10);
          pot += (bet + 10);
          bet += 10;
          computerAction();
          renderGame();
        }
      };
    }
    document.getElementById('fold').onclick = function() {
      playerFolded = true;
      document.getElementById('bet-controls').innerHTML = '<strong>You folded. Computer wins the pot!</strong>';
    };
    document.getElementById('next').onclick = function() {
      nextRound();
      renderGame();
    };
  }

  function computerAction() {
    // Simple AI: always calls if possible, never folds on a bet/raise
    if (computerChips >= bet) {
      computerChips -= bet;
      pot += bet;
      bet = 0;
    } else {
      // Only fold if computer cannot call
      playerChips += pot;
      pot = 0;
      playerFolded = true;
      document.getElementById('bet-controls').innerHTML = '<strong>Computer folded. You win the pot!</strong>';
    }
  }

  function nextRound() {
    if (round < 4) {
      round++;
    }
    if (round === 4) {
      renderGame();
    }
  }

  renderGame();
};