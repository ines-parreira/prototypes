import {renderHook} from '@testing-library/react-hooks'

import useAppSelector from 'hooks/useAppSelector'

import useBannerNotifications from '../useBannerNotifications'

jest.mock('hooks/useAppSelector', () => jest.fn())

const useAppSelectorMock = useAppSelector as jest.Mock

describe('useBannerNotifications', () => {
    beforeEach(() => {
        useAppSelectorMock.mockReturnValue([
            {style: 'alert', id: 1},
            {style: 'banner', id: 2},
            {style: 'alert', id: 3},
            {style: 'banner', id: 4},
        ])
    })

    it('should return all banner notifications', () => {
        const {result} = renderHook(() => useBannerNotifications())

        expect(result.current).toEqual([
            {style: 'banner', id: 2},
            {style: 'banner', id: 4},
        ])
    })
})
