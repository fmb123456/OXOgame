let Player1 = "0.139280 0.186330 0.674389 0.558114 0.441886 0.259011 0.740989 0.468401 0.531599";
let Player2 = "0.139280 0.186330 0.674389 0.558114 0.441886 0.259011 0.740989 0.468401 0.531599";
let dep = 2;
//use "random" to get a random AI
class Board {
    constructor() {
        this.game = new Game();
        document.querySelector(".big").addEventListener("click", e => {
            var target = e.target;
            if (target.matches(".Oavl") || target.matches(".Xavl"))
                this.move(target);
        });
        for (let [i, small] of[...document.querySelectorAll(".small")].entries()) {
            small.classList.add("s" + i);
            for (let [j, grid] of[...small.querySelectorAll(".grid")].entries()) {
                grid.classList.add("g" + i + j), grid.idx = [i, j];
            }
        }
    }
    move(target) {
        console.log("----------------------\n------------------------\n-----------------------");
        var idx = target.idx;
        var p;
        if (target.matches(".Oavl"))
            p = "O";
        else
            p = "X";
        target.classList.add(p);
        if (this.game.move(idx))
            target.closest(".small").classList.add(p);
        this.addHistory(idx, p);
        this.updateScreen();
    }
    updateScreen() {
        for (let grid of document.querySelectorAll(".Oavl"))
            grid.classList.remove("Oavl");
        for (let grid of document.querySelectorAll(".Xavl"))
            grid.classList.remove("Xavl");
        var p = this.game.cur_player === 1 ? "O" : "X";
        var avl = [...this.game.valid_moves()];
        if (avl.length) {
            for (let idx of avl)
                document.querySelector(".g" + idx.join("")).classList.add(p + "avl");
            document.querySelector("#top").className = p;
        } else {
            let winner = this.game.winner;
            if (winner)
                document.querySelector("#top").className = (winner === 1 ? "O" : "X") + "win";
            else
                document.querySelector("#top").className = "draw";
        }
        document.dispatchEvent(new Event("nextTurn"));
    }
    reset() {
        for (let node of[...document.querySelectorAll("#history>p")])
            node.parentNode.removeChild(node);
        for (let node of[...document.querySelectorAll(".O")])
            node.classList.remove("O");
        for (let node of[...document.querySelectorAll(".X")])
            node.classList.remove("X");
        this.game.reset();
        this.updateScreen();
    }
    undo() {
        var rep_times;
        if (Player1 && Player2) rep_times = 0;
        else if (Player2 || Player2) rep_times = 2;
        else rep_times = 1;
        for (let i = 0; i < rep_times; ++i) {
            if (!this.game.history.length) break;
            var idx = this.game.history[this.game.history.length - 1];
            var big_change = this.game.undo();
            var p = this.game.cur_player === 1 ? "O" : "X";
            document.querySelector(".g" + idx.join("")).classList.remove(p);
            if (big_change)
                document.querySelector(".s" + idx[0]).classList.remove(p);
            var history = [...document.querySelectorAll("#history>p")];
            var del = history[history.length - 1];
            del.parentNode.removeChild(del);
        }
        this.updateScreen();
    }
    addHistory(idx, p) {
        var node = document.createElement("p");
        node.innerHTML = `${p}: ${idx.join()}`;
        document.querySelector("#history").appendChild(node);
    }
}
var board = new Board();
let p1 = new Player(Player1);
let p2 = new Player(Player2);

function p1Check() {
    if (!board.game.finish && board.game.cur_player === 1) {
        let idx = p1.best_move(board.game, dep);
        let target = document.querySelector(".g" + idx.join(""));
        board.move(target);
    }
}

function p2Check() {
    if (!board.game.finish && board.game.cur_player === -1) {
        let idx = p2.best_move(board.game, dep);
        let target = document.querySelector(".g" + idx.join(""));
        board.move(target);
    }
}

function setEventListener(useP1 = false, useP2 = true) {
    if (useP1 === true && useP2 === true) {
        alert("幹嘛? 不給, 選別的");
        return;
    }
    document.removeEventListener("nextTurn", p1Check);
    document.removeEventListener("nextTurn", p2Check);
    if (useP1)
        document.addEventListener("nextTurn", p1Check);
    if (useP2)
        document.addEventListener("nextTurn", p2Check);
    board.reset();
}
document.querySelector("#undo").onclick = function(e) { board.undo(); };
document.querySelector("#reset").onclick = function(e) { board.reset(); };
document.querySelector("select").onchange = function(e) {
    var choice = e.target.value;
    if (choice === "pvp") setEventListener(false, false);
    else if (choice === "pvc") setEventListener(false, true);
    else if (choice === "cvp") setEventListener(true, false);
    else if (choice === "cvc") setEventListener(true, true);
};
setEventListener();
board.updateScreen();