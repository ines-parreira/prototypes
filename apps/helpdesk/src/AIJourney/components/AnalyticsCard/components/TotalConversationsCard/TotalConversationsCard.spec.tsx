import React from 'react'

import { fireEvent, render, screen } from '@testing-library/react'

import { TotalConversationsCard } from './TotalConversationsCard'

const mockHistoryPush = jest.fn()
jest.mock('react-router-dom', () => ({
    useHistory: () => ({
        push: mockHistoryPush,
    }),
}))

describe('TotalConversationsCard', () => {
    beforeEach(() => {
        mockHistoryPush.mockClear()
    })

    it('should renders with total messages in plural sent when value is different than 1', () => {
        render(<TotalConversationsCard totalConversations="5" />)

        expect(screen.getByText('5 total recipients')).toBeInTheDocument()
        expect(screen.getByText('sms')).toBeInTheDocument()
    })

    it('should renders with total message sent in singular when value is equal 1', () => {
        render(<TotalConversationsCard totalConversations="1" />)

        expect(screen.getByText('1 total recipient')).toBeInTheDocument()
        expect(screen.getByText('sms')).toBeInTheDocument()
    })

    it('shows redirect button when messages and ticketViewId exist', () => {
        render(
            <TotalConversationsCard
                totalConversations="3"
                ticketViewId="123"
            />,
        )

        const redirectButton = screen.getByRole('button')
        expect(redirectButton).toBeInTheDocument()
        expect(screen.getByText('arrow_forward')).toBeInTheDocument()
    })

    it('hides redirect button when no messages sent', () => {
        render(
            <TotalConversationsCard
                totalConversations="0"
                ticketViewId="123"
            />,
        )

        expect(screen.queryByRole('button')).not.toBeInTheDocument()
    })

    it('hides redirect button when no ticketViewId is received', () => {
        render(<TotalConversationsCard totalConversations="3" />)

        expect(screen.queryByRole('button')).not.toBeInTheDocument()
    })

    it('hides redirect button when no ticketViewId nor totalSent is received', () => {
        render(<TotalConversationsCard />)

        expect(screen.queryByRole('button')).not.toBeInTheDocument()
    })
    it('hides redirect button when no ticketViewId is received', () => {
        render(<TotalConversationsCard totalConversations="3" />)

        expect(screen.queryByRole('button')).not.toBeInTheDocument()
    })

    it('navigates to correct route when redirect button is clicked', () => {
        const ticketViewId = 'view-123'
        render(
            <TotalConversationsCard
                totalConversations="5"
                ticketViewId={ticketViewId}
            />,
        )

        const redirectButton = screen.getByRole('button')
        fireEvent.click(redirectButton)

        expect(mockHistoryPush).toHaveBeenCalledWith(
            `/app/views/${ticketViewId}`,
            { skipRedirect: true },
        )
    })
})
