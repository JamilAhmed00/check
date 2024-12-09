// LOGIC

function movement(e, element) {
    if (gameTurn != element.classList[1]) return;

    document.querySelectorAll(".prediction, .clone").forEach(element => {
        element.remove();
    });

    if (document.querySelector(".moving"))
        document.querySelector(".moving").classList.remove("moving");

    // MOVING
    let clone = element.cloneNode();
    clone.innerHTML = element.innerHTML;
    clone.classList.add("clone");
    clone.style.position = "absolute";

    document.body.appendChild(clone);
    element.classList.add("moving");

    moveClone(e);
    element.style.display = "none";

    const coords = getCoordinates(element);
    drawPredictions(element, coords);

    document.querySelectorAll(".prediction").forEach(element_prediction => {
        element_prediction.addEventListener("mouseup", () => {
            let moving_piece = document.querySelector(".moving");
            let clone = document.querySelector(".clone");

            if (clone) {
                clone.remove();
                moving_piece.style.display = "block";
            }

            const coords = getCoordinates(element_prediction);
            let promotion = false;

            // Check for promotion
            if (
                !element.classList.contains("dame") &&
                element.classList[1] == "white" &&
                coords[0] == 0
            ) {
                element.classList.add("dame");
                element.innerHTML = `<i class="fas fa-crown" style="font-size:4vh; position: relative; top: 50%; left: 50%; transform: translate(-50%, -50%); color: var(--white-piece-outer);"></i>`;
                promote.play();
                promotion = true;
            } else if (
                !element.classList.contains("dame") &&
                element.classList[1] == "black" &&
                coords[0] == 7
            ) {
                element.classList.add("dame");
                element.innerHTML = `<i class="fas fa-crown" style="font-size:4vh; position: relative; top: 50%; left: 50%; transform: translate(-50%, -50%); color: var(--black-piece-outer);"></i>`;
                promote.play();
                promotion = true;
            }

            element_prediction.parentNode.appendChild(moving_piece);

            document.querySelectorAll(".prediction").forEach(e => {
                e.remove();
            });

            if (element_prediction.classList[1]) {
                let x = element_prediction.classList[1][0];
                let y = element_prediction.classList[1][2];

                table[x][y].firstChild.remove();

                if (drawPredictions(element, getCoordinates(element))) {
                    gameTurn = gameTurn == "white" ? "black" : "white";
                } else {
                    document.querySelectorAll(".prediction").forEach(e => {
                        e.remove();
                    });
                }
                if (!promotion) capture.play();
            } else {
                if (!promotion) move.play();
            }

            gameTurn = gameTurn == "white" ? "black" : "white";

            document.querySelector(`.active`).classList.toggle("active");
            document.querySelector(`#player-${gameTurn}`).classList.toggle("active");

            // Update scores after a move
            blackScore = document.querySelectorAll(".piece.black:not(.clone)").length;
            whiteScore = document.querySelectorAll(".piece.white:not(.clone)").length;

            document.querySelector("#score-black").textContent = blackScore;
            document.querySelector("#score-white").textContent = whiteScore;

            // Check for the game-ending condition
            if (blackScore === 0 || whiteScore === 0) {
                let winner = blackScore === 0 ? 'white' : 'black';
                declareWinner(winner); // Call the declareWinner function
                return;
            }
        });
    });
}

function drawPredictions(element, coords) {
    let canEat = false;
    let prediction_;

    if (element.classList.contains("black") || element.classList.contains("dame")) {
        try {
            if (table[coords[0] + 1][coords[1] + 1]) {
                prediction_ = prediction.cloneNode();

                if (!table[coords[0] + 1][coords[1] + 1].firstChild)
                    table[coords[0] + 1][coords[1] + 1].appendChild(prediction_.cloneNode());
                else {
                    if (
                        table[coords[0] + 1][coords[1] + 1].firstChild.classList[1] != element.classList[1] &&
                        table[coords[0] + 2][coords[1] + 2] &&
                        !table[coords[0] + 2][coords[1] + 2].firstChild
                    ) {
                        prediction_.classList.add(`${[coords[0] + 1]}-${[coords[1] + 1]}`);
                        table[coords[0] + 2][coords[1] + 2].appendChild(prediction_.cloneNode());
                        canEat = true;
                    }
                }
            }
        } catch (error) { }

        try {
            if (table[coords[0] + 1][coords[1] - 1]) {
                prediction_ = prediction.cloneNode();

                if (!table[coords[0] + 1][coords[1] - 1].firstChild)
                    table[coords[0] + 1][coords[1] - 1].appendChild(prediction_.cloneNode());
                else {
                    if (
                        table[coords[0] + 1][coords[1] - 1].firstChild.classList[1] != element.classList[1] &&
                        table[coords[0] + 2][coords[1] - 2] &&
                        !table[coords[0] + 2][coords[1] - 2].firstChild
                    ) {
                        prediction_.classList.add(`${[coords[0] + 1]}-${[coords[1] - 1]}`);
                        table[coords[0] + 2][coords[1] - 2].appendChild(prediction_.cloneNode());
                        canEat = true;
                    }
                }
            }
        } catch (error) { }
    }

    if (element.classList.contains("white") || element.classList.contains("dame")) {
        try {
            if (table[coords[0] - 1][coords[1] + 1]) {
                prediction_ = prediction.cloneNode();

                if (!table[coords[0] - 1][coords[1] + 1].firstChild)
                    table[coords[0] - 1][coords[1] + 1].appendChild(prediction_.cloneNode());
                else {
                    if (
                        table[coords[0] - 1][coords[1] + 1].firstChild.classList[1] != element.classList[1] &&
                        table[coords[0] - 2][coords[1] + 2] &&
                        !table[coords[0] - 2][coords[1] + 2].firstChild
                    ) {
                        prediction_.classList.add(`${[coords[0] - 1]}-${[coords[1] + 1]}`);
                        table[coords[0] - 2][coords[1] + 2].appendChild(prediction_.cloneNode());
                        canEat = true;
                    }
                }
            }
        } catch (error) { }

        try {
            if (table[coords[0] - 1][coords[1] - 1]) {
                prediction_ = prediction.cloneNode();

                if (!table[coords[0] - 1][coords[1] - 1].firstChild)
                    table[coords[0] - 1][coords[1] - 1].appendChild(prediction_.cloneNode());
                else {
                    if (
                        table[coords[0] - 1][coords[1] - 1].firstChild.classList[1] != element.classList[1] &&
                        table[coords[0] - 2][coords[1] - 2] &&
                        !table[coords[0] - 2][coords[1] - 2].firstChild
                    ) {
                        prediction_.classList.add(`${[coords[0] - 1]}-${[coords[1] - 1]}`);
                        table[coords[0] - 2][coords[1] - 2].appendChild(prediction_.cloneNode());
                        canEat = true;
                    }
                }
            }
        } catch (error) { }
    }

    return canEat;
}

// Declare Winner UI Function
function declareWinner(winner) {
    const winnerText = winner === 'white' 
        ? `White Wins! (White: ${whiteScore}, Black: ${blackScore})` 
        : `Black Wins! (Black: ${blackScore}, White: ${whiteScore})`;

    const winnerDisplay = document.createElement('div');
    winnerDisplay.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background-color: rgba(0, 0, 0, 0.9);
        color: white;
        padding: 20px 40px;
        border-radius: 10px;
        font-size: 24px;
        z-index: 1000;
    `;
    winnerDisplay.textContent = winnerText;

    // Add Play Again button
    const playAgainBtn = document.createElement('button');
    playAgainBtn.textContent = 'Play Again';
    playAgainBtn.style.cssText = `
        display: block;
        margin: 10px auto 0;
        padding: 10px 20px;
        background-color: #4CAF50;
        color: white;
        border: none;
        border-radius: 5px;
        cursor: pointer;
    `;
    playAgainBtn.onclick = () => {
        location.reload();
    };

    winnerDisplay.appendChild(playAgainBtn);
    document.body.appendChild(winnerDisplay);
}
