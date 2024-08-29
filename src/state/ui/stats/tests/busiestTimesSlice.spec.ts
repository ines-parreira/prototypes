import {BusiestTimeOfDaysMetrics} from 'pages/stats/support-performance/busiest-times-of-days/types'
import {RootState} from 'state/types'
import {
    busiestTimesSlice,
    getSelectedMetric,
    initialState,
    setSelectedMetric,
} from 'state/ui/stats/busiestTimesSlice'

describe('busiestTimesSlice', () => {
    const defaultState = {
        ui: {
            [busiestTimesSlice.name]: initialState,
        },
    } as RootState

    it('should return initial metric', () => {
        expect(getSelectedMetric(defaultState)).toEqual(
            initialState.selectedMetric
        )
    })

    it('should update selectedMetric', () => {
        const metric = BusiestTimeOfDaysMetrics.TicketsCreated
        const newState = busiestTimesSlice.reducer(
            initialState,
            setSelectedMetric(metric)
        )

        expect(newState.selectedMetric).toEqual(metric)
    })

    it('should not update selectedMetric if the value is not one of the metrics', () => {
        const metric = 'randomString'
        const newState = busiestTimesSlice.reducer(
            initialState,
            setSelectedMetric(metric)
        )

        expect(newState.selectedMetric).toEqual(initialState.selectedMetric)
    })
})
