import type { ComponentProps } from 'react'

import { useFlag } from '@repo/feature-flags'
import { useHelpdeskV2MS1Flag } from '@repo/tickets/feature-flags'
import { render } from '@testing-library/react'
import MockAdapter from 'axios-mock-adapter'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import { MemoryRouter, Route } from 'react-router-dom'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import client from 'models/api/resources'
import useCollisionDetection from 'pages/tickets/detail/components/TicketHeaderWrapper/hooks/useCollisionDetection'

import TicketHeaderWrapper from '../TicketHeaderWrapper'

jest.mock('pages/tickets/detail/components/TicketHeader', () => () => (
    <div>TicketHeader</div>
))
jest.mock(
    'pages/tickets/detail/components/TicketFields/TicketFields',
    () => () => <div>TicketFields</div>,
)

jest.mock(
    'pages/tickets/detail/components/TicketHeaderWrapper/hooks/useCollisionDetection',
)

jest.mock('@repo/feature-flags')
const mockUseFlag = useFlag as jest.Mock

jest.mock('@repo/tickets/feature-flags')
const mockUseHelpdeskV2MS1Flag = useHelpdeskV2MS1Flag as jest.Mock

const mockUseCollisionDetection = useCollisionDetection as jest.Mock

const mockedServer = new MockAdapter(client)
const mockStore = configureMockStore([thunk])

describe('<TicketHeaderWrapper/>', () => {
    const minProps: ComponentProps<typeof TicketHeaderWrapper> = {
        hideTicket: jest.fn(),
        setStatus: jest.fn(),
    }
    const defaultState = {
        currentUser: fromJS({}),
        ticket: fromJS({
            id: 123,
        }),
    }

    const renderWithRouter = (ui: React.ReactElement, ticketId = '123') => {
        return render(
            <MemoryRouter initialEntries={[`/tickets/${ticketId}`]}>
                <Route path="/tickets/:ticketId">{ui}</Route>
            </MemoryRouter>,
        )
    }

    beforeEach(() => {
        mockedServer.reset()
        mockUseFlag.mockReturnValue(false)
        mockUseHelpdeskV2MS1Flag.mockReturnValue(false)
        mockUseCollisionDetection.mockReturnValue({
            agentsViewing: [],
            agentsViewingNotTyping: [],
            agentsTyping: [],
            hasBoth: false,
        })
    })

    it('should render history button, ticket header and separator, and ticket fields', () => {
        const { container } = renderWithRouter(
            <Provider store={mockStore(defaultState)}>
                <TicketHeaderWrapper {...minProps} />
            </Provider>,
        )
        expect(container).toMatchSnapshot()
    })

    it('should hide history button when on a new ticket and not render separator', () => {
        const { container } = renderWithRouter(
            <Provider
                store={mockStore({
                    ...defaultState,
                    ticket: fromJS({}),
                })}
            >
                <TicketHeaderWrapper {...minProps} />
            </Provider>,
            'new',
        )
        expect(container).toMatchSnapshot()
    })

    it('should hide TicketHeader and TicketFields when UIVisionMilestone1 flag is enabled', () => {
        mockUseHelpdeskV2MS1Flag.mockReturnValue(true)

        const { queryByText } = renderWithRouter(
            <Provider store={mockStore(defaultState)}>
                <TicketHeaderWrapper {...minProps} />
            </Provider>,
        )

        expect(queryByText('TicketHeader')).not.toBeInTheDocument()
        expect(queryByText('TicketFields')).not.toBeInTheDocument()
    })
})
