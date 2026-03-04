import type { ComponentProps, ReactNode } from 'react'

import type { EditShippingAddressModalRenderProps } from '@repo/customer'
import { useFlag } from '@repo/feature-flags'
import { TicketInfobarTab, useTicketInfobarNavigation } from '@repo/navigation'
import { assumeMock, userEvent } from '@repo/testing'
import { useHelpdeskV2MS1Flag } from '@repo/tickets/feature-flags'
import type { QueryObserverResult } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { useGetTicket } from '@gorgias/helpdesk-queries'
import type { HttpError } from '@gorgias/knowledge-service-types'

import { TicketStatus } from 'business/types/ticket'
import { useTicketIsAfterFeedbackCollectionPeriod } from 'common/utils/useIsTicketAfterFeedbackCollectionPeriod'
import { UserRole } from 'config/types/user'
import { ticket } from 'fixtures/ticket'
import { user } from 'fixtures/users'
import { useAiAgentAccess } from 'hooks/aiAgent/useAiAgentAccess'
import { OpportunityType } from 'pages/aiAgent/opportunities/enums'
import { useFindTopOpportunityByTicketId } from 'pages/aiAgent/opportunities/hooks/useFindTopOpportunityByTicketId'
import type { Opportunity } from 'pages/aiAgent/opportunities/types'
import type { Infobar } from 'pages/common/components/infobar/Infobar/Infobar'
import useHasAIAgent from 'pages/tickets/detail/components/TicketFeedback/hooks/useHasAIAgent'
import { getCurrentUser } from 'state/currentUser/selectors'
import { getAIAgentMessages, getIntegrationsData } from 'state/ticket/selectors'
import type { RootState, StoreState } from 'state/types'
import { changeTicketMessage } from 'state/ui/ticketAIAgentFeedback'
import { fetchWidgets, selectContext } from 'state/widgets/actions'
import { renderWithRouter } from 'utils/testing'

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
          onSubmit: () => void
      }
    | undefined

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

jest.mock('pages/tickets/detail/components/TicketFeedback', () => ({
    __esModule: true,
    default: () => <div>TicketFeedback</div>,
    useHasAIAgent: jest.fn(),
}))

jest.mock('auto_qa', () => ({
    AutoQA: () => <div>AutoQA Component</div>,
}))

jest.mock('@repo/customer', () => ({
    ShopifyCustomer: ({ renderEditShippingAddressModal }: any) => {
        mockCapturedRenderEditShippingAddressModal =
            renderEditShippingAddressModal
        return <div>ShopifyCustomer Component</div>
    },
    ShopifyCustomerProvider: ({ children }: { children: ReactNode }) => (
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

jest.mock('Widgets/modules/Shopify/modules/DraftOrderModal', () => ({
    __esModule: true,
    default: () => null,
}))

jest.mock('tickets/ticket-timeline', () => ({
    TimelineContent: () => <div>TimelineContent Component</div>,
}))

jest.mock(
    'pages/common/components/infobar/Infobar/InfobarCustomerInfo/CustomerSyncForm/CustomerSyncForm',
    () => () => <div>CustomerSyncForm Component</div>,
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

jest.mock('@gorgias/axiom', () => ({
    Dot: () => <span aria-label="notification dot" />,
}))

jest.mock(
    'pages/aiAgent/opportunities/hooks/useFindTopOpportunityByTicketId',
    () => ({
        useFindTopOpportunityByTicketId: jest.fn(),
    }),
)

jest.mock('state/integrations/selectors', () => ({
    getIntegrationsByType: () => () => [],
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
const mockedUseFindTopOpportunityByTicketId = assumeMock(
    useFindTopOpportunityByTicketId,
)
const mockedSelectContext = assumeMock(selectContext)
const mockedFetchWidgets = assumeMock(fetchWidgets)
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
        store = mockStore(state)
        store.dispatch = jest.fn()

        useFlagMock.mockReturnValue(false)
        useHelpdeskV2MS1FlagMock.mockReturnValue(false)

        useHasAIAgentMock.mockReturnValue(true)
        getCurrentUserMock.mockReturnValue(
            fromJS({
                id: 2,
                role: { name: UserRole.BasicAgent },
            }),
        )
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
        mockedUseFindTopOpportunityByTicketId.mockReturnValue({
            topOpportunity: null,
            isLoading: false,
            isError: false,
            refetch: jest.fn(),
        })
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

        expect(mockedSelectContext).toHaveBeenCalledWith()
        expect(mockedFetchWidgets).toHaveBeenCalled()
        expect(container.firstChild).toHaveTextContent(
            CUSTOMER_DETAILS_TAB.LABEL,
        )
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

        const customerTab = screen.queryByText(CUSTOMER_DETAILS_TAB.LABEL)
        expect(customerTab).not.toBeInTheDocument()
    })

    it('should show the AI Feedback tab when AI Agent has worked on ticket', () => {
        useAiAgentAccessMock.mockReturnValue({
            hasAccess: false,
            isLoading: false,
        })

        useHasAIAgentMock.mockReturnValue(true)

        renderWithRouter(
            <Provider store={store}>
                <TicketInfobarContainer {...minProps} />
            </Provider>,
            {
                path: '/foo/:ticketId?',
                route: '/foo/new',
            },
        )

        const aiAgentTab = screen.queryByText(AI_FEEDBACK_TAB.LABEL)

        expect(aiAgentTab).toBeInTheDocument()
    })

    it('should not show the AI Feedback tab if AI Agent feature not enabled and AI agent did not work on ticket', () => {
        useAiAgentAccessMock.mockReturnValue({
            hasAccess: false,
            isLoading: false,
        })

        useHasAIAgentMock.mockReturnValue(false)

        renderWithRouter(
            <Provider store={store}>
                <TicketInfobarContainer {...minProps} />
            </Provider>,
            {
                path: '/foo/:ticketId?',
                route: '/foo/new',
            },
        )

        const aiAgentTab = screen.queryByText(AI_FEEDBACK_TAB.LABEL)

        expect(aiAgentTab).not.toBeInTheDocument()
    })

    it('should call onChangeTab when AI Agent tab is clicked', () => {
        const { rerenderComponent } = renderWithRouter(
            <Provider store={store}>
                <TicketInfobarContainer {...minProps} />
            </Provider>,
            {
                path: '/foo/:ticketId?',
                route: '/foo/new',
            },
        )

        const aiAgentTab = screen.getByText(AI_FEEDBACK_TAB.LABEL)
        userEvent.click(aiAgentTab)

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
        const customerTab = screen.getByText(CUSTOMER_DETAILS_TAB.LABEL)
        userEvent.click(customerTab)

        expect(onChangeTab).toHaveBeenCalledWith(TicketInfobarTab.Customer)
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

        const aiAgentTab = screen.getByText(AI_FEEDBACK_TAB.LABEL)
        userEvent.click(aiAgentTab)

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

        const aiAgentTab = screen.getByText(AI_FEEDBACK_TAB.LABEL)
        userEvent.click(aiAgentTab)

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

        const customerInformationTab = screen.getByText(AI_FEEDBACK_TAB.LABEL)

        expect(onChangeTab).toHaveBeenCalledWith(TicketInfobarTab.AIFeedback)
        expect(customerInformationTab).toBeInTheDocument()
    })

    it('should not call changeActive tab when AI Agent tab is clicked and is already active', () => {
        renderWithRouter(
            <Provider store={store}>
                <TicketInfobarContainer {...minProps} />
            </Provider>,
            {
                path: '/foo/:ticketId?',
                route: '/foo/new',
            },
        )

        const customerInformationTab = screen.getByText(
            CUSTOMER_DETAILS_TAB.LABEL,
        )

        userEvent.click(customerInformationTab)

        expect(onChangeTab).not.toHaveBeenCalled()
    })

    it('should render AUTO_QA tab', () => {
        useTicketIsAfterFeedbackCollectionPeriodMock.mockReturnValueOnce(true)

        renderWithRouter(
            <Provider store={store}>
                <TicketInfobarContainer {...minProps} />
            </Provider>,
            {
                path: '/foo/:ticketId?',
                route: '/foo/new',
            },
        )

        const autoQATab = screen.getByText(AUTO_QA_TAB.LABEL)

        expect(autoQATab).toBeInTheDocument()
    })

    it('should call changeActive tab and render AUTO_QA content when AUTO_QA tab is clicked', () => {
        useTicketIsAfterFeedbackCollectionPeriodMock.mockReturnValueOnce(true)

        renderWithRouter(
            <Provider store={store}>
                <TicketInfobarContainer {...minProps} />
            </Provider>,
            {
                path: '/foo/:ticketId?',
                route: '/foo/new',
            },
        )

        const autoQATab = screen.getByText(AUTO_QA_TAB.LABEL)

        userEvent.click(autoQATab)

        expect(onChangeTab).toHaveBeenCalledWith(TicketInfobarTab.AutoQA)
        expect(mockedChangeTicketMessage).toHaveBeenCalled()
    })

    it('should render TicketFeedback when activeTab is AIAgent', () => {
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
                route: '/foo/new',
            },
        )

        expect(screen.getByText('TicketFeedback')).toBeInTheDocument()
    })

    it('should render AUTO_QA content when activeTab is AutoQA and feature flag is enabled', () => {
        useTicketIsAfterFeedbackCollectionPeriodMock.mockReturnValueOnce(true)
        useTicketInfobarNavigationMock.mockReturnValue({
            activeTab: TicketInfobarTab.AutoQA,
            onChangeTab,
        })

        renderWithRouter(
            <Provider store={store}>
                <TicketInfobarContainer {...minProps} />
            </Provider>,
            {
                path: '/foo/:ticketId?',
                route: '/foo/new',
            },
        )

        expect(screen.getByText('AutoQA Component')).toBeInTheDocument()
    })

    it('should render Infobar when activeTab is CustomerInformation', () => {
        renderWithRouter(
            <Provider store={store}>
                <TicketInfobarContainer {...minProps} />
            </Provider>,
            {
                path: '/foo/:ticketId?',
                route: '/foo/new',
            },
        )

        expect(screen.getByText('Infobar')).toBeInTheDocument()
    })
    it('should render ShopifyCustomer component when Shopify tab is active', () => {
        useTicketInfobarNavigationMock.mockReturnValue({
            activeTab: TicketInfobarTab.Shopify,
            onChangeTab,
        })

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
            screen.getByText('ShopifyCustomer Component'),
        ).toBeInTheDocument()
    })

    describe('renderEditShippingAddressModal', () => {
        it('dispatches executeAction, calls onClose and onSuccess with address payload on submit', () => {
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
    })

    it('should render TimelineContent component when Timeline tab is active and shopperId is present', () => {
        useTicketInfobarNavigationMock.mockReturnValue({
            activeTab: TicketInfobarTab.Timeline,
            onChangeTab,
        })

        useGetTicketMock.mockReturnValue({
            data: {
                data: {
                    id: 1,
                    customer: { id: 456 },
                },
            },
        } as any)

        renderWithRouter(
            <Provider store={store}>
                <TicketInfobarContainer {...minProps} />
            </Provider>,
            {
                path: '/foo/:ticketId?',
                route: '/foo/123',
            },
        )

        expect(
            screen.getByText('TimelineContent Component'),
        ).toBeInTheDocument()
    })

    describe('opportunity indicator', () => {
        it('should show indicator on AI Feedback tab when top opportunity exists', () => {
            mockedUseFindTopOpportunityByTicketId.mockReturnValue({
                topOpportunity: {
                    id: '123',
                    type: OpportunityType.FILL_KNOWLEDGE_GAP,
                    resources: [],
                    key: '',
                    insight: '',
                },
                isLoading: false,
                isError: false,
                refetch: function (): Promise<
                    QueryObserverResult<Opportunity[], HttpError<void>>
                > {
                    throw new Error('Function not implemented.')
                },
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

            expect(
                screen.getByLabelText('notification dot'),
            ).toBeInTheDocument()
        })

        it('should not show indicator on AI Feedback tab when no opportunity exists', () => {
            mockedUseFindTopOpportunityByTicketId.mockReturnValue({
                topOpportunity: null,
                isLoading: false,
                isError: false,
                refetch: function (): Promise<
                    QueryObserverResult<Opportunity[], HttpError<void>>
                > {
                    throw new Error('Function not implemented.')
                },
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

            expect(
                screen.queryByLabelText('notification dot'),
            ).not.toBeInTheDocument()
        })
    })
})
