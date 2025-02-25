import { renderHook } from '@testing-library/react-hooks'

import useAppSelector from 'hooks/useAppSelector'

import useLegacyAlertBanners from '../useLegacyAlertBanners'

jest.mock('hooks/useAppSelector', () => jest.fn())

const useAppSelectorMock = useAppSelector as jest.Mock

describe('useLegacyAlertBanners', () => {
    beforeEach(() => {
        useAppSelectorMock.mockReturnValue([
            { style: 'alert', id: 1 },
            { style: 'banner', id: 2 },
            { style: 'alert', id: 3 },
            { style: 'banner', id: 4 },
        ])
    })

    it('should return all banner notifications', () => {
        const { result } = renderHook(() => useLegacyAlertBanners())

        expect(result.current).toEqual([
            { style: 'banner', id: 2 },
            { style: 'banner', id: 4 },
        ])
    })
})
