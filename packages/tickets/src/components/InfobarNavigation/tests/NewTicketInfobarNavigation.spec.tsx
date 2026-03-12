import { useHelpdeskV2MS2Flag } from '@repo/feature-flags'
import * as repoNavigation from '@repo/navigation'
import { shortcutManager } from '@repo/utils'
import { act, screen } from '@testing-library/react'
import type { Mock, MockInstance } from 'vitest'

import { render } from '../../../tests/render.utils'
import { NewTicketInfobarNavigation } from '../NewTicketInfobarNavigation'

vi.mock('@repo/feature-flags', async (importOriginal) => ({
    ...(await importOriginal()),
    useHelpdeskV2MS2Flag: vi.fn(),
}))

const mockUseHelpdeskV2MS2Flag = vi.mocked(useHelpdeskV2MS2Flag)

const { TicketInfobarTab } = repoNavigation

describe('NewTicketInfobarNavigation', () => {
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
        render(<NewTicketInfobarNavigation />)

        const button = screen.getByLabelText('system-bar-collapse')
        expect(button).toBeInTheDocument()
    })

    it('should render the "Customer" tab', () => {
        render(<NewTicketInfobarNavigation />)

        const button = screen.getByLabelText('customer-info')
        expect(button).toBeInTheDocument()
    })

    it('should change to the "Customer" tab when that icon is clicked', async () => {
        const { user } = render(<NewTicketInfobarNavigation />)

        const button = screen.getByLabelText('customer-info').closest('button')

        await act(() => user.click(button!))

        expect(onChangeTab).toHaveBeenCalledWith(TicketInfobarTab.Customer)
    })

    it('should render the "Shopify" tab when `useHelpdeskV2MS2Flag` returns true', () => {
        mockUseHelpdeskV2MS2Flag.mockReturnValue(true)
        render(<NewTicketInfobarNavigation />)

        const button = screen.getByLabelText('app-shopify')
        expect(button).toBeInTheDocument()
    })

    it('should not render the "Shopify" tab when `useHelpdeskV2MS2Flag` returns false', () => {
        mockUseHelpdeskV2MS2Flag.mockReturnValue(false)
        render(<NewTicketInfobarNavigation />)

        const button = screen.queryByLabelText('app-shopify')
        expect(button).not.toBeInTheDocument()
    })

    it('should change to the "Shopify" tab when that icon is clicked', async () => {
        mockUseHelpdeskV2MS2Flag.mockReturnValue(true)
        const { user } = render(<NewTicketInfobarNavigation />)

        const button = screen.getByLabelText('app-shopify').closest('button')

        await act(() => user.click(button!))

        expect(onChangeTab).toHaveBeenCalledWith(TicketInfobarTab.Shopify)
    })

    describe('Expand/Collapse button', () => {
        it('should display the expand button when the infobar is collapsed', () => {
            useTicketInfobarNavigationMock.mockReturnValue({
                activeTab: TicketInfobarTab.Customer,
                isExpanded: false,
                onChangeTab,
                onToggle,
            })
            render(<NewTicketInfobarNavigation />)

            const button = screen.getByLabelText('system-bar-expand')
            expect(button).toBeInTheDocument()
        })

        it('should call onToggle when the toggle button is pressed', async () => {
            const { user } = render(<NewTicketInfobarNavigation />)

            const button = screen
                .getByLabelText('system-bar-collapse')
                .closest('button')

            await act(() => user.click(button!))

            expect(onToggle).toHaveBeenCalled()
        })

        it('should call onToggle when the "]" shortcut is pressed', async () => {
            render(<NewTicketInfobarNavigation />)

            await act(() => shortcutManager.trigger(']'))

            expect(onToggle).toHaveBeenCalled()
        })

        it('should display the collapse button when the infobar is expanded', () => {
            render(<NewTicketInfobarNavigation />)

            const button = screen.getByLabelText('system-bar-collapse')
            expect(button).toBeInTheDocument()
        })
    })
})
