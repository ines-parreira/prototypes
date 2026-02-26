import type { ReactNode } from 'react'

import { useFlag } from '@repo/feature-flags'
import { userEvent } from '@repo/testing'
import { waitFor } from '@testing-library/react'
import type { List, Map } from 'immutable'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { IntegrationType } from 'models/integration/constants'
import {
    GorgiasChatCreationWizardStatus,
    GorgiasChatCreationWizardSteps,
    GorgiasChatStatusEnum,
} from 'models/integration/types'
import type { RootState, StoreDispatch } from 'state/types'
import { renderWithRouter } from 'utils/testing'

import * as hookGorgiasChatIntegrationStatusData from '../../../../hooks/useGorgiasChatIntegrationStatusData'
import type { GorgiasChatIntegrationListRowProps } from '../GorgiasChatIntegrationList/GorgiasChatIntegrationListRow'
import GorgiasChatIntegrationListRow, {
    GorgiasChatIntegrationStatusFeedbackMapping,
} from '../GorgiasChatIntegrationList/GorgiasChatIntegrationListRow'

jest.mock('@repo/feature-flags')

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])
const mockUseFlag = useFlag as jest.Mock

const TestWrapper = ({ children }: { children: ReactNode }) => (
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

        mockUseFlag.mockReturnValue(false)
    })

    it('should render loading feedback if status is being fetched', () => {
        jest.spyOn(
            hookGorgiasChatIntegrationStatusData,
            'useGorgiasChatIntegrationStatusData',
        ).mockImplementation(() => ({
            chatStatus: undefined,
            isChatStatusLoading: true,
            isChatStatusError: false,
        }))

        const { getByText } = renderWithRouter(
            <Provider store={mockStore(defaultState)}>
                <TestWrapper>
                    <GorgiasChatIntegrationListRow {...defaultProps} />
                </TestWrapper>
            </Provider>,
        )

        expect(getByText(/Loading/)).toBeDefined()
    })

    it('should render unavailable feedback if status fetching resulted in error', () => {
        jest.spyOn(
            hookGorgiasChatIntegrationStatusData,
            'useGorgiasChatIntegrationStatusData',
        ).mockImplementation(() => ({
            chatStatus: undefined,
            isChatStatusLoading: false,
            isChatStatusError: true,
        }))

        const { getByText } = renderWithRouter(
            <Provider store={mockStore(defaultState)}>
                <TestWrapper>
                    <GorgiasChatIntegrationListRow {...defaultProps} />
                </TestWrapper>
            </Provider>,
        )

        expect(getByText(/Status unavailable/)).toBeDefined()
    })

    it('should render forward icon link for published chat', () => {
        jest.spyOn(
            hookGorgiasChatIntegrationStatusData,
            'useGorgiasChatIntegrationStatusData',
        ).mockImplementation(() => ({
            chatStatus: undefined,
            isChatStatusLoading: false,
            isChatStatusError: true,
        }))

        const { container, queryByText } = renderWithRouter(
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
            </Provider>,
        )

        expect(queryByText('Continue Setup')).not.toBeInTheDocument()
        expect(container.querySelector('.icon-go-forward')).toBeInTheDocument()
    })

    it('should render "Continue Setup" link for draft chat', () => {
        jest.spyOn(
            hookGorgiasChatIntegrationStatusData,
            'useGorgiasChatIntegrationStatusData',
        ).mockImplementation(() => ({
            chatStatus: undefined,
            isChatStatusLoading: false,
            isChatStatusError: true,
        }))

        const { container, queryByText } = renderWithRouter(
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
            </Provider>,
        )

        expect(queryByText('Continue Setup')).toBeInTheDocument()
        expect(
            container.querySelector('.icon-go-forward'),
        ).not.toBeInTheDocument()
    })

    it('should render "Update Permissions" link for chat with store integration requiring scope update', () => {
        mockUseFlag.mockReturnValue(true)
        jest.spyOn(
            hookGorgiasChatIntegrationStatusData,
            'useGorgiasChatIntegrationStatusData',
        ).mockImplementation(() => ({
            chatStatus: undefined,
            isChatStatusLoading: false,
            isChatStatusError: true,
        }))

        const { container, queryByText } = renderWithRouter(
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
                                        '2020-12-17',
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
            </Provider>,
        )

        expect(queryByText('Update Permissions')).toBeInTheDocument()
        expect(
            container.querySelector('.icon-go-forward'),
        ).not.toBeInTheDocument()
    })

    it.each(Object.entries(GorgiasChatIntegrationStatusFeedbackMapping))(
        'for chat status %s should render %s feedback',
        (status, expected) => {
            jest.spyOn(
                hookGorgiasChatIntegrationStatusData,
                'useGorgiasChatIntegrationStatusData',
            ).mockImplementation(() => ({
                chatStatus: status as GorgiasChatStatusEnum,
                isChatStatusLoading: false,
                isChatStatusError: false,
            }))

            const { getByText } = renderWithRouter(
                <Provider store={mockStore(defaultState)}>
                    <TestWrapper>
                        <GorgiasChatIntegrationListRow {...defaultProps} />
                    </TestWrapper>
                </Provider>,
            )

            expect(getByText(expected)).toBeDefined()
        },
    )

    it('should not render not installed popover if chat is draft', async () => {
        jest.spyOn(
            hookGorgiasChatIntegrationStatusData,
            'useGorgiasChatIntegrationStatusData',
        ).mockImplementation(() => ({
            chatStatus: GorgiasChatStatusEnum.NOT_INSTALLED,
            isChatStatusLoading: false,
            isChatStatusError: false,
        }))

        const { getByText, queryByText } = renderWithRouter(
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
            </Provider>,
        )

        const statusIndicator = getByText('Not Installed')

        userEvent.hover(statusIndicator)

        await waitFor(() => {
            expect(queryByText(/not seen installed/)).not.toBeInTheDocument()
        })
    })

    it.skip('should render not installed popover if chat is published', async () => {
        jest.spyOn(
            hookGorgiasChatIntegrationStatusData,
            'useGorgiasChatIntegrationStatusData',
        ).mockImplementation(() => ({
            chatStatus: GorgiasChatStatusEnum.NOT_INSTALLED,
            isChatStatusLoading: false,
            isChatStatusError: false,
        }))

        const { getByText, queryByText } = renderWithRouter(
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
            </Provider>,
        )

        const statusIndicator = getByText('Not Installed')

        userEvent.hover(statusIndicator)

        await waitFor(() => {
            expect(queryByText(/not seen installed/)).toBeInTheDocument()
        })
    })
})
