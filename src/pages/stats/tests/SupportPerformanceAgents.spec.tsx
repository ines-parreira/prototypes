import {render, screen} from '@testing-library/react'
import {fromJS} from 'immutable'
import LD from 'launchdarkly-react-client-sdk'
import React from 'react'
import {Provider} from 'react-redux'
import {MemoryRouter} from 'react-router-dom'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import {AgentsTable} from 'pages/stats/AgentsTable'
import {TicketChannel} from 'business/types/ticket'
import {FeatureFlagKey} from 'config/featureFlags'
import {account} from 'fixtures/account'
import {agents} from 'fixtures/agents'
import {integrationsState} from 'fixtures/integrations'
import {tags} from 'fixtures/tag'
import {teams} from 'fixtures/teams'
import {agentsStatsFilterLabels} from 'pages/stats/AgentsStatsFilter'
import {channelsStatsFilterLabels} from 'pages/stats/ChannelsStatsFilter'
import {CALENDAR_ICON} from 'pages/stats/common/PeriodPicker'
import {integrationsStatsFilterLabels} from 'pages/stats/IntegrationsStatsFilter'

import {LEARN_MORE_URL} from 'pages/stats/SupportPerformanceOverview'
import {tagsStatsFilterLabels} from 'pages/stats/TagsStatsFilter'
import {RootState, StoreDispatch} from 'state/types'
import {assumeMock} from 'utils/testing'
import {useAgentsMetrics} from 'pages/stats/useAgentsMetrics'
import {useAgentsSummaryMetrics} from 'pages/stats/useAgentsSummaryMetrics'

import SupportPerformanceAgents, {
    AGENT_PERFORMANCE_LEGACY_PATH,
    AGENT_PERFORMANCE_SECTION_TITLE,
    AGENTS_PAGE_TITLE,
} from '../SupportPerformanceAgents'

jest.unmock('react-router-dom')

jest.mock('state/ui/stats/agentPerformanceSlice')
jest.mock('pages/stats/useAgentsMetrics')
jest.mock('pages/stats/useAgentsSummaryMetrics')
jest.mock('pages/stats/AgentsTable.tsx')
const AgentsTableMock = assumeMock(AgentsTable)
const useAgentsMetricsMock = assumeMock(useAgentsMetrics)
const useAgentsSummaryMetricsMock = assumeMock(useAgentsSummaryMetrics)

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])
const cellMock = () => <div />

describe('SupportPerformanceAgents', () => {
    const tag = tags[0]
    const defaultState = {
        currentAccount: fromJS(account),
        integrations: fromJS(integrationsState),
        stats: fromJS({
            filters: {
                integrations: [integrationsState.integrations[1].id],
                channels: [TicketChannel.Chat],
                agents: [agents[0].id],
                tags: [1],
                period: {
                    start_datetime: '2021-02-03T00:00:00.000Z',
                    end_datetime: '2021-02-03T23:59:59.999Z',
                },
            },
        }),
        agents: fromJS({
            all: agents,
        }),
        teams: fromJS({
            all: teams,
        }),
        entities: {
            tags: {
                [tag.id]: tag,
            },
        },
    } as RootState

    const filtersLabels = [
        agentsStatsFilterLabels,
        channelsStatsFilterLabels,
        integrationsStatsFilterLabels,
        tagsStatsFilterLabels,
    ]
    AgentsTableMock.mockImplementation(cellMock)

    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('should render the page title and section title', () => {
        render(
            <MemoryRouter>
                <Provider store={mockStore(defaultState)}>
                    <SupportPerformanceAgents />
                </Provider>
            </MemoryRouter>
        )

        expect(screen.getByText(AGENTS_PAGE_TITLE)).toBeInTheDocument()
        expect(
            screen.getByText(AGENT_PERFORMANCE_SECTION_TITLE)
        ).toBeInTheDocument()
    })

    it('should render a banner that allows switching to the old version', () => {
        render(
            <MemoryRouter>
                <Provider store={mockStore(defaultState)}>
                    <SupportPerformanceAgents />
                </Provider>
            </MemoryRouter>
        )

        expect(
            screen.getByText('Switch To Old Version', {exact: false})
        ).toBeInTheDocument()
        expect(screen.getByRole('link', {name: /Switch/})).toHaveAttribute(
            'href',
            AGENT_PERFORMANCE_LEGACY_PATH
        )
        expect(screen.getByRole('link', {name: 'Learn more.'})).toHaveAttribute(
            'href',
            LEARN_MORE_URL
        )
        expect(
            screen.getByText('Welcome to the new Agents Performance beta!', {
                exact: false,
            })
        ).toBeInTheDocument()
    })

    it('should render the filters with no selected value', () => {
        jest.spyOn(LD, 'useFlags').mockImplementation(() => ({
            [FeatureFlagKey.AnalyticsFilterByTags]: true,
        }))

        render(
            <MemoryRouter>
                <Provider
                    store={mockStore({
                        ...defaultState,
                        stats: fromJS({
                            filters: {
                                integrations: [],
                                channels: [],
                                agents: [],
                                tags: [],
                                period: {
                                    start_datetime: '',
                                    end_datetime: '',
                                },
                            },
                        }),
                    })}
                >
                    <SupportPerformanceAgents />
                </Provider>
            </MemoryRouter>
        )

        filtersLabels.forEach((filterLabels) => {
            expect(
                screen.getByText(`All ${filterLabels.plural}`, {
                    exact: false,
                })
            ).toBeInTheDocument()
        })

        expect(screen.getByText(CALENDAR_ICON)).toBeInTheDocument()
    })

    it('should render the filters with one selected value', () => {
        jest.spyOn(LD, 'useFlags').mockImplementation(() => ({
            [FeatureFlagKey.AnalyticsFilterByTags]: true,
        }))

        render(
            <MemoryRouter>
                <Provider store={mockStore(defaultState)}>
                    <SupportPerformanceAgents />
                </Provider>
            </MemoryRouter>
        )

        filtersLabels.forEach((filterLabels) => {
            expect(
                screen.getByText(`1 ${filterLabels.singular}`, {
                    exact: false,
                })
            ).toBeInTheDocument()
        })
    })

    it('should render the export data button', () => {
        jest.spyOn(LD, 'useFlags').mockImplementation(() => ({
            [FeatureFlagKey.AnalyticsExportAgentsPerformance]: true,
        }))

        useAgentsMetricsMock.mockReturnValue({
            reportData: {
                closedTicketsMetric: {
                    isFetching: false,
                    isError: false,
                    data: {allData: [], value: null},
                },
            },
        } as any)
        useAgentsSummaryMetricsMock.mockReturnValue({
            summaryData: {
                closedTicketsMetric: {
                    isFetching: false,
                    isError: false,
                    data: {value: 2},
                },
            },
        } as any)

        render(
            <MemoryRouter>
                <Provider store={mockStore(defaultState)}>
                    <SupportPerformanceAgents />
                </Provider>
            </MemoryRouter>
        )

        const button = screen.getByText(/Download data/)

        expect(button).toBeInTheDocument()
    })
})
