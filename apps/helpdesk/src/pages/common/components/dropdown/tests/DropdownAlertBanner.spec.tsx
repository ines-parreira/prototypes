import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import type { AlertBannerData } from '../DropdownAlertBanner'
import DropdownAlertBanner from '../DropdownAlertBanner'

describe('<DropdownAlertBanner />', () => {
    const mockOnClear = jest.fn()

    beforeEach(() => {
        jest.clearAllMocks()
    })

    afterEach(() => {
        jest.clearAllTimers()
    })

    it('should not render anything when data is null', () => {
        const { container } = render(
            <DropdownAlertBanner data={null} onClear={mockOnClear} />,
        )

        expect(container.querySelector('.alertBanner')).not.toBeInTheDocument()
    })

    it('should render banner with message when data is provided', () => {
        const data: AlertBannerData = {
            message: 'Test error message',
            type: 'error',
        }

        render(<DropdownAlertBanner data={data} onClear={mockOnClear} />)

        expect(screen.getByText('Test error message')).toBeInTheDocument()
    })

    it('should handle data changes correctly', () => {
        const initialData: AlertBannerData = {
            message: 'Initial message',
            type: 'info',
        }

        const { rerender } = render(
            <DropdownAlertBanner data={initialData} onClear={mockOnClear} />,
        )

        expect(screen.getByText('Initial message')).toBeInTheDocument()

        const newData: AlertBannerData = {
            message: 'Updated message',
            type: 'success',
        }

        rerender(<DropdownAlertBanner data={newData} onClear={mockOnClear} />)

        expect(screen.queryByText('Initial message')).not.toBeInTheDocument()
        expect(screen.getByText('Updated message')).toBeInTheDocument()
    })

    it('should call onClear when banner is clicked', async () => {
        const user = userEvent.setup()
        const data: AlertBannerData = {
            message: 'Test warning message',
            type: 'warning',
        }

        render(<DropdownAlertBanner data={data} onClear={mockOnClear} />)

        await user.click(screen.getByText('Test warning message'))

        expect(mockOnClear).toHaveBeenCalledTimes(1)
    })

    it('should auto-dismiss after default duration when autoDismiss is true', async () => {
        jest.useFakeTimers()
        const data: AlertBannerData = {
            message: 'Auto dismiss message',
            type: 'info',
        }

        render(
            <DropdownAlertBanner
                data={data}
                onClear={mockOnClear}
                autoDismiss
            />,
        )

        expect(mockOnClear).not.toHaveBeenCalled()

        jest.advanceTimersByTime(5000)

        await waitFor(() => {
            expect(mockOnClear).toHaveBeenCalledTimes(1)
        })
        jest.useRealTimers()
    })

    it('should auto-dismiss after custom duration', async () => {
        jest.useFakeTimers()
        const data: AlertBannerData = {
            message: 'Custom duration message',
            type: 'success',
        }

        render(
            <DropdownAlertBanner
                data={data}
                onClear={mockOnClear}
                autoDismiss
                autoDismissDuration={2000}
            />,
        )

        expect(mockOnClear).not.toHaveBeenCalled()

        jest.advanceTimersByTime(1999)
        expect(mockOnClear).not.toHaveBeenCalled()

        jest.advanceTimersByTime(1)

        await waitFor(() => {
            expect(mockOnClear).toHaveBeenCalledTimes(1)
        })
        jest.useRealTimers()
    })

    it('should not auto-dismiss when autoDismiss is false', () => {
        jest.useFakeTimers()
        const data: AlertBannerData = {
            message: 'Test error message',
            type: 'error',
        }

        render(
            <DropdownAlertBanner
                data={data}
                onClear={mockOnClear}
                autoDismiss={false}
            />,
        )

        jest.advanceTimersByTime(10000)

        expect(mockOnClear).not.toHaveBeenCalled()
        jest.useRealTimers()
    })

    it('should not auto-dismiss when autoDismissDuration is 0', () => {
        jest.useFakeTimers()
        const data: AlertBannerData = {
            message: 'Zero duration',
            type: 'error',
        }

        render(
            <DropdownAlertBanner
                data={data}
                onClear={mockOnClear}
                autoDismiss
                autoDismissDuration={0}
            />,
        )

        jest.advanceTimersByTime(10000)

        expect(mockOnClear).not.toHaveBeenCalled()
        jest.useRealTimers()
    })

    it('should clear timeout when clicking banner before auto-dismiss', async () => {
        const user = userEvent.setup()
        const data: AlertBannerData = {
            message: 'Test warning message',
            type: 'warning',
        }

        render(
            <DropdownAlertBanner
                data={data}
                onClear={mockOnClear}
                autoDismiss
                autoDismissDuration={3000}
            />,
        )

        await user.click(screen.getByText('Test warning message'))

        expect(mockOnClear).toHaveBeenCalledTimes(1)
    })
})
