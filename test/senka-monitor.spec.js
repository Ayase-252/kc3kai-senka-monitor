const SenkaMonitor = require('../senka-monitor').SenkaMonitor;
const expect = require('chai').expect;

describe("SenkaMonitor", () => {
    it("should calculate rank pts based on previous cutoff.", () => {
        SenkaMonitor.setDayCutoffExp(19420000);
        SenkaMonitor.setMonthCutoffExp(19000000);

        SenkaMonitor.setCurrentExp(19500000);
        expect(SenkaMonitor.getRankPtsGainSinceMonthCutoff()).be.closeTo(350.14, 0.01);
        expect(SenkaMonitor.getRankPtsGainSinceDayCutoff()).be.closeTo(56.02, 0.01);
    });

    describe('Day cutoff', () => {
        context('if it is not the last day of a month', () => {
            it('should happen after 1700z everyday', () => {
                SenkaMonitor.setCurrentTime(Date.UTC(2018, 5, 20, 14));
                expect(SenkaMonitor.getNextDayCutoffTime()).to.equal(
                    Date.UTC(2018, 5, 20, 17)
                );

                SenkaMonitor.setCurrentTime(Date.UTC(2018, 5, 20, 18));
                expect(SenkaMonitor.getNextDayCutoffTime()).to.equal(
                    Date.UTC(2018, 5, 21, 17)
                );
            });
        });
        context('if it is the last day of a month', () => {
            it('should happen after 1300z', () => {
                SenkaMonitor.setCurrentTime(Date.UTC(2018, 0, 30, 22));
                expect(SenkaMonitor.getNextDayCutoffTime()).to.equal(
                    Date.UTC(2018, 0, 31, 13)
                );
                SenkaMonitor.setCurrentTime(Date.UTC(2018, 1, 28, 11));
                expect(SenkaMonitor.getNextDayCutoffTime()).to.equal(
                    Date.UTC(2018, 1, 28, 13)
                );
                SenkaMonitor.setCurrentTime(Date.UTC(2018, 4, 31, 13, 12));
                expect(SenkaMonitor.getNextDayCutoffTime()).to.equal(
                    Date.UTC(2018, 5, 1, 17)
                );
            });
        });

        it('should execute day cutoff if current time is later than scheduled '
            + 'day cutoff time', () => {
                SenkaMonitor.setCurrentTime(Date.UTC(2018, 4, 20, 14, 2, 1));
                SenkaMonitor.setNextDayCutoffTime(Date.UTC(2018, 4, 20, 17));
                
                SenkaMonitor.setCurrentTime(Date.UTC(2018, 4, 20, 15));
                SenkaMonitor.checkMonthCutoff();
                SenkaMonitor.checkDayCutoff();
                
                expect(SenkaMonitor.getNextDayCutoffTime()).to.equal(
                    Date.UTC(2018, 4, 20, 17)
                );
                
                SenkaMonitor.setPrevDayCutoffExp(648204);
                SenkaMonitor.setCurrentTime(Date.UTC(2018, 4, 20, 18, 0, 4));
                SenkaMonitor.setCurrentExp(649094);
                SenkaMonitor.checkDayCutoff();

                expect(SenkaMonitor.getNextDayCutoffTime()).to.equal(
                    Date.UTC(2018, 4, 21, 17)
                );
                expect(SenkaMonitor.getPrevDayCutoffExp()).to.equal(649094);
                expect(SenkaMonitor.getDailyRankPtsGain(20)).closeTo(0.62, 0.01);
            });
    });

    describe('Month cutoff', () => {
        it('should happened after 1300z of the last day of the month', () => {
            SenkaMonitor.setCurrentTime(Date.UTC(2018, 4, 30));

            expect(SenkaMonitor.getNextMonthCutoffTime()).to.equal(
                Date.UTC(2018, 4, 31, 13)
            );

            SenkaMonitor.setCurrentTime(Date.UTC(2018, 4, 31, 14));
            expect(SenkaMonitor.getNextMonthCutoffTime()).to.equal(
                Date.UTC(2018, 5, 30, 13)
            );

            SenkaMonitor.setCurrentTime(Date.UTC(2018, 11, 31, 15));
            expect(SenkaMonitor.getNextMonthCutoffTime()).to.equal(
                Date.UTC(2019, 0, 31, 13)
            );
        });

        it('should execute month cutoff if the time is later than scheduled ' +
            'cut off time', () => {
            SenkaMonitor.setCurrentExp(597402);
            SenkaMonitor.setNextMonthCutoffTime(Date.UTC(2018, 0, 31, 13));
            SenkaMonitor.setCurrentTime(Date.UTC(2018, 1, 1));

            SenkaMonitor.checkMonthCutoff();
            expect(SenkaMonitor.getPrevMonthCutoffExp()).to.equal(597402);
            expect(SenkaMonitor.getRankPtsGainPerDay()).to.deep.equal(
                Array(28).fill(0));
            // It should also reset the day cutoff time;
            expect(SenkaMonitor.getNextDayCutoffTime()).to.equal(
                Date.UTC(2018, 1, 1, 17)
            );
            expect(SenkaMonitor.getPrevDayCutoffExp()).to.equal(597402);
        });

        it('should reset the daily rank pts array', () => {
            SenkaMonitor.setNextDayCutoffTime(Date.UTC(2018, 4, 31, 13));
            SenkaMonitor.setCurrentTime(Date.UTC(2018, 4, 31, 13, 24));

            SenkaMonitor.checkMonthCutoff();
            expect(SenkaMonitor.getRankPtsGainPerDay()).to.deep.equal(
                Array(30).fill(0)
            );
        });
    });
});
