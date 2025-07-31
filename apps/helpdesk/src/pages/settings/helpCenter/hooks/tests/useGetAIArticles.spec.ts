import { renderHook } from '@repo/testing'

import { doNotRetry40XErrorsHandler } from 'api/utils'
import { assumeMock } from 'utils/testing'

import { useGetAIArticlesByHelpCenterAndStore } from '../../queries'
import { useGetAIArticles } from '../useGetAIArticles'

jest.mock('pages/settings/helpCenter/queries')

const mockedUseGetAIArticlesByHelpCenterAndStore = assumeMock(
    useGetAIArticlesByHelpCenterAndStore,
)

describe('useGetAIArticles', () => {
    const aiArticles = [{ id: 2, title: 'Article 2' }]

    beforeEach(() => {
        jest.resetAllMocks()
        mockedUseGetAIArticlesByHelpCenterAndStore.mockImplementation(() => {
            return {
                data: aiArticles,
                isInitialLoading: false,
            } as unknown as ReturnType<
                typeof useGetAIArticlesByHelpCenterAndStore
            >
        })
    })
    it('should fetch ai articles by help center and store', () => {
        const { result } = renderHook(() =>
            useGetAIArticles({
                helpCenterId: 1,
                storeIntegrationId: 2,
                locale: 'en-US',
            }),
        )

        expect(mockedUseGetAIArticlesByHelpCenterAndStore).toHaveBeenCalledWith(
            1,
            2,
            'en-US',
            {
                refetchOnWindowFocus: false,
                retry: doNotRetry40XErrorsHandler,
            },
        )
        expect(result.current.fetchedArticles).toEqual(aiArticles)
    })

    it('should return null when enabled is false', () => {
        const { result } = renderHook(() =>
            useGetAIArticles({
                helpCenterId: 1,
                storeIntegrationId: 2,
                locale: 'en-US',
                enabled: false,
            }),
        )

        expect(result.current.fetchedArticles).toBeNull()
    })

    it('should return null when data is loading', () => {
        mockedUseGetAIArticlesByHelpCenterAndStore.mockImplementationOnce(
            () => {
                return {
                    isInitialLoading: true,
                } as unknown as ReturnType<
                    typeof useGetAIArticlesByHelpCenterAndStore
                >
            },
        )
        const { result } = renderHook(() =>
            useGetAIArticles({
                helpCenterId: 1,
                storeIntegrationId: 2,
                locale: 'en-US',
            }),
        )

        expect(result.current.fetchedArticles).toBeNull()
    })
})
