import {render, screen} from '@testing-library/react'
import {fromJS} from 'immutable'
import LD from 'launchdarkly-react-client-sdk'
import React from 'react'
import {Provider} from 'react-redux'
import {MemoryRouter} from 'react-router-dom'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import {ClosedTicketsCellContent} from 'pages/stats/ClosedTicketsCellContent'
import {MessagesSentCellContent} from 'pages/stats/MessagesSentCellContent'
import {CustomerSatisfactionCellContent} from 'pages/stats/CustomerSatisfactionCellContent'
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
import {FirstResponseTimeCellContent} from 'pages/stats/FirstResponseTimeCellContent'
import {integrationsStatsFilterLabels} from 'pages/stats/IntegrationsStatsFilter'
import {ResolutionTimeCellContent} from 'pages/stats/ResolutionTimeCellContent'
import {PercentageOfClosedTicketsCellContent} from 'pages/stats/PercentageOfClosedTicketsCellContent'

import {LEARN_MORE_URL} from 'pages/stats/SupportPerformanceOverview'
import {tagsStatsFilterLabels} from 'pages/stats/TagsStatsFilter'
import {TicketsRepliedCellContent} from 'pages/stats/TicketsRepliedCellContent'
import {RootState, StoreDispatch} from 'state/types'
import {assumeMock} from 'utils/testing'

import SupportPerformanceAgents, {
    AGENT_PERFORMANCE_LEGACY_PATH,
    AGENT_PERFORMANCE_SECTION_TITLE,
    AGENTS_PAGE_TITLE,
} from '../SupportPerformanceAgents'

jest.unmock('react-router-dom')
jest.mock('pages/stats/FirstResponseTimeCellContent.tsx')
const FirstResponseTimeCellContentMock = assumeMock(
    FirstResponseTimeCellContent
)
jest.mock('pages/stats/TicketsRepliedCellContent.tsx')
const TicketsRepliedCellContentMock = assumeMock(TicketsRepliedCellContent)

jest.mock('pages/stats/ClosedTicketsCellContent.tsx')
const ClosedTicketsCellContentMock = assumeMock(ClosedTicketsCellContent)

jest.mock('pages/stats/MessagesSentCellContent.tsx')
const MessagesSentCellContentMock = assumeMock(MessagesSentCellContent)
jest.mock('pages/stats/ResolutionTimeCellContent.tsx')
const ResolutionTimeCellContentMock = assumeMock(ResolutionTimeCellContent)
jest.mock('pages/stats/CustomerSatisfactionCellContent.tsx')
const CustomerSatisfactionCellContentMock = assumeMock(
    CustomerSatisfactionCellContent
)
jest.mock('pages/stats/PercentageOfClosedTicketsCellContent.tsx')
const PercentageOfClosedTicketsCellContentMock = assumeMock(
    PercentageOfClosedTicketsCellContent
)

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

    FirstResponseTimeCellContentMock.mockImplementation(cellMock)
    TicketsRepliedCellContentMock.mockImplementation(cellMock)
    ClosedTicketsCellContentMock.mockImplementation(cellMock)
    MessagesSentCellContentMock.mockImplementation(cellMock)
    ResolutionTimeCellContentMock.mockImplementation(cellMock)
    CustomerSatisfactionCellContentMock.mockImplementation(cellMock)
    PercentageOfClosedTicketsCellContentMock.mockImplementation(cellMock)

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
})
