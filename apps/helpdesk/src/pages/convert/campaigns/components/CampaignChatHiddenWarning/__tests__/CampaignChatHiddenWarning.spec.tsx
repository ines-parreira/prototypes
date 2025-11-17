import * as dismissHook from '@repo/hooks'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'

import * as revenueBetaHook from 'pages/common/hooks/useIsConvertSubscriber'
import * as integrationsHelpers from 'state/integrations/helpers'
import type { RootState, StoreDispatch } from 'state/types'
import { renderWithRouter } from 'utils/testing'

import { CampaignChatHiddenWarning } from '../CampaignChatHiddenWarning'

jest.mock('@repo/hooks', () => ({
    ...jest.requireActual('@repo/hooks'),
    useDismissFlag: jest.fn(),
}))
jest.mock('state/integrations/helpers')

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>()

const mockedChatIntegration = {
    id: 118,
    type: 'gorgias_chat',
    name: 'My new chat',
    deactivated_datetime: null,
    meta: {
        preferences: {
            display_campaigns_hidden_chat: true,
            hide_outside_business_hours: true,
        },
    },
}

describe('<CampaignChatHiddenWarning/>', () => {
    beforeAll(() => {
        jest.spyOn(
            revenueBetaHook,
            'useIsConvertSubscriber',
        ).mockImplementation(() => true)
    })

    it('should not display the warning if the chat is not hidden', () => {
        ;(
            integrationsHelpers.isAccountDuringBusinessHours as jest.Mock
        ).mockReturnValue(true)
        ;(dismissHook.useDismissFlag as jest.Mock).mockReturnValue({
            isDismissed: false,
            dismiss: jest.fn(),
        })

        const { container } = renderWithRouter(
            <Provider store={mockStore()}>
                <CampaignChatHiddenWarning
                    integration={fromJS(mockedChatIntegration)}
                />
            </Provider>,
        )
        expect(container).toMatchInlineSnapshot('<div />')
    })

    describe('chat has "Display campaigns when chat is hidden" enabled', () => {
        describe('chat is offline', () => {
            it('should display the warning when chat is hidden and outside of business hours', () => {
                ;(
                    integrationsHelpers.isAccountDuringBusinessHours as jest.Mock
                ).mockReturnValue(false)
                ;(dismissHook.useDismissFlag as jest.Mock).mockReturnValue({
                    isDismissed: false,
                    dismiss: jest.fn(),
                })

                const { getByText } = renderWithRouter(
                    <Provider store={mockStore()}>
                        <CampaignChatHiddenWarning
                            integration={fromJS({
                                ...mockedChatIntegration,
                                deactivated_datetime: '123',
                                meta: {
                                    preferences: {
                                        display_campaigns_hidden_chat: true,
                                        hide_outside_business_hours: false,
                                    },
                                },
                            })}
                        />
                    </Provider>,
                )

                getByText(
                    'Chat is currently hidden. Campaigns are still displayed, but they will not be interactive. You can change this in the Preferences tab.',
                )
            })

            it('should display the warning when chat is hidden and within business hours', () => {
                ;(
                    integrationsHelpers.isAccountDuringBusinessHours as jest.Mock
                ).mockReturnValue(true)
                ;(dismissHook.useDismissFlag as jest.Mock).mockReturnValue({
                    isDismissed: false,
                    dismiss: jest.fn(),
                })

                const { getByText } = renderWithRouter(
                    <Provider store={mockStore()}>
                        <CampaignChatHiddenWarning
                            integration={fromJS({
                                ...mockedChatIntegration,
                                deactivated_datetime: '123',
                                meta: {
                                    preferences: {
                                        display_campaigns_hidden_chat: true,
                                        hide_outside_business_hours: false,
                                    },
                                },
                            })}
                        />
                    </Provider>,
                )

                getByText(
                    'Chat is currently hidden. Campaigns are still displayed, but they will not be interactive. You can change this in the Preferences tab.',
                )
            })
        })

        describe('chat is online but "Hide outside of business hours" is enabled', () => {
            it('should display the warning when chat is online but outside of business hours', () => {
                ;(
                    integrationsHelpers.isAccountDuringBusinessHours as jest.Mock
                ).mockReturnValue(false)
                ;(dismissHook.useDismissFlag as jest.Mock).mockReturnValue({
                    isDismissed: false,
                    dismiss: jest.fn(),
                })

                const { getByText } = renderWithRouter(
                    <Provider store={mockStore()}>
                        <CampaignChatHiddenWarning
                            integration={fromJS({
                                ...mockedChatIntegration,
                                meta: {
                                    preferences: {
                                        display_campaigns_hidden_chat: true,
                                        hide_outside_business_hours: true,
                                    },
                                },
                            })}
                        />
                    </Provider>,
                )

                getByText(
                    'Chat is currently hidden. Campaigns are still displayed, but they will not be interactive. You can change this in the Preferences tab.',
                )
            })

            it('should not display the warning when chat is online and within business hours', () => {
                ;(
                    integrationsHelpers.isAccountDuringBusinessHours as jest.Mock
                ).mockReturnValue(true)
                ;(dismissHook.useDismissFlag as jest.Mock).mockReturnValue({
                    isDismissed: false,
                    dismiss: jest.fn(),
                })

                const { container } = renderWithRouter(
                    <Provider store={mockStore()}>
                        <CampaignChatHiddenWarning
                            integration={fromJS({
                                ...mockedChatIntegration,
                                meta: {
                                    preferences: {
                                        display_campaigns_hidden_chat: true,
                                        hide_outside_business_hours: true,
                                    },
                                },
                            })}
                        />
                    </Provider>,
                )
                expect(container).toMatchInlineSnapshot('<div />')
            })
        })
    })

    describe('chat has "Display campaigns when chat is hidden" disabled', () => {
        it('should not display the warning', () => {
            ;(
                integrationsHelpers.isAccountDuringBusinessHours as jest.Mock
            ).mockReturnValue(true)
            ;(dismissHook.useDismissFlag as jest.Mock).mockReturnValue({
                isDismissed: false,
                dismiss: jest.fn(),
            })

            const { container } = renderWithRouter(
                <Provider store={mockStore()}>
                    <CampaignChatHiddenWarning
                        integration={fromJS({
                            ...mockedChatIntegration,
                            meta: {
                                preferences: {
                                    display_campaigns_hidden_chat: false,
                                    hide_outside_business_hours: false,
                                },
                            },
                        })}
                    />
                </Provider>,
            )
            expect(container).toMatchInlineSnapshot('<div />')
        })
    })

    describe('merchant is not part of revenue beta', () => {
        it('should not display the warning', () => {
            jest.spyOn(
                revenueBetaHook,
                'useIsConvertSubscriber',
            ).mockImplementation(() => false)

            const { container } = renderWithRouter(
                <Provider store={mockStore()}>
                    <CampaignChatHiddenWarning
                        integration={fromJS(mockedChatIntegration)}
                    />
                </Provider>,
            )

            expect(container).toMatchInlineSnapshot('<div />')
        })
    })
})
