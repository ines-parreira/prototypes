import {render, waitFor} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {fromJS, Map, List} from 'immutable'
import LD from 'launchdarkly-react-client-sdk'
import React, {ReactNode} from 'react'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import {FeatureFlagKey} from 'config/featureFlags'
import {IntegrationType} from 'models/integration/constants'
import {
    GorgiasChatCreationWizardStatus,
    GorgiasChatCreationWizardSteps,
    GorgiasChatStatusEnum,
} from 'models/integration/types'
import {RootState, StoreDispatch} from 'state/types'

import * as hookGorgiasChatIntegrationStatusData from '../../../hooks/useGorgiasChatIntegrationStatusData'
import GorgiasChatIntegrationListRow, {
    GorgiasChatIntegrationListRowProps,
    GorgiasChatIntegrationStatusFeedbackMapping,
} from '../GorgiasChatIntegrationListRow'

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])

const TestWrapper = ({children}: {children: ReactNode}) => (
    <table>
        <tbody>{children}</tbody>
    </table>
)

describe('<GorgiasChatIntegrationListRow />', () => {
    const defaultChat = {
        id: 1,
        name: 'my chat enabled',
        type: IntegrationType.GorgiasChat,
        meta: {
            self_service: {
                enabled: false,
            },
            shop_name: 'my associated Shopify store',
            shop_type: IntegrationType.Shopify,
        },
        decoration: {
            introduction_text: 'this is an intro',
            input_placeholder: 'type something please',
            main_color: '#123456',
        },
    }
    const chat = fromJS(defaultChat) as Map<any, any>
    const defaultProps: GorgiasChatIntegrationListRowProps = {
        chat,
        isLoadingIntegrations: false,
        integrations: fromJS([
            defaultChat,
            {
                id: 3,
                name: 'my associated Shopify store',
                type: IntegrationType.Shopify,
                meta: {
                    self_service: {
                        enabled: false,
                    },
                },
                decoration: {
                    introduction_text: 'this is an intro',
                    input_placeholder: 'type something please',
                    main_color: '#123456',
                },
                deactivated_datetime: new Date('2020-12-17'),
            },
        ]) as List<Map<any, any>>,
    }
    const defaultState = {} as RootState

    beforeEach(() => {
        jest.resetAllMocks()

        jest.spyOn(LD, 'useFlags').mockImplementation(() => ({
            [FeatureFlagKey.ChatCreationWizard]: false,
        }))
    })

    it('should render loading feedback if status is being fetched', () => {
        jest.spyOn(
            hookGorgiasChatIntegrationStatusData,
            'useGorgiasChatIntegrationStatusData'
        ).mockImplementation(() => ({
            chatStatus: undefined,
            isChatStatusLoading: true,
            isChatStatusError: false,
        }))

        const {getByText} = render(
            <Provider store={mockStore(defaultState)}>
                <TestWrapper>
                    <GorgiasChatIntegrationListRow {...defaultProps} />
                </TestWrapper>
            </Provider>
        )

        expect(getByText(/Loading/)).toBeDefined()
    })

    it('should render unavailable feedback if status fetching resulted in error', () => {
        jest.spyOn(
            hookGorgiasChatIntegrationStatusData,
            'useGorgiasChatIntegrationStatusData'
        ).mockImplementation(() => ({
            chatStatus: undefined,
            isChatStatusLoading: false,
            isChatStatusError: true,
        }))

        const {getByText} = render(
            <Provider store={mockStore(defaultState)}>
                <TestWrapper>
                    <GorgiasChatIntegrationListRow {...defaultProps} />
                </TestWrapper>
            </Provider>
        )

        expect(getByText(/Status unavailable/)).toBeDefined()
    })

    it('should render forward icon link for published chat', () => {
        jest.spyOn(
            hookGorgiasChatIntegrationStatusData,
            'useGorgiasChatIntegrationStatusData'
        ).mockImplementation(() => ({
            chatStatus: undefined,
            isChatStatusLoading: false,
            isChatStatusError: true,
        }))

        const {container, queryByText} = render(
            <Provider store={mockStore(defaultState)}>
                <TestWrapper>
                    <GorgiasChatIntegrationListRow
                        {...defaultProps}
                        chat={fromJS({
                            ...defaultChat,
                            meta: {
                                ...defaultChat.meta,
                                wizard: {
                                    status: GorgiasChatCreationWizardStatus.Published,
                                    step: GorgiasChatCreationWizardSteps.Installation,
                                },
                            },
                        })}
                    />
                </TestWrapper>
            </Provider>
        )

        expect(queryByText('Continue Setup')).not.toBeInTheDocument()
        expect(container.querySelector('.icon-go-forward')).toBeInTheDocument()
    })

    it('should render "Continue Setup" link for draft chat', () => {
        jest.spyOn(LD, 'useFlags').mockImplementation(() => ({
            [FeatureFlagKey.ChatCreationWizard]: true,
        }))
        jest.spyOn(
            hookGorgiasChatIntegrationStatusData,
            'useGorgiasChatIntegrationStatusData'
        ).mockImplementation(() => ({
            chatStatus: undefined,
            isChatStatusLoading: false,
            isChatStatusError: true,
        }))

        const {container, queryByText} = render(
            <Provider store={mockStore(defaultState)}>
                <TestWrapper>
                    <GorgiasChatIntegrationListRow
                        {...defaultProps}
                        chat={fromJS({
                            ...defaultChat,
                            meta: {
                                ...defaultChat.meta,
                                wizard: {
                                    status: GorgiasChatCreationWizardStatus.Draft,
                                    step: GorgiasChatCreationWizardSteps.Basics,
                                },
                            },
                        })}
                    />
                </TestWrapper>
            </Provider>
        )

        expect(queryByText('Continue Setup')).toBeInTheDocument()
        expect(
            container.querySelector('.icon-go-forward')
        ).not.toBeInTheDocument()
    })

    it('should render "Update Permissions" link for chat with store integration requiring scope update', () => {
        jest.spyOn(LD, 'useFlags').mockImplementation(() => ({
            [FeatureFlagKey.ChatCreationWizard]: true,
            [FeatureFlagKey.ChatScopeUpdateChatList]: true,
        }))
        jest.spyOn(
            hookGorgiasChatIntegrationStatusData,
            'useGorgiasChatIntegrationStatusData'
        ).mockImplementation(() => ({
            chatStatus: undefined,
            isChatStatusLoading: false,
            isChatStatusError: true,
        }))

        const {container, queryByText} = render(
            <Provider store={mockStore(defaultState)}>
                <TestWrapper>
                    <GorgiasChatIntegrationListRow
                        {...defaultProps}
                        integrations={
                            fromJS([
                                defaultChat,
                                {
                                    id: 3,
                                    name: 'my associated Shopify store',
                                    type: IntegrationType.Shopify,
                                    meta: {
                                        self_service: {
                                            enabled: false,
                                        },
                                        need_scope_update: true,
                                    },
                                    decoration: {
                                        introduction_text: 'this is an intro',
                                        input_placeholder:
                                            'type something please',
                                        main_color: '#123456',
                                    },
                                    deactivated_datetime: new Date(
                                        '2020-12-17'
                                    ),
                                },
                            ]) as List<Map<any, any>>
                        }
                        chat={fromJS({
                            ...defaultChat,
                            meta: {
                                ...defaultChat.meta,
                                shop_integration_id: 3,
                                shopify_integration_ids: [3],
                                wizard: {
                                    status: GorgiasChatCreationWizardStatus.Published,
                                    step: GorgiasChatCreationWizardSteps.Basics,
                                },
                            },
                        })}
                    />
                </TestWrapper>
            </Provider>
        )

        expect(queryByText('Update Permissions')).toBeInTheDocument()
        expect(
            container.querySelector('.icon-go-forward')
        ).not.toBeInTheDocument()
    })

    it.each(Object.entries(GorgiasChatIntegrationStatusFeedbackMapping))(
        'for chat status %s should render %s feedback',
        (status, expected) => {
            jest.spyOn(
                hookGorgiasChatIntegrationStatusData,
                'useGorgiasChatIntegrationStatusData'
            ).mockImplementation(() => ({
                chatStatus: status as GorgiasChatStatusEnum,
                isChatStatusLoading: false,
                isChatStatusError: false,
            }))

            const {getByText} = render(
                <Provider store={mockStore(defaultState)}>
                    <TestWrapper>
                        <GorgiasChatIntegrationListRow {...defaultProps} />
                    </TestWrapper>
                </Provider>
            )

            expect(getByText(expected)).toBeDefined()
        }
    )

    it('should not render not installed popover if chat is draft', async () => {
        jest.spyOn(LD, 'useFlags').mockImplementation(() => ({
            [FeatureFlagKey.ChatCreationWizard]: true,
        }))
        jest.spyOn(
            hookGorgiasChatIntegrationStatusData,
            'useGorgiasChatIntegrationStatusData'
        ).mockImplementation(() => ({
            chatStatus: GorgiasChatStatusEnum.NOT_INSTALLED,
            isChatStatusLoading: false,
            isChatStatusError: false,
        }))

        const {getByText, queryByText} = render(
            <Provider store={mockStore(defaultState)}>
                <TestWrapper>
                    <GorgiasChatIntegrationListRow
                        {...defaultProps}
                        chat={fromJS({
                            ...defaultChat,
                            meta: {
                                ...defaultChat.meta,
                                wizard: {
                                    status: GorgiasChatCreationWizardStatus.Draft,
                                },
                            },
                        })}
                    />
                </TestWrapper>
            </Provider>
        )

        const statusIndicator = getByText('Not Installed')

        userEvent.hover(statusIndicator)

        await waitFor(() => {
            expect(queryByText(/not seen installed/)).not.toBeInTheDocument()
        })
    })

    it('should render not installed popover if chat is published', async () => {
        jest.spyOn(LD, 'useFlags').mockImplementation(() => ({
            [FeatureFlagKey.ChatCreationWizard]: true,
        }))
        jest.spyOn(
            hookGorgiasChatIntegrationStatusData,
            'useGorgiasChatIntegrationStatusData'
        ).mockImplementation(() => ({
            chatStatus: GorgiasChatStatusEnum.NOT_INSTALLED,
            isChatStatusLoading: false,
            isChatStatusError: false,
        }))

        const {getByText, queryByText} = render(
            <Provider store={mockStore(defaultState)}>
                <TestWrapper>
                    <GorgiasChatIntegrationListRow
                        {...defaultProps}
                        chat={fromJS({
                            ...defaultChat,
                            meta: {
                                ...defaultChat.meta,
                                wizard: {
                                    status: GorgiasChatCreationWizardStatus.Published,
                                },
                            },
                        })}
                    />
                </TestWrapper>
            </Provider>
        )

        const statusIndicator = getByText('Not Installed')

        userEvent.hover(statusIndicator)

        await waitFor(() => {
            expect(queryByText(/not seen installed/)).toBeInTheDocument()
        })
    })
})
