import type { AnyAction } from 'redux'

import { store as reduxStore } from 'common/store'
import { isFullWidthViewPath } from 'common/utils'
import {
    fetchActiveViewTickets,
    fetchRecentViewsCounts,
} from 'state/views/actions'

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
            if (isFullWidthViewPath(window.location.pathname)) {
                this.store.dispatch(
                    fetchActiveViewTickets() as unknown as AnyAction,
                )
            }
        }, this.activeViewInterval)

        this.intervals.recentViewsCounts = setInterval(() => {
            this.store.dispatch(
                fetchRecentViewsCounts() as unknown as AnyAction,
            )
        }, this.recentViewsCountsInterval)

        if (isFullWidthViewPath(window.location.pathname)) {
            this.store.dispatch(
                fetchActiveViewTickets() as unknown as AnyAction,
            )
        }
    }

    stop = () => {
        Object.keys(this.intervals).forEach((interval) =>
            this._stopInterval(interval as keyof PollingManager['intervals']),
        )
    }

    stopRecentViewCountsInterval = () => {
        !!this.intervals.recentViewsCounts &&
            this._stopInterval('recentViewsCounts')
    }

    _stopInterval = (interval: keyof PollingManager['intervals']) => {
        clearInterval(this.intervals[interval])
        delete this.intervals[interval]
    }
}

const pollingManager = new PollingManager()

export default pollingManager
