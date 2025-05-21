import { useGetPlaygroundExecutions } from 'models/aiAgent/queries'
import { renderHook } from 'utils/testing/renderHook'

import { useFetchAiAgentPlaygroundExecutionsData } from '../useFetchAiAgentPlaygroundExecutionsData'

jest.mock('models/aiAgent/queries')
const mockUseGetPlaygroundExecutions = useGetPlaygroundExecutions as jest.Mock

describe('useFetchAiAgentPlaygroundExecutionsData', () => {
    const accountDomain = 'test-account'
    const storeName = 'test-store'

    it.each([true, false, undefined])(
        'sets correct retries value when retries is set to %s',
        (retries) => {
            const enabled = true

            renderHook(() =>
                useFetchAiAgentPlaygroundExecutionsData({
                    accountDomain,
                    storeName,
                    enabled,
                    retries,
                }),
            )

            expect(mockUseGetPlaygroundExecutions).toHaveBeenCalledWith(
                {
                    accountDomain,
                    storeName,
                },
                {
                    enabled,
                    refetchOnWindowFocus: true,
                    ...(retries === false && { retry: 0 }),
                },
            )
        },
    )
})
