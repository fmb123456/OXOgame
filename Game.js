const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
];
class Table {
    constructor() {
        this.state = Array.from({ length: 9 }, () => 0);
        this.winner = 0;
    }
    updateWinnerAndFinish() {
        for (let line of lines) {
            let tot = line.map(idx => this.state[idx]).reduce((s, i) => s + i);
            if (tot === 3) this.winner = 1;
            if (tot === -3) this.winner = -1;
        }
    }
    move(idx, p) {
        this.state[idx] = p;
        this.updateWinnerAndFinish();
        return this.winner !== 0;
    }
    delete(idx) {
        var res = this.winner !== 0;
        this.state[idx] = 0;
        this.winner = 0;
        return res;
    }
    get finish() {
        return this.winner || this.state.every(i => i !== 0);
    }
}

class Game {
    constructor() {
        this.small = Array.from({ length: 9 }, () => new Table());
        this.big = new Table();
        this.history = [];
    }
    valid(idx) {
        if (this.winner || this.small[idx[0]].finish || this.small[idx[0]].state[idx[1]])
            return false;
        return this.lastMove === -1 || this.lastMove === idx[0];
    }
    move(idx) {
        var res = this.small[idx[0]].move(idx[1], this.curPlayer);
        if (res)
            this.big.move(idx[0], this.curPlayer);
        this.history.push(idx);
        return res;
    }
    undo() {
        var idx = this.history.pop();
        if (this.small[idx[0]].delete(idx[1]))
            return this.big.delete(idx[0]), true;
        else
            return false;
    }
    reset() {
        while (this.history.length)
            this.undo();
    }
    get lastMove() {
        if (!this.history.length) return -1;
        let idx = this.history[this.history.length - 1];
        if (this.small[idx[1]].finish)
            return -1;
        return idx[1];
    }
    get curPlayer() {
        return this.history.length & 1 ? -1 : 1;
    }
    get finish() {
        return this.big.finish || this.small.every(i => i.finish);
    }
    get winner() {
        return this.big.winner;
    }
    state(idx) {
            return this.small[idx[0]].state[idx[1]];
        } *
        validMoves() {
            for (let i = 0; i < 9; ++i)
                for (let j = 0; j < 9; ++j)
                    if (this.valid([i, j]))
                        yield [i, j];
        }
}
class Player {
    constructor(params) {
        if (params === "random") {
            let a = Array.from({ length: 4 }, () => Math.random()).sort((i, j) => i - j);
            this.lineCnt = [a[0], a[1]];
            this.readyRate = [0, a[2], a[3]];
            this.occupy = Math.random + 1;
            this.sOpRate = [Math.random];
            this.sOpRate.push(1 - this.sOpRate[0]);
            this.nextNowRate = [Math.random / 2];
            this.nextNowRate.push(1 - this.nextNowRate[0]);
            this.omega = [1, Math.random];
            for (let i = 1; i < 7; ++i) this.omega.push(this.omega[i] * this.omega[1]);
            this.alpha = Math.random + 1;
        } else {
            params = params.split(' ').map(i => parseFloat(i));
            this.lineCnt = [params[0], params[1]];
            this.readyRate = [0, params[2], params[3]];
            this.occupy = params[4];
            this.sOpRate = [params[5], 1 - params[5]];
            this.nextNowRate = [params[6], 1 - params[6]];
            this.omega = [1, params[7]]
            this.alpha = params[8];
            for (let i = 1; i < 7; ++i) this.omega.push(this.omega[i] * this.omega[1]);
        }
    }
    bestMove(game, dep) {
        var best;
        var bestScore = Number.NEGATIVE_INFINITY;
        for (let i of game.validMoves()) {
            let score = this.getRating(game, i, dep);
            if (!best || score - bestScore > Number.EPSILON)
                bestScore = score, best = i;
        }
        return best;
    }
    getSmallAttackRating(game, idx, p) {
        if (game.small[idx].finish)
            return game.small[idx].winner === p ? this.occupy : 0;
        var ready = Array.from({ length: 9 }, () => false);
        for (let line of lines) {
            line = line.filter(i => game.state([idx, i]) !== p);
            if (line.length === 1 && game.state([idx, line[0]]) === 0)
                ready[line[0]] = true;
        }
        var readyScore = this.readyRate[Math.min(ready.filter(i => i === true).length, 2)];
        var lineScore = 0;
        var allLine = [];
        for (let line of lines) {
            if (line.some(i => ready[i]))
                continue;
            if (line.some(i => game.state([idx, i]) === -p))
                allLine.push(0);
            else
                allLine.push(this.lineCnt[line.filter(i => game.state([idx, i]) === p).length]);
        }
        if (allLine.length) {
            allLine.sort((i, j) => j - i);
            let base = 0;
            for (let [k, i] of allLine.entries()) {
                lineScore += i * this.omega[k];
                base += this.omega[k];
            }
            lineScore /= base;
        }
        return (readyScore + lineScore) / 2;
    }
    getSmallRating(game, idx, p) {
        return this.getSmallAttackRating(game, idx, p) * this.sOpRate[0] - this.getSmallAttackRating(game, idx, -p) * this.sOpRate[1];
    }
    getBigRating(game, p) {
        if (game.finish) {
            if (game.winner === p)
                return Number.POSITIVE_INFINITY;
            else if (game.winner === -p)
                return Number.NEGATIVE_INFINITY;
            else
                return 0;
        }
        var smallRating = Array.from({ length: 9 }, (i, k) => this.getSmallRating(game, k, p));
        var readyScore = 0;
        var lineScore = 0;
        var allLine = [];
        var ready = Array.from({ length: 9 }, () => false);
        for (let line of lines) {
            line = line.filter(i => game.small[i].winner !== p);
            if (line.length === 1 && !game.small[line[0]].finish && !ready[line[0]]) {
                ready[line[0]] = true;
                readyScore += this.alpha ** smallRating[line[0]];
            }
        }
        for (let line of lines) {
            if (line.some(i => ready[i]))
                continue;
            if (line.some(i => game.small[i].winner !== p && game.small[i].finish))
                allLine.push(0);
            else allLine.push(this.alpha ** (line.map(i => smallRating[i]).reduce((s, i) => s + i) / 3));
        }
        if (allLine.length) {
            allLine.sort((i, j) => j - i);
            let base = 0;
            for (let [k, i] of allLine.entries()) {
                lineScore += i * this.omega[k];
                base += this.omega[k];
            }
            lineScore /= base;
        }
        return (readyScore + lineScore) / 2;
    }
    getRating(game, idx, dep) {
        if (dep === 0) return 0;
        var p = game.curPlayer;
        var ratS = -this.getBigRating(game, p);
        game.move(idx);
        if (game.finish) {
            let res;
            if (game.winner)
                res = Number.POSITIVE_INFINITY;
            else
                res = 0;
            game.undo();
            return res;
        }
        ratS += this.getBigRating(game, p);
        var opBest = this.bestMove(game, dep - 1);
        var ratOp = this.getRating(game, opBest, dep - 1);
        game.undo();
        return ratS * this.nextNowRate[1] - ratOp * this.nextNowRate[0];
    }
}