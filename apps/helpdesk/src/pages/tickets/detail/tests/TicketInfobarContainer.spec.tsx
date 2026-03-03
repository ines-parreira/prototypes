import type { ComponentProps, ReactNode } from 'react'

import type { ShopperData } from '@repo/customer'
import { useFlag } from '@repo/feature-flags'
import { TicketInfobarTab, useTicketInfobarNavigation } from '@repo/navigation'
import { assumeMock, userEvent } from '@repo/testing'
import { useHelpdeskV2MS1Flag } from '@repo/tickets/feature-flags'
import { screen } from '@testing-library/react'
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
import { executeAction } from 'state/infobar/actions'
import { getAIAgentMessages } from 'state/ticket/selectors'
import type { RootState, StoreState } from 'state/types'
import { changeTicketMessage } from 'state/ui/ticketAIAgentFeedback'
import { fetchWidgets, selectContext } from 'state/widgets/actions'
import { renderWithRouter } from 'utils/testing'
import { ShopifyActionType } from 'Widgets/modules/Shopify/types'

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

let capturedOnCreateOrder:
    | ((integrationId: number, shopperData: ShopperData) => void)
    | undefined

jest.mock('@repo/customer', () => ({
    ShopifyCustomer: () => <div>ShopifyCustomer Component</div>,
    ShopifyCustomerProvider: ({
        children,
        onCreateOrder,
    }: {
        children: ReactNode
        onCreateOrder?: (
            integrationId: number,
            shopperData: ShopperData,
        ) => void
    }) => {
        capturedOnCreateOrder = onCreateOrder
        return <>{children}</>
    },
}))

jest.mock('Widgets/modules/Shopify/modules/DraftOrderModal', () => ({
    __esModule: true,
    default: (props: Record<string, any>) =>
        props.isOpen ? (
            <>
                <button onClick={props.onSubmit}>Submit order</button>
                <button onClick={props.onClose}>Close order</button>
            </>
        ) : null,
}))

jest.mock('state/infobar/actions')
const executeActionMock = assumeMock(executeAction)

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
jest.mock(
    'state/ticket/selectors',
    () =>
        ({
            ...jest.requireActual('state/ticket/selectors'),
            getAIAgentMessages: jest.fn(),
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
const mockedSelectContext = assumeMock(selectContext)
const mockedFetchWidgets = assumeMock(fetchWidgets)
const mockedChangeTicketMessage = assumeMock(changeTicketMessage)

const ticketsStore: Partial<RootState> = {
    currentUser: fromJS(user),
    ticket: fromJS(ticket),
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
        capturedOnCreateOrder = undefined
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

    it('should dispatch executeAction with correct payload when create order is submitted', async () => {
        useTicketInfobarNavigationMock.mockReturnValue({
            activeTab: TicketInfobarTab.Shopify,
            onChangeTab,
        })

        executeActionMock.mockReturnValue(jest.fn())

        renderWithRouter(
            <Provider store={store}>
                <TicketInfobarContainer {...minProps} />
            </Provider>,
            {
                path: '/foo/:ticketId?',
                route: '/foo/123',
            },
        )

        const testIntegrationId = 42
        const testShopperData: ShopperData = {
            id: 789,
            first_name: 'Jane',
            last_name: 'Doe',
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z',
            state: 'enabled',
            note: '',
            verified_email: true,
            multipass_identifier: null,
            tax_exempt: false,
            email: 'jane@example.com',
            phone: null,
            currency: 'USD',
            addresses: [],
            tax_exemptions: [],
            admin_graphql_api_id: 'gid://shopify/Customer/789',
            default_address: null,
            tags: '',
        }

        capturedOnCreateOrder?.(testIntegrationId, testShopperData)

        await screen.findByText('Submit order')

        await userEvent.click(screen.getByText('Submit order'))

        expect(executeActionMock).toHaveBeenCalledWith(
            expect.objectContaining({
                actionName: ShopifyActionType.CreateOrder,
                integrationId: testIntegrationId,
                payload: expect.objectContaining({
                    customer_id: testShopperData.id,
                }),
            }),
        )
        expect(executeActionMock).toHaveBeenCalledWith(
            expect.not.objectContaining({
                customerId: expect.anything(),
            }),
        )
    })
})
