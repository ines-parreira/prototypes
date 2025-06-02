import { dummyAppData, dummyAppListData } from 'fixtures/apps'
import { IntegrationType } from 'models/integration/constants'
import { useGetApps, useGetAppsByIds } from 'models/integration/queries'
import { useListActionsApps } from 'models/workflows/queries'
import { renderHook } from 'utils/testing/renderHook'

import useApps from '../useApps'

jest.mock('models/integration/queries')
jest.mock('models/workflows/queries')

const mockUseGetApps = jest.mocked(useGetApps)
const mockUseListActionsApps = jest.mocked(useListActionsApps)
const mockUseGetAppsByIds = jest.mocked(useGetAppsByIds)

describe('useApps()', () => {
    beforeEach(() => {
        jest.resetAllMocks()
    })

    it('should return native apps & apps from App store', () => {
        mockUseGetApps.mockReturnValue({
            data: [dummyAppListData],
            isInitialLoading: false,
        } as unknown as ReturnType<typeof useGetApps>)
        mockUseListActionsApps.mockReturnValue({
            data: [],
            isInitialLoading: false,
        } as unknown as ReturnType<typeof useListActionsApps>)
        mockUseGetAppsByIds.mockReturnValue([])

        const { result } = renderHook(() => useApps())

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
                    installed: false,
                },
            ],
            actionsApps: [],
        })
    })

    it('should load missing (unlisted) apps', () => {
        mockUseGetApps.mockReturnValue({
            data: [],
            isInitialLoading: false,
        } as unknown as ReturnType<typeof useGetApps>)
        mockUseListActionsApps.mockReturnValue({
            data: [
                {
                    id: 'someid1',
                    auth_type: 'api-key',
                    auth_settings: {
                        url: 'https://example.com',
                    },
                },
            ],
            isInitialLoading: false,
        } as unknown as ReturnType<typeof useListActionsApps>)
        mockUseGetAppsByIds.mockReturnValue([
            {
                isSuccess: true,
                data: dummyAppData,
            },
        ] as unknown as ReturnType<typeof useGetAppsByIds>)

        const { result } = renderHook(() => useApps())

        expect(mockUseGetAppsByIds).toHaveBeenCalledWith(['someid1'])
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
                    installed: false,
                },
            ],
            actionsApps: [
                {
                    id: 'someid1',
                    auth_type: 'api-key',
                    auth_settings: {
                        url: 'https://example.com',
                    },
                },
            ],
        })
    })

    it('should return only apps from App store', () => {
        mockUseGetApps.mockReturnValue({
            data: [dummyAppListData],
            isInitialLoading: false,
        } as unknown as ReturnType<typeof useGetApps>)
        mockUseListActionsApps.mockReturnValue({
            data: [],
            isInitialLoading: false,
        } as unknown as ReturnType<typeof useListActionsApps>)
        mockUseGetAppsByIds.mockReturnValue([])

        const { result } = renderHook(() => useApps([IntegrationType.App]))

        expect(result.current).toEqual({
            isLoading: false,
            apps: [
                {
                    icon: 'https://ok.com/1.png',
                    id: 'someid',
                    name: 'My test app',
                    type: 'app',
                    installed: false,
                },
            ],
            actionsApps: [],
        })
    })
})
