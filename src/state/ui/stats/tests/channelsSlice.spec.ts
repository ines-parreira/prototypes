import {OrderDirection} from 'models/api/types'
import {ChannelsTableColumns} from 'pages/stats/support-performance/channels/ChannelsTableConfig'
import {RootState} from 'state/types'
import {
    channelsSlice,
    getChannelsSorting,
    getHeatmapMode,
    initialState,
    sortingLoaded,
    sortingLoading,
    sortingSet,
    toggleHeatmapMode,
} from 'state/ui/stats/channelsSlice'

describe('channelsSlice', () => {
    const defaultState = {
        ui: {
            [channelsSlice.name]: initialState,
        },
    } as RootState

    it('should return heatmapMode', () => {
        expect(getHeatmapMode(defaultState)).toEqual(initialState.heatmapMode)
    })

    it('should toggle heatmapMode state', () => {
        const newState = channelsSlice.reducer(
            initialState,
            toggleHeatmapMode()
        )

        expect(newState.heatmapMode).toEqual(
            !defaultState.ui[channelsSlice.name].heatmapMode
        )
    })

    describe('sorting', () => {
        it('should set sorting with loading', () => {
            const field = ChannelsTableColumns.TicketHandleTime
            const direction = OrderDirection.Asc

            const newState = channelsSlice.reducer(
                initialState,
                sortingSet({field, direction})
            )

            expect(newState.sorting).toEqual({
                field,
                direction,
                isLoading: true,
                lastSortingMetric: null,
            })
        })

        it('should set sorting loading', () => {
            const newState = channelsSlice.reducer(
                initialState,
                sortingLoading()
            )

            expect(newState.sorting).toEqual({
                ...initialState.sorting,
                isLoading: true,
            })
        })

        it('should set loaded sorting with lastSortingMetric order', () => {
            const field = ChannelsTableColumns.TicketHandleTime
            const direction = OrderDirection.Asc
            const orderedChannelSlugs = ['abc', 'xyz']

            const newState = channelsSlice.reducer(
                {
                    ...initialState,
                    sorting: {
                        field,
                        direction,
                        isLoading: true,
                        lastSortingMetric: null,
                    },
                },
                sortingLoaded(orderedChannelSlugs)
            )

            expect(newState.sorting).toEqual({
                field,
                direction,
                isLoading: false,
                lastSortingMetric: orderedChannelSlugs,
            })
        })

        it('should return the sorting', () => {
            expect(getChannelsSorting(defaultState)).toEqual(
                defaultState.ui[channelsSlice.name].sorting
            )
        })
    })
})
