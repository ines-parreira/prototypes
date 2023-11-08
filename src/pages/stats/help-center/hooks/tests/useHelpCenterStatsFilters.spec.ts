import {renderHook} from '@testing-library/react-hooks'
import {useHelpCenterStatsFilters} from '../useHelpCenterStatsFilters'

const START_DATE = new Date().toString()
const END_DATE = new Date('01/01/2023').toString()
const initialState = {
    helpCenters: [1],
    period: {
        end_datetime: START_DATE,
        start_datetime: END_DATE,
    },
}

describe('useHelpCenterStatsFilters', () => {
    it('should return initial filters', () => {
        const {result} = renderHook(() =>
            useHelpCenterStatsFilters(initialState)
        )

        expect(result.current.statsFilters).toStrictEqual(initialState)
    })

    it('should change filter', () => {
        const {result} = renderHook(() =>
            useHelpCenterStatsFilters(initialState)
        )

        expect(result.current.statsFilters).toStrictEqual(initialState)

        result.current.setSelectedFilter('helpCenters', {helpCenters: [2]})

        expect(result.current.statsFilters).toStrictEqual({
            ...initialState,
            helpCenters: [2],
        })
    })
})
