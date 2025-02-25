import React from 'react'

import { render, screen } from '@testing-library/react'
import { fromJS } from 'immutable'
import LD from 'launchdarkly-react-client-sdk'
import { Provider } from 'react-redux'
import { MemoryRouter } from 'react-router-dom'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { TicketChannel } from 'business/types/ticket'
import { FeatureFlagKey } from 'config/featureFlags'
import { account } from 'fixtures/account'
import { agents } from 'fixtures/agents'
import { integrationsState } from 'fixtures/integrations'
import { withDefaultLogicalOperator } from 'models/reporting/queryFactories/utils'
import { TagFilterInstanceId } from 'models/stat/types'
import { AutomateOverviewFilters } from 'pages/stats/automate/overview/AutomateOverviewFilters'
import { CALENDAR_ICON } from 'pages/stats/common/PeriodPicker'
import { RootState, StoreDispatch } from 'state/types'
import { initialState as uiStatsInitialState } from 'state/ui/stats/filtersSlice'

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])

describe('<AutomateOverviewFilters />', () => {
    const defaultState = {
        currentAccount: fromJS(account),
        stats: {
            filters: {
                integrations: withDefaultLogicalOperator([
                    integrationsState.integrations[1].id,
                ]),
                channels: withDefaultLogicalOperator([TicketChannel.Chat]),
                agents: withDefaultLogicalOperator([agents[0].id]),
                tags: [
                    {
                        ...withDefaultLogicalOperator([1]),
                        filterInstanceId: TagFilterInstanceId.First,
                    },
                ],
                period: {
                    start_datetime: '2021-02-03T00:00:00.000Z',
                    end_datetime: '2021-02-03T23:59:59.999Z',
                },
            },
        },
        ui: {
            stats: { filters: uiStatsInitialState },
        },
    } as RootState

    // const filtersLabels = [channelsStatsFilterLabels]

    beforeEach(() => {
        jest.spyOn(LD, 'useFlags').mockImplementation(() => ({
            [FeatureFlagKey.AutomateOverviewChannelsFilter]: true,
        }))
    })

    it('should render the filters with no selected value', () => {
        render(
            <MemoryRouter>
                <Provider
                    store={mockStore({
                        ...defaultState,
                        stats: {
                            filters: {
                                channels: withDefaultLogicalOperator([]),
                                period: {
                                    start_datetime: '',
                                    end_datetime: '',
                                },
                            },
                        },
                    })}
                >
                    <AutomateOverviewFilters />
                </Provider>
            </MemoryRouter>,
        )

        // filtersLabels.forEach((filterLabels) => {
        //     expect(
        //         screen.getByText(`All ${filterLabels.plural}`, {
        //             exact: false,
        //         })
        //     ).toBeInTheDocument()
        // })

        expect(screen.getByText(CALENDAR_ICON)).toBeInTheDocument()
    })

    // it('should render the filters with one selected value', () => {
    //     render(
    //         <MemoryRouter>
    //             <Provider store={mockStore(defaultState)}>
    //                 <AutomateOverviewFilters />
    //             </Provider>
    //         </MemoryRouter>
    //     )
    //
    //     filtersLabels.forEach((filterLabels) => {
    //         expect(
    //             screen.getByText(`1 ${filterLabels.singular}`, {
    //                 exact: false,
    //             })
    //         ).toBeInTheDocument()
    //     })
    // })

    // it('should not render the legacy filters when the New Filters are enabled', () => {
    //     render(
    //         <MemoryRouter>
    //             <Provider store={mockStore(defaultState)}>
    //                 <AutomateOverviewFilters
    //                     isAnalyticsNewFiltersAutomate={true}
    //                 />
    //             </Provider>
    //         </MemoryRouter>
    //     )
    //
    //     filtersLabels.forEach((filterLabels) => {
    //         expect(
    //             screen.queryByText(`1 ${filterLabels.singular}`, {
    //                 exact: false,
    //             })
    //         ).not.toBeInTheDocument()
    //     })
    // })
})
