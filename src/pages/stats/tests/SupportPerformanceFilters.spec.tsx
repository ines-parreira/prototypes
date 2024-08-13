import React from 'react'
import {render, screen} from '@testing-library/react'
import {fromJS} from 'immutable'
import {Provider} from 'react-redux'
import {MemoryRouter} from 'react-router-dom'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import {withDefaultLogicalOperator} from 'models/reporting/queryFactories/utils'
import {SupportPerformanceFilters} from 'pages/stats/SupportPerformanceFilters'
import {TicketChannel} from 'business/types/ticket'
import {account} from 'fixtures/account'
import {agents} from 'fixtures/agents'
import {integrationsState} from 'fixtures/integrations'
import {tags} from 'fixtures/tag'
import {teams} from 'fixtures/teams'
import {agentsStatsFilterLabels} from 'pages/stats/common/filters/DEPRECATED_AgentsStatsFilter'
import {channelsStatsFilterLabels} from 'pages/stats/common/filters/DEPRECATED_ChannelsStatsFilter'
import {integrationsStatsFilterLabels} from 'pages/stats/common/filters/DEPRECATED_IntegrationsStatsFilter'
import {tagsStatsFilterLabels} from 'pages/stats/common/filters/DEPRECATED_TagsStatsFilter'
import {RootState, StoreDispatch} from 'state/types'
import {initialState as uiStatsInitialState} from 'state/ui/stats/reducer'
import {CALENDAR_ICON} from 'pages/stats/common/PeriodPicker'

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])

describe('Support Performance Filters', () => {
    const tag = tags[0]
    const defaultState = {
        currentAccount: fromJS(account),
        integrations: fromJS(integrationsState),
        stats: {
            filters: {
                integrations: withDefaultLogicalOperator([
                    integrationsState.integrations[1].id,
                ]),
                channels: withDefaultLogicalOperator([TicketChannel.Chat]),
                agents: withDefaultLogicalOperator([agents[0].id]),
                tags: withDefaultLogicalOperator([1]),
                period: {
                    start_datetime: '2021-02-03T00:00:00.000Z',
                    end_datetime: '2021-02-03T23:59:59.999Z',
                },
            },
        },
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
        ui: {
            stats: uiStatsInitialState,
        },
    } as RootState

    const filtersLabels = [
        agentsStatsFilterLabels,
        channelsStatsFilterLabels,
        integrationsStatsFilterLabels,
        tagsStatsFilterLabels,
    ]

    it('should render the filters with no selected value', () => {
        render(
            <MemoryRouter>
                <Provider
                    store={mockStore({
                        ...defaultState,
                        stats: {
                            filters: {
                                integrations: withDefaultLogicalOperator([]),
                                channels: withDefaultLogicalOperator([]),
                                agents: withDefaultLogicalOperator([]),
                                tags: withDefaultLogicalOperator([]),
                                period: {
                                    start_datetime: '',
                                    end_datetime: '',
                                },
                            },
                        },
                    })}
                >
                    <SupportPerformanceFilters />
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
        render(
            <MemoryRouter>
                <Provider store={mockStore(defaultState)}>
                    <SupportPerformanceFilters />
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

    it('should not render the filters when hidden', () => {
        render(
            <MemoryRouter>
                <Provider store={mockStore(defaultState)}>
                    <SupportPerformanceFilters hidden={true} />
                </Provider>
            </MemoryRouter>
        )

        filtersLabels.forEach((filterLabels) => {
            expect(
                screen.queryByText(`1 ${filterLabels.singular}`, {
                    exact: false,
                })
            ).not.toBeInTheDocument()
        })
    })
})
