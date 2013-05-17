var MS = {};
MS.num_rows = 16;
MS.num_cols = 30;
MS.num_bombs = 99;
MS.flag = String.fromCharCode(parseInt('2691', 16));
MS.bomb = '💣 ';
MS.alive = true;
MS.colors = {1: 'blue', 2: 'green', 3: 'red', 4: 'purple',
             5: 'maroon', 6: 'turquoise', 7: 'black', 8: 'grey'}
MS.mousewhiches = 0;

function startNewGame() {
    MS.bombs = placeBombs();
    document.getElementById('field').appendChild(createBoard());
}

function placeBombs() {
    var i, rows = [];
    for (i=0; i<MS.num_bombs; i++) {
        placeOneBomb(rows);
    }
    return rows;
}

function placeOneBomb(bombs) {
    var nrow, ncol, row, col;
    nrow = Math.floor(Math.random() * MS.num_rows);
    ncol = Math.floor(Math.random() * MS.num_cols);
    row = bombs[nrow];
    if (!row) {
        row = [];
        bombs[nrow] = row;
    }
    col = row[ncol];
    if (!col) {
        row[ncol] = true;
        return
    } else {
        placeOneBomb(bombs);
    }
}

function cellID(i, j) {
    return 'cell-' + i + '-' + j;
}

function createBoard() {
    var table, row, td, i, j;
    table = document.createElement('table');
    for (i=0; i<MS.num_rows; i++) {
        row = document.createElement('tr');
        for (j=0; j<MS.num_cols; j++) {
            td = document.createElement('td');
            td.id = cellID(i, j);
            row.appendChild(td);
            addCellListeners(td, i, j);
        }
        table.appendChild(row);
    }
    return table;
}

function addCellListeners(td, i, j) {
    td.addEventListener('mousedown', function(event) {
        if (!MS.alive) {
            return;
        }
        MS.mousewhiches += event.which;
        if (event.which === 3) {
            return;
        }
        if (this.flagged) {
            return;
        }
        this.style.backgroundColor = 'lightGrey';
    });
    td.addEventListener('mouseup', function(event) {
        if (!MS.alive) {
            return;
        }

        if (this.clicked && MS.mousewhiches == 4) {
            performMassClick(this, i, j);
        }
        MS.mousewhiches = 0;
        
        if (event.which === 3) {
            if (this.clicked) {
                return;
            }
            if (this.flagged) {
                this.flagged = false;
                this.textContent = '';
            } else {
                this.flagged = true;
                this.textContent = MS.flag;
            }
            event.preventDefault();
            event.stopPropagation();
            return false;
        } else {
            handleCellClick(this, i, j);
        }
    });

    td.oncontextmenu = function() { return false; };
}

function handleCellClick(cell, i, j) {
    if (!MS.alive) {
        return;
    }
    if (cell.flagged) {
        return;
    }
    cell.clicked = true;
    if (MS.bombs[i][j]) {
        cell.style.color = 'red';
        cell.textContent = MS.bomb;
        gameOver();
    } else {
        cell.style.backgroundColor = 'lightGrey';
        num_bombs = adjacentBombs(i, j);
        if (num_bombs) {
            cell.style.color = MS.colors[num_bombs];
            cell.textContent = num_bombs;
        } else {
            clickAdjacentBombs(i, j);
        }
    }
}

function adjacentBombs(row, col) {
    var i, j, num_bombs;
    num_bombs = 0;
    for (i=-1; i<2; i++) {
        for (j=-1; j<2; j++) {
            if (MS.bombs[row + i] && MS.bombs[row + i][col + j]) {
                num_bombs++;
            }
        }
    }
    return num_bombs;
}

function adjacentFlags(row, col) {
    var i, j, num_flags;
    num_flags = 0;
    for (i=-1; i<2; i++) {
        for (j=-1; j<2; j++) {
            cell = document.getElementById(cellID(row + i, col + j));
            if (!!cell && cell.flagged) {
                num_flags++;
            }
        }
    }
    return num_flags;
}

function clickAdjacentBombs(row, col) {
    var i, j, cell;
    for (i=-1; i<2; i++) {
        for (j=-1; j<2; j++) {
            if (i === 0 && j === 0) {
                continue;
            }
            cell = document.getElementById(cellID(row + i, col + j));
            if (!!cell && !cell.clicked && !cell.flagged) {
                handleCellClick(cell, row + i, col + j);
            }
        }
    }
}

function performMassClick(cell, row, col) {
    if (adjacentFlags(row, col) === adjacentBombs(row, col)) {
        clickAdjacentBombs(row, col);
    }
}

function gameOver() {
    MS.alive = false;
}

window.addEventListener('load', function() {
    var new_game_button = document.getElementById('new-game-button');
    new_game_button.addEventListener('click', startNewGame);
    startNewGame();
});
