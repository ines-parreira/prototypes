import { ComponentProps } from 'react'

import { userEvent } from '@repo/testing'
import { screen } from '@testing-library/react'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { TicketStatus } from 'business/types/ticket'
import { useTicketIsAfterFeedbackCollectionPeriod } from 'common/utils/useIsTicketAfterFeedbackCollectionPeriod'
import { UserRole } from 'config/types/user'
import { useFlag } from 'core/flags'
import { ticket } from 'fixtures/ticket'
import { user } from 'fixtures/users'
import { Infobar } from 'pages/common/components/infobar/Infobar/Infobar'
import useHasAIAgent from 'pages/tickets/detail/components/TicketFeedback/hooks/useHasAIAgent'
import { getHasAutomate } from 'state/billing/selectors'
import { getCurrentUser } from 'state/currentUser/selectors'
import { getAIAgentMessages } from 'state/ticket/selectors'
import { RootState, StoreState } from 'state/types'
import {
    changeActiveTab,
    changeTicketMessage,
    getActiveTab,
} from 'state/ui/ticketAIAgentFeedback'
import { TicketAIAgentFeedbackTab } from 'state/ui/ticketAIAgentFeedback/constants'
import { fetchWidgets, selectContext } from 'state/widgets/actions'
import { assumeMock, renderWithRouter } from 'utils/testing'

import {
    AI_FEEDBACK_TAB,
    AI_FEEDBACK_TAB_OLD_LABEL,
    AUTO_QA_TAB,
    CUSTOMER_DETAILS_TAB,
    CUSTOMER_DETAILS_TAB_OLD_LABEL,
    TicketInfobarContainer,
} from '../TicketInfobarContainer'

jest.mock('pages/tickets/detail/components/TicketFeedback', () => ({
    __esModule: true,
    default: () => <div>TicketFeedback</div>,
    useHasAIAgent: jest.fn(),
}))

jest.mock('auto_qa', () => ({
    AutoQA: () => <div>AutoQA Component</div>,
}))

jest.mock('core/flags', () => ({ useFlag: jest.fn() }))
const useFlagMock = useFlag as jest.Mock

jest.mock('state/currentUser/selectors')
const getCurrentUserMock = assumeMock(getCurrentUser)
jest.mock('state/billing/selectors', () => ({ getHasAutomate: jest.fn() }))
const getHasAutomateMock = assumeMock(getHasAutomate)

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
const mockedChangeActiveTab = assumeMock(changeActiveTab)
const mockedChangeTicketMessage = assumeMock(changeTicketMessage)
const mockedGetActiveTab = assumeMock(getActiveTab)

const ticketsStore: Partial<RootState> = {
    currentUser: fromJS(user),
    ticket: fromJS(ticket),
}

const mockStore = configureMockStore([thunk])
const state: Partial<StoreState> = {
    ...ticketsStore,
    ui: {
        ticketAIAgentFeedback: {
            activeTab: TicketAIAgentFeedbackTab.CustomerInformation,
        },
    } as any,
}

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

    beforeEach(() => {
        jest.clearAllMocks()
        store = mockStore(state)
        store.dispatch = jest.fn()

        useHasAIAgentMock.mockReturnValue(true)
        getCurrentUserMock.mockReturnValue(
            fromJS({
                id: 2,
                role: { name: UserRole.BasicAgent },
            }),
        )
        useFlagMock.mockReturnValue(false)
        useTicketIsAfterFeedbackCollectionPeriodMock.mockReturnValue(false)
        getHasAutomateMock.mockReturnValue(true)
        useHasAIAgentMock.mockReturnValue(true)
        mockedGetAIAgentMessages.mockReturnValue([
            {
                id: '1',
                public: true,
                created_datetime: dateAfterFeatureAvailable,
            } as any,
        ])
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

    it('should not show the AI Feedback tab when AI Agent feature not enabled', () => {
        getHasAutomateMock.mockReturnValue(false)

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

    it('should call changeActive tab when AI Agent tab is clicked', () => {
        renderWithRouter(
            <Provider store={store}>
                <TicketInfobarContainer {...minProps} />
            </Provider>,
            {
                path: '/foo/:ticketId?',
                route: '/foo/new',
            },
        )

        const aiAgentTab = screen.getByText(AI_FEEDBACK_TAB_OLD_LABEL)
        userEvent.click(aiAgentTab)

        expect(mockedChangeActiveTab).toHaveBeenCalledWith({
            activeTab: TicketAIAgentFeedbackTab.AIAgent,
        })

        const customerTab = screen.getByText(CUSTOMER_DETAILS_TAB_OLD_LABEL)
        userEvent.click(customerTab)

        expect(mockedChangeActiveTab).toHaveBeenCalledWith({
            activeTab: TicketAIAgentFeedbackTab.CustomerInformation,
        })
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

        const aiAgentTab = screen.getByText(AI_FEEDBACK_TAB_OLD_LABEL)
        userEvent.click(aiAgentTab)

        expect(mockedChangeActiveTab).toHaveBeenCalledWith({
            activeTab: TicketAIAgentFeedbackTab.AIAgent,
        })
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

        const aiAgentTab = screen.getByText(AI_FEEDBACK_TAB_OLD_LABEL)
        userEvent.click(aiAgentTab)

        expect(mockedChangeActiveTab).toHaveBeenCalledWith({
            activeTab: TicketAIAgentFeedbackTab.AIAgent,
        })
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
        mockedGetActiveTab.mockReturnValue(
            TicketAIAgentFeedbackTab.CustomerInformation,
        )

        renderWithRouter(
            <Provider store={customStore}>
                <TicketInfobarContainer {...minProps} />
            </Provider>,
            {
                path: `/foo/:ticketId?`,
                route: `/foo/123/?activeTab=${TicketAIAgentFeedbackTab.AIAgent}`,
            },
        )

        const customerInformationTab = screen.getByText(
            AI_FEEDBACK_TAB_OLD_LABEL,
        )

        expect(mockedChangeActiveTab).toHaveBeenCalledWith({
            activeTab: TicketAIAgentFeedbackTab.AIAgent,
        })
        expect(customerInformationTab).toBeInTheDocument()
    })

    it('should not call changeActive tab when AI Agent tab is clicked and is already active', () => {
        mockedGetActiveTab.mockReturnValue(
            TicketAIAgentFeedbackTab.CustomerInformation,
        )
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
            CUSTOMER_DETAILS_TAB_OLD_LABEL,
        )

        userEvent.click(customerInformationTab)

        expect(mockedChangeActiveTab).not.toHaveBeenCalled()
    })

    it('should not render AUTO_QA tab when SimplifyAiAgentFeedbackCollection is disabled', () => {
        useFlagMock.mockReturnValue(false)
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

        const autoQATab = screen.queryByText(AUTO_QA_TAB.LABEL)

        expect(autoQATab).not.toBeInTheDocument()
    })

    it('should render AUTO_QA tab when SimplifyAiAgentFeedbackCollection is enabled', () => {
        useFlagMock.mockReturnValue(true)
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
        useFlagMock.mockReturnValue(true)
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

        expect(mockedChangeActiveTab).toHaveBeenCalledWith({
            activeTab: TicketAIAgentFeedbackTab.AutoQA,
        })
        expect(mockedChangeTicketMessage).toHaveBeenCalled()
    })

    it('should render TicketFeedback when activeTab is AIAgent', () => {
        mockedGetActiveTab.mockReturnValue(TicketAIAgentFeedbackTab.AIAgent)

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
        useFlagMock.mockReturnValue(true)
        useTicketIsAfterFeedbackCollectionPeriodMock.mockReturnValueOnce(true)
        mockedGetActiveTab.mockReturnValue(TicketAIAgentFeedbackTab.AutoQA)

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

    it('should not render AUTO_QA content when activeTab is AutoQA but feature flag is disabled', () => {
        useFlagMock.mockReturnValue(false)

        mockedGetActiveTab.mockReturnValue(TicketAIAgentFeedbackTab.AutoQA)

        renderWithRouter(
            <Provider store={store}>
                <TicketInfobarContainer {...minProps} />
            </Provider>,
            {
                path: '/foo/:ticketId?',
                route: '/foo/new',
            },
        )
        expect(screen.queryByText('AutoQA Component')).not.toBeInTheDocument()
    })

    it('should render Infobar when activeTab is CustomerInformation', () => {
        mockedGetActiveTab.mockReturnValue(
            TicketAIAgentFeedbackTab.CustomerInformation,
        )

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
})
