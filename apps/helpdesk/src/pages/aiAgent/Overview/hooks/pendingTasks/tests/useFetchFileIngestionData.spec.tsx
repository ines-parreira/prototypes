import { renderHook } from '@repo/testing'

import {
    useGetFileIngestion,
    useGetHelpCenterList,
} from 'models/helpCenter/queries'

import { useFetchFileIngestionData } from '../useFetchFileIngestionData'

jest.mock('models/helpCenter/queries')
const mockUseGetHelpCenterList = useGetHelpCenterList as jest.Mock
const mockUseGetFileIngestion = useGetFileIngestion as jest.Mock

describe('useFetchFileIngestionData', () => {
    const storeName = 'test-store'
    const enabled = true

    it.each([true, false, undefined])(
        'sets correct retries value when retries is set to %s',
        (retries) => {
            mockUseGetHelpCenterList.mockReturnValue({
                isLoading: true,
                data: {
                    data: {
                        data: [
                            {
                                id: 'snippet-id',
                            },
                        ],
                    },
                },
            })

            mockUseGetFileIngestion.mockReturnValue({
                data: {
                    data: {
                        id: 'file-ingestion-id',
                    },
                },
                isLoading: false,
                isFetched: true,
            })

            renderHook(() =>
                useFetchFileIngestionData({
                    storeName,
                    enabled,
                    retries,
                }),
            )

            expect(mockUseGetHelpCenterList).toHaveBeenCalledWith(
                {
                    type: 'snippet',
                    per_page: 1,
                    shop_name: storeName,
                },
                {
                    enabled,
                    refetchOnWindowFocus: true,
                    ...(retries === false && { retry: 0 }),
                },
            )
            expect(mockUseGetFileIngestion).toHaveBeenCalledWith(
                {
                    help_center_id: 'snippet-id',
                },
                {
                    enabled: true,
                    refetchOnWindowFocus: true,
                    ...(retries === false && { retry: 0 }),
                },
            )
        },
    )
})
