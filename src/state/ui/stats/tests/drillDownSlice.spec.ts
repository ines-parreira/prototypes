import {RootState} from 'state/types'
import {TableColumn} from 'state/ui/stats/types'
import {OrderDirection} from 'models/api/types'
import {
    initialState,
    setMetricData,
    drillDownSlice,
    toggleDrillDownModal,
    getDrillDownMetric,
    getDrillDownMetricColumn,
    getDrillDownModalState,
    buildAgentMetric,
} from 'state/ui/stats/drillDownSlice'
import {User} from 'config/types/user'
import {TableLabels} from 'pages/stats/TableConfig'
import {TicketMessagesMeasure} from 'models/reporting/cubes/TicketMessagesCube'
import {MEDIAN_RESOLUTION_TIME_LABEL} from 'services/reporting/constants'
import {TicketCustomFieldsMeasure} from 'models/reporting/cubes/TicketCustomFieldsCube'

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
            expect(getDrillDownMetric(state)).toEqual({
                metricData,
                metricOrder: OrderDirection.Desc,
            })
            expect(
                getDrillDownMetric({
                    ...state,
                    ui: {
                        [drillDownSlice.name]: {
                            metricData: {
                                metricName: TableColumn.CustomerSatisfaction,
                            },
                        },
                    },
                } as unknown as RootState)
            ).toEqual({
                metricData: {
                    metricName: TableColumn.CustomerSatisfaction,
                },
                metricOrder: OrderDirection.Asc,
            })
            expect(
                getDrillDownMetric({
                    ...state,
                    ui: {
                        [drillDownSlice.name]: {
                            metricData: {
                                metricName: TableColumn.ClosedTickets,
                            },
                        },
                    },
                } as unknown as RootState)
            ).toEqual({
                metricData: {
                    metricName: TableColumn.ClosedTickets,
                },
                metricOrder: OrderDirection.Desc,
            })
        })
        it('getDrillDownMetricColumn', () => {
            expect(
                getDrillDownMetricColumn({
                    ...state,
                    ui: {
                        [drillDownSlice.name]: {
                            metricData: {
                                metricName: TableColumn.OneTouchTickets,
                                perAgentId: 1,
                            },
                        },
                    },
                } as unknown as RootState)
            ).toEqual({
                metricTitle: TableLabels[TableColumn.OneTouchTickets],
                showMetric: true,
                metricValueFormat: 'percent',
            })

            expect(
                getDrillDownMetricColumn({
                    ...state,
                    ui: {
                        [drillDownSlice.name]: {
                            metricData: {
                                metricName: TableColumn.ClosedTickets,
                                perAgentId: 1,
                            },
                        },
                    },
                } as unknown as RootState)
            ).toEqual({
                metricTitle: TableLabels[TableColumn.ClosedTickets],
                showMetric: false,
                metricValueFormat: 'decimal',
            })

            expect(
                getDrillDownMetricColumn({
                    ...state,
                    ui: {
                        [drillDownSlice.name]: {
                            metricData: {
                                metricName:
                                    TicketMessagesMeasure.MedianResolutionTime,
                            },
                        },
                    },
                } as unknown as RootState)
            ).toEqual({
                metricTitle: MEDIAN_RESOLUTION_TIME_LABEL,
                showMetric: true,
                metricValueFormat: 'duration',
            })

            expect(
                getDrillDownMetricColumn({
                    ...state,
                    ui: {
                        [drillDownSlice.name]: {
                            metricData: null,
                        },
                    },
                } as unknown as RootState)
            ).toEqual({
                metricTitle: '',
                showMetric: false,
                metricValueFormat: 'decimal',
            })

            expect(
                getDrillDownMetricColumn({
                    ...state,
                    ui: {
                        [drillDownSlice.name]: {
                            metricData: {
                                metricName:
                                    TicketCustomFieldsMeasure.TicketCustomFieldsTicketCount,
                                customFieldValue: 'customFieldValue',
                            },
                        },
                    },
                } as unknown as RootState)
            ).toEqual({
                metricTitle: '',
                showMetric: false,
                metricValueFormat: 'decimal',
            })
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
