import { assumeMock, renderHook } from '@repo/testing'
import { useLocation } from 'react-router-dom'

import useAppDispatch from 'hooks/useAppDispatch'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'

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

jest.mock('hooks/useAppDispatch')
jest.mock('state/notifications/actions')

const mockUseAppDispatch = assumeMock(useAppDispatch)
const mockUseLocation = assumeMock(useLocation)
const mockNotify = assumeMock(notify)

const { history } = require('@repo/routing') as {
    history: { replace: jest.Mock }
}

describe('useUrlNotification', () => {
    const mockDispatch = jest.fn()
    const mockNotifyThunk = jest.fn().mockResolvedValue(undefined)

    function mockLocationWith(search: string) {
        mockUseLocation.mockReturnValue({
            search,
            pathname: '/app/settings/billing',
            hash: '',
            state: null,
        })
    }

    beforeEach(() => {
        jest.clearAllMocks()
        mockUseAppDispatch.mockReturnValue(mockDispatch)
        mockNotify.mockReturnValue(mockNotifyThunk)
    })

    it('should dispatch error notification when notif_type=error and notif_msg are present', () => {
        mockLocationWith(
            '?notif_type=error&notif_msg=Shopify+store+is+still+in+trial',
        )

        renderHook(() => useUrlNotification())

        expect(mockNotify).toHaveBeenCalledWith({
            message: 'Shopify store is still in trial',
            status: NotificationStatus.Error,
        })
        expect(mockDispatch).toHaveBeenCalledWith(mockNotifyThunk)
    })

    it('should default to info status for unknown notif_type values', () => {
        mockLocationWith('?notif_type=unknown&notif_msg=Something+happened')

        renderHook(() => useUrlNotification())

        expect(mockNotify).toHaveBeenCalledWith({
            message: 'Something happened',
            status: NotificationStatus.Info,
        })
    })

    it('should not dispatch when params are absent', () => {
        mockLocationWith('')

        renderHook(() => useUrlNotification())

        expect(mockNotify).not.toHaveBeenCalled()
        expect(mockDispatch).not.toHaveBeenCalled()
    })

    it('should clean up notif_type and notif_msg from URL after dispatch', () => {
        mockLocationWith('?notif_type=error&notif_msg=Test+error')

        renderHook(() => useUrlNotification())

        expect(history.replace).toHaveBeenCalledWith({
            pathname: '/app/settings/billing',
            search: '',
        })
    })

    it('should decode double-encoded notif_msg from backend redirects', () => {
        mockLocationWith(
            '?notif_type=error&notif_msg=We%2Bdetected%2Bthat%2Byou%2Bdon%2527t%2Bhave%2Ban%2Bactive%2BShopify%2Bstore.',
        )

        renderHook(() => useUrlNotification())

        expect(mockNotify).toHaveBeenCalledWith({
            message: "We detected that you don't have an active Shopify store.",
            status: NotificationStatus.Error,
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
