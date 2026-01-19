import { renderHook } from '@testing-library/react'

import { MIN_TOTAL_OPPORTUNITIES_THRESHOLD } from 'pages/aiAgent/opportunities/constants'

import { useOpportunitiesCount } from './useOpportunitiesCount'

jest.mock('@repo/feature-flags', () => ({
    FeatureFlagKey: {
        OpportunitiesMilestone2: 'opportunities_milestone_2',
    },
    useFlag: jest.fn(),
}))

jest.mock('./useShopIntegrationId')
jest.mock(
    'pages/settings/helpCenter/components/AIArticlesLibraryView/hooks/useHelpCenterAIArticlesLibrary',
)
jest.mock('pages/aiAgent/opportunities/hooks/useKnowledgeServiceOpportunities')

const mockUseFlag = jest.fn()
const mockUseShopIntegrationId = jest.fn()
const mockUseHelpCenterAIArticlesLibrary = jest.fn()
const mockUseKnowledgeServiceOpportunities = jest.fn()

beforeEach(() => {
    jest.clearAllMocks()

    const featureFlags = require('@repo/feature-flags')
    featureFlags.useFlag = mockUseFlag

    const shopIntegration = require('./useShopIntegrationId')
    shopIntegration.useShopIntegrationId = mockUseShopIntegrationId

    const aiArticlesLibrary = require('pages/settings/helpCenter/components/AIArticlesLibraryView/hooks/useHelpCenterAIArticlesLibrary')
    aiArticlesLibrary.useHelpCenterAIArticlesLibrary =
        mockUseHelpCenterAIArticlesLibrary

    const knowledgeService = require('pages/aiAgent/opportunities/hooks/useKnowledgeServiceOpportunities')
    knowledgeService.useKnowledgeServiceOpportunities =
        mockUseKnowledgeServiceOpportunities

    mockUseShopIntegrationId.mockReturnValue(123)
})

describe('useOpportunitiesCount', () => {
    const defaultParams = {
        helpCenterId: 100,
        locale: 'en-US' as const,
        shopName: 'test-shop',
    }

    describe('when using knowledge service (feature flag enabled)', () => {
        beforeEach(() => {
            mockUseFlag.mockReturnValue(true)
            mockUseHelpCenterAIArticlesLibrary.mockReturnValue({
                articles: [],
                isLoading: false,
            })
        })

        it('returns totalPending as count when above threshold', () => {
            mockUseKnowledgeServiceOpportunities.mockReturnValue({
                totalPending: 10,
                totalCount: 20,
                allowedOpportunityIds: [1, 2, 3],
                isLoading: false,
            })

            const { result } = renderHook(() =>
                useOpportunitiesCount(
                    defaultParams.helpCenterId,
                    defaultParams.locale,
                    defaultParams.shopName,
                ),
            )

            expect(result.current.count).toBe(10)
            expect(result.current.totalCount).toBe(20)
            expect(result.current.isLoading).toBe(false)
        })

        it('returns 0 as count when total is below threshold and allowedOpportunityIds is defined', () => {
            mockUseKnowledgeServiceOpportunities.mockReturnValue({
                totalPending: 5,
                totalCount: MIN_TOTAL_OPPORTUNITIES_THRESHOLD - 1,
                allowedOpportunityIds: [1, 2],
                isLoading: false,
            })

            const { result } = renderHook(() =>
                useOpportunitiesCount(
                    defaultParams.helpCenterId,
                    defaultParams.locale,
                    defaultParams.shopName,
                ),
            )

            expect(result.current.count).toBe(0)
            expect(result.current.totalCount).toBe(
                MIN_TOTAL_OPPORTUNITIES_THRESHOLD - 1,
            )
        })

        it('returns totalPending when total equals threshold', () => {
            mockUseKnowledgeServiceOpportunities.mockReturnValue({
                totalPending: 10,
                totalCount: MIN_TOTAL_OPPORTUNITIES_THRESHOLD,
                allowedOpportunityIds: [1, 2, 3],
                isLoading: false,
            })

            const { result } = renderHook(() =>
                useOpportunitiesCount(
                    defaultParams.helpCenterId,
                    defaultParams.locale,
                    defaultParams.shopName,
                ),
            )

            expect(result.current.count).toBe(10)
        })

        it('returns totalPending when allowedOpportunityIds is undefined (premium user)', () => {
            mockUseKnowledgeServiceOpportunities.mockReturnValue({
                totalPending: 5,
                totalCount: MIN_TOTAL_OPPORTUNITIES_THRESHOLD - 1,
                allowedOpportunityIds: undefined,
                isLoading: false,
            })

            const { result } = renderHook(() =>
                useOpportunitiesCount(
                    defaultParams.helpCenterId,
                    defaultParams.locale,
                    defaultParams.shopName,
                ),
            )

            expect(result.current.count).toBe(5)
        })

        it('returns knowledge service loading state', () => {
            mockUseKnowledgeServiceOpportunities.mockReturnValue({
                totalPending: 0,
                totalCount: 0,
                allowedOpportunityIds: undefined,
                isLoading: true,
            })

            const { result } = renderHook(() =>
                useOpportunitiesCount(
                    defaultParams.helpCenterId,
                    defaultParams.locale,
                    defaultParams.shopName,
                ),
            )

            expect(result.current.isLoading).toBe(true)
        })
    })

    describe('when using legacy AI articles (feature flag disabled)', () => {
        beforeEach(() => {
            mockUseFlag.mockReturnValue(false)
            mockUseKnowledgeServiceOpportunities.mockReturnValue({
                totalPending: 0,
                totalCount: 0,
                allowedOpportunityIds: undefined,
                isLoading: false,
            })
        })

        it('returns AI articles count', () => {
            const mockArticles = [{ id: 1 }, { id: 2 }, { id: 3 }]
            mockUseHelpCenterAIArticlesLibrary.mockReturnValue({
                articles: mockArticles,
                isLoading: false,
            })

            const { result } = renderHook(() =>
                useOpportunitiesCount(
                    defaultParams.helpCenterId,
                    defaultParams.locale,
                    defaultParams.shopName,
                ),
            )

            expect(result.current.count).toBe(3)
            expect(result.current.totalCount).toBe(3)
        })

        it('returns 0 when helpCenterId is 0', () => {
            mockUseHelpCenterAIArticlesLibrary.mockReturnValue({
                articles: [{ id: 1 }],
                isLoading: false,
            })

            const { result } = renderHook(() =>
                useOpportunitiesCount(
                    0,
                    defaultParams.locale,
                    defaultParams.shopName,
                ),
            )

            expect(result.current.count).toBe(0)
        })

        it('returns 0 when articles is null', () => {
            mockUseHelpCenterAIArticlesLibrary.mockReturnValue({
                articles: null,
                isLoading: false,
            })

            const { result } = renderHook(() =>
                useOpportunitiesCount(
                    defaultParams.helpCenterId,
                    defaultParams.locale,
                    defaultParams.shopName,
                ),
            )

            expect(result.current.count).toBe(0)
        })

        it('returns AI articles loading state', () => {
            mockUseHelpCenterAIArticlesLibrary.mockReturnValue({
                articles: [],
                isLoading: true,
            })

            const { result } = renderHook(() =>
                useOpportunitiesCount(
                    defaultParams.helpCenterId,
                    defaultParams.locale,
                    defaultParams.shopName,
                ),
            )

            expect(result.current.isLoading).toBe(true)
        })
    })
})
