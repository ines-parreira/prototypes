import React from 'react'

import { fireEvent, render, screen } from '@testing-library/react'

import { TotalMessagesSentCard } from './TotalMessagesSentCard'

const mockHistoryPush = jest.fn()
jest.mock('react-router-dom', () => ({
    useHistory: () => ({
        push: mockHistoryPush,
    }),
}))

jest.mock('./TotalMessagesSentCard.less', () => ({
    totalMessagesSentCard: 'totalMessagesSentCard',
    totalMessages: 'totalMessages',
    redirectIcon: 'redirectIcon',
}))

describe('TotalMessagesSentCard', () => {
    beforeEach(() => {
        mockHistoryPush.mockClear()
    })

    it('should renders with total messages in plural sent when value is different than 1', () => {
        render(<TotalMessagesSentCard totalSent="5" />)

        expect(screen.getByText('5 messages sent')).toBeInTheDocument()
        expect(screen.getByText('sms')).toBeInTheDocument()
    })

    it('should renders with total message sent in singular when value is equal 1', () => {
        render(<TotalMessagesSentCard totalSent="1" />)

        expect(screen.getByText('1 message sent')).toBeInTheDocument()
        expect(screen.getByText('sms')).toBeInTheDocument()
    })

    it('shows redirect button when messages and ticketViewId exist', () => {
        render(<TotalMessagesSentCard totalSent="3" ticketViewId="123" />)

        const redirectButton = screen.getByRole('button')
        expect(redirectButton).toBeInTheDocument()
        expect(screen.getByText('arrow_forward')).toBeInTheDocument()
    })

    it('hides redirect button when no messages sent', () => {
        render(<TotalMessagesSentCard totalSent="0" ticketViewId="123" />)

        expect(screen.queryByRole('button')).not.toBeInTheDocument()
    })

    it('hides redirect button when no ticketViewId is received', () => {
        render(<TotalMessagesSentCard totalSent="3" />)

        expect(screen.queryByRole('button')).not.toBeInTheDocument()
    })

    it('hides redirect button when no ticketViewId nor totalSent is received', () => {
        render(<TotalMessagesSentCard />)

        expect(screen.queryByRole('button')).not.toBeInTheDocument()
    })
    it('hides redirect button when no ticketViewId is received', () => {
        render(<TotalMessagesSentCard totalSent="3" />)

        expect(screen.queryByRole('button')).not.toBeInTheDocument()
    })

    it('navigates to correct route when redirect button is clicked', () => {
        const ticketViewId = 'view-123'
        render(
            <TotalMessagesSentCard totalSent="5" ticketViewId={ticketViewId} />,
        )

        const redirectButton = screen.getByRole('button')
        fireEvent.click(redirectButton)

        expect(mockHistoryPush).toHaveBeenCalledWith(
            `/app/views/${ticketViewId}`,
            { skipRedirect: true },
        )
    })
})
