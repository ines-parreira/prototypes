import type { ComponentProps, ReactNode } from 'react'

import { useCanAccessAIFeedback } from '@repo/ai-agent'
import type { EditShippingAddressModalRenderProps } from '@repo/customer'
import { useFlag } from '@repo/feature-flags'
import { TicketInfobarTab, useTicketInfobarNavigation } from '@repo/navigation'
import { assumeMock, userEvent } from '@repo/testing'
import { useHelpdeskV2MS1Flag } from '@repo/tickets/feature-flags'
import { act, render, screen } from '@testing-library/react'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { useGetTicket } from '@gorgias/helpdesk-queries'

import { TicketStatus } from 'business/types/ticket'
import { useTicketIsAfterFeedbackCollectionPeriod } from 'common/utils/useIsTicketAfterFeedbackCollectionPeriod'
import { UserRole } from 'config/types/user'
import { ticket } from 'fixtures/ticket'
import { user } from 'fixtures/users'
import { useAiAgentAccess } from 'hooks/aiAgent/useAiAgentAccess'
import type { Infobar } from 'pages/common/components/infobar/Infobar/Infobar'
import useHasAIAgent from 'pages/tickets/detail/components/TicketFeedback/hooks/useHasAIAgent'
import { getCurrentUser } from 'state/currentUser/selectors'
import { getIntegrationsByType } from 'state/integrations/selectors'
import { getAIAgentMessages, getIntegrationsData } from 'state/ticket/selectors'
import type { RootState, StoreState } from 'state/types'
import { changeTicketMessage } from 'state/ui/ticketAIAgentFeedback'
import { renderWithRouter } from 'utils/testing'

import { useCancelOrder } from '../hooks/useCancelOrder'
import { useDuplicateOrder } from '../hooks/useDuplicateOrder'
import { useRefundOrder } from '../hooks/useRefundOrder'
import {
    AI_FEEDBACK_TAB,
    AUTO_QA_TAB,
    CUSTOMER_DETAILS_TAB,
    TicketInfobarContainer,
} from '../TicketInfobarContainer'

let mockCapturedRenderEditShippingAddressModal:
    | ((props: EditShippingAddressModalRenderProps) => ReactNode)
    | undefined
let mockCapturedConnectedModalProps:
    | {
          onChange: (name: string, value: unknown) => void
          onBulkChange: (
              values: Array<{ name: string; value: unknown }>,
              callback?: () => void,
          ) => void
          onSubmit: () => void
      }
    | undefined
let mockCapturedOnSyncProfile: (() => void) | undefined

jest.mock('@repo/navigation', () => ({
    ...jest.requireActual('@repo/navigation'),
    useTicketInfobarNavigation: jest.fn(),
}))
const useTicketInfobarNavigationMock = useTicketInfobarNavigation as jest.Mock

jest.mock('@repo/feature-flags', () => ({
    ...jest.requireActual('@repo/feature-flags'),
    useFlag: jest.fn(),
}))
const useFlagMock = jest.mocked(useFlag)

jest.mock('@repo/tickets/feature-flags', () => ({
    ...jest.requireActual('@repo/tickets/feature-flags'),
    useHelpdeskV2MS1Flag: jest.fn(),
}))
const useHelpdeskV2MS1FlagMock = assumeMock(useHelpdeskV2MS1Flag)

jest.mock('@gorgias/helpdesk-queries')
const useGetTicketMock = assumeMock(useGetTicket)

jest.mock('@repo/ai-agent', () => ({
    useCanAccessAIFeedback: jest.fn(),
    useFeedbackTracking: jest.fn(() => ({
        onFeedbackTabOpened: jest.fn(),
    })),
}))
const useCanAccessAIFeedbackMock = assumeMock(useCanAccessAIFeedback)

jest.mock('pages/tickets/detail/components/TicketFeedback', () => ({
    __esModule: true,
    default: () => <div>TicketFeedback</div>,
    useHasAIAgent: jest.fn(),
}))

jest.mock('auto_qa', () => ({
    AutoQA: () => <div>AutoQA Component</div>,
}))

jest.mock('@repo/customer', () => ({
    ShopifyCustomer: ({
        renderEditShippingAddressModal,
        onSyncProfile,
    }: any) => {
        mockCapturedRenderEditShippingAddressModal =
            renderEditShippingAddressModal
        mockCapturedOnSyncProfile = onSyncProfile
        return <div>ShopifyCustomer Component</div>
    },
    ShopifyCustomerProvider: ({ children }: { children: ReactNode }) => (
        <>{children}</>
    ),
    TemplateResolverProvider: ({ children }: { children: ReactNode }) => (
        <>{children}</>
    ),
}))

jest.mock(
    'Widgets/modules/Shopify/modules/Order/components/EditOrderShippingAddressModal',
    () => ({
        __esModule: true,
        default: (props: any) => {
            mockCapturedConnectedModalProps = props
            return null
        },
    }),
)

jest.mock('state/infobar/actions', () => ({
    executeAction: jest.fn().mockReturnValue({ type: 'MOCK_EXECUTE_ACTION' }),
}))

jest.mock('pages/tickets/detail/hooks/useEditOrder', () => ({
    useEditOrder: jest.fn().mockReturnValue({
        isOpen: false,
        data: null,
        open: jest.fn(),
        onChange: jest.fn(),
        onBulkChange: jest.fn(),
        onSubmit: jest.fn(),
        onClose: jest.fn(),
    }),
}))

jest.mock('pages/tickets/detail/hooks/useCancelOrder', () => ({
    useCancelOrder: jest.fn().mockReturnValue({
        isOpen: false,
        data: null,
        open: jest.fn(),
        onChange: jest.fn(),
        onBulkChange: jest.fn(),
        onSubmit: jest.fn(),
        onClose: jest.fn(),
    }),
}))

jest.mock('pages/tickets/detail/hooks/useRefundOrder', () => ({
    useRefundOrder: jest.fn().mockReturnValue({
        isOpen: false,
        data: null,
        open: jest.fn(),
        onChange: jest.fn(),
        onBulkChange: jest.fn(),
        onSubmit: jest.fn(),
        onClose: jest.fn(),
    }),
}))

jest.mock('pages/tickets/detail/hooks/useDuplicateOrder', () => ({
    useDuplicateOrder: jest.fn().mockReturnValue({
        isOpen: false,
        data: null,
        open: jest.fn(),
        onChange: jest.fn(),
        onBulkChange: jest.fn(),
        onSubmit: jest.fn(),
        onClose: jest.fn(),
    }),
}))

jest.mock(
    'Widgets/modules/Shopify/modules/Order/modules/EditOrderModal',
    () => ({
        __esModule: true,
        default: () => null,
    }),
)

jest.mock('Widgets/modules/Shopify/modules/DraftOrderModal', () => ({
    __esModule: true,
    default: () => null,
}))

jest.mock(
    'Widgets/modules/Shopify/modules/Order/modules/RefundOrderModal',
    () => ({
        __esModule: true,
        default: () => null,
    }),
)

jest.mock(
    'Widgets/modules/Shopify/modules/Order/modules/CancelOrderModal',
    () => ({
        __esModule: true,
        default: () => null,
    }),
)

jest.mock('tickets/ticket-timeline', () => ({
    TimelineContent: () => <div>TimelineContent Component</div>,
}))

jest.mock(
    'pages/common/components/infobar/Infobar/InfobarCustomerInfo/CustomerSyncForm/CustomerSyncForm',
    () =>
        ({ isCustomerSyncFormOpen }: { isCustomerSyncFormOpen: boolean }) => (
            <div>CustomerSyncForm isOpen:{String(isCustomerSyncFormOpen)}</div>
        ),
)

jest.mock('state/currentUser/selectors')
const getCurrentUserMock = assumeMock(getCurrentUser)

jest.mock('hooks/aiAgent/useAiAgentAccess')
const useAiAgentAccessMock = assumeMock(useAiAgentAccess)

jest.mock('pages/tickets/detail/components/TicketFeedback/hooks/useHasAIAgent')
const useHasAIAgentMock = assumeMock(useHasAIAgent)

jest.mock('common/utils/useIsTicketAfterFeedbackCollectionPeriod')
const useTicketIsAfterFeedbackCollectionPeriodMock = assumeMock(
    useTicketIsAfterFeedbackCollectionPeriod,
)

jest.mock('state/widgets/actions')

jest.mock('state/ui/ticketAIAgentFeedback')

jest.mock('pages/tickets/detail/IntegrationTabContent', () => ({
    __esModule: true,
    default: ({ widgetType }: { widgetType: string }) => (
        <div>IntegrationTabContent-{widgetType}</div>
    ),
}))

jest.mock('state/integrations/selectors', () => ({
    getIntegrationsByType: jest.fn(() => () => []),
}))

jest.mock(
    'state/ticket/selectors',
    () =>
        ({
            ...jest.requireActual('state/ticket/selectors'),
            getAIAgentMessages: jest.fn(),
            getIntegrationsData: jest.fn(),
        }) as Record<string, unknown>,
)
jest.mock(
    'pages/common/components/infobar/Infobar/Infobar',
    () =>
        ({
            sources,
            isRouteEditingWidgets,
            identifier,
            customer,
            widgets,
            context,
        }: ComponentProps<typeof Infobar>) => (
            <div>
                <div>Infobar</div>
                <div>sources: {JSON.stringify(sources)}</div>
                <div>isRouteEditingWidgets: {isRouteEditingWidgets}</div>
                <div>identifier: {identifier}</div>
                <div>customer: {customer.toArray()}</div>
                <div>widgets: {JSON.stringify(widgets)}</div>
                <div>context: {context}</div>
            </div>
        ),
)

const mockedGetAIAgentMessages = assumeMock(getAIAgentMessages)
const mockedGetIntegrationsData = assumeMock(getIntegrationsData)
const mockedGetIntegrationsByType = jest.mocked(getIntegrationsByType)
const mockedChangeTicketMessage = assumeMock(changeTicketMessage)

const ticketsStore: Partial<RootState> = {
    currentUser: fromJS(user),
    ticket: fromJS(ticket),
    integrations: fromJS({ integrations: [] }),
}

const mockStore = configureMockStore([thunk])
const state: Partial<StoreState> = ticketsStore

jest.mock('state/ticket/actions', () => ({
    addTag: jest.fn(),
    removeTag: jest.fn(),
}))
let store = mockStore(state)
const dateAfterFeatureAvailable = '2025-01-01T00:00:00Z'

describe('<TicketInfobarContainer />', () => {
    const minProps = {
        isEditingWidgets: false,
        sources: fromJS({
            ticket: fromJS({
                customer: fromJS({}),
            }),
            customer: fromJS({}),
        }),
        widgets: fromJS({}),
    } as unknown as ComponentProps<typeof TicketInfobarContainer>

    let onChangeTab: jest.Mock

    beforeEach(() => {
        jest.clearAllMocks()
        mockCapturedRenderEditShippingAddressModal = undefined
        mockCapturedConnectedModalProps = undefined
        mockCapturedOnSyncProfile = undefined
        ;(mockedGetIntegrationsByType as jest.Mock).mockReturnValue(() => [])
        store = mockStore(state)
        store.dispatch = jest.fn()

        useFlagMock.mockReturnValue(false)
        useHelpdeskV2MS1FlagMock.mockReturnValue(false)

        useHasAIAgentMock.mockReturnValue(true)
        getCurrentUserMock.mockReturnValue(
            fromJS({
                id: 2,
                role: { name: UserRole.Agent },
            }),
        )
        useCanAccessAIFeedbackMock.mockReturnValue(true)
        useTicketIsAfterFeedbackCollectionPeriodMock.mockReturnValue(false)
        useAiAgentAccessMock.mockReturnValue({
            hasAccess: true,
            isLoading: false,
        })
        useHasAIAgentMock.mockReturnValue(true)
        mockedGetAIAgentMessages.mockReturnValue([
            {
                id: '1',
                public: true,
                created_datetime: dateAfterFeatureAvailable,
            } as any,
        ])

        onChangeTab = jest.fn()
        useTicketInfobarNavigationMock.mockReturnValue({
            activeTab: TicketInfobarTab.Customer,
            onChangeTab,
        })

        useGetTicketMock.mockReturnValue({
            data: {
                data: {
                    id: 1,
                    customer: { id: 123 },
                },
            },
        } as any)

        mockedGetIntegrationsData.mockReturnValue(fromJS({}))
    })

    it('should render infobar for active customer', () => {
        const { container } = renderWithRouter(
            <Provider store={store}>
                <TicketInfobarContainer {...minProps} />
            </Provider>,
            {
                path: '/foo/:ticketId?',
                route: '/foo/new',
            },
        )

        expect(container.firstChild).toHaveTextContent(
            CUSTOMER_DETAILS_TAB.LABEL,
        )
        expect(screen.getByText('Infobar')).toBeInTheDocument()
    })

    it('should not render the navbar if the UI Vision MS1 flag is enabled', () => {
        useHelpdeskV2MS1FlagMock.mockReturnValue(true)

        renderWithRouter(
            <Provider store={store}>
                <TicketInfobarContainer {...minProps} />
            </Provider>,
            {
                path: '/foo/:ticketId?',
                route: '/foo/new',
            },
        )

        expect(
            screen.queryByText(CUSTOMER_DETAILS_TAB.LABEL),
        ).not.toBeInTheDocument()
    })

    describe('AI Feedback tab visibility', () => {
        it('shows when AI Agent has worked on ticket', () => {
            useAiAgentAccessMock.mockReturnValue({
                hasAccess: false,
                isLoading: false,
            })
            useHasAIAgentMock.mockReturnValue(true)

            renderWithRouter(
                <Provider store={store}>
                    <TicketInfobarContainer {...minProps} />
                </Provider>,
                { path: '/foo/:ticketId?', route: '/foo/new' },
            )

            expect(
                screen.queryByText(AI_FEEDBACK_TAB.LABEL),
            ).toBeInTheDocument()
        })

        it('does not show when AI Agent feature is not enabled and agent did not work on ticket', () => {
            useAiAgentAccessMock.mockReturnValue({
                hasAccess: false,
                isLoading: false,
            })
            useHasAIAgentMock.mockReturnValue(false)

            renderWithRouter(
                <Provider store={store}>
                    <TicketInfobarContainer {...minProps} />
                </Provider>,
                { path: '/foo/:ticketId?', route: '/foo/new' },
            )

            expect(
                screen.queryByText(AI_FEEDBACK_TAB.LABEL),
            ).not.toBeInTheDocument()
        })

        it('does not show when user cannot access AI feedback', () => {
            useCanAccessAIFeedbackMock.mockReturnValue(false)

            renderWithRouter(
                <Provider store={store}>
                    <TicketInfobarContainer {...minProps} />
                </Provider>,
                { path: '/foo/:ticketId?', route: '/foo/new' },
            )

            expect(
                screen.queryByText(AI_FEEDBACK_TAB.LABEL),
            ).not.toBeInTheDocument()
        })

        it('shows when user can access AI feedback', () => {
            useCanAccessAIFeedbackMock.mockReturnValue(true)

            renderWithRouter(
                <Provider store={store}>
                    <TicketInfobarContainer {...minProps} />
                </Provider>,
                { path: '/foo/:ticketId?', route: '/foo/new' },
            )

            expect(
                screen.queryByText(AI_FEEDBACK_TAB.LABEL),
            ).toBeInTheDocument()
        })

        it('does not show on edit-widgets route', () => {
            renderWithRouter(
                <Provider store={store}>
                    <TicketInfobarContainer {...minProps} />
                </Provider>,
                {
                    path: '/foo/:ticketId?/edit-widgets',
                    route: '/foo/123/edit-widgets',
                },
            )

            expect(
                screen.queryByText(AI_FEEDBACK_TAB.LABEL),
            ).not.toBeInTheDocument()
        })
    })

    it('should render TicketFeedback content when AI Agent tab is clicked', () => {
        const { rerenderComponent } = renderWithRouter(
            <Provider store={store}>
                <TicketInfobarContainer {...minProps} />
            </Provider>,
            {
                path: '/foo/:ticketId?',
                route: '/foo/new',
            },
        )

        userEvent.click(screen.getByText(AI_FEEDBACK_TAB.LABEL))

        expect(onChangeTab).toHaveBeenCalledWith(TicketInfobarTab.AIFeedback)

        useTicketInfobarNavigationMock.mockReturnValue({
            activeTab: TicketInfobarTab.AIFeedback,
            onChangeTab,
        })
        rerenderComponent(
            <Provider store={store}>
                <TicketInfobarContainer {...minProps} />
            </Provider>,
        )

        expect(screen.getByText('TicketFeedback')).toBeInTheDocument()
    })

    it('should change selected message when AI agent tab is clicked and there is only 1 public AI message', () => {
        mockedGetAIAgentMessages.mockReturnValue([
            {
                id: '1',
                public: true,
                created_datetime: dateAfterFeatureAvailable,
            } as any,
        ])

        renderWithRouter(
            <Provider store={store}>
                <TicketInfobarContainer {...minProps} />
            </Provider>,
            {
                path: '/foo/:ticketId?',
                route: '/foo/new',
            },
        )

        userEvent.click(screen.getByText(AI_FEEDBACK_TAB.LABEL))

        expect(onChangeTab).toHaveBeenCalledWith(TicketInfobarTab.AIFeedback)
        expect(mockedChangeTicketMessage).toHaveBeenCalledWith({
            message: {
                id: '1',
                public: true,
                created_datetime: dateAfterFeatureAvailable,
            },
        })
    })

    it('should unset selected message when AI agent tab is clicked and there are multiple public AI messages', () => {
        mockedGetAIAgentMessages.mockReturnValue([
            {
                id: '1',
                public: true,
                created_datetime: dateAfterFeatureAvailable,
            } as any,
            {
                id: '2',
                public: true,
                created_datetime: dateAfterFeatureAvailable,
            } as any,
        ])

        renderWithRouter(
            <Provider store={store}>
                <TicketInfobarContainer {...minProps} />
            </Provider>,
            {
                path: '/foo/:ticketId?',
                route: '/foo/new',
            },
        )

        userEvent.click(screen.getByText(AI_FEEDBACK_TAB.LABEL))

        expect(onChangeTab).toHaveBeenCalledWith(TicketInfobarTab.AIFeedback)
        expect(mockedChangeTicketMessage).toHaveBeenCalledWith({
            message: undefined,
        })
    })

    it('should switch to the Ticket Feedback tab if the user is a team lead and is coming with AI tab search param', async () => {
        const customStore = mockStore({
            ...state,
            ticket: fromJS({ ...ticket, status: TicketStatus.Closed }),
        })
        customStore.dispatch = jest.fn()
        getCurrentUserMock.mockReturnValue(
            fromJS({
                id: 2,
                role: { name: UserRole.Agent },
            }),
        )

        renderWithRouter(
            <Provider store={customStore}>
                <TicketInfobarContainer {...minProps} />
            </Provider>,
            {
                path: `/foo/:ticketId?`,
                route: `/foo/123/?activeTab=${TicketInfobarTab.AIFeedback}`,
            },
        )

        expect(onChangeTab).toHaveBeenCalledWith(TicketInfobarTab.AIFeedback)
        expect(screen.getByText(AI_FEEDBACK_TAB.LABEL)).toBeInTheDocument()
    })

    it('should default back to the Customer tab on first render in the new layout', () => {
        useHelpdeskV2MS1FlagMock.mockReturnValue(true)
        useTicketInfobarNavigationMock.mockReturnValue({
            activeTab: TicketInfobarTab.AIFeedback,
            onChangeTab,
        })

        renderWithRouter(
            <Provider store={store}>
                <TicketInfobarContainer {...minProps} />
            </Provider>,
            {
                path: '/foo/:ticketId?',
                route: '/foo/123',
            },
        )

        expect(onChangeTab).toHaveBeenCalledWith(TicketInfobarTab.Customer)
    })

    it('should keep the AI Feedback tab on first render in the new layout when explicitly requested in the URL', () => {
        useHelpdeskV2MS1FlagMock.mockReturnValue(true)
        const customStore = mockStore({
            ...state,
            ticket: fromJS({ ...ticket, status: TicketStatus.Closed }),
        })
        customStore.dispatch = jest.fn()

        renderWithRouter(
            <Provider store={customStore}>
                <TicketInfobarContainer {...minProps} />
            </Provider>,
            {
                path: '/foo/:ticketId?',
                route: `/foo/123/?activeTab=${TicketInfobarTab.AIFeedback}`,
            },
        )

        expect(onChangeTab).toHaveBeenCalledWith(TicketInfobarTab.AIFeedback)
    })

    it('should not call onChangeTab when clicking an already active tab', () => {
        renderWithRouter(
            <Provider store={store}>
                <TicketInfobarContainer {...minProps} />
            </Provider>,
            {
                path: '/foo/:ticketId?',
                route: '/foo/new',
            },
        )

        userEvent.click(screen.getByText(CUSTOMER_DETAILS_TAB.LABEL))

        expect(onChangeTab).not.toHaveBeenCalled()
    })

    it('should render AutoQA content when AutoQA tab is clicked', () => {
        useTicketIsAfterFeedbackCollectionPeriodMock.mockReturnValueOnce(true)
        const { rerenderComponent } = renderWithRouter(
            <Provider store={store}>
                <TicketInfobarContainer {...minProps} />
            </Provider>,
            {
                path: '/foo/:ticketId?',
                route: '/foo/new',
            },
        )

        userEvent.click(screen.getByText(AUTO_QA_TAB.LABEL))

        expect(onChangeTab).toHaveBeenCalledWith(TicketInfobarTab.AutoQA)

        useTicketIsAfterFeedbackCollectionPeriodMock.mockReturnValueOnce(true)
        useTicketInfobarNavigationMock.mockReturnValue({
            activeTab: TicketInfobarTab.AutoQA,
            onChangeTab,
        })
        rerenderComponent(
            <Provider store={store}>
                <TicketInfobarContainer {...minProps} />
            </Provider>,
        )

        expect(screen.getByText('AutoQA Component')).toBeInTheDocument()
    })

    it('should render ShopifyCustomer with non-null order data from hooks when Shopify tab is active', () => {
        const orderImmutable = fromJS({ id: 1 })
        const customerImmutable = fromJS({ id: 99 })

        jest.mocked(useDuplicateOrder).mockReturnValueOnce({
            isOpen: true,
            data: {
                integrationId: 10,
                orderId: 1,
                orderImmutable,
                customerImmutable,
            },
            open: jest.fn(),
            onChange: jest.fn(),
            onBulkChange: jest.fn(),
            onSubmit: jest.fn(),
            onClose: jest.fn(),
        })
        jest.mocked(useRefundOrder).mockReturnValueOnce({
            isOpen: true,
            data: { integrationId: 20, orderImmutable },
            open: jest.fn(),
            onChange: jest.fn(),
            onBulkChange: jest.fn(),
            onSubmit: jest.fn(),
            onClose: jest.fn(),
        })
        jest.mocked(useCancelOrder).mockReturnValueOnce({
            isOpen: true,
            data: { integrationId: 30, orderImmutable },
            open: jest.fn(),
            onChange: jest.fn(),
            onBulkChange: jest.fn(),
            onSubmit: jest.fn(),
            onClose: jest.fn(),
        })

        useTicketInfobarNavigationMock.mockReturnValue({
            activeTab: TicketInfobarTab.Shopify,
            onChangeTab,
        })

        renderWithRouter(
            <Provider store={store}>
                <TicketInfobarContainer {...minProps} />
            </Provider>,
            { path: '/foo/:ticketId?', route: '/foo/123' },
        )

        expect(
            screen.getByText('ShopifyCustomer Component'),
        ).toBeInTheDocument()
    })

    it('should open CustomerSyncForm when onSyncProfile is called', () => {
        useTicketInfobarNavigationMock.mockReturnValue({
            activeTab: TicketInfobarTab.Shopify,
            onChangeTab,
        })

        renderWithRouter(
            <Provider store={store}>
                <TicketInfobarContainer {...minProps} />
            </Provider>,
            { path: '/foo/:ticketId?', route: '/foo/123' },
        )

        expect(screen.getByText(/isOpen:false/)).toBeInTheDocument()

        act(() => {
            mockCapturedOnSyncProfile!()
        })

        expect(screen.getByText(/isOpen:true/)).toBeInTheDocument()
    })

    describe('renderEditShippingAddressModal', () => {
        beforeEach(() => {
            useTicketInfobarNavigationMock.mockReturnValue({
                activeTab: TicketInfobarTab.Shopify,
                onChangeTab,
            })

            renderWithRouter(
                <Provider store={store}>
                    <TicketInfobarContainer {...minProps} />
                </Provider>,
                { path: '/foo/:ticketId?', route: '/foo/123' },
            )
        })

        it('dispatches executeAction, calls onClose and onSuccess with address payload on submit', () => {
            const onClose = jest.fn()
            const onSuccess = jest.fn()
            const addressPayload = { address1: '456 New St', city: 'Austin' }

            render(
                mockCapturedRenderEditShippingAddressModal!({
                    isOpen: true,
                    orderId: '123',
                    customerId: '456',
                    integrationId: 1,
                    currentShippingAddress: {},
                    onClose,
                    onSuccess,
                }) as React.ReactElement,
            )

            mockCapturedConnectedModalProps!.onChange('payload', addressPayload)
            mockCapturedConnectedModalProps!.onSubmit()

            expect(store.dispatch).toHaveBeenCalled()
            expect(onClose).toHaveBeenCalledTimes(1)
            expect(onSuccess).toHaveBeenCalledWith(addressPayload)
        })

        it('accumulates onBulkChange values and calls callback before submit', () => {
            const onClose = jest.fn()
            const onSuccess = jest.fn()
            const callback = jest.fn()

            render(
                mockCapturedRenderEditShippingAddressModal!({
                    isOpen: true,
                    orderId: '1',
                    customerId: '2',
                    integrationId: 1,
                    currentShippingAddress: {},
                    onClose,
                    onSuccess,
                }) as React.ReactElement,
            )

            mockCapturedConnectedModalProps!.onBulkChange(
                [
                    { name: 'payload', value: { address1: '123 Main St' } },
                    { name: 'city', value: 'NYC' },
                ],
                callback,
            )
            mockCapturedConnectedModalProps!.onSubmit()

            expect(callback).toHaveBeenCalled()
            expect(store.dispatch).toHaveBeenCalled()
        })
    })

    describe('Timeline tab', () => {
        it('renders TimelineContent when shopperId is present', () => {
            useTicketInfobarNavigationMock.mockReturnValue({
                activeTab: TicketInfobarTab.Timeline,
                onChangeTab,
            })
            useGetTicketMock.mockReturnValue({
                data: { data: { id: 1, customer: { id: 456 } } },
            } as any)

            renderWithRouter(
                <Provider store={store}>
                    <TicketInfobarContainer {...minProps} />
                </Provider>,
                { path: '/foo/:ticketId?', route: '/foo/123' },
            )

            expect(
                screen.getByText('TimelineContent Component'),
            ).toBeInTheDocument()
        })

        it('does not render TimelineContent when shopperId is absent', () => {
            useTicketInfobarNavigationMock.mockReturnValue({
                activeTab: TicketInfobarTab.Timeline,
                onChangeTab,
            })
            useGetTicketMock.mockReturnValue({ data: null } as any)

            renderWithRouter(
                <Provider store={store}>
                    <TicketInfobarContainer {...minProps} />
                </Provider>,
                { path: '/foo/:ticketId?', route: '/foo/123' },
            )

            expect(
                screen.queryByText('TimelineContent Component'),
            ).not.toBeInTheDocument()
        })
    })

    describe('Recharge tab', () => {
        it('should render IntegrationTabContent when activeTab is Recharge and recharge integration exists', () => {
            useTicketInfobarNavigationMock.mockReturnValue({
                activeTab: TicketInfobarTab.Recharge,
                onChangeTab,
            })
            ;(mockedGetIntegrationsByType as jest.Mock).mockImplementation(
                (type: string) => () => {
                    if (type === 'recharge') return [{ id: 42 }]
                    return []
                },
            )
            mockedGetIntegrationsData.mockReturnValue(fromJS({ '42': {} }))

            renderWithRouter(
                <Provider store={store}>
                    <TicketInfobarContainer {...minProps} />
                </Provider>,
                { path: '/foo/:ticketId?', route: '/foo/123' },
            )

            expect(
                screen.getByText('IntegrationTabContent-recharge'),
            ).toBeInTheDocument()
        })

        it('should not render IntegrationTabContent when tab is not Recharge', () => {
            useTicketInfobarNavigationMock.mockReturnValue({
                activeTab: TicketInfobarTab.Customer,
                onChangeTab,
            })
            ;(mockedGetIntegrationsByType as jest.Mock).mockImplementation(
                (type: string) => () => {
                    if (type === 'recharge') return [{ id: 42 }]
                    return []
                },
            )
            mockedGetIntegrationsData.mockReturnValue(fromJS({ '42': {} }))

            renderWithRouter(
                <Provider store={store}>
                    <TicketInfobarContainer {...minProps} />
                </Provider>,
                { path: '/foo/:ticketId?', route: '/foo/123' },
            )

            expect(
                screen.queryByText('IntegrationTabContent-recharge'),
            ).not.toBeInTheDocument()
        })

        it('should not render IntegrationTabContent when no recharge integration matches customer', () => {
            useTicketInfobarNavigationMock.mockReturnValue({
                activeTab: TicketInfobarTab.Recharge,
                onChangeTab,
            })
            ;(mockedGetIntegrationsByType as jest.Mock).mockImplementation(
                (type: string) => () => {
                    if (type === 'recharge') return [{ id: 42 }]
                    return []
                },
            )
            mockedGetIntegrationsData.mockReturnValue(fromJS({}))

            renderWithRouter(
                <Provider store={store}>
                    <TicketInfobarContainer {...minProps} />
                </Provider>,
                { path: '/foo/:ticketId?', route: '/foo/123' },
            )

            expect(
                screen.queryByText('IntegrationTabContent-recharge'),
            ).not.toBeInTheDocument()
        })
    })

    describe('BigCommerce tab', () => {
        it('should render IntegrationTabContent when activeTab is BigCommerce and integration exists', () => {
            useTicketInfobarNavigationMock.mockReturnValue({
                activeTab: TicketInfobarTab.BigCommerce,
                onChangeTab,
            })
            ;(mockedGetIntegrationsByType as jest.Mock).mockImplementation(
                (type: string) => () => {
                    if (type === 'bigcommerce') return [{ id: 50 }]
                    return []
                },
            )
            mockedGetIntegrationsData.mockReturnValue(fromJS({ '50': {} }))

            renderWithRouter(
                <Provider store={store}>
                    <TicketInfobarContainer {...minProps} />
                </Provider>,
                { path: '/foo/:ticketId?', route: '/foo/123' },
            )

            expect(
                screen.getByText('IntegrationTabContent-bigcommerce'),
            ).toBeInTheDocument()
        })

        it('should not render when no bigcommerce integration matches', () => {
            useTicketInfobarNavigationMock.mockReturnValue({
                activeTab: TicketInfobarTab.BigCommerce,
                onChangeTab,
            })
            ;(mockedGetIntegrationsByType as jest.Mock).mockImplementation(
                () => () => [],
            )
            mockedGetIntegrationsData.mockReturnValue(fromJS({}))

            renderWithRouter(
                <Provider store={store}>
                    <TicketInfobarContainer {...minProps} />
                </Provider>,
                { path: '/foo/:ticketId?', route: '/foo/123' },
            )

            expect(
                screen.queryByText('IntegrationTabContent-bigcommerce'),
            ).not.toBeInTheDocument()
        })
    })

    describe('Magento tab', () => {
        it('should render IntegrationTabContent when activeTab is Magento and integration exists', () => {
            useTicketInfobarNavigationMock.mockReturnValue({
                activeTab: TicketInfobarTab.Magento,
                onChangeTab,
            })
            ;(mockedGetIntegrationsByType as jest.Mock).mockImplementation(
                (type: string) => () => {
                    if (type === 'magento2') return [{ id: 60 }]
                    return []
                },
            )
            mockedGetIntegrationsData.mockReturnValue(fromJS({ '60': {} }))

            renderWithRouter(
                <Provider store={store}>
                    <TicketInfobarContainer {...minProps} />
                </Provider>,
                { path: '/foo/:ticketId?', route: '/foo/123' },
            )

            expect(
                screen.getByText('IntegrationTabContent-magento2'),
            ).toBeInTheDocument()
        })
    })

    describe('WooCommerce tab', () => {
        it('should render IntegrationTabContent when activeTab is WooCommerce and store exists', () => {
            useTicketInfobarNavigationMock.mockReturnValue({
                activeTab: TicketInfobarTab.WooCommerce,
                onChangeTab,
            })
            ;(mockedGetIntegrationsByType as jest.Mock).mockReturnValue(
                () => [],
            )
            mockedGetIntegrationsData.mockReturnValue(fromJS({}))

            const sourcesWithWoo = fromJS({
                ticket: {
                    customer: {
                        ecommerce_data: {
                            'store-uuid': {
                                store: { type: 'woocommerce' },
                            },
                        },
                    },
                },
                customer: {},
            })

            renderWithRouter(
                <Provider store={store}>
                    <TicketInfobarContainer
                        {...minProps}
                        sources={sourcesWithWoo}
                    />
                </Provider>,
                { path: '/foo/:ticketId?', route: '/foo/123' },
            )

            expect(
                screen.getByText('IntegrationTabContent-woocommerce'),
            ).toBeInTheDocument()
        })

        it.each([
            {
                scenario: 'no ecommerce_data key',
                sources: fromJS({
                    ticket: { customer: {} },
                    customer: {},
                }),
            },
            {
                scenario: 'ecommerce_data is empty',
                sources: fromJS({
                    ticket: { customer: { ecommerce_data: {} } },
                    customer: {},
                }),
            },
            {
                scenario: 'store type is not woocommerce',
                sources: fromJS({
                    ticket: {
                        customer: {
                            ecommerce_data: {
                                'store-uuid': {
                                    store: { type: 'shopify' },
                                },
                            },
                        },
                    },
                    customer: {},
                }),
            },
        ])(
            'should not render IntegrationTabContent when $scenario',
            ({ sources }) => {
                useTicketInfobarNavigationMock.mockReturnValue({
                    activeTab: TicketInfobarTab.WooCommerce,
                    onChangeTab,
                })
                ;(mockedGetIntegrationsByType as jest.Mock).mockReturnValue(
                    () => [],
                )
                mockedGetIntegrationsData.mockReturnValue(fromJS({}))

                renderWithRouter(
                    <Provider store={store}>
                        <TicketInfobarContainer
                            {...minProps}
                            sources={sources}
                        />
                    </Provider>,
                    { path: '/foo/:ticketId?', route: '/foo/123' },
                )

                expect(
                    screen.queryByText('IntegrationTabContent-woocommerce'),
                ).not.toBeInTheDocument()
            },
        )

        it('should not render when no woocommerce store exists', () => {
            useTicketInfobarNavigationMock.mockReturnValue({
                activeTab: TicketInfobarTab.WooCommerce,
                onChangeTab,
            })
            ;(mockedGetIntegrationsByType as jest.Mock).mockReturnValue(
                () => [],
            )
            mockedGetIntegrationsData.mockReturnValue(fromJS({}))

            renderWithRouter(
                <Provider store={store}>
                    <TicketInfobarContainer {...minProps} />
                </Provider>,
                { path: '/foo/:ticketId?', route: '/foo/123' },
            )

            expect(
                screen.queryByText('IntegrationTabContent-woocommerce'),
            ).not.toBeInTheDocument()
        })
    })

    describe('Smile tab', () => {
        it('should render IntegrationTabContent when activeTab is Smile and smile integration exists', () => {
            useTicketInfobarNavigationMock.mockReturnValue({
                activeTab: TicketInfobarTab.Smile,
                onChangeTab,
            })
            ;(mockedGetIntegrationsByType as jest.Mock).mockImplementation(
                (type: string) => () => {
                    if (type === 'smile') return [{ id: 70 }]
                    return []
                },
            )
            mockedGetIntegrationsData.mockReturnValue(fromJS({ '70': {} }))

            renderWithRouter(
                <Provider store={store}>
                    <TicketInfobarContainer {...minProps} />
                </Provider>,
                { path: '/foo/:ticketId?', route: '/foo/123' },
            )

            expect(
                screen.getByText('IntegrationTabContent-smile'),
            ).toBeInTheDocument()
        })

        it('should not render when no smile integration matches', () => {
            useTicketInfobarNavigationMock.mockReturnValue({
                activeTab: TicketInfobarTab.Smile,
                onChangeTab,
            })
            ;(mockedGetIntegrationsByType as jest.Mock).mockImplementation(
                () => () => [],
            )
            mockedGetIntegrationsData.mockReturnValue(fromJS({}))

            renderWithRouter(
                <Provider store={store}>
                    <TicketInfobarContainer {...minProps} />
                </Provider>,
                { path: '/foo/:ticketId?', route: '/foo/123' },
            )

            expect(
                screen.queryByText('IntegrationTabContent-smile'),
            ).not.toBeInTheDocument()
        })
    })

    describe('Yotpo tab', () => {
        it('should render IntegrationTabContent when activeTab is Yotpo and yotpo integration exists', () => {
            useTicketInfobarNavigationMock.mockReturnValue({
                activeTab: TicketInfobarTab.Yotpo,
                onChangeTab,
            })
            ;(mockedGetIntegrationsByType as jest.Mock).mockImplementation(
                (type: string) => () => {
                    if (type === 'yotpo') return [{ id: 80 }]
                    return []
                },
            )
            mockedGetIntegrationsData.mockReturnValue(fromJS({ '80': {} }))

            renderWithRouter(
                <Provider store={store}>
                    <TicketInfobarContainer {...minProps} />
                </Provider>,
                { path: '/foo/:ticketId?', route: '/foo/123' },
            )

            expect(
                screen.getByText('IntegrationTabContent-yotpo'),
            ).toBeInTheDocument()
        })

        it('should not render when no yotpo integration matches', () => {
            useTicketInfobarNavigationMock.mockReturnValue({
                activeTab: TicketInfobarTab.Yotpo,
                onChangeTab,
            })
            ;(mockedGetIntegrationsByType as jest.Mock).mockImplementation(
                () => () => [],
            )
            mockedGetIntegrationsData.mockReturnValue(fromJS({}))

            renderWithRouter(
                <Provider store={store}>
                    <TicketInfobarContainer {...minProps} />
                </Provider>,
                { path: '/foo/:ticketId?', route: '/foo/123' },
            )

            expect(
                screen.queryByText('IntegrationTabContent-yotpo'),
            ).not.toBeInTheDocument()
        })
    })
})
