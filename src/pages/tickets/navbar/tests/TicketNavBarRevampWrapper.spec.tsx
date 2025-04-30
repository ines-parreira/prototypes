import { render, screen } from '@testing-library/react'

import { useFlag } from 'core/flags'

import { TicketNavBarRevampWrapper } from '../v2/TicketNavBarRevampWrapper'

// Mock the child components
jest.mock('../TicketNavbar', () => ({
    __esModule: true,
    default: jest.fn(() => <div data-testid="ticket-navbar-v1" />),
}))
jest.mock('../v2/TicketNavbarV2', () => ({
    __esModule: true,
    default: jest.fn(() => <div data-testid="ticket-navbar-v2" />),
}))

// Mock the useFlag hook
jest.mock('core/flags', () => ({
    useFlag: jest.fn(),
}))

const mockUseFlag = useFlag as jest.Mock

describe('TicketNavBarRevampWrapper', () => {
    beforeEach(() => {
        // Reset mocks before each test
        jest.clearAllMocks()
    })

    it('should render TicketNavbar when the RevampNavBarUi flag is false', () => {
        mockUseFlag.mockReturnValue(false)
        render(<TicketNavBarRevampWrapper />)

        expect(screen.getByTestId('ticket-navbar-v1')).toBeInTheDocument()
        expect(screen.queryByTestId('ticket-navbar-v2')).not.toBeInTheDocument()
    })

    it('should render TicketNavbarV2 when the RevampNavBarUi flag is true', () => {
        mockUseFlag.mockReturnValue(true)
        render(<TicketNavBarRevampWrapper />)

        expect(screen.getByTestId('ticket-navbar-v2')).toBeInTheDocument()
        expect(screen.queryByTestId('ticket-navbar-v1')).not.toBeInTheDocument()
    })
})
