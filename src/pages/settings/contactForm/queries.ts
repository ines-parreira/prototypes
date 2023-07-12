import {
    UseInfiniteQueryOptions,
    useInfiniteQuery,
    useMutation,
} from '@tanstack/react-query'
import {useHelpCenterApi} from 'pages/settings/helpCenter/hooks/useHelpCenterApi'
import {Paths} from '../../../rest_api/help_center_api/client.generated'
import {MutationOverrides} from '../../../types/query'
import {createContactForm, getContactForms} from './resources'

/**
 * RQ Key Factory for Contact Forms
 */
export const contactFormKeys = {
    all: () => ['contactForm'],
    lists: () => [...contactFormKeys.all(), 'list'] as const,
    list: (params: Paths.ListContactForms.QueryParameters) => [
        ...contactFormKeys.lists(),
        params,
    ],
    details: () => [...contactFormKeys.all(), 'detail'] as const,
    detail: (id: number) => [...contactFormKeys.details(), id] as const,
}

/**
 * queries
 */

export const useGetContactFormList = <
    TData = Awaited<ReturnType<typeof getContactForms>>
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
