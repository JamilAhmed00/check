// LOGIC

// Add at the top with other variables
const AI_MOVE_TIMEOUT = 3000; // 3 seconds timeout for AI moves
let aiTimeoutId = null;



// Evaluate the board for the AI (black pieces)
function evaluateBoard(board) {
    let score = 0;
    for (let row of board) {
        for (let cell of row) {
            if (cell === "b") score += 1; // Black piece
            else if (cell === "B") score += 3; // Black king
            else if (cell === "w") score -= 1; // White piece
            else if (cell === "W") score -= 3; // White king
        }
    }
    return score;
}

// Generate all valid moves for a given player (black or white)
function getValidMoves(board, isBlack) {
    // Your existing logic to generate valid moves for black/white
    // Each move should be represented as {from: [row, col], to: [row, col], capture: boolean}
    return [];
}

// Apply a move to the board and return the resulting board state
function applyMove(board, move) {
    // Make a deep copy of the board
    const newBoard = board.map(row => row.slice());
    // Apply the move (update the board based on the move details)
    const [fromRow, fromCol] = move.from;
    const [toRow, toCol] = move.to;
    newBoard[toRow][toCol] = newBoard[fromRow][fromCol];
    newBoard[fromRow][fromCol] = null;

    // Handle captures
    if (move.capture) {
        const captureRow = (fromRow + toRow) / 2;
        const captureCol = (fromCol + toCol) / 2;
        newBoard[captureRow][captureCol] = null;
    }

    // Handle king promotion
    if (toRow === 0 && newBoard[toRow][toCol] === "b") {
        newBoard[toRow][toCol] = "B";
    }

    return newBoard;
}

// Minimax algorithm with alpha-beta pruning
function minimax(board, depth, isMaximizing, alpha, beta) {
    // Base case: if depth is 0 or the game is over
    if (depth === 0 || isGameOver(board)) {
        return evaluateBoard(board);
    }

    const validMoves = getValidMoves(board, isMaximizing);
    if (isMaximizing) {
        let maxEval = -Infinity;
        for (const move of validMoves) {
            const newBoard = applyMove(board, move);
            const eval = minimax(newBoard, depth - 1, false, alpha, beta);
            maxEval = Math.max(maxEval, eval);
            alpha = Math.max(alpha, eval);
            if (beta <= alpha) break; // Prune
        }
        return maxEval;
    } else {
        let minEval = Infinity;
        for (const move of validMoves) {
            const newBoard = applyMove(board, move);
            const eval = minimax(newBoard, depth - 1, true, alpha, beta);
            minEval = Math.min(minEval, eval);
            beta = Math.min(beta, eval);
            if (beta <= alpha) break; // Prune
        }
        return minEval;
    }
}

// Select the best move for the AI
function getBestMove(board, depth) {
    let bestMove = null;
    let bestValue = -Infinity;
    const validMoves = getValidMoves(board, true); // True for black pieces

    for (const move of validMoves) {
        const newBoard = applyMove(board, move);
        const moveValue = minimax(newBoard, depth - 1, false, -Infinity, Infinity);
        if (moveValue > bestValue) {
            bestValue = moveValue;
            bestMove = move;
        }
    }

    return bestMove;
}

// Integration: Use the AI in your game
function automatedMoveForBlack(board) {
    const depth = 3; // Set the search depth
    const bestMove = getBestMove(board, depth);
    if (bestMove) {
        return applyMove(board, bestMove);
    } else {
        console.error("No valid moves for AI");
        return board;
    }
}




function movement(e, element) {
    if (gameTurn != element.classList[1]) return;

    // Only allow white pieces to be moved by human
    if (element.classList.contains('black')) return;

    document.querySelectorAll(".prediction, .clone").forEach(element => {
        element.remove();
    })

    if (document.querySelector(".moving"))
        document.querySelector(".moving").classList.remove("moving");

    // MOVING
    let clone = element.cloneNode();
    clone.innerHTML = element.innerHTML;
    clone.classList.add("clone");
    clone.style.position = "absolute";
        
    document.body.appendChild(clone);
    element.classList.add("moving");
    
    moveClone(e)
    element.style.display = "none";

    const coords = getCoordinates(element);
    drawPredictions(element, coords)

    document.querySelectorAll(".prediction").forEach(element_prediction => {
        element_prediction.addEventListener("mouseup", () => {
            handleMove(element, element_prediction);
        })
    })
}

function handleMove(piece, targetSquare) {
    let moving_piece = document.querySelector(".moving");
    let clone = document.querySelector(".clone");
    
    if (clone) {
        clone.remove();
    }
    
    const coords = getCoordinates(targetSquare);
    let promotion = false;

    // Handle promotion
    if (!piece.classList.contains("dame")) {
        if (piece.classList[1] == "white" && coords[0] == 0) {
            piece.classList.add("dame");
            piece.innerHTML = `<i class="fas fa-crown" style="font-size:4vh; position: relative; top: 50%; left: 50%; transform: translate(-50%, -50%); color: var(--white-piece-outer);"></i>`;
            promote.play();
            promotion = true;
        } else if (piece.classList[1] == "black" && coords[0] == 7) {
            piece.classList.add("dame");
            piece.innerHTML = `<i class="fas fa-crown" style="font-size:4vh; position: relative; top: 50%; left: 50%; transform: translate(-50%, -50%); color: var(--black-piece-outer);"></i>`;
            promote.play();
            promotion = true;
        }
    }

    // Handle capture
    if (targetSquare.classList[1]) {
        const x = parseInt(targetSquare.classList[1][0]);
        const y = parseInt(targetSquare.classList[1][2]);
        if (table[x][y].firstChild) {
            table[x][y].firstChild.remove();
            if (!promotion) capture.play();
        }
    } else if (!promotion) {
        move.play();
    }

    // Move the piece
    targetSquare.parentNode.appendChild(moving_piece);
    moving_piece.classList.remove("moving");
    moving_piece.style.display = "block"; // Ensure piece is visible
    
    // Change turn
    gameTurn = gameTurn == "white" ? "black" : "white";
    
    document.querySelector(`.active`).classList.toggle("active");
    document.querySelector(`#player-${gameTurn}`).classList.toggle("active");

    // Update scores
    blackScore = document.querySelectorAll(".piece.black:not(.clone)").length;
    whiteScore = document.querySelectorAll(".piece.white:not(.clone)").length;
    document.querySelector("#score-black").textContent = blackScore;
    document.querySelector("#score-white").textContent = whiteScore;

    // Check for no valid moves or zero pieces
    if (blackScore === 0) {
        declareWinner('white');
        return;
    } else if (whiteScore === 0) {
        declareWinner('black');
        return;
    }

    // Check if current player has any valid moves
    const currentPieces = document.querySelectorAll(`.piece.${gameTurn}:not(.clone)`);
    let hasValidMoves = false;
    
    for (const piece of currentPieces) {
        const coords = getCoordinates(piece);
        drawPredictions(piece, coords);
        if (document.querySelectorAll('.prediction').length > 0) {
            hasValidMoves = true;
            document.querySelectorAll('.prediction').forEach(p => p.remove());
            break;
        }
        document.querySelectorAll('.prediction').forEach(p => p.remove());
    }
    
    if (!hasValidMoves) {
        // Declare winner based on piece count
        if (blackScore > whiteScore) {
            declareWinner('black');
        } else if (whiteScore > blackScore) {
            declareWinner('white');
        } else {
            declareDraw(); // In case of equal pieces
        }
        return;
    }

    // Clean up and continue with AI move
    document.querySelectorAll(".prediction").forEach(p => p.remove());

    if (gameTurn === 'black') {
        setTimeout(makeAIMove, 500);
    }
}

function makeAIMove() {
    // Clear any existing timeout
    if (aiTimeoutId) {
        clearTimeout(aiTimeoutId);
    }

    // Set a timeout to handle cases where AI takes too long
    aiTimeoutId = setTimeout(() => {
        console.log("AI move timed out - making random move");
        makeRandomMove();
    }, AI_MOVE_TIMEOUT);

    const blackPieces = [...document.querySelectorAll('.piece.black:not(.clone)')];
    if (!blackPieces.length) {
        declareWinner('white');
        return;
    }

    // Check if AI has any valid moves
    let hasValidMoves = false;
    for (const piece of blackPieces) {
        const coords = getCoordinates(piece);
        if (!coords) continue;

        drawPredictions(piece, coords);
        const predictions = [...document.querySelectorAll('.prediction')];
        
        if (predictions.length > 0) {
            hasValidMoves = true;
            document.querySelectorAll('.prediction').forEach(p => p.remove());
            break;
        }
        document.querySelectorAll('.prediction').forEach(p => p.remove());
    }

   
    if (!hasValidMoves) {
        clearTimeout(aiTimeoutId);
        if (blackScore > whiteScore) {
            declareWinner('black');
        } else if (whiteScore > blackScore) {
            declareWinner('white');
        } else {
            declareDraw();
        }
        return;
    }

    let bestPiece = null;
    let bestMove = null;

    
    for (const piece of blackPieces) {
        const coords = getCoordinates(piece);
        if (!coords) continue;

        const hasCaptures = drawPredictions(piece, coords);
        const predictions = [...document.querySelectorAll('.prediction')];
        
        if (hasCaptures && predictions.length > 0) {
            bestPiece = piece;
            bestMove = predictions[0]; // Take first capturing move as they're mandatory
            break;
        }
        
        document.querySelectorAll(".prediction").forEach(p => p.remove());
    }

    if (!bestPiece) {
        for (const piece of blackPieces) {
            if (piece.classList.contains('dame')) continue; // Skip if already a king
            
            const coords = getCoordinates(piece);
            if (!coords || coords[0] < 5) continue; // Only check pieces close to promotion

            drawPredictions(piece, coords);
            const predictions = [...document.querySelectorAll('.prediction')];
            
            for (const pred of predictions) {
                const predCoords = getCoordinates(pred);
                if (predCoords && predCoords[0] === 7) { // Will result in promotion
                    bestPiece = piece;
                    bestMove = pred;
                    break;
                }
            }
            
            document.querySelectorAll(".prediction").forEach(p => p.remove());
            if (bestPiece) break;
        }
    }

 
    if (!bestPiece) {
        for (const piece of blackPieces) {
            if (piece.classList.contains('dame')) continue; // Skip kings for now
            
            const coords = getCoordinates(piece);
            if (!coords) continue;

            drawPredictions(piece, coords);
            const predictions = [...document.querySelectorAll('.prediction')];
            
            // Filter for forward moves only
            const forwardMoves = predictions.filter(pred => {
                const predCoords = getCoordinates(pred);
                return predCoords && predCoords[0] > coords[0];
            });

            if (forwardMoves.length > 0) {
                bestPiece = piece;
                bestMove = forwardMoves[Math.floor(Math.random() * forwardMoves.length)];
                break;
            }
            
            document.querySelectorAll(".prediction").forEach(p => p.remove());
        }
    }

    
    if (!bestPiece) {
        for (const piece of blackPieces) {
            const coords = getCoordinates(piece);
            if (!coords) continue;

            drawPredictions(piece, coords);
            const predictions = [...document.querySelectorAll('.prediction')];
            
            if (predictions.length > 0) {
                bestPiece = piece;
                bestMove = predictions[Math.floor(Math.random() * predictions.length)];
                break;
            }
            
            document.querySelectorAll(".prediction").forEach(p => p.remove());
        }
    }

   
    if (bestPiece && bestMove) {
        clearTimeout(aiTimeoutId);
        bestPiece.classList.add("moving");
        
        document.querySelectorAll(".prediction").forEach(p => {
            if (p !== bestMove) p.remove();
        });

        handleMove(bestPiece, bestMove);
    }
}

function makeRandomMove() {
    const blackPieces = [...document.querySelectorAll('.piece.black:not(.clone)')];
    if (!blackPieces.length) {
        declareWinner('white');
        return;
    }

  
    const randomPiece = blackPieces[Math.floor(Math.random() * blackPieces.length)];
    const coords = getCoordinates(randomPiece);
    
    drawPredictions(randomPiece, coords);
    const predictions = [...document.querySelectorAll('.prediction')];
    
    if (predictions.length > 0) {
        const randomMove = predictions[Math.floor(Math.random() * predictions.length)];
        randomPiece.classList.add("moving");
        
        document.querySelectorAll(".prediction").forEach(p => {
            if (p !== randomMove) p.remove();
        });

        handleMove(randomPiece, randomMove);
    }
}

function drawPredictions(element, coords) {

    let canEat = false;
    let prediction_;

    if (element.classList.contains("black") || element.classList.contains("dame")) {

        try {

        if (table[coords[0]+1][coords[1]+1])
            
            prediction_ = prediction.cloneNode();

            if (!table[coords[0]+1][coords[1]+1].firstChild)
                table[coords[0]+1][coords[1]+1]
                    .appendChild(prediction_.cloneNode());
            
            else {
                if (table[coords[0]+1][coords[1]+1].firstChild
                    .classList[1] != element.classList[1] &&
                    table[coords[0]+2][coords[1]+2] &&
                    !table[coords[0]+2][coords[1]+2].firstChild
                ) {
                    prediction_.classList.add(`${[coords[0]+1]}-${[coords[1]+1]}`);

                    table[coords[0]+2][coords[1]+2]
                        .appendChild(prediction_.cloneNode());

                    canEat = true;
                }
            }
        
        } catch (error) { }

        try {

        if (table[coords[0]+1][coords[1]-1])

            prediction_ = prediction.cloneNode();

            if (!table[coords[0]+1][coords[1]-1].firstChild)
                table[coords[0]+1][coords[1]-1]
                    .appendChild(prediction_.cloneNode());
            
            else {
                if (table[coords[0]+1][coords[1]-1].firstChild
                    .classList[1] != element.classList[1] &&
                    table[coords[0]+2][coords[1]-2] && 
                    !table[coords[0]+2][coords[1]-2].firstChild
                ) {
                    prediction_.classList.add(`${[coords[0]+1]}-${[coords[1]-1]}`);

                    table[coords[0]+2][coords[1]-2]
                        .appendChild(prediction_.cloneNode());

                    canEat = true;
                }
            }

        } catch (error) { }

    } 
    
    if (element.classList.contains("white") || element.classList.contains("dame")) {

        try {

        if (table[coords[0]-1][coords[1]+1])

            prediction_ = prediction.cloneNode();

            if (!table[coords[0]-1][coords[1]+1].firstChild)
                table[coords[0]-1][coords[1]+1]
                    .appendChild(prediction_.cloneNode());
            
            else {
                if (table[coords[0]-1][coords[1]+1].firstChild
                    .classList[1] != element.classList[1] &&
                    table[coords[0]-2][coords[1]+2] &&
                    !table[coords[0]-2][coords[1]+2].firstChild
                ) {
                    prediction_.classList.add(`${[coords[0]-1]}-${[coords[1]+1]}`);

                    table[coords[0]-2][coords[1]+2]
                        .appendChild(prediction_.cloneNode());

                    canEat = true;
                }
            }

        } catch (error) { }

        try {

        if (table[coords[0]-1][coords[1]-1])
        
            prediction_ = prediction.cloneNode();

            if (!table[coords[0]-1][coords[1]-1].firstChild)
                table[coords[0]-1][coords[1]-1]
                    .appendChild(prediction_.cloneNode());
            
            else {
                if (table[coords[0]-1][coords[1]-1].firstChild
                    .classList[1] != element.classList[1] &&
                    table[coords[0]-2][coords[1]-2] && 
                    !table[coords[0]-2][coords[1]-2].firstChild
                ) {
                    prediction_.classList.add(`${[coords[0]-1]}-${[coords[1]-1]}`);

                    table[coords[0]-2][coords[1]-2]
                        .appendChild(prediction_.cloneNode());

                    canEat = true;
                }
            }
        
        } catch (error) { }
            
    }
    
    return canEat;
}

// Add new function to declare draw
function declareDraw() {
   
}



// Update the declareWinner function to handle 1 or 0 piece logic
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

// Modify handleMove function to incorporate the logic
function handleMove(piece, targetSquare) {
    let moving_piece = document.querySelector(".moving");
    let clone = document.querySelector(".clone");

    if (clone) clone.remove();

    const coords = getCoordinates(targetSquare);
    let promotion = false;

    // Handle promotion
    if (!piece.classList.contains("dame")) {
        if (piece.classList[1] === "white" && coords[0] === 0) {
            piece.classList.add("dame");
            piece.innerHTML = `<i class="fas fa-crown" style="font-size:4vh; position: relative; top: 50%; left: 50%; transform: translate(-50%, -50%); color: var(--white-piece-outer);"></i>`;
            promote.play();
            promotion = true;
        } else if (piece.classList[1] === "black" && coords[0] === 7) {
            piece.classList.add("dame");
            piece.innerHTML = `<i class="fas fa-crown" style="font-size:4vh; position: relative; top: 50%; left: 50%; transform: translate(-50%, -50%); color: var(--black-piece-outer);"></i>`;
            promote.play();
            promotion = true;
        }
    }

    // Handle capture
    if (targetSquare.classList[1]) {
        const x = parseInt(targetSquare.classList[1][0]);
        const y = parseInt(targetSquare.classList[1][2]);
        if (table[x][y].firstChild) {
            table[x][y].firstChild.remove();
            if (!promotion) capture.play();
        }
    } else if (!promotion) {
        move.play();
    }

    // Move the piece
    targetSquare.parentNode.appendChild(moving_piece);
    moving_piece.classList.remove("moving");
    moving_piece.style.display = "block";

    // Change turn
    gameTurn = gameTurn === "white" ? "black" : "white";

    document.querySelector(`.active`).classList.toggle("active");
    document.querySelector(`#player-${gameTurn}`).classList.toggle("active");

    // Update scores
    blackScore = document.querySelectorAll(".piece.black:not(.clone)").length;
    whiteScore = document.querySelectorAll(".piece.white:not(.clone)").length;
    document.querySelector("#score-black").textContent = blackScore;
    document.querySelector("#score-white").textContent = whiteScore;

    // Check for the 1 or 0 piece logic
    if (blackScore <= 1) {
        declareWinner('white');
        return;
    } else if (whiteScore <= 1) {
        declareWinner('black');
        return;
    }

    // Check if current player has any valid moves
    const currentPieces = document.querySelectorAll(`.piece.${gameTurn}:not(.clone)`);
    let hasValidMoves = false;

    for (const piece of currentPieces) {
        const coords = getCoordinates(piece);
        drawPredictions(piece, coords);
        if (document.querySelectorAll('.prediction').length > 0) {
            hasValidMoves = true;
            document.querySelectorAll('.prediction').forEach(p => p.remove());
            break;
        }
        document.querySelectorAll('.prediction').forEach(p => p.remove());
    }

    if (!hasValidMoves) {
        // Declare winner based on piece count
        if (blackScore > whiteScore) {
            declareWinner('black');
        } else if (whiteScore > blackScore) {
            declareWinner('white');
        } else {
            declareDraw(); // In case of equal pieces
        }
        return;
    }

    // Clean up and continue with AI move
    document.querySelectorAll(".prediction").forEach(p => p.remove());

    if (gameTurn === 'black') {
        setTimeout(makeAIMove, 500);
    }
}
