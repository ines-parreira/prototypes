import {renderHook} from '@testing-library/react-hooks'
import {mockFlags} from 'jest-launchdarkly-mock'
import {assumeMock} from 'utils/testing'
import {FeatureFlagKey} from 'config/featureFlags'
import {doNotRetry40XErrorsHandler} from 'api/utils'
import {
    useGetAIArticlesByHelpCenter,
    useGetAIArticlesByHelpCenterAndStore,
} from '../../queries'
import {useConditionalGetAIArticles} from '../useConditionalGetAIArticles'

jest.mock('pages/settings/helpCenter/queries')

const mockedUseGetAIArticlesByHelpCenter = assumeMock(
    useGetAIArticlesByHelpCenter
)
const mockedUseGetAIArticlesByHelpCenterAndStore = assumeMock(
    useGetAIArticlesByHelpCenterAndStore
)

describe('useConditionalGetAIArticles', () => {
    const aiArticlesWithMultiStoreDisabled = [{id: 1, title: 'Article 1'}]
    const aiArticlesWithMultiStoreEnabled = [{id: 2, title: 'Article 2'}]

    beforeEach(() => {
        jest.resetAllMocks()
        mockedUseGetAIArticlesByHelpCenter.mockImplementation(() => {
            return {
                data: aiArticlesWithMultiStoreDisabled,
                isInitialLoading: false,
            } as unknown as ReturnType<typeof useGetAIArticlesByHelpCenter>
        })
        mockedUseGetAIArticlesByHelpCenterAndStore.mockImplementation(() => {
            return {
                data: aiArticlesWithMultiStoreEnabled,
                isInitialLoading: false,
            } as unknown as ReturnType<
                typeof useGetAIArticlesByHelpCenterAndStore
            >
        })
    })
    it('should fetch ai articles by help center when flag disabled', () => {
        mockFlags({
            [FeatureFlagKey.ObservabilityAllowAIGeneratedArticlesForMultiStore]:
                false,
        })
        const {result} = renderHook(() =>
            useConditionalGetAIArticles({
                helpCenterId: 1,
                storeIntegrationId: 2,
                locale: 'en-US',
            })
        )

        expect(mockedUseGetAIArticlesByHelpCenter).toHaveBeenCalledWith(
            1,
            'en-US',
            false,
            {
                refetchOnWindowFocus: false,
                retry: doNotRetry40XErrorsHandler,
            }
        )
        expect(result.current.fetchedArticles).toEqual(
            aiArticlesWithMultiStoreDisabled
        )
    })
    it('should fetch ai articles by help center when flag enabled', () => {
        mockFlags({
            [FeatureFlagKey.ObservabilityAllowAIGeneratedArticlesForMultiStore]:
                true,
        })
        const {result} = renderHook(() =>
            useConditionalGetAIArticles({
                helpCenterId: 1,
                storeIntegrationId: 2,
                locale: 'en-US',
            })
        )

        expect(mockedUseGetAIArticlesByHelpCenterAndStore).toHaveBeenCalledWith(
            1,
            2,
            'en-US',
            true,
            {
                refetchOnWindowFocus: false,
                retry: doNotRetry40XErrorsHandler,
            }
        )
        expect(result.current.fetchedArticles).toEqual(
            aiArticlesWithMultiStoreEnabled
        )
    })
    it('does nothing when disabled - single store', () => {
        mockFlags({
            [FeatureFlagKey.ObservabilityAllowAIGeneratedArticlesForMultiStore]:
                false,
        })

        const {result} = renderHook(() =>
            useConditionalGetAIArticles({
                helpCenterId: 1,
                storeIntegrationId: 2,
                locale: 'en-US',
                enabled: false,
            })
        )

        expect(mockedUseGetAIArticlesByHelpCenter).toHaveBeenCalledWith(
            1,
            'en-US',
            false,
            {
                refetchOnWindowFocus: false,
                retry: doNotRetry40XErrorsHandler,
                enabled: false,
            }
        )
        expect(result.current.fetchedArticles).toBeNull()
    })
    it('does nothing when disabled - multistore', () => {
        mockFlags({
            [FeatureFlagKey.ObservabilityAllowAIGeneratedArticlesForMultiStore]:
                true,
        })

        const {result} = renderHook(() =>
            useConditionalGetAIArticles({
                helpCenterId: 1,
                storeIntegrationId: 2,
                locale: 'en-US',
                enabled: false,
            })
        )

        expect(mockedUseGetAIArticlesByHelpCenterAndStore).toHaveBeenCalledWith(
            1,
            2,
            'en-US',
            true,
            {
                refetchOnWindowFocus: false,
                retry: doNotRetry40XErrorsHandler,
                enabled: false,
            }
        )
        expect(result.current.fetchedArticles).toBeNull()
    })
})
