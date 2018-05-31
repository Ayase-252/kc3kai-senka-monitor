const SenkaMonitor = {
    expPrevDayCutoff: 0,
    expPrevMonthCutoff: 0,
    expCurrent: 0,
    currentTime: 0,
    timeNextDayCutoff: 0,
    timeNextMonthCutoff: 0,
    rankPtsGainPerDay: [],

    setDayCutoffExp: function (exp) {
        this.expPrevDayCutoff = exp;
    },

    setMonthCutoffExp: function (exp) {
        this.expPrevMonthCutoff = exp;
    },

    setCurrentExp: function (exp) {
        this.expCurrent = exp;
    },

    getRankPtsGainSinceMonthCutoff: function () {
        return this._calculateRankPtsGain(this.expCurrent,
            this.expPrevMonthCutoff);
    },

    getRankPtsGainSinceDayCutoff: function () {
        return this._calculateRankPtsGain(this.expCurrent,
            this.expPrevDayCutoff);
    },

    _calculateRankPtsGain: function (currExp, cutoffExp) {
        return (currExp - cutoffExp) / 1428;
    },

    setCurrentTime: function (time) {
        this.currentTime = time;
    },

    getNextDayCutoffTime: function () {
        const now = new Date(this.currentTime);
        // Cutoff on 1700(UTC) everyday
        // If it is the last day of a month, cutoff will be at 2200(JST), 
        // 1300(UTC)
        let nextDay = now.getUTCDate();
        let cutoffHour = 17;
        if (now.getUTCHours() >= 17 ||
            (now.getUTCDate() === this._getMonthLastDay() &&
                now.getUTCHours() >= 13)) {
            nextDay += 1;
        }
        if (nextDay === this._getMonthLastDay()) {
            cutoffHour = 13;
        }
        return Date.UTC(now.getUTCFullYear(), now.getUTCMonth(),
            nextDay, cutoffHour);
    },

    getNextMonthCutoffTime: function () {
        const now = new Date(this.currentTime);
        const currentYear = now.getUTCFullYear();
        const currentMonth = now.getUTCMonth();
        // It will be 13:00 of the last day of specified month (UTC).
        let proposedCutoffTime = Date.UTC(currentYear, currentMonth + 1, 0, 13);
        if (now.valueOf() > proposedCutoffTime) {
            proposedCutoffTime = Date.UTC(currentYear, currentMonth + 2, 0, 13);
        }
        return proposedCutoffTime;
    },

    setNextDayCutoffTime: function (time) {
        this.timeNextDayCutoff = time;
    },

    setNextMonthCutoffTime: function (time) {
        this.timeNextMonthCutoff = time;
    },

    getPrevDayCutoffExp: function () {
        return this.expPrevDayCutoff;
    },

    getPrevMonthCutoffExp: function () {
        return this.expPrevMonthCutoff;
    },

    getRankPtsGainPerDay: function () {
        return this.rankPtsGainPerDay;
    },

    setPrevDayCutoffExp: function (exp) {
        this.expPrevDayCutoff = exp;
    },

    getDailyRankPtsGain: function (day) {
        return this.rankPtsGainPerDay[day - 1];
    },

    checkDayCutoff: function () {
        if (this.currentTime > this.timeNextDayCutoff) {
            const dayIndex = new Date(this.timeNextDayCutoff).getUTCDate() - 1;
            this.rankPtsGainPerDay[dayIndex] = this._calculateRankPtsGain(
                this.expCurrent, this.expPrevDayCutoff);
            this.expPrevDayCutoff = this.expCurrent;
            this.timeNextDayCutoff = this.getNextDayCutoffTime();
        }
    },

    checkMonthCutoff: function () {
        if (this.currentTime > this.timeNextMonthCutoff) {
            this.expPrevMonthCutoff = this.expCurrent;
            this.timeNextMonthCutoff = this.getNextMonthCutoffTime();
            this.rankPtsGainPerDay = Array(this._getMonthLastDay()).fill(0);

            this.expPrevDayCutoff = this.expCurrent;
            this.timeNextDayCutoff = this.getNextDayCutoffTime();
        }
    },

    _getMonthLastDay: function () {
        // UTC+9, now UTC of jstNow is the JST
        const utcNow = new Date(this.currentTime);
        const jstNow = new Date(utcNow + 9 * 3600000);
        const lastDay = new Date(Date.UTC(jstNow.getUTCFullYear(),
            jstNow.getUTCMonth() + 1, 0)).getUTCDate();
        return lastDay;
    },

    saveTo: function(localStorage) {
        const dataObj = {
            expPrevDayCutoff: this.expPrevDayCutoff,
            expPrevMonthCutoff: this.expPrevMonthCutoff,
            expCurrent: this.expCurrent,
            currentTime: this.currentTime,
            timeNextDayCutoff: this.timeNextDayCutoff,
            timeNextMonthCutoff: this.timeNextMonthCutoff,
            rankPtsGainPerDay: this.rankPtsGainPerDay,
        };
        localStorage.senkamonitor = JSON.stringify(dataObj);
    },

    readFrom: function(localStorage) {
        if(localStorage.senkamonitor !== undefined) {
            const parsedDataObj = JSON.parse(localStorage.senkamonitor);
            this.expPrevDayCutoff = parsedDataObj.expPrevDayCutoff;
            this.expPrevMonthCutoff = parsedDataObj.expPrevDayCutoff;
            this.expCurrent = parsedDataObj.expCurrent;
            this.currentTime = parsedDataObj.currentTime;
            this.timeNextDayCutoff = parsedDataObj.timeNextDayCutoff;
            this.timeNextMonthCutoff = parsedDataObj.timeNextMonthCutoff;
            this.rankPtsGainPerDay = parsedDataObj.rankPtsGainPerDay;
        };
    },
    
    getCurrentExp() {
        return this.expCurrent;   
    }
};


exports.SenkaMonitor = SenkaMonitor;