import {fetchActiveViewCount, fetchActiveViewTickets, fetchRecentViewsCounts} from '../state/views/actions'
import {pollChats} from '../state/activity/actions'
import {store as reduxStore} from '../init'

class PollingManager {
    intervals = {}
    store = reduxStore

    activeViewInterval = 10000
    activeViewCountInterval = 1000
    recentViewsCountsInterval = 5000
    chatInterval = 9000

    start = () => {
        if (window.DISABLE_ACTIVITY_POLLING === 'True') {
            return
        }

        // clear previous intervals before creating new intervals
        this.stop()

        this.intervals.chats = setInterval(() => {
            this.store.dispatch(pollChats())
        }, this.chatInterval)

        this.intervals.activeViewTickets = setInterval(() => {
            this.store.dispatch(fetchActiveViewTickets())
        }, this.activeViewInterval)

        this.intervals.activeViewCount = setInterval(() => {
            this.store.dispatch(fetchActiveViewCount)
        }, this.activeViewCountInterval)

        this.intervals.recentViewsCounts = setInterval(() => {
            this.store.dispatch(fetchRecentViewsCounts())
        }, this.recentViewsCountsInterval)

        this.store.dispatch(pollChats())
        this.store.dispatch(fetchActiveViewTickets())
        this.store.dispatch(fetchActiveViewCount())
        this.store.dispatch(fetchRecentViewsCounts())
    }

    stopInterval = (interval) => {
        clearInterval(this.intervals[interval])
        delete this.intervals[interval]
    }

    pause = () => {
        Object.keys(this.intervals).forEach(interval => {
            //  do not stop chat polling
            if (interval === 'chats') {
                return
            }

            this.stopInterval(interval)
        })
    }

    stop = () => {
        Object.keys(this.intervals).forEach(interval => this.stopInterval(interval))
    }
}

export default new PollingManager()
