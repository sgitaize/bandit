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

    let numPlayers = 1;
    let bets = {};
    let winChance = 45;
    let symbols = ["🍒", "🍋", "🍊", "🍉", "⭐", "💎", "🔔", "🍇"];
    
    function getRandomMultiplier() {
        return Math.floor(Math.random() * (4 - 2 + 1)) + 2; // Multiplikator zwischen 2 und 4
    }

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
        document.getElementById("result").textContent = "...";
        spinSound.play();
        let spinDuration = 3000
        let interval = setInterval(() => {
            slot1.innerText = symbols[Math.floor(Math.random() * symbols.length)];
            slot2.innerText = symbols[Math.floor(Math.random() * symbols.length)];
            slot3.innerText = symbols[Math.floor(Math.random() * symbols.length)];
        }, 100);
        
        setTimeout(() => {
            clearInterval(interval);
            let final1 = symbols[Math.floor(Math.random() * symbols.length)];
            let final2 = symbols[Math.floor(Math.random() * symbols.length)];
            let final3 = symbols[Math.floor(Math.random() * symbols.length)];
            slot1.innerText = final1;
            slot2.innerText = final2;
            slot3.innerText = final3;
            checkWin(final1, final2, final3);
        }, spinDuration);
    }

    function checkWin(s1, s2, s3) {
        let result = "Verloren!";
        let className = "lose";
        let multiplier = 0;
        if (s1 === s2 && s2 === s3) {
            result = "JACKPOT! Gewinn x10";
            className = "win";
            multiplier = 10;
            winSound.play();
        } else if (Math.random() * 100 < winChance) {
            multiplier = getRandomMultiplier();
            result = `Gewonnen! Gewinn x${multiplier}`;
            className = "win";
            
            winSound.play();
        } else {
            loseSound.play();
            setTimeout(() => {
                resultText.classList.remove("lose"); // Stoppt das Wackeln nach 3 Sekunden
            }, 3000);
        }
        resultText.innerText = result;
        resultText.className = className;
        updateBetSummary(multiplier);
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
});
