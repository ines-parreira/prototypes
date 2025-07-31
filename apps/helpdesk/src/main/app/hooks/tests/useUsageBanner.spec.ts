import { renderHook } from '@repo/testing'
import { fromJS } from 'immutable'

import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import { handleUsageBanner } from 'state/notifications/actions'

import { useUsageBanner } from '../useUsageBanner'

jest.mock('hooks/useAppDispatch', () => jest.fn())
jest.mock('hooks/useAppSelector', () => jest.fn())
jest.mock('state/notifications/actions', () => ({
    handleUsageBanner: jest.fn(),
}))

const handleUsageBannerMock = handleUsageBanner as jest.Mock
const useAppDispatchMock = useAppDispatch as jest.Mock
const useAppSelectorMock = useAppSelector as jest.Mock

describe('useUsageBanner', () => {
    let dispatch: jest.Mock

    beforeEach(() => {
        jest.restoreAllMocks()

        handleUsageBannerMock.mockReturnValue({ type: 'handle-usage-banner' })

        dispatch = jest.fn()
        useAppDispatchMock.mockReturnValue(dispatch)
    })

    it('should dispatch an action with a notification for the usage banner on mount', () => {
        useAppSelectorMock.mockReturnValue(
            fromJS({
                status: {
                    notification: fromJS({ id: 1 }),
                    status: 'STATUS',
                },
            }),
        )

        renderHook(() => useUsageBanner())

        expect(handleUsageBanner).toHaveBeenCalledWith({
            currentAccountStatus: 'STATUS',
            newAccountStatus: 'STATUS',
            notification: { id: 1 },
        })
        expect(dispatch).toHaveBeenCalledWith({ type: 'handle-usage-banner' })
    })

    it('should dispatch an action without a notification for the usage banner on mount', () => {
        useAppSelectorMock.mockReturnValue(
            fromJS({
                status: {
                    status: 'STATUS',
                },
            }),
        )

        renderHook(() => useUsageBanner())

        expect(handleUsageBanner).toHaveBeenCalledWith({
            currentAccountStatus: 'STATUS',
            newAccountStatus: 'STATUS',
            notification: null,
        })
        expect(dispatch).toHaveBeenCalledWith({ type: 'handle-usage-banner' })
    })
})
