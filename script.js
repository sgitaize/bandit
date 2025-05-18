document.addEventListener("DOMContentLoaded", () => {
    
    const spinSound = new Audio("slot-machine.mp3");
    const loseSound = new Audio("https://www.myinstants.com/media/sounds/sad-trombone.mp3");
    const winSound = new Audio("https://www.myinstants.com/media/sounds/fanfare.mp3");
    const playerButtons = document.getElementById("playerButtons");
    const betOptions = document.getElementById("betOptions");
    const spinButton = document.getElementById("spinButton");
    const replayButton = document.getElementById("replayButton");
    const slot1 = document.getElementById("slot1");
    const slot2 = document.getElementById("slot2");
    const slot3 = document.getElementById("slot3");
    const resultText = document.getElementById("result");
    const betSummary = document.getElementById("betSummary");
    const winChanceSlider = document.getElementById("winChance");
    const winChanceValue = document.getElementById("winChanceValue");
    const winTableDiv = document.getElementById("winTable");

    // Slot-Matrix Felder
    const slotMatrixEls = [
        [document.getElementById("slot-0-0"), document.getElementById("slot-0-1"), document.getElementById("slot-0-2")],
        [document.getElementById("slot-1-0"), document.getElementById("slot-1-1"), document.getElementById("slot-1-2")],
        [document.getElementById("slot-2-0"), document.getElementById("slot-2-1"), document.getElementById("slot-2-2")]
    ];

    let numPlayers = 1;
    let bets = {};
    let winChance = 45;
    let symbols = ["🍒", "🍋", "🍊", "🍉", "⭐", "💎", "🔔", "🍇"];
    
    // Gewinntabelle: Symbol -> [3x, 2x] Multiplikator
    const winTable = [
        { symbol: "💎", name: "Diamant", three: 20, two: 5 },
        { symbol: "⭐", name: "Stern", three: 10, two: 3 },
        { symbol: "🔔", name: "Glocke", three: 8, two: 2 },
        { symbol: "🍉", name: "Wassermelone", three: 6, two: 2 },
        { symbol: "🍇", name: "Traube", three: 5, two: 1 },
        { symbol: "🍊", name: "Orange", three: 4, two: 1 },
        { symbol: "🍋", name: "Zitrone", three: 3, two: 1 },
        { symbol: "🍒", name: "Kirsche", three: 2, two: 1 }
    ];

    // Hilfsfunktion: Symbol zu Tabelle
    function getWinEntry(symbol) {
        return winTable.find(e => e.symbol === symbol);
    }

    // Initialisiere Gewinnchance-Slider korrekt
    winChanceSlider.value = winChance;
    winChanceValue.innerText = winChance + "%";

    window.openPopup = function(id) {
        document.getElementById(id).classList.remove("hidden");
    };
    
    window.closePopup = function(id) {
        document.getElementById(id).classList.add("hidden");
    };

    window.updateWinChance = function(value) {
        winChance = parseInt(value);
        winChanceValue.innerText = value + "%";
    };

    for (let i = 1; i <= 8; i++) {
        let btn = document.createElement("button");
        btn.innerText = i;
        btn.onclick = () => setPlayers(i);
        playerButtons.appendChild(btn);
    }

    function setPlayers(players) {
        numPlayers = players;
        closePopup("playerSelection");
        openPopup("betSelection");
        generateBetOptions();
    }

    function generateBetOptions() {
        betOptions.innerHTML = "";
        bets = {};
        for (let i = 1; i <= numPlayers; i++) {
            let div = document.createElement("div");
            div.innerHTML = `<h3>Spieler ${i}</h3>
                             <button class='bet-button' onclick="setBet(${i}, 5, this)">5</button>
                             <button class='bet-button' onclick="setBet(${i}, 10, this)">10</button>
                             <button class='bet-button' onclick="setBet(${i}, 25, this)">25</button>
                             <button class='bet-button' onclick="setBet(${i}, 100, this)">100</button>
                             <input type='number' class='custom-bet bet-button' placeholder='Manuell' oninput='setCustomBet(${i}, this)'>`;
            betOptions.appendChild(div);
        }
    }

    window.setBet = function(player, amount, button) {
        bets[player] = amount;
        button.parentElement.querySelectorAll(".bet-button").forEach(btn => btn.classList.remove("selected"));
        button.parentElement.querySelector(".custom-bet").value = "";
        button.classList.add("selected");
        checkBets();
    };

    window.setCustomBet = function(player, input) {
        bets[player] = parseInt(input.value) || 0;
        input.classList.add("selected");
        input.parentElement.querySelectorAll(".bet-button").forEach(btn => btn.classList.remove("selected"));
        checkBets();
    };

    function checkBets() {
        spinButton.disabled = Object.keys(bets).length !== numPlayers;
    }

    spinButton.addEventListener("click", () => {
        closePopup("betSelection");
        document.getElementById("gameContainer").classList.remove("hidden");
        displayBetSummary();
        startSpin();
    });

    function displayBetSummary() {
        let summary = "<h3>Einsätze</h3>";
        for (let i in bets) {
            summary += `<p>Spieler ${i}: ${bets[i]} gesetzt</p>`;
        }
        betSummary.innerHTML = summary;
    }

    function startSpin() {
        resultText.textContent = "...";
        spinSound.play();
        // Animation: Zufällige Symbole rotieren
        let spinDuration = 3000;
        let matrix = [
            ["", "", ""],
            ["", "", ""],
            ["", "", ""]
        ];
        let interval = setInterval(() => {
            for (let i = 0; i < 3; i++) {
                for (let j = 0; j < 3; j++) {
                    let sym = symbols[Math.floor(Math.random() * symbols.length)];
                    matrix[i][j] = sym;
                    slotMatrixEls[i][j].innerText = sym;
                    slotMatrixEls[i][j].classList.remove("win-line", "lose-line");
                }
            }
        }, 100);

        setTimeout(() => {
            clearInterval(interval);
            // Endgültige Matrix generieren
            for (let i = 0; i < 3; i++) {
                for (let j = 0; j < 3; j++) {
                    let sym = symbols[Math.floor(Math.random() * symbols.length)];
                    matrix[i][j] = sym;
                    slotMatrixEls[i][j].innerText = sym;
                    slotMatrixEls[i][j].classList.remove("win-line", "lose-line");
                }
            }
            checkWinMatrix(matrix);
        }, spinDuration);
    }

    // Prüft alle Gewinnlinien in der Matrix
    function checkWinMatrix(matrix) {
        let result = "Verloren!";
        let className = "lose";
        let maxMultiplier = 0;
        let bestWin = null;
        let winCoords = [];

        // Gewinnchance prüfen
        if (Math.random() * 100 < winChance) {
            // Prüfe horizontale Linien
            for (let i = 0; i < 3; i++) {
                let row = matrix[i];
                if (row[0] === row[1] && row[1] === row[2]) {
                    let entry = getWinEntry(row[0]);
                    if (entry && entry.three > 1 && entry.three > maxMultiplier) {
                        maxMultiplier = entry.three;
                        bestWin = { line: `Reihe ${i+1}`, symbol: row[0], multi: entry.three, coords: [[i,0],[i,1],[i,2]] };
                    }
                } else {
                    // Zwei gleiche in einer Reihe, nur wenn two > 1
                    if (row[0] === row[1]) {
                        let entry = getWinEntry(row[0]);
                        if (entry && entry.two > 1 && entry.two > maxMultiplier) {
                            maxMultiplier = entry.two;
                            bestWin = { line: `Reihe ${i+1}`, symbol: row[0], multi: entry.two, coords: [[i,0],[i,1]] };
                        }
                    }
                    if (row[1] === row[2]) {
                        let entry = getWinEntry(row[1]);
                        if (entry && entry.two > 1 && entry.two > maxMultiplier) {
                            maxMultiplier = entry.two;
                            bestWin = { line: `Reihe ${i+1}`, symbol: row[1], multi: entry.two, coords: [[i,1],[i,2]] };
                        }
                    }
                    if (row[0] === row[2]) {
                        let entry = getWinEntry(row[0]);
                        if (entry && entry.two > 1 && entry.two > maxMultiplier) {
                            maxMultiplier = entry.two;
                            bestWin = { line: `Reihe ${i+1}`, symbol: row[0], multi: entry.two, coords: [[i,0],[i,2]] };
                        }
                    }
                }
            }
            // Prüfe Diagonalen (nur 3 gleiche, nur wenn three > 1)
            if (matrix[0][0] === matrix[1][1] && matrix[1][1] === matrix[2][2]) {
                let entry = getWinEntry(matrix[0][0]);
                if (entry && entry.three > 1 && entry.three > maxMultiplier) {
                    maxMultiplier = entry.three;
                    bestWin = { line: "Diagonal ↘", symbol: matrix[0][0], multi: entry.three, coords: [[0,0],[1,1],[2,2]] };
                }
            }
            if (matrix[0][2] === matrix[1][1] && matrix[1][1] === matrix[2][0]) {
                let entry = getWinEntry(matrix[0][2]);
                if (entry && entry.three > 1 && entry.three > maxMultiplier) {
                    maxMultiplier = entry.three;
                    bestWin = { line: "Diagonal ↙", symbol: matrix[0][2], multi: entry.three, coords: [[0,2],[1,1],[2,0]] };
                }
            }
        }

        // Optische Hervorhebung der Gewinnlinie
        for (let i = 0; i < 3; i++)
            for (let j = 0; j < 3; j++)
                slotMatrixEls[i][j].classList.remove("win-line", "lose-line");
        if (bestWin && bestWin.coords) {
            bestWin.coords.forEach(([i, j]) => {
                slotMatrixEls[i][j].classList.add("win-line");
            });
        } else {
            // Alle Felder leicht ausgrauen bei Verlust
            for (let i = 0; i < 3; i++)
                for (let j = 0; j < 3; j++)
                    slotMatrixEls[i][j].classList.add("lose-line");
        }

        if (maxMultiplier > 0) {
            result = `Gewonnen! ${bestWin.line}: ${bestWin.symbol} x${bestWin.multi}`;
            className = "win";
            winSound.play();
        } else {
            loseSound.play();
            setTimeout(() => {
                resultText.classList.remove("lose");
            }, 3000);
        }
        resultText.innerText = result;
        resultText.className = className;
        updateBetSummary(maxMultiplier);
    }

    function updateBetSummary(multiplier) {
        let summary = "<h3>Einsätze und Gewinne</h3>";
        for (let i in bets) {
            let winAmount = multiplier > 0 ? bets[i] * multiplier : 0;
            summary += `<p>Spieler ${i}: ${bets[i]} gesetzt → ${winAmount > 0 ? winAmount + " gewonnen" : "Verloren"}</p>`;
        }
        betSummary.innerHTML = summary;
        replayButton.classList.remove("hidden");
    }

    window.replayGame = function() {
        replayButton.classList.add("hidden");
        displayBetSummary();
        startSpin();
    };

    // Gewinntabelle im DOM anzeigen
    function renderWinTable() {
        if (!winTableDiv) return;
        let html = `
        <table class="win-table">
            <tr><th>Symbol</th><th>3x</th><th>2x</th></tr>`;
        winTable.forEach(row => {
            html += `<tr>
                <td style="font-size:1.5em">${row.symbol}</td>
                <td>x${row.three}</td>
                <td>${row.two > 1 ? "x"+row.two : "-"}</td>
            </tr>`;
        });
        html += "</table>";
        winTableDiv.innerHTML = html;
    }
    renderWinTable();
});
