import {renderHook} from '@testing-library/react-hooks'

import {useGetApps} from 'models/integration/queries'
import {dummyAppListData} from 'fixtures/apps'

import useApps from '../useApps'

jest.mock('models/integration/queries')

const mockUseGetApps = jest.mocked(useGetApps)

describe('useApps()', () => {
    beforeEach(() => {
        jest.resetAllMocks()
    })

    it('should return native apps & apps from App store', () => {
        mockUseGetApps.mockReturnValue({
            data: [dummyAppListData],
            isInitialLoading: false,
        } as unknown as ReturnType<typeof useGetApps>)

        const {result} = renderHook(() => useApps())

        expect(result.current).toEqual({
            isLoading: false,
            apps: [
                {
                    icon: '/assets/img/integrations/shopify.png',
                    id: 'shopify',
                    name: 'Shopify',
                    type: 'shopify',
                },
                {
                    icon: '/assets/img/integrations/recharge.svg',
                    id: 'recharge',
                    name: 'Recharge',
                    type: 'recharge',
                },
                {
                    icon: 'https://ok.com/1.png',
                    id: 'someid',
                    name: 'My test app',
                    type: 'app',
                },
            ],
        })
    })
})
