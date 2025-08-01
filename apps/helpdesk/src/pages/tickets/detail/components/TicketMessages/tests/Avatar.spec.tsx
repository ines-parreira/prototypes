import { assumeMock } from '@repo/testing'
import { fireEvent, render, screen } from '@testing-library/react'

import { getCurrentUserId } from 'state/currentUser/selectors'

import { Avatar } from '../Avatar'

jest.mock('hooks/useAppSelector', () => (fn: () => void) => fn())

jest.mock('state/currentUser/selectors', () => ({
    getCurrentUserId: jest.fn(),
}))
const getCurrentUserIdMock = assumeMock(getCurrentUserId)

describe('Avatar', () => {
    beforeEach(() => {
        getCurrentUserIdMock.mockReturnValue(0)
    })

    it('should render an avatar with initials', () => {
        render(<Avatar name="John Doe" />)
        expect(screen.getByText('JD')).toBeInTheDocument()
    })

    it('should render an icon for AI agent', () => {
        render(<Avatar name="AI Agent" isAIAgent />)
        expect(screen.getByText('auto_awesome')).toBeInTheDocument()
    })

    it('should render a tooltip if given', () => {
        const { container } = render(
            <Avatar name="John Doe" tooltip="Beep boop" />,
        )
        const el = container.firstChild!
        fireEvent.focus(el)
        expect(screen.getByText('Beep boop')).toBeInTheDocument()
    })
})
