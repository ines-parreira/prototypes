import {AnyAction} from 'redux'

import {
    fetchActiveViewTickets,
    fetchRecentViewsCounts,
} from '../state/views/actions'
import {store as reduxStore} from '../init'

type Intervals = {
    activeViewTickets: ReturnType<typeof setTimeout>
    recentViewsCounts: ReturnType<typeof setTimeout>
}

class PollingManager {
    intervals = {} as Intervals
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
            this.store.dispatch(
                fetchActiveViewTickets() as unknown as AnyAction
            )
        }, this.activeViewInterval)

        this.intervals.recentViewsCounts = setInterval(() => {
            this.store.dispatch(
                fetchRecentViewsCounts() as unknown as AnyAction
            )
        }, this.recentViewsCountsInterval)

        this.store.dispatch(fetchActiveViewTickets() as unknown as AnyAction)
    }

    stop = () => {
        Object.keys(this.intervals).forEach((interval) =>
            this._stopInterval(interval as keyof PollingManager['intervals'])
        )
    }

    _stopInterval = (interval: keyof PollingManager['intervals']) => {
        clearInterval(this.intervals[interval])
        delete this.intervals[interval]
    }
}

export default new PollingManager()
