import React, {ComponentProps} from 'react'
import {screen, fireEvent, render, waitFor} from '@testing-library/react'
import {fromJS} from 'immutable'
import configureMockStore, {MockStoreEnhanced} from 'redux-mock-store'
import thunk from 'redux-thunk'
import {Provider} from 'react-redux'
import {RootState, StoreDispatch} from 'state/types'
import {entitiesInitialState} from 'fixtures/entities'
import {billingState} from 'fixtures/billing'
import * as actions from 'state/integrations/actions'
import * as isConvertSubscriberHook from 'pages/common/hooks/useIsConvertSubscriber'
import useSearch from 'hooks/useSearch'
import {CAMPAIGN_INFO_BOX_STORAGE_KEY} from 'pages/integrations/integration/components/gorgias_chat/GorgiasChatIntegrationCampaigns/components/CampaignGenerator/constants'

import GorgiasChatIntegrationCampaigns, {
    GorgiasChatIntegrationCampaignsComponent,
} from '../GorgiasChatIntegrationCampaigns'
import {createTrigger} from '../utils/createTrigger'
import {CampaignTriggerKey} from '../types/enums/CampaignTriggerKey.enum'

jest.mock('utils/launchDarkly')
jest.mock('hooks/useSearch')
const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])
const updateOrCreateIntegrationRequest = jest.spyOn(
    actions,
    'updateOrCreateIntegrationRequest'
)
jest.mock(
    'pages/integrations/integration/components/gorgias_chat/GorgiasChatIntegrationHeader',
    () => () => {
        return <div data-testid="GorgiasChatIntegrationHeader" />
    }
)

jest.mock('pages/settings/revenue/hooks/useGetConvertStatus')
jest.mock(
    'pages/integrations/integration/components/gorgias_chat/GorgiasChatIntegrationCampaigns/components/ConvertSetupBanner/ConvertSetupBanner',
    () => {
        return jest.fn(() => null)
    }
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
        jest.spyOn(
            isConvertSubscriberHook,
            'useIsConvertSubscriber'
        ).mockImplementation(() => true)
        ;(useSearch as jest.Mock).mockImplementation(() => {
            return {
                search: '',
            }
        })
    })

    const minProps: ComponentProps<
        | typeof GorgiasChatIntegrationCampaigns
        | typeof GorgiasChatIntegrationCampaignsComponent
    > = {
        integration: fromJS({}),
        currentUser: fromJS({}),
        updateCampaign: jest.fn(),
        createCampaign: jest.fn(),
        deleteCampaign: jest.fn(),
    }

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
                                    message: {
                                        text: 'Campaign message 1',
                                        html: 'Campaign message 1',
                                    },
                                    triggers: [
                                        createTrigger(
                                            CampaignTriggerKey.BusinessHours
                                        ),
                                    ],
                                    deactivated_datetime: null,
                                },
                                {
                                    id: 'not-so-good-campaign-d8f9-fds486-sf78',
                                    name: 'Not so good campaign',
                                    message: {
                                        text: 'Campaign message 2',
                                        html: 'Campaign message 2',
                                    },
                                    triggers: [
                                        createTrigger(
                                            CampaignTriggerKey.BusinessHours
                                        ),
                                    ],
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

    describe('Revenue campaign generator', () => {
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
                isConvertSubscriberHook,
                'useIsConvertSubscriber'
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
            expect(
                localStorage.getItem(`${CAMPAIGN_INFO_BOX_STORAGE_KEY}:118`)
            ).toBe('true')
        })
    })

    describe('Campaign actions', () => {
        it('should display the duplicate buttons correctly', () => {
            const {container, getAllByTestId} = render(
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
                                        message: {
                                            text: 'Campaign message 1',
                                            html: 'Campaign message 1',
                                        },
                                        triggers: [
                                            createTrigger(
                                                CampaignTriggerKey.BusinessHours
                                            ),
                                        ],
                                        deactivated_datetime: null,
                                    },
                                    {
                                        id: 'not-so-good-campaign-d8f9-fds486-sf78',
                                        name: 'Not so good campaign',
                                        message: {
                                            text: 'Campaign message 2',
                                            html: 'Campaign message 2',
                                        },
                                        triggers: [
                                            createTrigger(
                                                CampaignTriggerKey.BusinessHours
                                            ),
                                        ],
                                        deactivated_datetime:
                                            '2017-10-06T17:17:56.565Z',
                                    },
                                ],
                            },
                        })}
                    />
                </Provider>
            )

            const duplicateButtons = getAllByTestId('duplicate-icon-button')
            expect(duplicateButtons.length).toBe(2)
            expect(container).toMatchSnapshot()
        })

        it('should display the delete buttons correctly', () => {
            const {container, getAllByTestId} = render(
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
                                        message: {
                                            text: 'Campaign message 1',
                                            html: 'Campaign message 1',
                                        },
                                        triggers: [
                                            createTrigger(
                                                CampaignTriggerKey.BusinessHours
                                            ),
                                        ],
                                        deactivated_datetime: null,
                                    },
                                    {
                                        id: 'not-so-good-campaign-d8f9-fds486-sf78',
                                        name: 'Not so good campaign',
                                        message: {
                                            text: 'Campaign message 2',
                                            html: 'Campaign message 2',
                                        },
                                        triggers: [
                                            createTrigger(
                                                CampaignTriggerKey.BusinessHours
                                            ),
                                        ],
                                        deactivated_datetime:
                                            '2017-10-06T17:17:56.565Z',
                                    },
                                ],
                            },
                        })}
                    />
                </Provider>
            )

            const duplicateButtons = getAllByTestId('delete-icon-button')
            expect(duplicateButtons.length).toBe(2)
            expect(container).toMatchSnapshot()
        })

        it('should call the duplicate callback', async () => {
            const {getByTestId} = render(
                <Provider store={store}>
                    <GorgiasChatIntegrationCampaignsComponent
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
                                        triggers: [
                                            createTrigger(
                                                CampaignTriggerKey.BusinessHours
                                            ),
                                        ],
                                        message: {
                                            text: 'Hello world',
                                            html: '<p>Hello world</p>',
                                        },
                                    },
                                ],
                            },
                        })}
                    />
                </Provider>
            )

            fireEvent.click(getByTestId('duplicate-icon-button'))

            await waitFor(() => {
                expect(minProps.createCampaign).toHaveBeenCalled()
            })
        })

        it('should call the delete callback', async () => {
            const {getByTestId} = render(
                <Provider store={store}>
                    <GorgiasChatIntegrationCampaignsComponent
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
                                        message: {
                                            text: 'Campaign message 1',
                                            html: 'Campaign message 1',
                                        },
                                        triggers: [
                                            createTrigger(
                                                CampaignTriggerKey.BusinessHours
                                            ),
                                        ],
                                        deactivated_datetime: null,
                                    },
                                ],
                            },
                        })}
                    />
                </Provider>
            )

            fireEvent.click(getByTestId('delete-icon-button'))

            await waitFor(() => {
                screen.getByText(`Are you sure?`)
            })

            fireEvent.click(screen.getByText('Confirm'))

            await waitFor(() => {
                expect(minProps.deleteCampaign).toHaveBeenCalled()
            })
        })
    })
})
