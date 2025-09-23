import * as repoNavigation from '@repo/navigation'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { Mock, MockInstance } from 'vitest'

import { TicketInfobarNavigation } from '../TicketInfobarNavigation'

const { TicketInfobarTab } = repoNavigation

describe('TicketInfobarNavigation', () => {
    let useTicketInfobarNavigationMock: MockInstance
    let onChangeTab: Mock
    let onToggle: Mock

    beforeEach(() => {
        onChangeTab = vi.fn()
        onToggle = vi.fn()

        useTicketInfobarNavigationMock = vi.spyOn(
            repoNavigation,
            'useTicketInfobarNavigation',
        )
        useTicketInfobarNavigationMock.mockReturnValue({
            activeTab: TicketInfobarTab.Customer,
            isExpanded: true,
            onChangeTab,
            onToggle,
        })
    })

    it('should render the infobar navigation', () => {
        render(<TicketInfobarNavigation />)

        const button = screen.getByLabelText('system-bar-right')
        expect(button).toBeInTheDocument()
    })

    it('should render the "AI Feedback" tab when the `hasAIFeedback` prop is true', () => {
        render(<TicketInfobarNavigation hasAIFeedback />)

        const button = screen.getByLabelText('ai-agent-feedback')
        expect(button).toBeInTheDocument()
    })

    it('should call onToggle when the toggle button is pressed', async () => {
        render(<TicketInfobarNavigation />)

        const button = screen
            .getByLabelText('system-bar-right')
            .closest('button')
        await userEvent.click(button!)

        expect(onToggle).toHaveBeenCalledWith()
    })

    it('should change to the "Customer" tab when that icon is clicked', async () => {
        render(<TicketInfobarNavigation />)

        const button = screen.getByLabelText('customer-info').closest('button')
        await userEvent.click(button!)

        expect(onChangeTab).toHaveBeenCalledWith(TicketInfobarTab.Customer)
    })

    it('should change to the "AI Feedback" tab when that icon is clicked', async () => {
        render(<TicketInfobarNavigation hasAIFeedback />)

        const button = screen
            .getByLabelText('ai-agent-feedback')
            .closest('button')
        await userEvent.click(button!)

        expect(onChangeTab).toHaveBeenCalledWith(TicketInfobarTab.AIFeedback)
    })

    it('should change to the "Customer" tab when that icon is clicked', async () => {
        render(<TicketInfobarNavigation />)

        const button = screen.getByLabelText('star').closest('button')
        await userEvent.click(button!)

        expect(onChangeTab).toHaveBeenCalledWith(TicketInfobarTab.AutoQA)
    })
})
