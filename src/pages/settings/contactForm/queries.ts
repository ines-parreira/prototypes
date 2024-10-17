import {
    UseInfiniteQueryOptions,
    useInfiniteQuery,
    UseQueryOptions,
    useQuery,
    useMutation,
} from '@tanstack/react-query'
import {useHelpCenterApi} from 'pages/settings/helpCenter/hooks/useHelpCenterApi'
import {Paths} from '../../../rest_api/help_center_api/client.generated'
import {MutationOverrides} from '../../../types/query'
import {
    createContactForm,
    getContactForms,
    getShopifyPages,
    getPageEmbedments,
    createPageEmbedment,
    updatePageEmbedment,
    deletePageEmbedment,
} from './resources'

/**
 * RQ Key Factory for Contact Forms
 */
export const contactFormKeys = {
    all: () => ['contactForm'] as const,
    lists: () => [...contactFormKeys.all(), 'list'] as const,
    list: (params: Paths.ListContactForms.QueryParameters) => [
        ...contactFormKeys.lists(),
        params,
    ],
    details: () => [...contactFormKeys.all(), 'detail'] as const,
    detail: (id: number) => [...contactFormKeys.details(), id] as const,
}

/**
 * RQ Key Factory for Contact Form Shopify Pages
 */
export const embeddablePageKeys = {
    all: () => ['embeddablePage'] as const,
    lists: () => [...embeddablePageKeys.all(), 'list'] as const,
}

/**
 * RQ Key Factory for Contact Form Embeddable Pages /contact-form/{id1}/pages/{id2}
 */
export const contactFormEmbeddablePageKeys = {
    all: (contactFormId: number) =>
        [
            ...contactFormKeys.detail(contactFormId),
            ...embeddablePageKeys.all(),
        ] as const,
    lists: (contactFormId: number) =>
        [
            ...contactFormEmbeddablePageKeys.all(contactFormId),
            ...embeddablePageKeys.lists(),
        ] as const,
}

/**
 * RQ Key Factory for Contact Form Page Embedments
 */
export const pageEmbedmentsKeys = {
    all: () => ['pageEmbedments'] as const,
    lists: () => [...pageEmbedmentsKeys.all(), 'list'] as const,
}

/**
 * RQ Key Factory for Contact Form Page Embedments /contact-form/{id1}/page-embedments
 */
export const contactFormPageEmbedmentsKeys = {
    all: (contactFormId: number) =>
        [
            ...contactFormKeys.detail(contactFormId),
            ...pageEmbedmentsKeys.all(),
        ] as const,
    lists: (contactFormId: number) =>
        [
            ...contactFormPageEmbedmentsKeys.all(contactFormId),
            ...pageEmbedmentsKeys.lists(),
        ] as const,
}

/**
 * queries
 */

export const useGetContactFormList = <
    TData = Awaited<ReturnType<typeof getContactForms>>,
>(
    overrides?: UseInfiniteQueryOptions<
        Awaited<ReturnType<typeof getContactForms>>,
        unknown,
        TData
    >
) => {
    const {client} = useHelpCenterApi()

    return useInfiniteQuery({
        queryKey: contactFormKeys.lists(),
        queryFn: async ({pageParam = 1}) =>
            getContactForms(client, {page: pageParam}),
        getNextPageParam: (lastPage) => {
            if (!lastPage) return 1
            if (lastPage.meta.page < lastPage.meta.nb_pages) {
                return lastPage.meta.page + 1
            }
            return undefined
        },
        enabled: !!client,
        ...overrides,
    })
}

export const useGetShopifyPages = <
    TData = Awaited<ReturnType<typeof getShopifyPages>>,
>(
    contactFormId: Paths.ListContactFormShopifyPages.Parameters.ContactFormId,
    overrides?: UseQueryOptions<
        Awaited<ReturnType<typeof getShopifyPages>>,
        unknown,
        TData
    >
) => {
    const {client} = useHelpCenterApi()

    return useQuery({
        queryKey: contactFormEmbeddablePageKeys.lists(contactFormId),
        queryFn: async () =>
            getShopifyPages(client, {
                contact_form_id: contactFormId,
            }),
        enabled: !!client,
        retry: false,
        ...overrides,
    })
}

export const useGetPageEmbedments = <
    TData = Awaited<ReturnType<typeof getPageEmbedments>>,
>(
    contactFormId: Paths.ListContactFormShopifyPageEmbedments.Parameters.ContactFormId,
    overrides?: UseQueryOptions<
        Awaited<ReturnType<typeof getPageEmbedments>>,
        unknown,
        TData
    >
) => {
    const {client} = useHelpCenterApi()

    return useQuery({
        queryKey: contactFormPageEmbedmentsKeys.lists(contactFormId),
        queryFn: async () =>
            getPageEmbedments(client, {
                contact_form_id: contactFormId,
            }),
        enabled: !!client,
        ...overrides,
    })
}

/**
 * Mutations
 */
export const useCreateContactForm = (
    overrides?: MutationOverrides<typeof createContactForm>
) => {
    const {client} = useHelpCenterApi()

    return useMutation({
        mutationFn: ([, newContactForm]) =>
            createContactForm(client, newContactForm),
        ...overrides,
    })
}

export const useCreatePageEmbedment = (
    overrides?: MutationOverrides<typeof createPageEmbedment>
) => {
    const {client} = useHelpCenterApi()

    return useMutation({
        mutationFn: ([, pathParameters, newPageEmbedment]) =>
            createPageEmbedment(client, pathParameters, newPageEmbedment),
        ...overrides,
    })
}

export const useUpdatePageEmbedment = (
    overrides?: MutationOverrides<typeof updatePageEmbedment>
) => {
    const {client} = useHelpCenterApi()

    return useMutation({
        mutationFn: ([, pathParameters, newPageEmbedment]) =>
            updatePageEmbedment(client, pathParameters, newPageEmbedment),
        ...overrides,
    })
}

export const useDeletePageEmbedment = (
    overrides?: MutationOverrides<typeof deletePageEmbedment>
) => {
    const {client} = useHelpCenterApi()

    return useMutation({
        mutationFn: ([, pathParameters]) =>
            deletePageEmbedment(client, pathParameters),
        ...overrides,
    })
}
