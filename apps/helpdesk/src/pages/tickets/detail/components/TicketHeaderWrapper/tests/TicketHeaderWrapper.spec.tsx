import type { ComponentProps } from 'react'

import client from '@repo/api-resources'
import { useFlag } from '@repo/feature-flags'
import { render } from '@repo/testing'
import { useHelpdeskV2MS1Flag } from '@repo/tickets/feature-flags'
import MockAdapter from 'axios-mock-adapter'
import { fromJS } from 'immutable'

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

    const renderWithRouter = (state: typeof defaultState, ticketId = '123') =>
        render(<TicketHeaderWrapper {...minProps} />, {
            initialEntries: [`/tickets/${ticketId}`],
            path: '/tickets/:ticketId',
            storeState: state,
        })

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
        const { container } = renderWithRouter(defaultState)
        expect(container).toMatchSnapshot()
    })

    it('should hide history button when on a new ticket and not render separator', () => {
        const { container } = renderWithRouter(
            {
                ...defaultState,
                ticket: fromJS({}),
            },
            'new',
        )
        expect(container).toMatchSnapshot()
    })

    it('should hide TicketHeader and TicketFields when Helpdesk V2 MS1 flag is enabled', () => {
        mockUseHelpdeskV2MS1Flag.mockReturnValue(true)

        const { queryByText } = renderWithRouter(defaultState)

        expect(queryByText('TicketHeader')).not.toBeInTheDocument()
        expect(queryByText('TicketFields')).not.toBeInTheDocument()
    })
})
