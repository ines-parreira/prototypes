import { renderHook } from '@testing-library/react'

import type { StoreConfiguration } from 'models/aiAgent/types'
import {
    PostStoreInstallationStepStatus,
    PostStoreInstallationStepType,
} from 'models/aiAgentPostStoreInstallationSteps/types'

import { State, useOpportunityPageState } from './useOpportunityPageState'

jest.mock('pages/aiAgent/providers/AiAgentStoreConfigurationContext')
jest.mock('pages/aiAgent/hooks/useOpportunitiesCount')
jest.mock('pages/aiAgent/utils/store-configuration.utils')
jest.mock('models/aiAgentPostStoreInstallationSteps/queries')

const mockUseAiAgentStoreConfigurationContext = jest.fn()
const mockUseOpportunitiesCount = jest.fn()
const mockIsAiAgentEnabledForStore = jest.fn()
const mockUseGetPostStoreInstallationStepsPure = jest.fn()

beforeEach(() => {
    jest.clearAllMocks()

    const aiAgentContext = require('pages/aiAgent/providers/AiAgentStoreConfigurationContext')
    aiAgentContext.useAiAgentStoreConfigurationContext =
        mockUseAiAgentStoreConfigurationContext

    const opportunitiesCount = require('pages/aiAgent/hooks/useOpportunitiesCount')
    opportunitiesCount.useOpportunitiesCount = mockUseOpportunitiesCount

    const storeConfigUtils = require('pages/aiAgent/utils/store-configuration.utils')
    storeConfigUtils.isAiAgentEnabledForStore = mockIsAiAgentEnabledForStore

    const postStoreQueries = require('models/aiAgentPostStoreInstallationSteps/queries')
    postStoreQueries.useGetPostStoreInstallationStepsPure =
        mockUseGetPostStoreInstallationStepsPure
})

describe('useOpportunityPageState', () => {
    const defaultParams = {
        helpCenterId: 1,
        locale: 'en-US' as const,
        shopName: 'test-shop',
        accountId: 123,
        shopType: 'shopify',
    }

    const createMockStoreConfiguration = (
        overrides?: Partial<StoreConfiguration>,
    ): StoreConfiguration =>
        ({
            storeName: 'test-shop',
            shopType: 'shopify',
            ...overrides,
        }) as StoreConfiguration

    const createMockPostStoreInstallationSteps = (
        completedDatetime: string | null = '2024-01-01T00:00:00Z',
    ) => ({
        postStoreInstallationSteps: [
            {
                id: '1',
                accountId: 123,
                shopName: 'test-shop',
                shopType: 'shopify',
                status: completedDatetime
                    ? PostStoreInstallationStepStatus.COMPLETED
                    : PostStoreInstallationStepStatus.IN_PROGRESS,
                type: PostStoreInstallationStepType.POST_ONBOARDING,
                stepsConfiguration: [],
                notificationsConfiguration: null,
                createdDatetime: '2024-01-01T00:00:00Z',
                updatedDatetime: '2024-01-01T00:00:00Z',
                completedDatetime,
            },
        ],
    })

    describe('LOADING state', () => {
        it('returns LOADING state when store configuration is loading', () => {
            mockUseAiAgentStoreConfigurationContext.mockReturnValue({
                storeConfiguration: undefined,
                isLoading: true,
            })

            mockUseOpportunitiesCount.mockReturnValue({
                count: 0,
                isLoading: false,
            })

            mockUseGetPostStoreInstallationStepsPure.mockReturnValue({
                data: createMockPostStoreInstallationSteps(),
                isLoading: false,
            })

            const { result } = renderHook(() =>
                useOpportunityPageState(defaultParams),
            )

            expect(result.current.state).toBe(State.LOADING)
            expect(result.current.isLoading).toBe(true)
            expect(result.current.media).toBeNull()
            expect(result.current.showEmptyState).toBe(false)
        })

        it('returns LOADING state when opportunities are loading', () => {
            mockUseAiAgentStoreConfigurationContext.mockReturnValue({
                storeConfiguration: createMockStoreConfiguration(),
                isLoading: false,
            })

            mockUseOpportunitiesCount.mockReturnValue({
                count: undefined,
                isLoading: true,
            })

            mockUseGetPostStoreInstallationStepsPure.mockReturnValue({
                data: createMockPostStoreInstallationSteps(),
                isLoading: false,
            })

            const { result } = renderHook(() =>
                useOpportunityPageState(defaultParams),
            )

            expect(result.current.state).toBe(State.LOADING)
            expect(result.current.isLoading).toBe(true)
        })

        it('returns LOADING state when post store steps are loading', () => {
            mockUseAiAgentStoreConfigurationContext.mockReturnValue({
                storeConfiguration: createMockStoreConfiguration(),
                isLoading: false,
            })

            mockUseOpportunitiesCount.mockReturnValue({
                count: 0,
                isLoading: false,
            })

            mockUseGetPostStoreInstallationStepsPure.mockReturnValue({
                data: undefined,
                isLoading: true,
            })

            const { result } = renderHook(() =>
                useOpportunityPageState(defaultParams),
            )

            expect(result.current.state).toBe(State.LOADING)
            expect(result.current.isLoading).toBe(true)
        })

        it('returns LOADING state when all are loading', () => {
            mockUseAiAgentStoreConfigurationContext.mockReturnValue({
                storeConfiguration: undefined,
                isLoading: true,
            })

            mockUseOpportunitiesCount.mockReturnValue({
                count: undefined,
                isLoading: true,
            })

            mockUseGetPostStoreInstallationStepsPure.mockReturnValue({
                data: undefined,
                isLoading: true,
            })

            const { result } = renderHook(() =>
                useOpportunityPageState(defaultParams),
            )

            expect(result.current.state).toBe(State.LOADING)
            expect(result.current.isLoading).toBe(true)
            expect(result.current.title).toBe('')
            expect(result.current.description).toBe('')
            expect(result.current.media).toBeNull()
            expect(result.current.primaryCta).toBeNull()
        })
    })

    describe('HAS_OPPORTUNITIES state', () => {
        it('returns HAS_OPPORTUNITIES when count is greater than 0', () => {
            mockUseAiAgentStoreConfigurationContext.mockReturnValue({
                storeConfiguration: createMockStoreConfiguration(),
                isLoading: false,
            })

            mockUseOpportunitiesCount.mockReturnValue({
                count: 5,
                isLoading: false,
            })

            mockUseGetPostStoreInstallationStepsPure.mockReturnValue({
                data: createMockPostStoreInstallationSteps(),
                isLoading: false,
            })

            const { result } = renderHook(() =>
                useOpportunityPageState(defaultParams),
            )

            expect(result.current.state).toBe(State.HAS_OPPORTUNITIES)
            expect(result.current.isLoading).toBe(false)
            expect(result.current.showEmptyState).toBe(false)
            expect(result.current.title).toBe('')
            expect(result.current.description).toBe('')
            expect(result.current.media).toBeNull()
            expect(result.current.primaryCta).toBeNull()
        })

        it('returns HAS_OPPORTUNITIES even when AI Agent is disabled', () => {
            const storeConfig = createMockStoreConfiguration({
                chatChannelDeactivatedDatetime: '2024-01-01T00:00:00Z',
                emailChannelDeactivatedDatetime: '2024-01-01T00:00:00Z',
            })

            mockUseAiAgentStoreConfigurationContext.mockReturnValue({
                storeConfiguration: storeConfig,
                isLoading: false,
            })

            mockUseOpportunitiesCount.mockReturnValue({
                count: 1,
                isLoading: false,
            })

            mockUseGetPostStoreInstallationStepsPure.mockReturnValue({
                data: createMockPostStoreInstallationSteps(null),
                isLoading: false,
            })

            mockIsAiAgentEnabledForStore.mockReturnValue(false)

            const { result } = renderHook(() =>
                useOpportunityPageState(defaultParams),
            )

            expect(result.current.state).toBe(State.HAS_OPPORTUNITIES)
        })

        it('returns HAS_OPPORTUNITIES even when setup is not complete', () => {
            const storeConfig = createMockStoreConfiguration()

            mockUseAiAgentStoreConfigurationContext.mockReturnValue({
                storeConfiguration: storeConfig,
                isLoading: false,
            })

            mockUseOpportunitiesCount.mockReturnValue({
                count: 1,
                isLoading: false,
            })

            mockUseGetPostStoreInstallationStepsPure.mockReturnValue({
                data: createMockPostStoreInstallationSteps(null),
                isLoading: false,
            })

            const { result } = renderHook(() =>
                useOpportunityPageState(defaultParams),
            )

            expect(result.current.state).toBe(State.HAS_OPPORTUNITIES)
        })
    })

    describe('ENABLED_NO_OPPORTUNITIES state', () => {
        it('returns ENABLED_NO_OPPORTUNITIES when AI Agent is enabled and no opportunities', () => {
            const storeConfig = createMockStoreConfiguration()

            mockUseAiAgentStoreConfigurationContext.mockReturnValue({
                storeConfiguration: storeConfig,
                isLoading: false,
            })

            mockUseOpportunitiesCount.mockReturnValue({
                count: 0,
                isLoading: false,
            })

            mockUseGetPostStoreInstallationStepsPure.mockReturnValue({
                data: createMockPostStoreInstallationSteps(),
                isLoading: false,
            })

            mockIsAiAgentEnabledForStore.mockReturnValue(true)

            const { result } = renderHook(() =>
                useOpportunityPageState(defaultParams),
            )

            expect(result.current.state).toBe(State.ENABLED_NO_OPPORTUNITIES)
            expect(result.current.isLoading).toBe(false)
            expect(result.current.showEmptyState).toBe(true)
            expect(result.current.title).toBe(
                'AI Agent is learning from your conversations',
            )
            expect(result.current.description).toContain(
                "As AI Agent handles more conversations, we'll surface opportunities",
            )
            expect(result.current.media).toBe('test-file-stub')
            expect(result.current.primaryCta).toBeNull()
        })
    })

    describe('DISABLED_NEEDS_ENABLE state', () => {
        it('returns DISABLED_NEEDS_ENABLE when post-onboarding complete but AI Agent disabled', () => {
            const storeConfig = createMockStoreConfiguration()

            mockUseAiAgentStoreConfigurationContext.mockReturnValue({
                storeConfiguration: storeConfig,
                isLoading: false,
            })

            mockUseOpportunitiesCount.mockReturnValue({
                count: 0,
                isLoading: false,
            })

            mockUseGetPostStoreInstallationStepsPure.mockReturnValue({
                data: createMockPostStoreInstallationSteps(
                    '2024-01-01T00:00:00Z',
                ),
                isLoading: false,
            })

            mockIsAiAgentEnabledForStore.mockReturnValue(false)

            const { result } = renderHook(() =>
                useOpportunityPageState(defaultParams),
            )

            expect(result.current.state).toBe(State.DISABLED_NEEDS_ENABLE)
            expect(result.current.isLoading).toBe(false)
            expect(result.current.showEmptyState).toBe(true)
            expect(result.current.title).toBe(
                'Let AI Agent show you what to improve',
            )
            expect(result.current.description).toContain(
                'AI Agent automatically finds opportunities',
            )
            expect(result.current.media).toBe('test-file-stub')
            expect(result.current.primaryCta).toEqual({
                label: 'Enable AI Agent',
                href: '/app/ai-agent/shopify/test-shop/deploy/email',
            })
        })

        it('provides correct CTA for enabling AI Agent', () => {
            const storeConfig = createMockStoreConfiguration()

            mockUseAiAgentStoreConfigurationContext.mockReturnValue({
                storeConfiguration: storeConfig,
                isLoading: false,
            })

            mockUseOpportunitiesCount.mockReturnValue({
                count: 0,
                isLoading: false,
            })

            mockUseGetPostStoreInstallationStepsPure.mockReturnValue({
                data: createMockPostStoreInstallationSteps(
                    '2024-01-01T00:00:00Z',
                ),
                isLoading: false,
            })

            mockIsAiAgentEnabledForStore.mockReturnValue(false)

            const { result } = renderHook(() =>
                useOpportunityPageState(defaultParams),
            )

            expect(result.current.primaryCta?.label).toBe('Enable AI Agent')
            expect(result.current.primaryCta?.href).toBe(
                '/app/ai-agent/shopify/test-shop/deploy/email',
            )
        })
    })

    describe('DISABLED_NEEDS_SETUP state', () => {
        it('returns DISABLED_NEEDS_SETUP when post-onboarding not complete and AI Agent disabled', () => {
            const storeConfig = createMockStoreConfiguration()

            mockUseAiAgentStoreConfigurationContext.mockReturnValue({
                storeConfiguration: storeConfig,
                isLoading: false,
            })

            mockUseOpportunitiesCount.mockReturnValue({
                count: 0,
                isLoading: false,
            })

            mockUseGetPostStoreInstallationStepsPure.mockReturnValue({
                data: createMockPostStoreInstallationSteps(null),
                isLoading: false,
            })

            mockIsAiAgentEnabledForStore.mockReturnValue(false)

            const { result } = renderHook(() =>
                useOpportunityPageState(defaultParams),
            )

            expect(result.current.state).toBe(State.DISABLED_NEEDS_SETUP)
            expect(result.current.isLoading).toBe(false)
            expect(result.current.showEmptyState).toBe(true)
            expect(result.current.title).toBe(
                'Let AI Agent show you what to improve',
            )
            expect(result.current.description).toContain(
                'AI Agent automatically finds opportunities',
            )
            expect(result.current.media).toBe('test-file-stub')
            expect(result.current.primaryCta).toEqual({
                label: 'Complete AI Agent setup',
                href: '/app/ai-agent/shopify/test-shop/overview',
            })
        })

        it('returns DISABLED_NEEDS_SETUP when post-onboarding steps not found', () => {
            const storeConfig = createMockStoreConfiguration()

            mockUseAiAgentStoreConfigurationContext.mockReturnValue({
                storeConfiguration: storeConfig,
                isLoading: false,
            })

            mockUseOpportunitiesCount.mockReturnValue({
                count: 0,
                isLoading: false,
            })

            mockUseGetPostStoreInstallationStepsPure.mockReturnValue({
                data: { postStoreInstallationSteps: [] },
                isLoading: false,
            })

            mockIsAiAgentEnabledForStore.mockReturnValue(false)

            const { result } = renderHook(() =>
                useOpportunityPageState(defaultParams),
            )

            expect(result.current.state).toBe(State.DISABLED_NEEDS_SETUP)
        })

        it('provides correct CTA for completing setup', () => {
            const storeConfig = createMockStoreConfiguration()

            mockUseAiAgentStoreConfigurationContext.mockReturnValue({
                storeConfiguration: storeConfig,
                isLoading: false,
            })

            mockUseOpportunitiesCount.mockReturnValue({
                count: 0,
                isLoading: false,
            })

            mockUseGetPostStoreInstallationStepsPure.mockReturnValue({
                data: createMockPostStoreInstallationSteps(null),
                isLoading: false,
            })

            mockIsAiAgentEnabledForStore.mockReturnValue(false)

            const { result } = renderHook(() =>
                useOpportunityPageState(defaultParams),
            )

            expect(result.current.primaryCta?.label).toBe(
                'Complete AI Agent setup',
            )
            expect(result.current.primaryCta?.href).toBe(
                '/app/ai-agent/shopify/test-shop/overview',
            )
        })
    })

    describe('edge cases', () => {
        it('handles undefined storeConfiguration gracefully', () => {
            mockUseAiAgentStoreConfigurationContext.mockReturnValue({
                storeConfiguration: undefined,
                isLoading: false,
            })

            mockUseOpportunitiesCount.mockReturnValue({
                count: 0,
                isLoading: false,
            })

            mockUseGetPostStoreInstallationStepsPure.mockReturnValue({
                data: createMockPostStoreInstallationSteps(null),
                isLoading: false,
            })

            mockIsAiAgentEnabledForStore.mockReturnValue(false)

            const { result } = renderHook(() =>
                useOpportunityPageState(defaultParams),
            )

            expect(result.current.state).toBe(State.DISABLED_NEEDS_SETUP)
        })

        it('handles undefined count by falling back to 0', () => {
            mockUseAiAgentStoreConfigurationContext.mockReturnValue({
                storeConfiguration: createMockStoreConfiguration(),
                isLoading: false,
            })

            mockUseOpportunitiesCount.mockReturnValue({
                count: undefined,
                isLoading: false,
            })

            mockUseGetPostStoreInstallationStepsPure.mockReturnValue({
                data: createMockPostStoreInstallationSteps(),
                isLoading: false,
            })

            mockIsAiAgentEnabledForStore.mockReturnValue(true)

            const { result } = renderHook(() =>
                useOpportunityPageState(defaultParams),
            )

            expect(result.current.state).toBe(State.ENABLED_NO_OPPORTUNITIES)
        })

        it('prioritizes opportunities existence over all other conditions', () => {
            const storeConfig = createMockStoreConfiguration()

            mockUseAiAgentStoreConfigurationContext.mockReturnValue({
                storeConfiguration: storeConfig,
                isLoading: false,
            })

            mockUseOpportunitiesCount.mockReturnValue({
                count: 1,
                isLoading: false,
            })

            mockUseGetPostStoreInstallationStepsPure.mockReturnValue({
                data: createMockPostStoreInstallationSteps(null),
                isLoading: false,
            })

            mockIsAiAgentEnabledForStore.mockReturnValue(false)

            const { result } = renderHook(() =>
                useOpportunityPageState(defaultParams),
            )

            expect(result.current.state).toBe(State.HAS_OPPORTUNITIES)
        })
    })
})
