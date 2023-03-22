import React, {ComponentProps} from 'react'
import {fireEvent, render} from '@testing-library/react'
import {fromJS} from 'immutable'
import configureMockStore, {MockStoreEnhanced} from 'redux-mock-store'
import thunk from 'redux-thunk'
import {Provider} from 'react-redux'
import {RootState, StoreDispatch} from 'state/types'
import {entitiesInitialState} from 'fixtures/entities'
import {billingState} from 'fixtures/billing'
import * as actions from 'state/integrations/actions'
import * as betaTesterHook from 'pages/common/hooks/useIsRevenueBetaTester'
import {CAMPAIGN_INFO_BOX_STORAGE_KEY} from 'pages/integrations/integration/components/gorgias_chat/GorgiasChatIntegrationCampaigns/components/CampaignGenerator'
import GorgiasChatIntegrationCampaigns, {
    GorgiasChatIntegrationCampaignsComponent,
} from '../GorgiasChatIntegrationCampaigns'

jest.mock('utils/launchDarkly')
const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])
const updateOrCreateIntegrationRequest = jest.spyOn(
    actions,
    'updateOrCreateIntegrationRequest'
)

describe('<GorgiasChatIntegrationCampaigns/>', () => {
    let store: MockStoreEnhanced<Partial<RootState>, StoreDispatch>

    beforeEach(() => {
        store = mockStore({
            entities: entitiesInitialState,
            billing: fromJS(billingState),
        })
        localStorage.clear()
        updateOrCreateIntegrationRequest.mockReset()
        jest.spyOn(betaTesterHook, 'useIsRevenueBetaTester').mockImplementation(
            () => true
        )
    })

    const minProps: ComponentProps<
        | typeof GorgiasChatIntegrationCampaigns
        | typeof GorgiasChatIntegrationCampaignsComponent
    > = {
        integration: fromJS({}),
        currentUser: fromJS({}),
        updateCampaign: jest.fn(),
    }

    describe('render()', () => {
        it('should display the empty state correctly', () => {
            const {container} = render(
                <Provider store={store}>
                    <GorgiasChatIntegrationCampaigns
                        {...minProps}
                        integration={fromJS({
                            id: 118,
                            type: 'gorgias_chat',
                            name: 'My new chat',
                            meta: {
                                campaigns: [],
                            },
                        })}
                    />
                </Provider>
            )

            expect(container).toMatchSnapshot()
        })

        it('should display the list correctly', () => {
            const {container} = render(
                <Provider store={store}>
                    <GorgiasChatIntegrationCampaigns
                        {...minProps}
                        integration={fromJS({
                            id: 118,
                            type: 'gorgias_chat',
                            name: 'My new chat',
                            meta: {
                                campaigns: [
                                    {
                                        id: '156a4d-fg68h40-sd6f4',
                                        name: 'Super campaign',
                                        deactivated_datetime: null,
                                    },
                                    {
                                        id: 'not-so-good-campaign-d8f9-fds486-sf78',
                                        name: 'Not so good campaign',
                                        deactivated_datetime:
                                            '2017-10-06T17:17:56.565Z',
                                    },
                                ],
                            },
                        })}
                    />
                </Provider>
            )

            expect(container).toMatchSnapshot()
        })

        it('should not display infobox to non-admin', () => {
            const {queryByText} = render(
                <Provider store={store}>
                    <GorgiasChatIntegrationCampaignsComponent
                        {...minProps}
                        currentUser={fromJS({
                            id: 1,
                            role: {name: 'agent'},
                        })}
                        integration={fromJS({
                            id: 118,
                            type: 'gorgias_chat',
                            name: 'My new chat',
                            meta: {
                                campaigns: [],
                            },
                        })}
                    />
                </Provider>
            )
            expect(
                queryByText(
                    'Get started with our recommended top performing campaigns.'
                )
            ).toBeNull()
        })

        it('should not display infobox to non-betatester', () => {
            jest.spyOn(
                betaTesterHook,
                'useIsRevenueBetaTester'
            ).mockImplementation(() => false)

            const {queryByText} = render(
                <Provider store={store}>
                    <GorgiasChatIntegrationCampaignsComponent
                        {...minProps}
                        currentUser={fromJS({
                            id: 1,
                            role: {name: 'admin'},
                        })}
                        integration={fromJS({
                            id: 118,
                            type: 'gorgias_chat',
                            name: 'My new chat',
                            meta: {
                                campaigns: [],
                            },
                        })}
                    />
                </Provider>
            )
            expect(
                queryByText(
                    'Get started with our recommended top performing campaigns'
                )
            ).toBeNull()
        })

        it('should display infobox to admin', () => {
            updateOrCreateIntegrationRequest.mockImplementation(
                () => () => Promise.resolve()
            )

            const {getByText} = render(
                <Provider store={store}>
                    <GorgiasChatIntegrationCampaignsComponent
                        {...minProps}
                        currentUser={fromJS({
                            id: 1,
                            role: {name: 'admin'},
                        })}
                        integration={fromJS({
                            id: 118,
                            type: 'gorgias_chat',
                            name: 'My new chat 3',
                            meta: {
                                campaigns: [],
                            },
                        })}
                    />
                </Provider>
            )
            fireEvent.click(getByText('Add'))
            expect(
                updateOrCreateIntegrationRequest.mock.calls
            ).toMatchSnapshot()
        })

        it('close button should permanently close infobox', () => {
            const {getByAltText, container} = render(
                <Provider store={store}>
                    <GorgiasChatIntegrationCampaignsComponent
                        {...minProps}
                        currentUser={fromJS({
                            id: 1,
                            role: {name: 'admin'},
                        })}
                        integration={fromJS({
                            id: 118,
                            type: 'gorgias_chat',
                            name: 'My new chat',
                            meta: {
                                campaigns: [],
                            },
                        })}
                    />
                </Provider>
            )
            expect(container).toHaveTextContent(
                'Get started with our recommended top performing campaigns'
            )
            fireEvent.click(getByAltText('dismiss-icon'))
            expect(localStorage.getItem(CAMPAIGN_INFO_BOX_STORAGE_KEY)).toBe(
                'true'
            )
        })
    })
})
