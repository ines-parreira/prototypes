import {RootState} from 'state/types'
import {TableColumn} from 'state/ui/stats/types'
import {OrderDirection} from 'models/api/types'
import {
    initialState,
    setMetricData,
    drillDownSlice,
    toggleDrillDownModal,
    getDrillDownMetric,
    getDrillDownMetricOrder,
    getDrillDownMetricShow,
    getDrillDownModalState,
    buildAgentMetric,
} from 'state/ui/stats/drillDownSlice'
import {User} from 'config/types/user'
import {TableLabels} from 'pages/stats/TableConfig'

describe('drillDownSlice', () => {
    const dateRange = {
        start_datetime: '1970-01-01T00:00:00+00:00',
        end_datetime: '1970-01-01T00:00:00+00:00',
    }

    describe('reducers', () => {
        it('should show the agent customer satisfaction metric', () => {
            const newState = drillDownSlice.reducer(
                initialState,
                setMetricData({
                    metricName: TableColumn.CustomerSatisfaction,
                    perAgentId: 1,
                    dateRange,
                })
            )

            expect(newState.metricData?.metricName).toEqual(
                TableColumn.CustomerSatisfaction
            )
            expect(newState.isOpen).toBeTruthy()
        })

        it('should not show closed tickets agents metric', () => {
            const newState = drillDownSlice.reducer(
                initialState,
                setMetricData({
                    metricName: TableColumn.ClosedTickets,
                    perAgentId: 1,
                    dateRange,
                })
            )

            expect(newState.metricData?.metricName).toEqual(
                TableColumn.ClosedTickets
            )
            expect(newState.isOpen).toBeTruthy()
        })

        it('should toggle the modal state', () => {
            const newState = drillDownSlice.reducer(
                initialState,
                toggleDrillDownModal()
            )

            expect(newState.isOpen).toEqual(true)
        })
    })

    describe('selectors', () => {
        const isOpen = false
        const metricData = {
            metricName: 'someName',
        }

        const state = {
            ui: {
                [drillDownSlice.name]: {
                    isOpen,
                    metricData,
                },
            },
        } as unknown as RootState

        it('getDrillDownMetric', () => {
            expect(getDrillDownMetric(state)).toEqual(metricData)
        })
        it('getDrillDownMetricOrder', () => {
            expect(
                getDrillDownMetricOrder({
                    ...state,
                    ui: {
                        [drillDownSlice.name]: {
                            metricData: {
                                metricName: TableColumn.CustomerSatisfaction,
                            },
                        },
                    },
                } as unknown as RootState)
            ).toEqual(OrderDirection.Asc)
            expect(
                getDrillDownMetricOrder({
                    ...state,
                    ui: {
                        [drillDownSlice.name]: {
                            metricData: {
                                metricName: TableColumn.ClosedTickets,
                            },
                        },
                    },
                } as unknown as RootState)
            ).toEqual(OrderDirection.Desc)
        })
        it('getDrillDownMetricShow', () => {
            expect(
                getDrillDownMetricShow({
                    ...state,
                    ui: {
                        [drillDownSlice.name]: {
                            metricData: {
                                metricName: TableColumn.CustomerSatisfaction,
                            },
                        },
                    },
                } as unknown as RootState)
            ).toBeTruthy()

            expect(
                getDrillDownMetricShow({
                    ...state,
                    ui: {
                        [drillDownSlice.name]: {
                            metricData: {
                                metricName: TableColumn.ClosedTickets,
                            },
                        },
                    },
                } as unknown as RootState)
            ).toBeFalsy()
        })

        it('getDrillDownModalState', () => {
            expect(getDrillDownModalState(state)).toEqual(isOpen)
        })
    })

    it('should build agent metric', () => {
        const agent = {
            id: 1,
            name: 'Test',
        } as User

        expect(
            buildAgentMetric(TableColumn.CustomerSatisfaction, agent)
        ).toEqual({
            title: `${TableLabels[TableColumn.CustomerSatisfaction]} | ${
                agent.name
            }`,
            metricName: TableColumn.CustomerSatisfaction,
            perAgentId: agent.id,
        })
    })
})
