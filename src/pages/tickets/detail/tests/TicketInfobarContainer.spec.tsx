import React, {ComponentProps} from 'react'
import {fromJS} from 'immutable'
import configureMockStore from 'redux-mock-store'
import {Provider} from 'react-redux'
import thunk from 'redux-thunk'
import {screen} from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import {useFlag} from 'common/flags'
import {UserRole} from 'config/types/user'
import {selectContext, fetchWidgets} from 'state/widgets/actions'
import {assumeMock, renderWithRouter} from 'utils/testing'
import {RootState, StoreState} from 'state/types'
import {
    changeActiveTab,
    changeTicketMessage,
    getActiveTab,
} from 'state/ui/ticketAIAgentFeedback'
import {TicketAIAgentFeedbackTab} from 'state/ui/ticketAIAgentFeedback/constants'
import {getAIAgentMessages} from 'state/ticket/selectors'
import {user} from 'fixtures/users'
import {ticket} from 'fixtures/ticket'
import {Infobar} from 'pages/common/components/infobar/Infobar/Infobar'
import {useHasAIAgent} from 'pages/tickets/detail/components/TicketFeedback'
import {getCurrentUser} from 'state/currentUser/selectors'
import {
    CUSTOMER_INFORMATION_TAB,
    TICKET_FEEDBACK_TAB,
    TicketInfobarContainer,
} from '../TicketInfobarContainer'
import {TRIAL_MESSAGE_TAG} from '../components/AIAgentFeedbackBar/constants'

jest.mock('pages/tickets/detail/components/TicketFeedback', () => ({
    default: () => <div>TicketFeedback</div>,
    useHasAIAgent: jest.fn(),
}))
const useHasAIAgentMock = useHasAIAgent as jest.Mock

jest.mock('common/flags', () => ({useFlag: jest.fn()}))
const useFlagMock = useFlag as jest.Mock

jest.mock('state/currentUser/selectors')
const getCurrentUserMock = getCurrentUser as unknown as jest.Mock

jest.mock('state/widgets/actions')

jest.mock('state/ui/ticketAIAgentFeedback')
jest.mock(
    'state/ticket/selectors',
    () =>
        ({
            ...jest.requireActual('state/ticket/selectors'),
            getAIAgentMessages: jest.fn(),
        } as Record<string, unknown>)
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
        }: ComponentProps<typeof Infobar>) =>
            (
                <div>
                    <div>Infobar</div>
                    <div>sources: {JSON.stringify(sources)}</div>
                    <div>isRouteEditingWidgets: {isRouteEditingWidgets}</div>
                    <div>identifier: {identifier}</div>
                    <div>customer: {customer}</div>
                    <div>widgets: {JSON.stringify(widgets)}</div>
                    <div>context: {context}</div>
                </div>
            )
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
    addTags: jest.fn(),
    removeTag: jest.fn(),
}))
const store = mockStore(state)
store.dispatch = jest.fn()
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
        getCurrentUserMock.mockReturnValue(
            fromJS({
                id: 2,
                role: {name: UserRole.BasicAgent},
            })
        )
        useFlagMock.mockReturnValue(false)
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
        const {container} = renderWithRouter(
            <Provider store={store}>
                <TicketInfobarContainer {...minProps} />
            </Provider>,
            {
                path: '/foo/:ticketId?',
                route: '/foo/new',
            }
        )

        expect(mockedSelectContext).toHaveBeenCalledWith()
        expect(mockedFetchWidgets).toHaveBeenCalled()
        expect(container.firstChild).toHaveTextContent(CUSTOMER_INFORMATION_TAB)
        expect(container.firstChild).toHaveTextContent('sources: {')
    })

    it('should call changeActive tab when AI Agent tab is clicked', () => {
        renderWithRouter(
            <Provider store={store}>
                <TicketInfobarContainer {...minProps} />
            </Provider>,
            {
                path: '/foo/:ticketId?',
                route: '/foo/new',
            }
        )

        const aiAgentTab = screen.getByText(TICKET_FEEDBACK_TAB)
        userEvent.click(aiAgentTab)

        expect(mockedChangeActiveTab).toHaveBeenCalledWith({
            activeTab: TicketAIAgentFeedbackTab.AIAgent,
        })

        const customerTab = screen.getByText(CUSTOMER_INFORMATION_TAB)
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
            }
        )

        const aiAgentTab = screen.getByText(TICKET_FEEDBACK_TAB)
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
            }
        )

        const aiAgentTab = screen.getByText(TICKET_FEEDBACK_TAB)
        userEvent.click(aiAgentTab)

        expect(mockedChangeActiveTab).toHaveBeenCalledWith({
            activeTab: TicketAIAgentFeedbackTab.AIAgent,
        })

        expect(mockedChangeTicketMessage).toHaveBeenCalledWith({
            message: undefined,
        })
    })

    it('should switch to the Ticket Feedback tab if the user is a team lead and that tab is not yet selected', () => {
        getCurrentUserMock.mockReturnValue(
            fromJS({
                id: 2,
                role: {name: UserRole.Agent},
            })
        )
        mockedGetActiveTab.mockReturnValue(
            TicketAIAgentFeedbackTab.CustomerInformation
        )
        renderWithRouter(
            <Provider store={store}>
                <TicketInfobarContainer {...minProps} />
            </Provider>,
            {
                path: '/foo/:ticketId?',
                route: '/foo/new',
            }
        )

        const customerInformationTab = screen.getByText(
            CUSTOMER_INFORMATION_TAB
        )
        userEvent.click(customerInformationTab)

        expect(mockedChangeActiveTab).toHaveBeenCalledWith({
            activeTab: TicketAIAgentFeedbackTab.AIAgent,
        })
    })

    it('should not call changeActive tab when AI Agent tab is clicked and is already active', () => {
        mockedGetActiveTab.mockReturnValue(
            TicketAIAgentFeedbackTab.CustomerInformation
        )
        renderWithRouter(
            <Provider store={store}>
                <TicketInfobarContainer {...minProps} />
            </Provider>,
            {
                path: '/foo/:ticketId?',
                route: '/foo/new',
            }
        )

        const customerInformationTab = screen.getByText(
            CUSTOMER_INFORMATION_TAB
        )
        userEvent.click(customerInformationTab)

        expect(mockedChangeActiveTab).not.toHaveBeenCalled()
    })

    it('should not render secondary navbar if there is no ticket feedback', () => {
        useHasAIAgentMock.mockReturnValue(false)
        mockedGetAIAgentMessages.mockReturnValue([])

        renderWithRouter(
            <Provider store={store}>
                <TicketInfobarContainer {...minProps} />
            </Provider>,
            {
                path: '/foo/:ticketId?',
                route: '/foo/new',
            }
        )

        expect(screen.queryByText(CUSTOMER_INFORMATION_TAB)).toBeNull()
    })

    it('should not render secondary navbar if all AI messages on trial mode', () => {
        const aiMessage = {
            id: '1',
            created_datetime: dateAfterFeatureAvailable,
            public: true,
            body_html: TRIAL_MESSAGE_TAG,
        } as any

        useHasAIAgentMock.mockReturnValue(false)
        mockedGetAIAgentMessages.mockReturnValue([aiMessage])

        renderWithRouter(
            <Provider store={store}>
                <TicketInfobarContainer {...minProps} />
            </Provider>,
            {
                path: '/foo/:ticketId?',
                route: '/foo/new',
            }
        )

        expect(screen.queryByText(CUSTOMER_INFORMATION_TAB)).toBeNull()
    })
})
