let Player1 = [
    "0.0597493260 0.0911376696 0.6714633763 0.9681431079 1.7303547007 0.8145670122 0.3791052146 0.9028103752 1.6803037029",
    "0.0042466509 0.0195638929 0.7091416232 0.7718535331 1.4247274501 0.0584790536 0.4627202925 0.5608847774 1.6144937918",
    "0.0763347519 0.1190042465 0.7647244494 0.8475031885 1.7303547007 0.8145670122 0.3791052146 0.9028103752 1.2385556254",
    "0.0597493260 0.0911376696 0.6714633763 0.9681431079 1.7303547007 0.8145670122 0.3791052146 0.9028103752 1.6803037029",
    "0.0597493260 0.0911376696 0.6714633763 0.9681431079 1.7303547007 0.8145670122 0.3791052146 0.9028103752 1.6803037029"
];
let Player2 = [
    "0.0190046567 0.3863728809 0.8065844206 0.8967346416 1.1796081640 0.6116801636 0.4647948411 0.9761332087 1.8924844711",
    "0.1697484877 0.1845909637 0.8121196910 0.9287697377 1.6159995293 0.3266117189 0.4832613703 0.6381569599 1.7491571785",
    "0.3818017797 0.4438981719 0.7921089193 0.8600679094 1.0171300893 0.4595301075 0.4963115487 0.9707022184 1.5296438045",
    "0.0355480195 0.1217017076 0.6423934736 0.9353113364 1.0163164171 0.6471232569 0.4728762567 0.8313467754 1.4267390007",
    "0.1071492359 0.1213246100 0.5542140767 0.8382288591 1.5339484225 0.2926134227 0.4889446372 0.7893483414 1.8931953752"
];
//use "random" to get a random AI
const INITDEP = 3;
const EXTRADEP = 4;
let dep;
let img = [
    "oil1.jpg", //https://www.pixiv.net/artworks/80520328
    "oil2.jpg", //https://www.pixiv.net/artworks/18231910
    "oil3.jpg", //https://www.youtube.com/watch?v=2l_6oIGTrbg
    "oil4.jpg", //https://www.pixiv.net/artworks/87658338
    "oil5.jpg", //https://twitter.com/momomomomiZ/status/1363547464033308673/photo/1
    "oil6.jpg", //https://twitter.com/pkpk44/status/1363437351372877825/photo/1
    "oil7.jpg", //https://www.pixiv.net/artworks/87991921
    "oil8.jpg", //https://www.pinterest.ru/pin/611293349404059174/
    "oil9.jpg", //https://www.pixiv.net/artworks/87772580
    "oil10.jpg", //https://www.pixiv.net/artworks/88081516
    "oil11.jpg", //https://www.pixiv.net/artworks/80520328
    "oil12.jpg", //https://www.pixiv.net/artworks/73573157
    "oil13.jpg", //https://www.pixiv.net/artworks/71123408
    "oil1.jpeg", //https://www.pixiv.net/artworks/85978281
    "oil1.png", //https://www.pixiv.net/artworks/72972311
    "oil2.png", //https://www.pixiv.net/artworks/75778049
    "oil3.png" //https://www.pixiv.net/artworks/76435086
];
let stop = false;
class Board {
    constructor() {
        this.game = new Game();
        this.undoTimes = 2;
        document.querySelector(".big").addEventListener("click", e => {
            if (!stop) {
                var target = e.target;
                if (target.matches(".Oavl") || target.matches(".Xavl"))
                    this.move(target);
            }
        });
        for (let [i, small] of[...document.querySelectorAll(".small")].entries()) {
            small.classList.add("s" + i);
            for (let [j, grid] of[...small.querySelectorAll(".grid")].entries()) {
                grid.classList.add("g" + i + j), grid.idx = [i, j];
            }
        }
    }
    move(target) {
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
        var p = this.game.curPlayer === 1 ? "O" : "X";
        var avl = [...this.game.validMoves()];
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
        for (let i = 0; i < this.undoTimes; ++i) {
            if (!this.game.history.length) break;
            var idx = this.game.history[this.game.history.length - 1];
            var bigChange = this.game.undo();
            var p = this.game.curPlayer === 1 ? "O" : "X";
            document.querySelector(".g" + idx.join("")).classList.remove(p);
            if (bigChange)
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

let board = new Board();
let p1 = new Player(Player1[Math.floor(Math.random() * Player1.length)]);
let p2 = new Player(Player2[Math.floor(Math.random() * Player2.length)]);
let bg = document.querySelector(".bg");
bg.style.backgroundImage = `url(images/${img[Math.floor(Math.random() * img.length)]})`;

function p1Check() {
    if (!stop && !board.game.finish && board.game.curPlayer === 1) {
        stop = true;
        setTimeout(function() {
            if (board.game.big.state.filter(i => i !== 0).length >= 3 || board.game.history.length >= 40) dep = EXTRADEP;
            else dep = INITDEP;
            let idx = p1.bestMove(board.game, dep);
            let target = document.querySelector(".g" + idx.join(""));
            board.move(target);
            stop = false;
        }, 500);
    }
}

function p2Check() {
    if (!stop && !board.game.finish && board.game.curPlayer === -1) {
        stop = true;
        setTimeout(function() {
            if (board.game.big.state.filter(i => i !== 0).length >= 3 || board.game.history.length >= 40) dep = EXTRADEP;
            else dep = INITDEP;
            let idx = p2.bestMove(board.game, dep);
            let target = document.querySelector(".g" + idx.join(""));
            board.move(target);
            stop = false;
        }, 500);
    }
}

function setEventListener(useP1 = false, useP2 = true) {
    board.undoTimes = useP1 & useP2 ? 0 : useP1 | useP2 ? 2 : 1;
    document.removeEventListener("nextTurn", p1Check);
    document.removeEventListener("nextTurn", p2Check);
    if (useP1)
        document.addEventListener("nextTurn", p1Check);
    if (useP2)
        document.addEventListener("nextTurn", p2Check);
    board.reset();
}
document.querySelector("#undo").onclick = function(e) { board.undo(); };
document.querySelector("#reset").onclick = function(e) {
    board.reset();
    bg.style.backgroundImage = `url(images/${img[Math.floor(Math.random() * img.length)]})`;
};
document.querySelector("select").onchange = function(e) {
    var choice = e.target.value;
    if (choice === "pvp") setEventListener(false, false), board.undoTimes = 1;
    else if (choice === "pvc") setEventListener(false, true), board.undoTimes = 2;
    else if (choice === "cvp") setEventListener(true, false), board.undoTimes = 2;
    else if (choice === "cvc") setEventListener(true, true);
};
setEventListener();
board.updateScreen();