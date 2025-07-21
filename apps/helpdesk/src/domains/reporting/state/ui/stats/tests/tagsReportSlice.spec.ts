import {
    getHeatmapMode,
    getTagsOrder,
    getValueMode,
    setOrder,
    tagsReportSlice,
    TagsReportState,
    toggleHeatmapMode,
    toggleValueMode,
} from 'domains/reporting/state/ui/stats/tagsReportSlice'
import { ValueMode } from 'domains/reporting/state/ui/stats/types'
import { opposite, OrderDirection } from 'models/api/types'
import { RootState } from 'state/types'

describe('tagsReportSlice', () => {
    const tagsState: TagsReportState = {
        order: {
            column: 'tag',
            direction: OrderDirection.Asc,
        },
        valueMode: ValueMode.TotalCount,
        heatmapMode: false,
    }
    const state = {
        ui: {
            stats: {
                [tagsReportSlice.name]: tagsState,
            },
        },
    } as RootState

    describe('reducers', () => {
        it('should toggleValueMode', () => {
            const newState = tagsReportSlice.reducer(
                tagsState,
                toggleValueMode(),
            )

            expect(newState.valueMode).toEqual(ValueMode.Percentage)
        })

        it('should toggleValueMode', () => {
            const state = {
                ...tagsState,
                valueMode: ValueMode.Percentage,
            }

            const newState = tagsReportSlice.reducer(state, toggleValueMode())

            expect(newState.valueMode).toEqual(ValueMode.TotalCount)
        })

        it('should setOrder as opposite of current', () => {
            const newState = tagsReportSlice.reducer(
                tagsState,
                setOrder({ column: 'tag' }),
            )

            expect(newState.order.direction).toEqual(
                opposite(tagsState.order.direction),
            )
        })

        it('should setOrder to ascending first for tag column', () => {
            const state: TagsReportState = {
                ...tagsState,
                order: {
                    direction: OrderDirection.Asc,
                    column: 'total',
                },
            }
            const newState = tagsReportSlice.reducer(
                state,
                setOrder({ column: 'tag' }),
            )

            expect(newState.order.direction).toEqual(OrderDirection.Asc)
        })

        it('should setOrder to descending first for non-tag column', () => {
            const state: TagsReportState = {
                ...tagsState,
                order: {
                    direction: OrderDirection.Asc,
                    column: 'tag',
                },
            }
            const newState = tagsReportSlice.reducer(
                state,
                setOrder({ column: 'total' }),
            )

            expect(newState.order.direction).toEqual(OrderDirection.Desc)
        })

        it('should toggleHeatmapMode', () => {
            const newState = tagsReportSlice.reducer(
                tagsState,
                toggleHeatmapMode(),
            )

            expect(newState.heatmapMode).toEqual(true)
        })
    })

    describe('selectors', () => {
        it('should return expected value', () => {
            expect(getValueMode(state)).toEqual(
                state.ui.stats[tagsReportSlice.name].valueMode,
            )
            expect(getTagsOrder(state)).toEqual(
                state.ui.stats[tagsReportSlice.name].order,
            )
            expect(getHeatmapMode(state)).toEqual(
                state.ui.stats[tagsReportSlice.name].heatmapMode,
            )
        })
    })
})
