import { renderHook } from '@repo/testing'

import { useGetHelpCenterList } from 'models/helpCenter/queries'

import { useFetchFaqHelpCentersData } from '../useFetchFaqHelpCentersData'

jest.mock('models/helpCenter/queries')
const mockUseGetHelpCenterList = useGetHelpCenterList as jest.Mock

describe('useFetchFaqHelpCentersData', () => {
    it.each([true, false, undefined])(
        'sets correct retries value when retries is set to %s',
        (retries) => {
            const enabled = true
            mockUseGetHelpCenterList.mockReturnValue({
                isLoading: true,
                data: undefined,
            })

            renderHook(() =>
                useFetchFaqHelpCentersData({
                    enabled,
                    retries,
                }),
            )

            expect(mockUseGetHelpCenterList).toHaveBeenCalledWith(
                {
                    type: 'faq',
                    per_page: 400,
                },
                {
                    enabled,
                    refetchOnWindowFocus: false,
                    staleTime: 300000,
                    ...(retries === false && { retry: 0 }),
                },
            )
        },
    )
})
