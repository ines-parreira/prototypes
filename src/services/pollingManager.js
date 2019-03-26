import {fetchActiveViewCount, fetchActiveViewTickets, fetchRecentViewsCounts} from '../state/views/actions'
import {store as reduxStore} from '../init'

class PollingManager {
    intervals = {}
    store = reduxStore

    activeViewInterval = 10000
    activeViewCountInterval = 1000
    recentViewsCountsInterval = 5000

    start = () => {
        if (window.DISABLE_ACTIVITY_POLLING === 'True') {
            return
        }

        // clear previous intervals before creating new intervals
        this.stop()

        this.intervals.activeViewTickets = setInterval(() => {
            this.store.dispatch(fetchActiveViewTickets())
        }, this.activeViewInterval)

        this.intervals.activeViewCount = setInterval(() => {
            this.store.dispatch(fetchActiveViewCount())
        }, this.activeViewCountInterval)

        this.intervals.recentViewsCounts = setInterval(() => {
            this.store.dispatch(fetchRecentViewsCounts())
        }, this.recentViewsCountsInterval)

        this.store.dispatch(fetchActiveViewTickets())
        this.store.dispatch(fetchActiveViewCount())
    }


    stop = () => {
        Object.keys(this.intervals).forEach((interval) => this._stopInterval(interval))
    }

    _stopInterval = (interval) => {
        clearInterval(this.intervals[interval])
        delete this.intervals[interval]
    }
}

export default new PollingManager()
