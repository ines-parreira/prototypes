import React from 'react'
import _get from 'lodash/get'
import {renderHook} from '@testing-library/react-hooks'
import {QueryClientProvider} from '@tanstack/react-query'
import * as reactQuery from '@tanstack/react-query'
import {mockFlags} from 'jest-launchdarkly-mock'
import {mockQueryClient} from 'tests/reactQueryTestingUtils'
import {useHelpCenterApi} from 'pages/settings/helpCenter/hooks/useHelpCenterApi'
import {FeatureFlagKey} from 'config/featureFlags'
import {buildSDKMocks} from '../../../../rest_api/help_center_api/tests/buildSdkMocks'
import {
    useGetShopifyPages,
    useGetPageEmbedments,
    useCreatePageEmbedment,
    useUpdatePageEmbedment,
    useGetArticleTemplates,
    useGetArticleTemplate,
    useGetAIArticlesByHelpCenter,
    useGetAIArticlesByHelpCenterAndStore,
    useUpsertArticleTemplateReview,
} from '../queries'
import * as resources from '../resources'
import {mockResourceServerReplies} from './resource-mocks'

jest.mock('pages/settings/helpCenter/hooks/useHelpCenterApi')
const mockedUseHelpCenterApi = useHelpCenterApi as jest.MockedFunction<
    typeof useHelpCenterApi
>

const getAIGeneratedArticlesByHelpCenter = jest.spyOn(
    resources,
    'getAIGeneratedArticlesByHelpCenter'
)
const getAIGeneratedArticlesByHelpCenterAndStore = jest.spyOn(
    resources,
    'getAIGeneratedArticlesByHelpCenterAndStore'
)

const queryClient = mockQueryClient()

const wrapper: React.FC = ({children}) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
)

describe('useGetShopifyPages', () => {
    let sdkMocks: Awaited<ReturnType<typeof buildSDKMocks>>
    const helpCenterId = 1

    beforeEach(async () => {
        sdkMocks = await buildSDKMocks()
        queryClient.getQueryCache().clear()
        mockedUseHelpCenterApi.mockReturnValue({
            client: sdkMocks.client,
            isReady: true,
        })
    })

    it('resolves with the list of shopify pages', async () => {
        const mocks = mockResourceServerReplies(sdkMocks.mockedServer, {
            getShopifyPages: 'success',
        })

        const {result, waitFor} = renderHook(
            () => useGetShopifyPages(helpCenterId),
            {
                wrapper,
            }
        )

        await waitFor(() => expect(result.current.isSuccess).toBeTruthy())

        expect(result.current.data).toEqual(
            mocks.fixtures.ShopifyPagesListFixture
        )
    })

    it('returns the error', async () => {
        mockResourceServerReplies(sdkMocks.mockedServer, {
            getShopifyPages: 'error',
        })

        const {result, waitFor} = renderHook(
            () => useGetShopifyPages(helpCenterId),
            {
                wrapper,
            }
        )

        await waitFor(() => {
            expect(result.current.isError).toBeTruthy()
            expect(result.current.error).toMatchInlineSnapshot(
                `[Error: Request failed with status code 500]`
            )
        })
    })
})

describe('useGetPageEmbedments', () => {
    let sdkMocks: Awaited<ReturnType<typeof buildSDKMocks>>
    const helpCenterId = 1

    beforeEach(async () => {
        sdkMocks = await buildSDKMocks()
        queryClient.getQueryCache().clear()
        mockedUseHelpCenterApi.mockReturnValue({
            client: sdkMocks.client,
            isReady: true,
        })
    })

    it('resolves with the list of page embedments', async () => {
        const mocks = mockResourceServerReplies(sdkMocks.mockedServer, {
            getPageEmbedments: 'success',
        })

        const {result, waitFor} = renderHook(
            () => useGetPageEmbedments(helpCenterId),
            {
                wrapper,
            }
        )

        await waitFor(() => expect(result.current.isSuccess).toBeTruthy())

        expect(result.current.data).toEqual(
            mocks.fixtures.PageEmbedmentsListFixture
        )
    })

    it('returns the error', async () => {
        mockResourceServerReplies(sdkMocks.mockedServer, {
            getPageEmbedments: 'error',
        })

        const {result, waitFor} = renderHook(
            () => useGetPageEmbedments(helpCenterId),
            {
                wrapper,
            }
        )

        await waitFor(() => {
            expect(result.current.isError).toBeTruthy()
            expect(result.current.error).toMatchInlineSnapshot(
                `[Error: Request failed with status code 500]`
            )
        })
    })
})

describe('useCreatePageEmbedment', () => {
    let sdkMocks: Awaited<ReturnType<typeof buildSDKMocks>>
    const payload = {
        help_center_id: 1,
        page_id: 1,
        position: 'TOP',
    } as const

    const pathParams = {
        help_center_id: 1,
    }

    beforeEach(async () => {
        sdkMocks = await buildSDKMocks()
        queryClient.getQueryCache().clear()
        mockedUseHelpCenterApi.mockReturnValue({
            client: sdkMocks.client,
            isReady: true,
        })
    })

    it('resolves with the newly created page embedment', async () => {
        const mocks = mockResourceServerReplies(sdkMocks.mockedServer, {
            createPageEmbedment: 'success',
        })

        const {result, waitFor} = renderHook(() => useCreatePageEmbedment(), {
            wrapper,
        })

        result.current.mutate([sdkMocks.client, pathParams, payload])

        await waitFor(() => expect(result.current.isSuccess).toBeTruthy())

        expect(_get(result, ['current', 'data'])).toEqual(
            mocks.fixtures.PageEmbedmentFixture
        )
    })

    it('returns the error', async () => {
        mockResourceServerReplies(sdkMocks.mockedServer, {
            createPageEmbedment: 'error',
        })

        const {result, waitFor} = renderHook(() => useCreatePageEmbedment(), {
            wrapper,
        })

        result.current.mutate([sdkMocks.client, pathParams, payload])

        await waitFor(() => {
            expect(result.current.isError).toBeTruthy()
            expect(result.current.error).toMatchInlineSnapshot(
                `[Error: Request failed with status code 500]`
            )
        })
    })
})

describe('useUpdatePageEmbedment', () => {
    let sdkMocks: Awaited<ReturnType<typeof buildSDKMocks>>
    const payload = {
        help_center_id: 1,
        page_id: 1,
        position: 'TOP',
    } as const

    const pathParams = {
        help_center_id: 1,
        embedment_id: 1,
    }

    beforeEach(async () => {
        sdkMocks = await buildSDKMocks()
        queryClient.getQueryCache().clear()
        mockedUseHelpCenterApi.mockReturnValue({
            client: sdkMocks.client,
            isReady: true,
        })
    })

    it('resolves with the updated page embedment', async () => {
        const mocks = mockResourceServerReplies(sdkMocks.mockedServer, {
            updatePageEmbedment: 'success',
        })

        const {result, waitFor} = renderHook(() => useUpdatePageEmbedment(), {
            wrapper,
        })

        result.current.mutate([sdkMocks.client, pathParams, payload])

        await waitFor(() => expect(result.current.isSuccess).toBeTruthy())

        expect(_get(result, ['current', 'data'])).toEqual(
            mocks.fixtures.PageEmbedmentFixture
        )
    })

    it('returns the error', async () => {
        mockResourceServerReplies(sdkMocks.mockedServer, {
            updatePageEmbedment: 'error',
        })

        const {result, waitFor} = renderHook(() => useUpdatePageEmbedment(), {
            wrapper,
        })

        result.current.mutate([sdkMocks.client, pathParams, payload])

        await waitFor(() => {
            expect(result.current.isError).toBeTruthy()
            expect(result.current.error).toMatchInlineSnapshot(
                `[Error: Request failed with status code 500]`
            )
        })
    })
})

describe('useGetArticleTemplates', () => {
    let sdkMocks: Awaited<ReturnType<typeof buildSDKMocks>>
    const locale = 'en-US'

    beforeEach(async () => {
        sdkMocks = await buildSDKMocks()
        queryClient.getQueryCache().clear()
        mockedUseHelpCenterApi.mockReturnValue({
            client: sdkMocks.client,
            isReady: true,
        })
    })

    it('resolves with the list of article templates', async () => {
        const mocks = mockResourceServerReplies(sdkMocks.mockedServer, {
            getArticleTemplates: 'success',
        })

        const {result, waitFor} = renderHook(
            () => useGetArticleTemplates(locale),
            {
                wrapper,
            }
        )

        await waitFor(() => expect(result.current.isSuccess).toBeTruthy())

        expect(result.current.data).toEqual(
            mocks.fixtures.ArticleTemplatesListFixture
        )
    })

    it('returns the error', async () => {
        mockResourceServerReplies(sdkMocks.mockedServer, {
            getArticleTemplates: 'error',
        })

        const {result, waitFor} = renderHook(
            () => useGetArticleTemplates(locale),
            {
                wrapper,
            }
        )

        await waitFor(() => {
            expect(result.current.isError).toBeTruthy()
            expect(result.current.error).toMatchInlineSnapshot(
                `[Error: Request failed with status code 500]`
            )
        })
    })
})

describe('useGetArticleTemplate', () => {
    let sdkMocks: Awaited<ReturnType<typeof buildSDKMocks>>
    const locale = 'en-US'
    const templateKey = 'shippingPolicy'

    beforeEach(async () => {
        sdkMocks = await buildSDKMocks()
        queryClient.getQueryCache().clear()
        mockedUseHelpCenterApi.mockReturnValue({
            client: sdkMocks.client,
            isReady: true,
        })
    })

    it('resolves with the article template', async () => {
        const mocks = mockResourceServerReplies(sdkMocks.mockedServer, {
            getArticleTemplate: 'success',
        })

        const {result, waitFor} = renderHook(
            () => useGetArticleTemplate(templateKey, locale),
            {
                wrapper,
            }
        )

        await waitFor(() => expect(result.current.isSuccess).toBeTruthy())

        expect(result.current.data).toEqual(
            mocks.fixtures.ArticleTemplatesListFixture[0]
        )
    })

    it('returns the error', async () => {
        mockResourceServerReplies(sdkMocks.mockedServer, {
            getArticleTemplate: 'error',
        })

        const {result, waitFor} = renderHook(
            () => useGetArticleTemplate(templateKey, locale),
            {
                wrapper,
            }
        )

        await waitFor(() => {
            expect(result.current.isError).toBeTruthy()
            expect(result.current.error).toMatchInlineSnapshot(
                `[Error: Request failed with status code 500]`
            )
        })
    })
})

describe('useGetAIGeneratedArticlesByHelpCenter', () => {
    let sdkMocks: Awaited<ReturnType<typeof buildSDKMocks>>
    const locale = 'en-US'
    const helpCenterId = 1
    const isAIArticlesForMultiStoreEnabled = false

    mockFlags({
        [FeatureFlagKey.ObservabilityAIArticles]: true,
        [FeatureFlagKey.ObservabilityShowAILibraryForMultiBrands]: true,
    })

    beforeEach(async () => {
        sdkMocks = await buildSDKMocks()
        queryClient.getQueryCache().clear()
        mockedUseHelpCenterApi.mockReturnValue({
            client: sdkMocks.client,
            isReady: true,
        })
    })

    it('resolves with the list of AIArticles', async () => {
        const mocks = mockResourceServerReplies(sdkMocks.mockedServer, {
            getAIGeneratedArticlesByHelpCenter: 'success',
        })

        const {result, waitFor} = renderHook(
            () =>
                useGetAIArticlesByHelpCenter(
                    helpCenterId,
                    locale,
                    isAIArticlesForMultiStoreEnabled
                ),
            {
                wrapper,
            }
        )

        await waitFor(() => expect(result.current.isSuccess).toBeTruthy())

        expect(result.current.data).toEqual(
            mocks.fixtures.AIArticlesListFixture
        )
    })

    it('disables query if helpCenterId is null', async () => {
        const useQuerySpy = jest.spyOn(reactQuery, 'useQuery')

        const {result} = renderHook(
            () =>
                useGetAIArticlesByHelpCenter(
                    null,
                    locale,
                    isAIArticlesForMultiStoreEnabled
                ),
            {
                wrapper,
            }
        )

        expect(getAIGeneratedArticlesByHelpCenter).toHaveBeenCalledTimes(0)

        expect(result.current.data).toBeUndefined()

        expect(useQuerySpy).toHaveBeenCalledTimes(1)

        expect(useQuerySpy.mock.calls[0][0]).toEqual({
            enabled: false,
            queryFn: expect.any(Function),
            queryKey: ['aiArticle', 'list', null],
        })

        const queryFn = (
            useQuerySpy.mock.calls[0][0] as unknown as {
                queryFn: () => Promise<any>
            }
        )?.queryFn

        const queryFnResult = await queryFn()
        expect(queryFnResult).toBeNull()
    })

    it('returns the error', async () => {
        mockResourceServerReplies(sdkMocks.mockedServer, {
            getAIGeneratedArticlesByHelpCenter: 'error',
        })

        const {result, waitFor} = renderHook(
            () =>
                useGetAIArticlesByHelpCenter(
                    helpCenterId,
                    locale,
                    isAIArticlesForMultiStoreEnabled
                ),
            {
                wrapper,
            }
        )

        await waitFor(() => {
            expect(result.current.isError).toBeTruthy()
            expect(result.current.error).toMatchInlineSnapshot(
                `[Error: Request failed with status code 404]`
            )
        })
    })
})

describe('useGetAIGeneratedArticlesByHelpCenterAndStore', () => {
    let sdkMocks: Awaited<ReturnType<typeof buildSDKMocks>>
    const locale = 'en-US'
    const helpCenterId = 1
    const storeIntegrationId = 2
    const isAIArticlesForMultiStoreEnabled = true

    mockFlags({
        [FeatureFlagKey.ObservabilityAIArticles]: true,
        [FeatureFlagKey.ObservabilityShowAILibraryForMultiBrands]: true,
    })

    beforeEach(async () => {
        sdkMocks = await buildSDKMocks()
        queryClient.getQueryCache().clear()
        mockedUseHelpCenterApi.mockReturnValue({
            client: sdkMocks.client,
            isReady: true,
        })
    })

    it('resolves with the list of AIArticles', async () => {
        const mocks = mockResourceServerReplies(sdkMocks.mockedServer, {
            getAIGeneratedArticlesByHelpCenterAndStore: 'success',
        })

        const {result, waitFor} = renderHook(
            () =>
                useGetAIArticlesByHelpCenterAndStore(
                    helpCenterId,
                    storeIntegrationId,
                    locale,
                    isAIArticlesForMultiStoreEnabled
                ),
            {
                wrapper,
            }
        )

        await waitFor(() => expect(result.current.isSuccess).toBeTruthy())

        expect(result.current.data).toEqual(
            mocks.fixtures.AIArticlesListFixture
        )
    })

    it('disables query if helpCenterId is null', async () => {
        const useQuerySpy = jest.spyOn(reactQuery, 'useQuery')

        const {result} = renderHook(
            () =>
                useGetAIArticlesByHelpCenterAndStore(
                    null,
                    storeIntegrationId,
                    locale,
                    isAIArticlesForMultiStoreEnabled
                ),
            {
                wrapper,
            }
        )

        expect(
            getAIGeneratedArticlesByHelpCenterAndStore
        ).toHaveBeenCalledTimes(0)

        expect(result.current.data).toBeUndefined()

        expect(useQuerySpy).toHaveBeenCalledTimes(1)

        expect(useQuerySpy.mock.calls[0][0]).toEqual({
            enabled: false,
            queryFn: expect.any(Function),
            queryKey: ['aiArticle', 'list', null, 'store', storeIntegrationId],
        })

        const queryFn = (
            useQuerySpy.mock.calls[0][0] as unknown as {
                queryFn: () => Promise<any>
            }
        )?.queryFn

        const queryFnResult = await queryFn()
        expect(queryFnResult).toBeNull()
    })

    it('disables query if storeIntegrationId is null', async () => {
        const useQuerySpy = jest.spyOn(reactQuery, 'useQuery')

        const {result} = renderHook(
            () =>
                useGetAIArticlesByHelpCenterAndStore(
                    helpCenterId,
                    null,
                    locale,
                    isAIArticlesForMultiStoreEnabled
                ),
            {
                wrapper,
            }
        )

        expect(
            getAIGeneratedArticlesByHelpCenterAndStore
        ).toHaveBeenCalledTimes(0)

        expect(result.current.data).toBeUndefined()

        expect(useQuerySpy).toHaveBeenCalledTimes(1)

        expect(useQuerySpy.mock.calls[0][0]).toEqual({
            enabled: false,
            queryFn: expect.any(Function),
            queryKey: ['aiArticle', 'list', helpCenterId, 'store', null],
        })

        const queryFn = (
            useQuerySpy.mock.calls[0][0] as unknown as {
                queryFn: () => Promise<any>
            }
        )?.queryFn

        const queryFnResult = await queryFn()
        expect(queryFnResult).toBeNull()
    })

    it('returns the error', async () => {
        mockResourceServerReplies(sdkMocks.mockedServer, {
            getAIGeneratedArticlesByHelpCenterAndStore: 'error',
        })

        const {result, waitFor} = renderHook(
            () =>
                useGetAIArticlesByHelpCenterAndStore(
                    helpCenterId,
                    storeIntegrationId,
                    locale,
                    isAIArticlesForMultiStoreEnabled
                ),
            {
                wrapper,
            }
        )

        await waitFor(() => {
            expect(result.current.isError).toBeTruthy()
            expect(result.current.error).toMatchInlineSnapshot(
                `[Error: Request failed with status code 404]`
            )
        })
    })
})

describe('useUpsertArticleTemplateReview', () => {
    let sdkMocks: Awaited<ReturnType<typeof buildSDKMocks>>
    const payload = {
        template_key: 'ai_Generated_1',
        action: 'publish',
        reason: null,
    } as const

    const pathParams = {
        help_center_id: 1,
    }

    beforeEach(async () => {
        sdkMocks = await buildSDKMocks()
        queryClient.getQueryCache().clear()
        mockedUseHelpCenterApi.mockReturnValue({
            client: sdkMocks.client,
            isReady: true,
        })
    })

    it('resolves with the updated article template review', async () => {
        mockResourceServerReplies(sdkMocks.mockedServer, {
            upsertArticleTemplateReview: 'success',
        })

        const {result, waitFor} = renderHook(
            () => useUpsertArticleTemplateReview(),
            {
                wrapper,
            }
        )

        result.current.mutate([sdkMocks.client, pathParams, payload])

        await waitFor(() => expect(result.current.isSuccess).toBeTruthy())

        expect(result.current.data).toBeUndefined
    })

    it('returns the error', async () => {
        mockResourceServerReplies(sdkMocks.mockedServer, {
            upsertArticleTemplateReview: 'error',
        })

        const {result, waitFor} = renderHook(
            () => useUpsertArticleTemplateReview(),
            {
                wrapper,
            }
        )

        result.current.mutate([sdkMocks.client, pathParams, payload])

        await waitFor(() => {
            expect(result.current.isError).toBeTruthy()
            expect(result.current.error).toMatchInlineSnapshot(
                `[Error: Request failed with status code 500]`
            )
        })
    })
})
