import useAppSelector from 'hooks/useAppSelector'
import { renderHook } from 'utils/testing/renderHook'

import useAlertNotifications from '../useAlertNotifications'

jest.mock('hooks/useAppSelector', () => jest.fn())

const useAppSelectorMock = useAppSelector as jest.Mock

describe('useAlertNotifications', () => {
    beforeEach(() => {
        useAppSelectorMock.mockReturnValue([
            { style: 'alert', id: 1 },
            { style: 'banner', id: 2 },
            { style: 'alert', id: 3 },
            { style: 'banner', id: 4 },
        ])
    })

    it('should return all alert notifications', () => {
        const { result } = renderHook(() => useAlertNotifications())

        expect(result.current).toEqual([
            { style: 'alert', id: 1 },
            { style: 'alert', id: 3 },
        ])
    })
})
