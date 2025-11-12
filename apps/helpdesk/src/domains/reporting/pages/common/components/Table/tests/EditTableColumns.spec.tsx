import { FeatureFlagKey } from '@repo/feature-flags'
import { logEvent, SegmentEvent } from '@repo/logging'
import { assumeMock } from '@repo/testing'
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { createDragDropManager } from 'dnd-core'
import { fromJS } from 'immutable'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { useFlag } from 'core/flags'
import { useAgentsTableConfigSetting } from 'domains/reporting/hooks/useAgentsTableConfigSetting'
import { useChannelsTableSetting } from 'domains/reporting/hooks/useChannelsTableConfigSetting'
import { useIsHrtAiEnabled } from 'domains/reporting/hooks/useIsHrtAiEnabled'
import {
    EditTableColumns,
    SAVE_BUTTON_TEXT,
    TOGGLE_LABEL,
} from 'domains/reporting/pages/common/components/Table/EditTableColumns'
import {
    agentPerformanceTableActiveView,
    AgentsColumnConfig,
    AgentsRowConfig,
    AgentsTableViews,
    TableLabels,
    TableRowLabels,
} from 'domains/reporting/pages/support-performance/agents/AgentsTableConfig'
import {
    ChannelColumnConfig,
    channelsReportTableActiveView,
    ChannelsTableLabels,
    ChannelsTableViews,
    LeadColumn,
} from 'domains/reporting/pages/support-performance/channels/ChannelsTableConfig'
import {
    AgentsTableColumn,
    AgentsTableRow,
    ChannelsTableColumns,
} from 'domains/reporting/state/ui/stats/types'
import * as currentAccount from 'state/currentAccount/actions'
import {
    getAgentsTableConfigSettingsJS,
    getChannelsTableConfigSettingsJS,
} from 'state/currentAccount/selectors'
import { AccountSettingType } from 'state/currentAccount/types'
import { RootState, StoreDispatch } from 'state/types'
import { DndProvider } from 'utils/wrappers/DndProvider'

const manager = createDragDropManager(HTML5Backend, undefined, undefined)

const submitAgentSettingSpy = jest.spyOn(
    currentAccount,
    'submitAgentTableConfigView',
)
const submitChannelsSettingSpy = jest.spyOn(
    currentAccount,
    'submitChannelsTableConfigView',
)
const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])

jest.mock('@repo/logging')
const logEventMock = assumeMock(logEvent)

jest.mock('core/flags')
const useFlagMock = assumeMock(useFlag)

jest.mock('domains/reporting/hooks/useIsHrtAiEnabled')
const useIsHrtAiEnabledMock = assumeMock(useIsHrtAiEnabled)

describe('<AgentsEditColumns>', () => {
    const column = AgentsTableColumn.ClosedTickets
    const columnTitle = TableLabels[AgentsTableColumn.ClosedTickets]
    const row = AgentsTableRow.Total
    const rowTitle = TableRowLabels[AgentsTableRow.Total]
    const settingsSelector = getAgentsTableConfigSettingsJS
    const fallbackViews = AgentsTableViews
    const tableLabels = TableLabels
    const rowLabels = TableRowLabels
    const tooltips = AgentsColumnConfig
    const rowTooltips = AgentsRowConfig
    const leadColumn = AgentsTableColumn.AgentName
    const leadRow = AgentsTableRow.Average
    const useTableSetting = useAgentsTableConfigSetting
    const defaultProps = {
        settingsSelector,
        fallbackViews,
        tableLabels,

        tooltips,

        leadColumn,

        useTableSetting,
    }
    const propsWithRows = {
        ...defaultProps,
        rowLabels,
        rowTooltips,
        leadRow,
    }

    beforeEach(() => {
        submitAgentSettingSpy.mockReturnValue(() => Promise.resolve({}))
        useIsHrtAiEnabledMock.mockReturnValue(true)
    })

    it('should render dropdown toggle button', () => {
        render(
            <Provider store={mockStore({})}>
                <DndProvider manager={manager}>
                    <EditTableColumns {...defaultProps} />
                </DndProvider>
            </Provider>,
        )

        expect(screen.getByText(TOGGLE_LABEL)).toBeInTheDocument()
    })

    it('should render dropdown menu', () => {
        render(
            <Provider store={mockStore({})}>
                <DndProvider manager={manager}>
                    <EditTableColumns {...defaultProps} />
                </DndProvider>
            </Provider>,
        )

        act(() => {
            fireEvent.click(screen.getByText(TOGGLE_LABEL))
        })

        expect(screen.getByRole('menu')).toBeInTheDocument()
    })

    it('should change column visibility', () => {
        render(
            <Provider store={mockStore({})}>
                <DndProvider manager={manager}>
                    <EditTableColumns {...defaultProps} />
                </DndProvider>
            </Provider>,
        )

        const element = screen.getByText(columnTitle)
        const input = element.getElementsByTagName('input')[0]

        fireEvent.click(element)
        expect(input).not.toBeChecked()

        fireEvent.click(element)
        expect(input).toBeChecked()
        expect(logEventMock).toHaveBeenCalledWith(
            SegmentEvent.StatTableMetricVisibilityEnabled,
            { metric: column },
        )
    })

    it('should change row visibility', () => {
        useFlagMock.mockReturnValue(true)
        render(
            <Provider store={mockStore({})}>
                <DndProvider manager={manager}>
                    <EditTableColumns {...propsWithRows} />
                </DndProvider>
            </Provider>,
        )

        const element = screen.getByText(rowTitle)
        const input = element.getElementsByTagName('input')[0]

        fireEvent.click(element)
        expect(input).toBeChecked()

        fireEvent.click(element)
        expect(input).not.toBeChecked()
        expect(logEventMock).toHaveBeenCalledWith(
            SegmentEvent.StatTableRowVisibilityEnabled,
            { row: row, tableLeadColumn: leadColumn },
        )
    })

    it('should dispatch submit new setting on save', async () => {
        useFlagMock.mockReturnValue(false)
        render(
            <Provider store={mockStore({})}>
                <DndProvider manager={manager}>
                    <EditTableColumns {...defaultProps} />
                </DndProvider>
            </Provider>,
        )

        const element = screen.getByText(columnTitle)
        const save = screen.getByText(SAVE_BUTTON_TEXT)

        fireEvent.click(element)
        act(() => {
            fireEvent.click(save)
        })

        await waitFor(() => {
            expect(submitAgentSettingSpy).toHaveBeenCalledWith({
                id: expect.any(String),
                name: expect.any(String),
                metrics: agentPerformanceTableActiveView.metrics.map(
                    (metric) => {
                        if (metric.id === AgentsTableColumn.ClosedTickets) {
                            return {
                                ...metric,
                                visibility: false,
                            }
                        }
                        return metric
                    },
                ),
            })
        })
    })

    it('should dispatch submit update setting on save', () => {
        useFlagMock.mockReturnValue(false)
        const props = {
            settingsSelector: getChannelsTableConfigSettingsJS,
            fallbackViews: ChannelsTableViews,
            tableLabels: ChannelsTableLabels,
            tooltips: ChannelColumnConfig,
            leadColumn: LeadColumn,
            useTableSetting: useChannelsTableSetting,
        }
        const activeViewId = 'activeViewId'
        const activeView = {
            id: activeViewId,
            name: 'Some name',
            metrics: channelsReportTableActiveView.metrics,
        } as any
        const state = {
            currentAccount: fromJS({
                settings: [
                    {
                        id: 'settingId',
                        type: AccountSettingType.ChannelsTableConfig,
                        data: {
                            active_view: activeViewId,
                            views: [activeView],
                        },
                    },
                ],
                _internal: {
                    loading: {},
                },
            }),
        }

        render(
            <Provider store={mockStore(state)}>
                <DndProvider manager={manager}>
                    <EditTableColumns {...props} />
                </DndProvider>
            </Provider>,
        )

        const element = screen.getByText(columnTitle)
        const save = screen.getByText(SAVE_BUTTON_TEXT)

        fireEvent.click(element)
        fireEvent.click(save)

        expect(submitChannelsSettingSpy).toHaveBeenCalledWith({
            id: expect.any(String),
            name: expect.any(String),
            metrics: channelsReportTableActiveView?.metrics.map((metric) => {
                if (metric.id === ChannelsTableColumns.ClosedTickets) {
                    return {
                        ...metric,
                        visibility: false,
                    }
                }
                return metric
            }),
            rows: [],
        })
    })

    it('should dispatch submit update setting on save with rows', async () => {
        useFlagMock.mockImplementation(
            (flag) =>
                flag === FeatureFlagKey.ReportingAgentsTableAverageAndTotal,
        )
        const activeViewId = 'activeViewId'
        const activeView = {
            id: activeViewId,
            name: 'Some name',
            metrics: agentPerformanceTableActiveView.metrics,
            rows: agentPerformanceTableActiveView.rows,
        } as any
        const state = {
            currentAccount: fromJS({
                settings: [
                    {
                        id: 'settingId',
                        type: AccountSettingType.AgentsTableConfig,
                        data: {
                            active_view: activeViewId,
                            views: [activeView],
                        },
                    },
                ],
                _internal: {
                    loading: {},
                },
            }),
        }

        render(
            <Provider store={mockStore(state)}>
                <DndProvider manager={manager}>
                    <EditTableColumns {...propsWithRows} />
                </DndProvider>
            </Provider>,
        )

        const element = screen.getByText(columnTitle)
        const save = screen.getByText(SAVE_BUTTON_TEXT)

        fireEvent.click(element)
        act(() => {
            fireEvent.click(save)
        })

        await waitFor(() => {
            expect(submitAgentSettingSpy).toHaveBeenCalledWith({
                id: expect.any(String),
                name: expect.any(String),
                metrics: agentPerformanceTableActiveView.metrics.map(
                    (metric) => {
                        if (metric.id === AgentsTableColumn.ClosedTickets) {
                            return {
                                ...metric,
                                visibility: false,
                            }
                        }
                        return metric
                    },
                ),
                rows: [
                    { id: AgentsTableRow.Average, visibility: true },
                    { id: AgentsTableRow.Total, visibility: false },
                ],
            })
        })
    })

    it('should update column visibility on the order change', () => {
        const activeViewId = 'activeViewId'
        const activeView = {
            id: activeViewId,
            name: 'Some name',
            metrics: agentPerformanceTableActiveView.metrics,
        }
        const state = {
            currentAccount: fromJS({
                settings: [
                    {
                        id: 'settingId',
                        type: AccountSettingType.AgentsTableConfig,
                        data: {
                            active_view: activeViewId,
                            views: [activeView],
                        },
                    },
                ],
                _internal: {
                    loading: {},
                },
            }),
        }
        const props = {
            ...defaultProps,
            useTableSetting: () => ({
                currentView: activeView,
                submitActiveView: jest.fn(),
            }),
        }

        const { rerender } = render(
            <Provider store={mockStore(state)}>
                <DndProvider manager={manager}>
                    <EditTableColumns {...props} />
                </DndProvider>
            </Provider>,
        )

        const updatedActiveView = {
            id: activeViewId,
            name: 'Some name',
            metrics: [
                agentPerformanceTableActiveView.metrics[0],
                agentPerformanceTableActiveView.metrics[1],
            ],
        }

        const options = screen.getAllByRole('checkbox', { hidden: true })

        const activeViewMetricsWithoutLeadColumn = activeView.metrics.filter(
            (m) => m.id !== leadColumn,
        )
        expect(options.length).toBe(activeViewMetricsWithoutLeadColumn.length)

        rerender(
            <Provider store={mockStore(state)}>
                <DndProvider manager={manager}>
                    <EditTableColumns
                        {...props}
                        useTableSetting={() => ({
                            currentView: updatedActiveView,
                            submitActiveView: jest.fn(),
                        })}
                    />
                </DndProvider>
            </Provider>,
        )

        const optionsAfterUpdate = screen.getAllByRole('checkbox', {
            hidden: true,
        })

        const updatedActiveViewMetricsWithoutLeadColumn =
            updatedActiveView.metrics.filter((m) => m.id !== leadColumn)

        expect(optionsAfterUpdate.length).toBe(
            updatedActiveViewMetricsWithoutLeadColumn.length,
        )
    })

    it('should render items in expected order', () => {
        useFlagMock.mockReturnValue(false)
        render(
            <Provider store={mockStore({})}>
                <DndProvider manager={manager}>
                    <EditTableColumns {...defaultProps} />
                </DndProvider>
            </Provider>,
        )

        const items = document.getElementsByClassName('dropdown-item')

        const metricsWithoutLeadColumn =
            agentPerformanceTableActiveView.metrics.filter(
                (m) => m.id !== leadColumn,
            )

        metricsWithoutLeadColumn.forEach((column, index) => {
            expect(items[index]).toHaveTextContent(
                new RegExp(TableLabels[column.id]),
            )
        })
    })

    it('should allow changing order of columns with drag and drop', () => {
        useFlagMock.mockReturnValue(false)
        const firstOrderableItemLabel =
            TableLabels[agentPerformanceTableActiveView.metrics[1].id]
        const lastItemLabel =
            TableLabels[agentPerformanceTableActiveView.metrics[5].id]

        render(
            <Provider store={mockStore({})}>
                <DndProvider manager={manager}>
                    <EditTableColumns {...defaultProps} />
                </DndProvider>
            </Provider>,
        )

        const optionItem = screen.getByLabelText(firstOrderableItemLabel)
        const optionItem2 = screen.getByLabelText(lastItemLabel)

        act(() => {
            fireEvent.dragStart(optionItem2)
            fireEvent.dragEnter(optionItem)
            fireEvent.dragOver(optionItem)
            fireEvent.drop(optionItem)
        })

        const allItems = document.getElementsByClassName('dropdown-item')
        expect(allItems[0]).toHaveTextContent(new RegExp(lastItemLabel))
        expect(allItems[1]).toHaveTextContent(
            new RegExp(firstOrderableItemLabel),
        )
        expect(screen.getByText(SAVE_BUTTON_TEXT)).toBeEnabled()
    })

    it('should allow changing order or rows with drag and drop', () => {
        useFlagMock.mockReturnValue(true)
        const firstOrderableItemLabel = TableRowLabels[AgentsTableRow.Average]
        const lastItemLabel = TableRowLabels[AgentsTableRow.Total]

        render(
            <Provider store={mockStore({})}>
                <DndProvider manager={manager}>
                    <EditTableColumns {...propsWithRows} />
                </DndProvider>
            </Provider>,
        )

        const optionItem = screen.getByLabelText(firstOrderableItemLabel)
        const optionItem2 = screen.getByLabelText(lastItemLabel)

        act(() => {
            fireEvent.dragStart(optionItem2)
            fireEvent.dragEnter(optionItem)
            fireEvent.dragOver(optionItem)
            fireEvent.drop(optionItem)
        })

        const allItems = document.getElementsByClassName('dropdown-item')
        expect(allItems[0]).toHaveTextContent(new RegExp(lastItemLabel))
        expect(allItems[1]).toHaveTextContent(
            new RegExp(firstOrderableItemLabel),
        )
        expect(screen.getByText(SAVE_BUTTON_TEXT)).toBeEnabled()
    })

    it('should render row labels with fallback to empty string when rowLabels is undefined', () => {
        useFlagMock.mockReturnValue(true)
        const propsWithoutRowLabels = {
            ...defaultProps,
            rowTooltips,
            leadRow,
            rowLabels: undefined,
        }

        render(
            <Provider store={mockStore({})}>
                <DndProvider manager={manager}>
                    <EditTableColumns {...propsWithoutRowLabels} />
                </DndProvider>
            </Provider>,
        )

        const items = document.getElementsByClassName('label')
        expect(items[0]).toHaveTextContent('')
    })

    it('should render correct row label when rowLabels is provided', () => {
        useFlagMock.mockReturnValue(true)
        const expectedLabel = TableRowLabels[AgentsTableRow.Average]

        render(
            <Provider store={mockStore({})}>
                <DndProvider manager={manager}>
                    <EditTableColumns {...propsWithRows} />
                </DndProvider>
            </Provider>,
        )

        const items = document.getElementsByClassName('label')
        expect(items[0]).toHaveTextContent(expectedLabel)
    })
})
