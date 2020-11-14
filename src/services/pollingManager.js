import {
    fetchActiveViewTickets,
    fetchRecentViewsCounts,
} from '../state/views/actions.ts'
import {store as reduxStore} from '../init'

class PollingManager {
    intervals = {}
    store = reduxStore

    activeViewInterval = 10000
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

        this.intervals.recentViewsCounts = setInterval(() => {
            this.store.dispatch(fetchRecentViewsCounts())
        }, this.recentViewsCountsInterval)

        this.store.dispatch(fetchActiveViewTickets())
    }

    stop = () => {
        Object.keys(this.intervals).forEach((interval) =>
            this._stopInterval(interval)
        )
    }

    _stopInterval = (interval) => {
        clearInterval(this.intervals[interval])
        delete this.intervals[interval]
    }
}

export default new PollingManager()
