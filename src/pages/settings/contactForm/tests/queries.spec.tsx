import React from 'react'
import _get from 'lodash/get'
import {renderHook} from '@testing-library/react-hooks'
import {QueryClientProvider} from '@tanstack/react-query'
import {createTestQueryClient} from 'tests/reactQueryTestingUtils'
import {useHelpCenterApi} from 'pages/settings/helpCenter/hooks/useHelpCenterApi'
import {buildSDKMocks} from '../../../../rest_api/help_center_api/tests/buildSdkMocks'
import {
    useCreateContactForm,
    useGetContactFormList,
    useGetShopifyPages,
    useGetPageEmbedments,
} from '../queries'
import {mockResourceServerReplies} from './resource-mocks'

jest.mock('pages/settings/helpCenter/hooks/useHelpCenterApi')
const mockedUseHelpCenterApi = useHelpCenterApi as jest.MockedFunction<
    typeof useHelpCenterApi
>

const queryClient = createTestQueryClient()

const wrapper: React.FC = ({children}) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
)

describe('useGetContactFormList', () => {
    let sdkMocks: Awaited<ReturnType<typeof buildSDKMocks>>

    beforeEach(async () => {
        sdkMocks = await buildSDKMocks()
        queryClient.getQueryCache().clear()
        mockedUseHelpCenterApi.mockReturnValue({
            client: sdkMocks.client,
            isReady: true,
        })
    })

    it('resolves with the list of contact forms', async () => {
        const mocks = mockResourceServerReplies(sdkMocks.mockedServer, {
            getContactForms: 'success',
        })

        const {result, waitFor} = renderHook(() => useGetContactFormList(), {
            wrapper,
        })

        await waitFor(() => expect(result.current.isSuccess).toBeTruthy())

        expect(_get(result, ['current', 'data', 'pages', 0])).toEqual(
            mocks.fixtures.ContactFormListFixtures
        )
    })

    it('returns the error', async () => {
        mockResourceServerReplies(sdkMocks.mockedServer, {
            getContactForms: 'error',
        })

        const {result, waitFor} = renderHook(() => useGetContactFormList(), {
            wrapper,
        })

        await waitFor(() => {
            expect(result.current.isError).toBeTruthy()
            expect(result.current.error).toMatchInlineSnapshot(
                `[Error: Request failed with status code 500]`
            )
        })
    })
})

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

describe('useCreateContactForm', () => {
    let sdkMocks: Awaited<ReturnType<typeof buildSDKMocks>>
    const payload = {
        name: 'test',
        default_locale: 'en-US',
        email_integration: {
            email: 'a@a.com',
            id: 1,
        },
    } as const

    beforeEach(async () => {
        sdkMocks = await buildSDKMocks()
        queryClient.getQueryCache().clear()
        mockedUseHelpCenterApi.mockReturnValue({
            client: sdkMocks.client,
            isReady: true,
        })
    })

    it('resolves with the newly created contact form', async () => {
        const mocks = mockResourceServerReplies(sdkMocks.mockedServer, {
            createContactForm: 'success',
        })

        const {result, waitFor} = renderHook(() => useCreateContactForm(), {
            wrapper,
        })

        result.current.mutate([sdkMocks.client, payload])

        await waitFor(() => expect(result.current.isSuccess).toBeTruthy())

        expect(_get(result, ['current', 'data'])).toEqual(
            mocks.fixtures.ContactFormFixture
        )
    })

    it('returns the error', async () => {
        mockResourceServerReplies(sdkMocks.mockedServer, {
            createContactForm: 'error',
        })

        const {result, waitFor} = renderHook(() => useCreateContactForm(), {
            wrapper,
        })

        result.current.mutate([sdkMocks.client, payload])

        await waitFor(() => {
            expect(result.current.isError).toBeTruthy()
            expect(result.current.error).toMatchInlineSnapshot(
                `[Error: Request failed with status code 500]`
            )
        })
    })
})
