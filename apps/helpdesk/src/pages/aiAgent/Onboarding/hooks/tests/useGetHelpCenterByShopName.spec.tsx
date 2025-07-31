import { renderHook } from '@repo/testing'

import { getHelpCentersResponseFixture } from 'pages/settings/helpCenter/fixtures/getHelpCentersResponse.fixture'
import { useHelpCenterList } from 'pages/settings/helpCenter/hooks/useHelpCenterList'
import { assumeMock } from 'utils/testing'

import { useGetHelpCentersByShopName } from '../useGetHelpCentersByShopName'

jest.mock('pages/settings/helpCenter/hooks/useHelpCenterList')
const mockUseHelpCenterList = assumeMock(useHelpCenterList)

describe('useGetHelpCenterByShopName', () => {
    it('should return an empty array when shop name is empty', () => {
        mockUseHelpCenterList.mockReturnValue({
            isLoading: false,
            helpCenters: [],
            hasMore: false,
            fetchMore: jest.fn(),
        })

        const { result } = renderHook(() => useGetHelpCentersByShopName(''))

        expect(result.current).toStrictEqual({
            isHelpCenterLoading: false,
            helpCenters: [],
        })
    })

    it('should return correct status when knowledge data is found for the shop', () => {
        mockUseHelpCenterList.mockReturnValue({
            isLoading: false,
            helpCenters: getHelpCentersResponseFixture.data,
            hasMore: false,
            fetchMore: jest.fn(),
        })
        const { result } = renderHook(() => useGetHelpCentersByShopName('test'))

        expect(result.current).toStrictEqual({
            isHelpCenterLoading: false,
            helpCenters: getHelpCentersResponseFixture.data,
        })
    })
})
