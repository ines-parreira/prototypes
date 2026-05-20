import { assumeMock, renderHook } from '@repo/testing'
import { screen, waitFor } from '@testing-library/react'
import { useLocation } from 'react-router-dom'

import { toast } from '@gorgias/axiom'

import { useUrlNotification } from '../useUrlNotification'

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useLocation: jest.fn(),
}))

jest.mock('@repo/routing', () => ({
    ...jest.requireActual('@repo/routing'),
    history: {
        replace: jest.fn(),
    },
}))

const mockUseLocation = assumeMock(useLocation)

const { history } = require('@repo/routing') as {
    history: { replace: jest.Mock }
}

function mockLocationWith(search: string) {
    mockUseLocation.mockReturnValue({
        search,
        pathname: '/app/settings/billing',
        hash: '',
        state: null,
    })
}

describe('useUrlNotification', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    afterEach(() => {
        toast.dismiss()
    })

    it('should show error toast when notif_type=error and notif_msg are present', async () => {
        mockLocationWith(
            '?notif_type=error&notif_msg=Shopify+store+is+still+in+trial',
        )

        renderHook(() => useUrlNotification())

        await waitFor(() => {
            expect(
                screen.getByRole('status', {
                    name: 'Shopify store is still in trial',
                }),
            ).toHaveAttribute('data-intent', 'destructive')
        })
    })

    it('should default to info toast for unknown notif_type values', async () => {
        mockLocationWith('?notif_type=unknown&notif_msg=Something+happened')

        renderHook(() => useUrlNotification())

        await waitFor(() => {
            expect(
                screen.getByRole('status', { name: 'Something happened' }),
            ).toHaveAttribute('data-intent', 'info')
        })
    })

    it('should not show toast when params are absent', () => {
        mockLocationWith('')

        renderHook(() => useUrlNotification())

        expect(screen.queryByRole('status')).not.toBeInTheDocument()
    })

    it('should clean up notif_type and notif_msg from URL after dispatch', () => {
        mockLocationWith('?notif_type=error&notif_msg=Test+error')

        renderHook(() => useUrlNotification())

        expect(history.replace).toHaveBeenCalledWith({
            pathname: '/app/settings/billing',
            search: '',
        })
    })

    it('should decode double-encoded notif_msg from backend redirects', async () => {
        mockLocationWith(
            '?notif_type=error&notif_msg=We%2Bdetected%2Bthat%2Byou%2Bdon%2527t%2Bhave%2Ban%2Bactive%2BShopify%2Bstore.',
        )

        renderHook(() => useUrlNotification())

        await waitFor(() => {
            expect(
                screen.getByRole('status', {
                    name: "We detected that you don't have an active Shopify store.",
                }),
            ).toHaveAttribute('data-intent', 'destructive')
        })
    })

    it('should preserve other query params during cleanup', () => {
        mockLocationWith(
            '?tab=plans&notif_type=error&notif_msg=Test+error&other=value',
        )

        renderHook(() => useUrlNotification())

        expect(history.replace).toHaveBeenCalledWith({
            pathname: '/app/settings/billing',
            search: '?tab=plans&other=value',
        })
    })
})
