import * as repoNavigation from '@repo/navigation'
import { shortcutManager } from '@repo/utils'
import { act, screen } from '@testing-library/react'
import type { Mock, MockInstance } from 'vitest'

import { render } from '../../tests/render.utils'
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

        const button = screen.getByLabelText('system-bar-collapse')
        expect(button).toBeInTheDocument()
    })

    it('should render the "AI Feedback" tab when the `hasAIFeedback` prop is true', () => {
        render(<TicketInfobarNavigation hasAIFeedback />)

        const button = screen.getByLabelText('ai-agent-feedback')
        expect(button).toBeInTheDocument()
    })

    it('should change to the "Customer" tab when that icon is clicked', async () => {
        const { user } = render(<TicketInfobarNavigation />)

        const button = screen.getByLabelText('customer-info').closest('button')

        await act(() => user.click(button!))

        expect(onChangeTab).toHaveBeenCalledWith(TicketInfobarTab.Customer)
    })

    it('should change to the "AI Feedback" tab when that icon is clicked', async () => {
        const { user } = render(<TicketInfobarNavigation hasAIFeedback />)

        const button = screen
            .getByLabelText('ai-agent-feedback')
            .closest('button')

        await act(() => user.click(button!))

        expect(onChangeTab).toHaveBeenCalledWith(TicketInfobarTab.AIFeedback)
    })

    it('should change to the "Customer" tab when that icon is clicked', async () => {
        const { user } = render(<TicketInfobarNavigation />)

        const button = screen.getByLabelText('star').closest('button')
        await act(() => user.click(button!))

        expect(onChangeTab).toHaveBeenCalledWith(TicketInfobarTab.AutoQA)
    })

    describe('Expand/Collapse button', () => {
        it('should display the expand button when the infobar is collapsed', () => {
            useTicketInfobarNavigationMock.mockReturnValue({
                activeTab: TicketInfobarTab.Customer,
                isExpanded: false,
                onChangeTab,
                onToggle,
            })
            render(<TicketInfobarNavigation />)

            const button = screen.getByLabelText('system-bar-expand')
            expect(button).toBeInTheDocument()
        })

        it('should call onToggle when the toggle button is pressed', async () => {
            const { user } = render(<TicketInfobarNavigation />)

            const button = screen
                .getByLabelText('system-bar-collapse')
                .closest('button')

            await act(() => user.click(button!))

            expect(onToggle).toHaveBeenCalled()
        })

        it('should call onToggle when the "]" shortcut is pressed', async () => {
            render(<TicketInfobarNavigation />)

            await act(() => shortcutManager.trigger(']'))

            expect(onToggle).toHaveBeenCalled()
        })

        it('should display the collapse button when the infobar is expanded', () => {
            render(<TicketInfobarNavigation />)

            const button = screen.getByLabelText('system-bar-collapse')
            expect(button).toBeInTheDocument()
        })
    })
})
