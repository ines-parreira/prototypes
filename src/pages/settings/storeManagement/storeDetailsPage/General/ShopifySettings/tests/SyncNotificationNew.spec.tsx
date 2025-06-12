import { fireEvent, render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'

import SyncNotification from '../SyncNotificationNew'

jest.mock('hooks/useLocalStorage', () => {
    return jest.fn(() => [false, jest.fn()])
})

const renderWithRouter = (element: React.ReactElement) => {
    return render(element, { wrapper: BrowserRouter })
}

describe('<SyncNotification />', () => {
    const defaultProps = {
        platform: 'Shopify',
        shopName: 'test-store',
        isSyncComplete: false,
    }

    it('should render loading banner when sync is in progress', () => {
        renderWithRouter(<SyncNotification {...defaultProps} />)

        expect(screen.getByText(/Import in progress/)).toBeInTheDocument()
        expect(
            screen.getByText(/We typically sync 3,000 customers an hour/),
        ).toBeInTheDocument()
        expect(screen.getByRole('status')).toBeInTheDocument() // LoadingSpinner
    })

    it('should render success banner when sync is complete', () => {
        renderWithRouter(
            <SyncNotification {...defaultProps} isSyncComplete={true} />,
        )

        expect(screen.getByText(/Import complete/)).toBeInTheDocument()
        expect(
            screen.getByText(/The real-time sync is active/),
        ).toBeInTheDocument()
        expect(
            screen.getByRole('button', { name: 'View Customers' }),
        ).toBeInTheDocument()
    })

    it('should have correct link in view customers button', () => {
        renderWithRouter(
            <SyncNotification {...defaultProps} isSyncComplete={true} />,
        )

        const button = screen.getByRole('button', { name: 'View Customers' })
        const link = button.closest('a')
        expect(link).toHaveAttribute('to', '/app/customers')
    })

    it('should call setBannerClosed when close button is clicked', () => {
        const mockSetBannerClosed = jest.fn()
        const useLocalStorageMock = jest.requireMock('hooks/useLocalStorage')
        useLocalStorageMock.mockImplementation(() => [
            false,
            mockSetBannerClosed,
        ])

        renderWithRouter(
            <SyncNotification {...defaultProps} isSyncComplete={true} />,
        )

        const closeButton = screen.getByRole('button', { name: /close/i })
        fireEvent.click(closeButton)

        expect(mockSetBannerClosed).toHaveBeenCalled()
    })

    it('should not render anything when banner is closed', () => {
        const useLocalStorageMock = jest.requireMock('hooks/useLocalStorage')
        useLocalStorageMock.mockImplementation(() => [true, jest.fn()])

        renderWithRouter(
            <SyncNotification {...defaultProps} isSyncComplete={true} />,
        )

        expect(screen.queryByText(/Import complete/)).not.toBeInTheDocument()
        expect(
            screen.queryByRole('button', { name: 'View Customers' }),
        ).not.toBeInTheDocument()
    })
})
