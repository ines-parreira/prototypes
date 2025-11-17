import type { ComponentProps } from 'react'

import { render } from '@testing-library/react'
import MockAdapter from 'axios-mock-adapter'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { useFlag } from 'core/flags'
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

jest.mock('core/flags')
const mockUseFlag = useFlag as jest.Mock

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

    beforeEach(() => {
        mockedServer.reset()
        mockUseFlag.mockReturnValue(false)
        mockUseCollisionDetection.mockReturnValue({
            agentsViewing: [],
            agentsViewingNotTyping: [],
            agentsTyping: [],
            hasBoth: false,
        })
    })

    it('should render history button, ticket header and separator, and ticket fields', () => {
        const { container } = render(
            <Provider store={mockStore(defaultState)}>
                <TicketHeaderWrapper {...minProps} />
            </Provider>,
        )
        expect(container).toMatchSnapshot()
    })

    it('should hide history button when on a new ticket and not render separator', () => {
        const { container } = render(
            <Provider
                store={mockStore({
                    ...defaultState,
                    ticket: fromJS({}),
                })}
            >
                <TicketHeaderWrapper {...minProps} />
            </Provider>,
        )
        expect(container).toMatchSnapshot()
    })
})
