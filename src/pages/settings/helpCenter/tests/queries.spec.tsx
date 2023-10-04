import React from 'react'
import _get from 'lodash/get'
import {renderHook} from '@testing-library/react-hooks'
import {QueryClientProvider} from '@tanstack/react-query'
import {mockQueryClient} from 'tests/reactQueryTestingUtils'
import {useHelpCenterApi} from 'pages/settings/helpCenter/hooks/useHelpCenterApi'
import {buildSDKMocks} from '../../../../rest_api/help_center_api/tests/buildSdkMocks'
import {
    useGetShopifyPages,
    useGetPageEmbedments,
    useCreatePageEmbedment,
    useUpdatePageEmbedment,
} from '../queries'
import {mockResourceServerReplies} from './resource-mocks'

jest.mock('pages/settings/helpCenter/hooks/useHelpCenterApi')
const mockedUseHelpCenterApi = useHelpCenterApi as jest.MockedFunction<
    typeof useHelpCenterApi
>

const queryClient = mockQueryClient()

const wrapper: React.FC = ({children}) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
)

describe('useGetShopifyPages', () => {
    let sdkMocks: Awaited<ReturnType<typeof buildSDKMocks>>
    const contactFormId = 1

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
            () => useGetShopifyPages(contactFormId),
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
            () => useGetShopifyPages(contactFormId),
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
    const contactFormId = 1

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
            () => useGetPageEmbedments(contactFormId),
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
            () => useGetPageEmbedments(contactFormId),
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
        contact_form_id: 1,
        page_id: 1,
        position: 'TOP',
    } as const

    const pathParams = {
        contact_form_id: 1,
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
        contact_form_id: 1,
        page_id: 1,
        position: 'TOP',
    } as const

    const pathParams = {
        contact_form_id: 1,
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
