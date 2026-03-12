import { useHelpdeskV2MS2Flag } from '@repo/feature-flags'
import * as repoNavigation from '@repo/navigation'
import { shortcutManager } from '@repo/utils'
import { act, screen } from '@testing-library/react'
import type { Mock, MockInstance } from 'vitest'

import { render } from '../../../tests/render.utils'
import { TicketInfobarNavigation } from '../TicketInfobarNavigation'

vi.mock('@repo/feature-flags', async (importOriginal) => ({
    ...(await importOriginal()),
    useHelpdeskV2MS2Flag: vi.fn(),
}))

const mockUseHelpdeskV2MS2Flag = vi.mocked(useHelpdeskV2MS2Flag)

const { TicketInfobarTab } = repoNavigation

describe('TicketInfobarNavigation', () => {
    let useTicketInfobarNavigationMock: MockInstance
    let onChangeTab: Mock
    let onToggle: Mock

    beforeEach(() => {
        onChangeTab = vi.fn()
        onToggle = vi.fn()
        mockUseHelpdeskV2MS2Flag.mockReturnValue(false)

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

    it('should render the "Shopify" tab when `useHelpdeskV2MS2Flag` returns true', () => {
        mockUseHelpdeskV2MS2Flag.mockReturnValue(true)
        render(<TicketInfobarNavigation />)

        const button = screen.getByLabelText('app-shopify')
        expect(button).toBeInTheDocument()
    })

    it('should not render the "Shopify" tab when `useHelpdeskV2MS2Flag` returns false', () => {
        mockUseHelpdeskV2MS2Flag.mockReturnValue(false)
        render(<TicketInfobarNavigation />)

        const button = screen.queryByLabelText('app-shopify')
        expect(button).not.toBeInTheDocument()
    })

    it('should change to the "Shopify" tab when that icon is clicked', async () => {
        mockUseHelpdeskV2MS2Flag.mockReturnValue(true)
        const { user } = render(<TicketInfobarNavigation />)

        const button = screen.getByLabelText('app-shopify').closest('button')

        await act(() => user.click(button!))

        expect(onChangeTab).toHaveBeenCalledWith(TicketInfobarTab.Shopify)
    })

    it('should render the "Timeline" tab when the `hasTimeline` prop is true', () => {
        render(<TicketInfobarNavigation hasTimeline />)

        const button = screen.getByLabelText('history')
        expect(button).toBeInTheDocument()
    })

    it('should not render the "Timeline" tab when `hasTimeline` is false', () => {
        render(<TicketInfobarNavigation />)

        const button = screen.queryByLabelText('history')
        expect(button).not.toBeInTheDocument()
    })

    it('should change to the "Timeline" tab when that icon is clicked', async () => {
        const { user } = render(<TicketInfobarNavigation hasTimeline />)

        const button = screen.getByLabelText('history').closest('button')

        await act(() => user.click(button!))

        expect(onChangeTab).toHaveBeenCalledWith(TicketInfobarTab.Timeline)
    })

    describe('Tab click when collapsed', () => {
        it('should expand the infobar when a tab icon is clicked while collapsed', async () => {
            useTicketInfobarNavigationMock.mockReturnValue({
                activeTab: TicketInfobarTab.Customer,
                isExpanded: false,
                onChangeTab,
                onToggle,
            })
            const { user } = render(<TicketInfobarNavigation />)

            const button = screen
                .getByLabelText('customer-info')
                .closest('button')
            await act(() => user.click(button!))

            expect(onChangeTab).toHaveBeenCalledWith(TicketInfobarTab.Customer)
            expect(onToggle).toHaveBeenCalled()
        })

        it('should not call onToggle when a tab icon is clicked while already expanded', async () => {
            const { user } = render(<TicketInfobarNavigation />)

            const button = screen
                .getByLabelText('customer-info')
                .closest('button')
            await act(() => user.click(button!))

            expect(onChangeTab).toHaveBeenCalledWith(TicketInfobarTab.Customer)
            expect(onToggle).not.toHaveBeenCalled()
        })
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
