import { assumeMock, renderHook } from '@repo/testing'

import { useGetSelfServiceConfigurations } from 'models/selfServiceConfiguration/queries'
import type { SelfServiceConfiguration } from 'models/selfServiceConfiguration/types'
import { useIsArticleRecommendationsEnabledWhileSunset } from 'pages/integrations/integration/components/gorgias_chat/legacy/hooks/useIsArticleRecommendationsEnabledWhileSunset'

import { useIsArticleRecommendationTableVisible } from '../useIsArticleRecommendationTableVisible'

jest.mock('models/selfServiceConfiguration/queries', () => ({
    useGetSelfServiceConfigurations: jest.fn(),
}))

jest.mock(
    'pages/integrations/integration/components/gorgias_chat/legacy/hooks/useIsArticleRecommendationsEnabledWhileSunset',
    () => ({
        useIsArticleRecommendationsEnabledWhileSunset: jest.fn(),
    }),
)

const mockUseGetSelfServiceConfigurations = assumeMock(
    useGetSelfServiceConfigurations,
)
const mockUseIsArticleRecommendationsEnabledWhileSunset = assumeMock(
    useIsArticleRecommendationsEnabledWhileSunset,
)

describe('useIsArticleRecommendationTableVisible', () => {
    beforeEach(() => {
        mockUseIsArticleRecommendationsEnabledWhileSunset.mockReturnValue({
            enabledInStatistics: true,
            enabledInSettings: true,
        })
        mockUseGetSelfServiceConfigurations.mockReturnValue({
            data: [],
            isLoading: false,
        } as unknown as ReturnType<typeof useGetSelfServiceConfigurations>)
    })

    it('should return false when article recommendations are not enabled in statistics', () => {
        mockUseIsArticleRecommendationsEnabledWhileSunset.mockReturnValue({
            enabledInStatistics: false,
            enabledInSettings: false,
        })

        const { result } = renderHook(() =>
            useIsArticleRecommendationTableVisible(),
        )

        expect(result.current).toBe(false)
    })

    it('should return true while self-service configurations are loading', () => {
        mockUseGetSelfServiceConfigurations.mockReturnValue({
            data: undefined,
            isLoading: true,
        } as unknown as ReturnType<typeof useGetSelfServiceConfigurations>)

        const { result } = renderHook(() =>
            useIsArticleRecommendationTableVisible(),
        )

        expect(result.current).toBe(true)
    })

    it('should return true when at least one configuration has articleRecommendationHelpCenterId set', () => {
        mockUseGetSelfServiceConfigurations.mockReturnValue({
            data: [
                {
                    articleRecommendationHelpCenterId: null,
                } as SelfServiceConfiguration,
                {
                    articleRecommendationHelpCenterId: 42,
                } as SelfServiceConfiguration,
            ],
            isLoading: false,
        } as unknown as ReturnType<typeof useGetSelfServiceConfigurations>)

        const { result } = renderHook(() =>
            useIsArticleRecommendationTableVisible(),
        )

        expect(result.current).toBe(true)
    })

    it('should return false when no configuration has articleRecommendationHelpCenterId set', () => {
        mockUseGetSelfServiceConfigurations.mockReturnValue({
            data: [
                {
                    articleRecommendationHelpCenterId: null,
                } as SelfServiceConfiguration,
                {
                    articleRecommendationHelpCenterId: null,
                } as SelfServiceConfiguration,
            ],
            isLoading: false,
        } as unknown as ReturnType<typeof useGetSelfServiceConfigurations>)

        const { result } = renderHook(() =>
            useIsArticleRecommendationTableVisible(),
        )

        expect(result.current).toBe(false)
    })

    it('should return false when there are no configurations', () => {
        mockUseGetSelfServiceConfigurations.mockReturnValue({
            data: [],
            isLoading: false,
        } as unknown as ReturnType<typeof useGetSelfServiceConfigurations>)

        const { result } = renderHook(() =>
            useIsArticleRecommendationTableVisible(),
        )

        expect(result.current).toBe(false)
    })

    it('should return false when data is undefined and not loading', () => {
        mockUseGetSelfServiceConfigurations.mockReturnValue({
            data: undefined,
            isLoading: false,
        } as unknown as ReturnType<typeof useGetSelfServiceConfigurations>)

        const { result } = renderHook(() =>
            useIsArticleRecommendationTableVisible(),
        )

        expect(result.current).toBe(false)
    })
})
