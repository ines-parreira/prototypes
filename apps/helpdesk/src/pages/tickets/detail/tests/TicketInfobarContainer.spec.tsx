import type { ComponentProps, ReactElement, ReactNode } from 'react'

import { useCanAccessAIFeedback } from '@repo/ai-agent'
import { useFlag, useHelpdeskV2MS2Flag } from '@repo/feature-flags'
import { TicketInfobarTab, useTicketInfobarNavigation } from '@repo/navigation'
import { assumeMock, render, userEvent } from '@repo/testing'
import { useHelpdeskV2MS1Flag } from '@repo/tickets/feature-flags'
import { screen } from '@testing-library/react'
import { fromJS, OrderedMap } from 'immutable'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { useGetTicket } from '@gorgias/helpdesk-queries'

import { TicketStatus } from 'business/types/ticket'
import { useTicketIsAfterFeedbackCollectionPeriod } from 'common/utils/useIsTicketAfterFeedbackCollectionPeriod'
import { UserRole } from 'config/types/user'
import { createMockStandaloneAiAccess } from 'fixtures/standaloneAiAccess'
import { ticket } from 'fixtures/ticket'
import { user } from 'fixtures/users'
import { useAiAgentAccess } from 'hooks/aiAgent/useAiAgentAccess'
import type { Infobar } from 'pages/common/components/infobar/Infobar/Infobar'
import useHasAIAgent from 'pages/tickets/detail/components/TicketFeedback/hooks/useHasAIAgent'
import { useStandaloneAiContext as useStandaloneAiAccess } from 'providers/standalone-ai/StandaloneAiContext'
import { getCurrentUser } from 'state/currentUser/selectors'
import { getIntegrationsByType } from 'state/integrations/selectors'
import { getAIAgentMessages, getIntegrationsData } from 'state/ticket/selectors'
import type { RootState, StoreState } from 'state/types'
import { changeTicketMessage } from 'state/ui/ticketAIAgentFeedback'
import { fetchWidgets, selectContext } from 'state/widgets/actions'

import {
    AI_FEEDBACK_TAB,
    AUTO_QA_TAB,
    CUSTOMER_DETAILS_TAB,
    TicketInfobarContainer,
} from '../TicketInfobarContainer'

jest.mock('@repo/navigation', () => ({
    ...jest.requireActual('@repo/navigation'),
    useTicketInfobarNavigation: jest.fn(),
}))
const useTicketInfobarNavigationMock = useTicketInfobarNavigation as jest.Mock

jest.mock('@repo/feature-flags', () => ({
    ...jest.requireActual('@repo/feature-flags'),
    useFlag: jest.fn(),
    useHelpdeskV2MS2Flag: jest.fn(),
}))
const useFlagMock = jest.mocked(useFlag)
const useHelpdeskV2MS2FlagMock = assumeMock(useHelpdeskV2MS2Flag)

jest.mock('@repo/tickets/feature-flags', () => ({
    ...jest.requireActual('@repo/tickets/feature-flags'),
    useHelpdeskV2MS1Flag: jest.fn(),
}))
const useHelpdeskV2MS1FlagMock = assumeMock(useHelpdeskV2MS1Flag)

jest.mock('@gorgias/helpdesk-queries')
const useGetTicketMock = assumeMock(useGetTicket)

jest.mock('@repo/ai-agent', () => ({
    useCanAccessAIFeedback: jest.fn(),
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
    ShopifyCustomer: () => <div>ShopifyCustomer Component</div>,
    ShopifyCustomerProvider: ({ children }: { children?: ReactNode }) => (
        <>{children}</>
    ),
    TemplateResolverProvider: ({ children }: { children?: ReactNode }) => (
        <>{children}</>
    ),
}))

jest.mock(
    'Widgets/modules/Shopify/modules/Order/components/EditOrderShippingAddressModal',
    () => ({
        __esModule: true,
        default: () => null,
    }),
)

jest.mock('state/infobar/actions', () => ({
    executeAction: jest.fn().mockReturnValue({ type: 'MOCK_EXECUTE_ACTION' }),
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

jest.mock('providers/standalone-ai/StandaloneAiContext', () => ({
    useStandaloneAiContext: jest.fn(() => createMockStandaloneAiAccess()),
}))
const useStandaloneAiAccessMock = assumeMock(useStandaloneAiAccess)

jest.mock('common/utils/useIsTicketAfterFeedbackCollectionPeriod')
const useTicketIsAfterFeedbackCollectionPeriodMock = assumeMock(
    useTicketIsAfterFeedbackCollectionPeriod,
)

jest.mock('state/widgets/actions')
const mockedFetchWidgets = assumeMock(fetchWidgets)
const mockedSelectContext = assumeMock(selectContext)

jest.mock('state/ui/ticketAIAgentFeedback')

jest.mock('pages/tickets/detail/IntegrationTabContent', () => ({
    __esModule: true,
    default: ({
        widgetType,
        sourcePaths,
    }: {
        widgetType: string
        sourcePaths: string[][]
    }) => (
        <>
            <div>IntegrationTabContent-{widgetType}</div>
            {sourcePaths.map((path) => (
                <div key={path.join('.')}>
                    IntegrationTabContent-{widgetType}-path-{path.join('.')}
                </div>
            ))}
        </>
    ),
}))

jest.mock('pages/tickets/detail/WooCommerceTabContent', () => ({
    __esModule: true,
    default: () => <div>WooCommerceTabContent</div>,
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

jest.mock('pages/tickets/detail/hooks/useIsIntegrationDisplayable', () => ({
    __esModule: true,
    default: jest.fn(() => false),
}))
const useIsIntegrationDisplayableMock = jest.mocked(
    jest.requireMock('pages/tickets/detail/hooks/useIsIntegrationDisplayable')
        .default,
) as jest.Mock

const mockedGetAIAgentMessages = assumeMock(getAIAgentMessages)
const mockedGetIntegrationsData = assumeMock(getIntegrationsData)
const mockedGetIntegrationsByType = jest.mocked(getIntegrationsByType)
const mockedChangeTicketMessage = assumeMock(changeTicketMessage)

const ticketsStore: Partial<RootState> = {
    currentUser: fromJS(user),
    ticket: fromJS(ticket),
    integrations: fromJS({ integrations: [] }),
}

const mockStore = configureMockStore<Partial<StoreState>>([thunk])
const state: Partial<StoreState> = ticketsStore

jest.mock('state/ticket/actions', () => ({
    addTag: jest.fn(),
    removeTag: jest.fn(),
}))
let store = mockStore(state)

const renderWithStore = (
    ui: ReactElement,
    options?: Parameters<typeof render>[1],
    storeState: Partial<StoreState> = store.getState(),
) => {
    return render(ui, {
        storeState,
        ...options,
    })
}

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
        ;(mockedGetIntegrationsByType as jest.Mock).mockReturnValue(() => [])
        useIsIntegrationDisplayableMock.mockReturnValue(false)
        store = mockStore(state)

        useFlagMock.mockReturnValue(false)
        useHelpdeskV2MS1FlagMock.mockReturnValue(false)
        useHelpdeskV2MS2FlagMock.mockReturnValue(false)
        mockedChangeTicketMessage.mockReturnValue({
            type: 'MOCK_CHANGE_TICKET_MESSAGE',
        } as any)
        mockedFetchWidgets.mockReturnValue({
            type: 'MOCK_FETCH_WIDGETS',
        } as any)
        mockedSelectContext.mockReturnValue({
            type: 'MOCK_SELECT_CONTEXT',
        } as any)

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
        useStandaloneAiAccessMock.mockReturnValue(
            createMockStandaloneAiAccess(),
        )
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
            editingWidgetType: null,
            onChangeTab,
            onSetEditingWidgetType: jest.fn(),
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
        const { container } = renderWithStore(
            <TicketInfobarContainer {...minProps} />,
            { path: '/foo/:ticketId?', initialEntries: ['/foo/new'] },
        )

        expect(container.firstChild).toHaveTextContent(
            CUSTOMER_DETAILS_TAB.LABEL,
        )
        expect(screen.getByText('Infobar')).toBeInTheDocument()
    })

    it('should not render the navbar if the UI Vision MS1 flag is enabled', () => {
        useHelpdeskV2MS1FlagMock.mockReturnValue(true)

        renderWithStore(<TicketInfobarContainer {...minProps} />, {
            path: '/foo/:ticketId?',
            initialEntries: ['/foo/new'],
        })

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

            renderWithStore(<TicketInfobarContainer {...minProps} />, {
                path: '/foo/:ticketId?',
                initialEntries: ['/foo/new'],
            })

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

            renderWithStore(<TicketInfobarContainer {...minProps} />, {
                path: '/foo/:ticketId?',
                initialEntries: ['/foo/new'],
            })

            expect(
                screen.queryByText(AI_FEEDBACK_TAB.LABEL),
            ).not.toBeInTheDocument()
        })

        it('does not show when user cannot access AI feedback', () => {
            useCanAccessAIFeedbackMock.mockReturnValue(false)

            renderWithStore(<TicketInfobarContainer {...minProps} />, {
                path: '/foo/:ticketId?',
                initialEntries: ['/foo/new'],
            })

            expect(
                screen.queryByText(AI_FEEDBACK_TAB.LABEL),
            ).not.toBeInTheDocument()
        })

        it('shows when user can access AI feedback', () => {
            useCanAccessAIFeedbackMock.mockReturnValue(true)

            renderWithStore(<TicketInfobarContainer {...minProps} />, {
                path: '/foo/:ticketId?',
                initialEntries: ['/foo/new'],
            })

            expect(
                screen.queryByText(AI_FEEDBACK_TAB.LABEL),
            ).toBeInTheDocument()
        })

        it('shows AI Feedback before Customer for standalone ai agents', () => {
            useStandaloneAiAccessMock.mockReturnValue(
                createMockStandaloneAiAccess({
                    isStandaloneAiAgent: true,
                }),
            )

            renderWithStore(<TicketInfobarContainer {...minProps} />, {
                path: '/foo/:ticketId?',
                initialEntries: ['/foo/new'],
            })

            const aiFeedbackTab = screen.getByText(AI_FEEDBACK_TAB.LABEL)
            const customerTab = screen.getByText(CUSTOMER_DETAILS_TAB.LABEL)

            expect(
                aiFeedbackTab.compareDocumentPosition(customerTab) &
                    Node.DOCUMENT_POSITION_FOLLOWING,
            ).toBeTruthy()
        })

        it('does not show on edit-widgets route', () => {
            renderWithStore(<TicketInfobarContainer {...minProps} />, {
                path: '/foo/:ticketId?/edit-widgets',
                initialEntries: ['/foo/123/edit-widgets'],
            })

            expect(
                screen.queryByText(AI_FEEDBACK_TAB.LABEL),
            ).not.toBeInTheDocument()
        })
    })

    it('should render TicketFeedback content when AI Agent tab is clicked', () => {
        const { rerender } = renderWithStore(
            <TicketInfobarContainer {...minProps} />,
            { path: '/foo/:ticketId?', initialEntries: ['/foo/new'] },
        )

        userEvent.click(screen.getByText(AI_FEEDBACK_TAB.LABEL))

        expect(onChangeTab).toHaveBeenCalledWith(TicketInfobarTab.AIFeedback)

        useTicketInfobarNavigationMock.mockReturnValue({
            activeTab: TicketInfobarTab.AIFeedback,
            onChangeTab,
        })
        rerender(<TicketInfobarContainer {...minProps} />)

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

        renderWithStore(<TicketInfobarContainer {...minProps} />, {
            path: '/foo/:ticketId?',
            initialEntries: ['/foo/new'],
        })

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

        renderWithStore(<TicketInfobarContainer {...minProps} />, {
            path: '/foo/:ticketId?',
            initialEntries: ['/foo/new'],
        })

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
        getCurrentUserMock.mockReturnValue(
            fromJS({
                id: 2,
                role: { name: UserRole.Agent },
            }),
        )

        renderWithStore(
            <TicketInfobarContainer {...minProps} />,
            {
                path: `/foo/:ticketId?`,
                initialEntries: [
                    `/foo/123/?activeTab=${TicketInfobarTab.AIFeedback}`,
                ],
            },
            customStore.getState(),
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

        renderWithStore(<TicketInfobarContainer {...minProps} />, {
            path: '/foo/:ticketId?',
            initialEntries: ['/foo/123'],
        })

        expect(onChangeTab).toHaveBeenCalledWith(TicketInfobarTab.Customer)
    })

    it('should keep the AI Feedback tab on first render in the new layout when explicitly requested in the URL', () => {
        useHelpdeskV2MS1FlagMock.mockReturnValue(true)
        const customStore = mockStore({
            ...state,
            ticket: fromJS({ ...ticket, status: TicketStatus.Closed }),
        })

        renderWithStore(
            <TicketInfobarContainer {...minProps} />,
            {
                path: '/foo/:ticketId?',
                initialEntries: [
                    `/foo/123/?activeTab=${TicketInfobarTab.AIFeedback}`,
                ],
            },
            customStore.getState(),
        )

        expect(onChangeTab).toHaveBeenCalledWith(TicketInfobarTab.AIFeedback)
    })

    it('should not call onChangeTab when clicking an already active tab', () => {
        renderWithStore(<TicketInfobarContainer {...minProps} />, {
            path: '/foo/:ticketId?',
            initialEntries: ['/foo/new'],
        })

        userEvent.click(screen.getByText(CUSTOMER_DETAILS_TAB.LABEL))

        expect(onChangeTab).not.toHaveBeenCalled()
    })

    it('should render AutoQA content when AutoQA tab is clicked', () => {
        useTicketIsAfterFeedbackCollectionPeriodMock.mockReturnValueOnce(true)
        const { rerender } = renderWithStore(
            <TicketInfobarContainer {...minProps} />,
            { path: '/foo/:ticketId?', initialEntries: ['/foo/new'] },
        )

        userEvent.click(screen.getByText(AUTO_QA_TAB.LABEL))

        expect(onChangeTab).toHaveBeenCalledWith(TicketInfobarTab.AutoQA)

        useTicketIsAfterFeedbackCollectionPeriodMock.mockReturnValueOnce(true)
        useTicketInfobarNavigationMock.mockReturnValue({
            activeTab: TicketInfobarTab.AutoQA,
            onChangeTab,
        })
        rerender(<TicketInfobarContainer {...minProps} />)

        expect(screen.getByText('AutoQA Component')).toBeInTheDocument()
    })

    describe('Timeline side panel', () => {
        it('renders TimelineContent in the side panel when activeTab is Timeline and shopperId is present', async () => {
            useTicketInfobarNavigationMock.mockReturnValue({
                activeTab: TicketInfobarTab.Timeline,
                onChangeTab,
            })
            useGetTicketMock.mockReturnValue({
                data: { data: { id: 1, customer: { id: 456 } } },
            } as any)

            renderWithStore(<TicketInfobarContainer {...minProps} />, {
                path: '/foo/:ticketId?',
                initialEntries: ['/foo/123'],
            })

            expect(
                await screen.findByText('TimelineContent Component'),
            ).toBeInTheDocument()
        })

        it('does not render TimelineContent when activeTab is not Timeline', () => {
            useTicketInfobarNavigationMock.mockReturnValue({
                activeTab: TicketInfobarTab.Customer,
                onChangeTab,
            })
            useGetTicketMock.mockReturnValue({
                data: { data: { id: 1, customer: { id: 456 } } },
            } as any)

            renderWithStore(<TicketInfobarContainer {...minProps} />, {
                path: '/foo/:ticketId?',
                initialEntries: ['/foo/123'],
            })

            expect(
                screen.queryByText('TimelineContent Component'),
            ).not.toBeInTheDocument()
        })

        it('does not render TimelineContent when shopperId is absent', () => {
            useTicketInfobarNavigationMock.mockReturnValue({
                activeTab: TicketInfobarTab.Timeline,
                onChangeTab,
            })
            useGetTicketMock.mockReturnValue({ data: null } as any)

            renderWithStore(<TicketInfobarContainer {...minProps} />, {
                path: '/foo/:ticketId?',
                initialEntries: ['/foo/123'],
            })

            expect(
                screen.queryByText('TimelineContent Component'),
            ).not.toBeInTheDocument()
        })
    })

    describe('Edit mode (MS2)', () => {
        beforeEach(() => {
            useHelpdeskV2MS2FlagMock.mockReturnValue(true)
        })

        it('renders InfobarEditModeHeader when editingWidgetType is set', () => {
            useTicketInfobarNavigationMock.mockReturnValue({
                activeTab: TicketInfobarTab.Shopify,
                editingWidgetType: 'shopify',
                onChangeTab,
                onSetEditingWidgetType: jest.fn(),
            })
            ;(mockedGetIntegrationsByType as jest.Mock).mockImplementation(
                (type: string) => () => {
                    if (type === 'shopify') return [{ id: 1 }]
                    return []
                },
            )
            mockedGetIntegrationsData.mockReturnValue(fromJS({ '1': {} }))

            renderWithStore(<TicketInfobarContainer {...minProps} />, {
                path: '/foo/:ticketId?',
                initialEntries: ['/foo/123'],
            })

            expect(
                screen.getByText('Editing Shopify widget'),
            ).toBeInTheDocument()
        })

        it('does not render InfobarEditModeHeader when editingWidgetType is null', () => {
            useTicketInfobarNavigationMock.mockReturnValue({
                activeTab: TicketInfobarTab.Customer,
                editingWidgetType: null,
                onChangeTab,
                onSetEditingWidgetType: jest.fn(),
            })

            renderWithStore(<TicketInfobarContainer {...minProps} />, {
                path: '/foo/:ticketId?',
                initialEntries: ['/foo/123'],
            })

            expect(
                screen.queryByLabelText('Exit edit mode'),
            ).not.toBeInTheDocument()
        })
    })

    describe('Unified Customer scrollable view (MS2)', () => {
        beforeEach(() => {
            useHelpdeskV2MS2FlagMock.mockReturnValue(true)
            useTicketInfobarNavigationMock.mockReturnValue({
                activeTab: TicketInfobarTab.Customer,
                onChangeTab,
            })
        })

        it('always renders the Customer Infobar section', () => {
            renderWithStore(<TicketInfobarContainer {...minProps} />, {
                path: '/foo/:ticketId?',
                initialEntries: ['/foo/123'],
            })

            expect(screen.getByText('Infobar')).toBeInTheDocument()
        })

        it('renders ShopifyInfobarSection when the customer has Shopify integrations', () => {
            ;(mockedGetIntegrationsByType as jest.Mock).mockImplementation(
                (type: string) => () => {
                    if (type === 'shopify') return [{ id: 1 }]
                    return []
                },
            )

            renderWithStore(<TicketInfobarContainer {...minProps} />, {
                path: '/foo/:ticketId?',
                initialEntries: ['/foo/123'],
            })

            expect(
                screen.getByText('ShopifyCustomer Component'),
            ).toBeInTheDocument()
        })

        it('renders one IntegrationTabContent path per matching integration when the customer has multiple', () => {
            useIsIntegrationDisplayableMock.mockImplementation(
                (type: string) => type === 'recharge',
            )
            ;(mockedGetIntegrationsByType as jest.Mock).mockImplementation(
                (type: string) => () => {
                    if (type === 'recharge') return [{ id: 42 }, { id: 43 }]
                    return []
                },
            )
            mockedGetIntegrationsData.mockReturnValue(
                fromJS({ '42': {}, '43': {} }),
            )

            renderWithStore(<TicketInfobarContainer {...minProps} />, {
                path: '/foo/:ticketId?',
                initialEntries: ['/foo/123'],
            })

            expect(
                screen.getByText(
                    'IntegrationTabContent-recharge-path-ticket.customer.integrations.42',
                ),
            ).toBeInTheDocument()
            expect(
                screen.getByText(
                    'IntegrationTabContent-recharge-path-ticket.customer.integrations.43',
                ),
            ).toBeInTheDocument()
        })

        it('only includes integrations whose id is present in the customer integrations data', () => {
            useIsIntegrationDisplayableMock.mockImplementation(
                (type: string) => type === 'recharge',
            )
            ;(mockedGetIntegrationsByType as jest.Mock).mockImplementation(
                (type: string) => () => {
                    if (type === 'recharge') return [{ id: 42 }, { id: 43 }]
                    return []
                },
            )
            mockedGetIntegrationsData.mockReturnValue(fromJS({ '43': {} }))

            renderWithStore(<TicketInfobarContainer {...minProps} />, {
                path: '/foo/:ticketId?',
                initialEntries: ['/foo/123'],
            })

            expect(
                screen.queryByText(
                    'IntegrationTabContent-recharge-path-ticket.customer.integrations.42',
                ),
            ).not.toBeInTheDocument()
            expect(
                screen.getByText(
                    'IntegrationTabContent-recharge-path-ticket.customer.integrations.43',
                ),
            ).toBeInTheDocument()
        })

        it('orders integrations by customer integrations data order', () => {
            useIsIntegrationDisplayableMock.mockImplementation(
                (type: string) => type === 'smile',
            )
            ;(mockedGetIntegrationsByType as jest.Mock).mockImplementation(
                (type: string) => () => {
                    if (type === 'smile') return [{ id: 70 }, { id: 71 }]
                    return []
                },
            )
            mockedGetIntegrationsData.mockReturnValue(
                OrderedMap([
                    ['71', fromJS({})],
                    ['70', fromJS({})],
                ]),
            )

            renderWithStore(<TicketInfobarContainer {...minProps} />, {
                path: '/foo/:ticketId?',
                initialEntries: ['/foo/123'],
            })

            const pathMatches = screen.getAllByText(
                /IntegrationTabContent-smile-path-/,
            )
            expect(pathMatches.map((el) => el.textContent)).toEqual([
                'IntegrationTabContent-smile-path-ticket.customer.integrations.71',
                'IntegrationTabContent-smile-path-ticket.customer.integrations.70',
            ])
        })

        it('hides every integration section when MS2 flag is off', () => {
            useHelpdeskV2MS2FlagMock.mockReturnValue(false)
            ;(mockedGetIntegrationsByType as jest.Mock).mockImplementation(
                (type: string) => () => {
                    if (type === 'recharge') return [{ id: 11 }]
                    return []
                },
            )
            mockedGetIntegrationsData.mockReturnValue(fromJS({ '11': {} }))

            renderWithStore(<TicketInfobarContainer {...minProps} />, {
                path: '/foo/:ticketId?',
                initialEntries: ['/foo/123'],
            })

            expect(screen.getByText('Infobar')).toBeInTheDocument()
            expect(
                screen.queryByText('IntegrationTabContent-recharge'),
            ).not.toBeInTheDocument()
        })
    })
})
