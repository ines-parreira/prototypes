import { useHelpdeskV2MS2Flag } from '@repo/feature-flags'
import * as repoNavigation from '@repo/navigation'
import { shortcutManager } from '@repo/utils'
import { act, screen, waitFor } from '@testing-library/react'
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

    it('should render the infobar navigation', async () => {
        render(<NewTicketInfobarNavigation />)

        await waitFor(() => {
            expect(
                screen.getByLabelText('system-bar-collapse'),
            ).toBeInTheDocument()
        })
    })

    it('should render the "Customer" tab', async () => {
        render(<NewTicketInfobarNavigation />)

        await waitFor(() => {
            expect(screen.getByLabelText('customer-info')).toBeInTheDocument()
        })
    })

    it('should change to the "Customer" tab when that icon is clicked', async () => {
        const { user } = render(<NewTicketInfobarNavigation />)

        const button = screen.getByLabelText('customer-info').closest('button')

        await user.click(button!)

        expect(onChangeTab).toHaveBeenCalledWith(TicketInfobarTab.Customer)
    })

    it('should render the "Shopify" tab when `useHelpdeskV2MS2Flag` returns true', async () => {
        mockUseHelpdeskV2MS2Flag.mockReturnValue(true)
        render(<NewTicketInfobarNavigation />)

        await waitFor(() => {
            expect(screen.getByLabelText('app-shopify')).toBeInTheDocument()
        })
    })

    it('should not render the "Shopify" tab when `useHelpdeskV2MS2Flag` returns false', async () => {
        mockUseHelpdeskV2MS2Flag.mockReturnValue(false)
        render(<NewTicketInfobarNavigation />)

        await waitFor(() => {
            expect(
                screen.queryByLabelText('app-shopify'),
            ).not.toBeInTheDocument()
        })
    })

    it('should change to the "Shopify" tab when that icon is clicked', async () => {
        mockUseHelpdeskV2MS2Flag.mockReturnValue(true)
        const { user } = render(<NewTicketInfobarNavigation />)

        const button = screen.getByLabelText('app-shopify').closest('button')

        await user.click(button!)

        expect(onChangeTab).toHaveBeenCalledWith(TicketInfobarTab.Shopify)
    })

    describe('Expand/Collapse button', () => {
        it('should display the expand button when the infobar is collapsed', async () => {
            useTicketInfobarNavigationMock.mockReturnValue({
                activeTab: TicketInfobarTab.Customer,
                isExpanded: false,
                onChangeTab,
                onToggle,
            })
            render(<NewTicketInfobarNavigation />)

            await waitFor(() => {
                expect(
                    screen.getByLabelText('system-bar-expand'),
                ).toBeInTheDocument()
            })
        })

        it('should call onToggle when the toggle button is pressed', async () => {
            const { user } = render(<NewTicketInfobarNavigation />)

            const button = screen
                .getByLabelText('system-bar-collapse')
                .closest('button')

            await user.click(button!)

            expect(onToggle).toHaveBeenCalled()
        })

        it('should call onToggle when the "]" shortcut is pressed', async () => {
            render(<NewTicketInfobarNavigation />)

            await act(() => shortcutManager.trigger(']'))

            expect(onToggle).toHaveBeenCalled()
        })

        it('should display the collapse button when the infobar is expanded', async () => {
            render(<NewTicketInfobarNavigation />)

            await waitFor(() => {
                expect(
                    screen.getByLabelText('system-bar-collapse'),
                ).toBeInTheDocument()
            })
        })
    })
})
