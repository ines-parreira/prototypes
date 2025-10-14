import { renderHook } from '@repo/testing'
import { useParams } from 'react-router'

import { IntegrationType, StoreIntegration } from 'models/integration/types'
import { getShopNameFromStoreIntegration } from 'models/selfServiceConfiguration/utils'
import useStoreIntegrations from 'pages/automate/common/hooks/useStoreIntegrations'

import { useShopNameResolution } from '../useShopNameResolution'

// Mock react-router
jest.mock('react-router', () => ({
    useParams: jest.fn(),
}))

// Mock the hooks
jest.mock('pages/automate/common/hooks/useStoreIntegrations', () => ({
    __esModule: true,
    default: jest.fn(),
}))
const mockedUseStoreIntegrations = jest.mocked(useStoreIntegrations)

jest.mock('models/selfServiceConfiguration/utils', () => ({
    getShopNameFromStoreIntegration: jest.fn(),
}))
const mockedGetShopNameFromStoreIntegration = jest.mocked(
    getShopNameFromStoreIntegration,
)

const mockUseParams = jest.mocked(useParams)

const mockStoreIntegration = {
    id: 1,
    name: 'Test Store',
    type: IntegrationType.Shopify,
    meta: { shop_name: 'test-store' },
} as unknown as StoreIntegration

describe('useShopNameResolution', () => {
    beforeEach(() => {
        jest.clearAllMocks()

        mockedUseStoreIntegrations.mockReturnValue([mockStoreIntegration])
        mockedGetShopNameFromStoreIntegration.mockReturnValue('test-store')
        mockUseParams.mockReturnValue({})
    })

    it('should return resolved shop name from matching store integration', () => {
        mockUseParams.mockReturnValue({ shopName: 'test-store' })

        const { result } = renderHook(() => useShopNameResolution())

        expect(result.current.resolvedShopName).toBe('test-store')
        expect(result.current.currentStoreIntegration).toBe(
            mockStoreIntegration,
        )
        expect(result.current.storeIntegrations).toEqual([mockStoreIntegration])
    })

    it('should work without providing a shop name parameter', () => {
        mockUseParams.mockReturnValue({})

        const { result } = renderHook(() => useShopNameResolution())

        expect(result.current.resolvedShopName).toBe('test-store')
        expect(result.current.currentStoreIntegration).toBe(
            mockStoreIntegration,
        )
    })

    it('should fallback to first store integration when shop name does not match', () => {
        mockUseParams.mockReturnValue({ shopName: 'non-matching-store' })

        const { result } = renderHook(() => useShopNameResolution())

        expect(result.current.resolvedShopName).toBe('test-store')
        expect(result.current.currentStoreIntegration).toBe(
            mockStoreIntegration,
        )
    })

    it('should return provided shop name when no store integrations are available', () => {
        mockedUseStoreIntegrations.mockReturnValue([])
        mockUseParams.mockReturnValue({ shopName: 'fallback-store' })

        const { result } = renderHook(() => useShopNameResolution())

        expect(result.current.resolvedShopName).toBe('fallback-store')
        expect(result.current.currentStoreIntegration).toBeUndefined()
        expect(result.current.storeIntegrations).toEqual([])
    })

    it('should handle multiple store integrations and find the correct match', () => {
        const secondStoreIntegration = {
            id: 2,
            name: 'Second Store',
            type: IntegrationType.Shopify,
            meta: { shop_name: 'second-store' },
        } as unknown as StoreIntegration

        mockedUseStoreIntegrations.mockReturnValue([
            mockStoreIntegration,
            secondStoreIntegration,
        ])
        mockedGetShopNameFromStoreIntegration
            .mockReturnValueOnce('test-store')
            .mockReturnValueOnce('second-store')
            .mockReturnValueOnce('second-store') // for resolved shop name

        mockUseParams.mockReturnValue({ shopName: 'second-store' })

        const { result } = renderHook(() => useShopNameResolution())

        expect(result.current.currentStoreIntegration).toBe(
            secondStoreIntegration,
        )
        expect(result.current.resolvedShopName).toBe('second-store')
    })

    it('should return empty string when no shop name provided and no store integrations available', () => {
        mockedUseStoreIntegrations.mockReturnValue([])
        mockUseParams.mockReturnValue({})

        const { result } = renderHook(() => useShopNameResolution())

        expect(result.current.resolvedShopName).toBe('')
        expect(result.current.currentStoreIntegration).toBeUndefined()
    })
})
