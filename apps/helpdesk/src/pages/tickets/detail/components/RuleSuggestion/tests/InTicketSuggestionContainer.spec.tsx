import { assumeMock } from '@repo/testing'
import { render, screen } from '@testing-library/react'

import { useFlag } from 'core/flags'

import InTicketSuggestionContainer from '../InTicketSuggestionContainer'

jest.mock('core/flags', () => ({ useFlag: jest.fn() }))
const useFlagMock = assumeMock(useFlag)

jest.mock('pages/common/components/Avatar/Avatar', () => () => (
    <div>Avatar</div>
))

jest.mock('pages/tickets/detail/components/TicketMessages/Avatar', () => ({
    Avatar: () => <div>New Avatar</div>,
}))

describe('InTicketSuggestionContainer', () => {
    beforeEach(() => {
        useFlagMock.mockReturnValue(false)
    })

    it('should render an avatar', () => {
        render(<InTicketSuggestionContainer />)
        expect(screen.getByText('Avatar')).toBeInTheDocument()
    })

    it('should render the new avatar if the ticket thread revamp flag is enabled', () => {
        useFlagMock.mockReturnValue(true)
        render(<InTicketSuggestionContainer />)
        expect(screen.getByText('New Avatar')).toBeInTheDocument()
    })
})
