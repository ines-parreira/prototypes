import {useMutation, useQuery, UseQueryOptions} from '@tanstack/react-query'
import {MutationOverrides} from 'types/query'
import {useHelpCenterApi} from 'pages/settings/helpCenter/hooks/useHelpCenterApi'
import {Paths} from 'rest_api/help_center_api/client.generated'
import {
    getMailtoReplacementConfig,
    upsertMailtoReplacementConfig,
} from './resources'

export const contactFormMailtoReplacementConfigKeys = {
    all: () => ['contactFormMailtoReplacementConfig'] as const,
    get: (contactFormId: number) => [
        ...contactFormMailtoReplacementConfigKeys.all(),
        contactFormId,
    ],
}

export const useGetContactFormMailtoReplacementConfig = <
    TData = Awaited<ReturnType<typeof getMailtoReplacementConfig>>
>(
    contactFormId: Paths.GetContactFormMailtoReplacementConfig.Parameters.ContactFormId,
    overrides?: UseQueryOptions<
        Awaited<ReturnType<typeof getMailtoReplacementConfig>>,
        unknown,
        TData
    >
) => {
    const {client} = useHelpCenterApi()

    return useQuery({
        queryKey: contactFormMailtoReplacementConfigKeys.get(contactFormId),
        queryFn: () =>
            getMailtoReplacementConfig(client, {
                contact_form_id: contactFormId,
            }),
        enabled: !!client,
        retry: false,
        ...overrides,
    })
}

export const useUpsertContactFormMailtoReplacementConfig = <TContext = unknown>(
    overrides?: MutationOverrides<
        typeof upsertMailtoReplacementConfig,
        false,
        TContext
    >
) => {
    const {client} = useHelpCenterApi()

    return useMutation({
        mutationFn: async ([, pathParams, body]) => {
            return upsertMailtoReplacementConfig(client, pathParams, body)
        },
        ...overrides,
    })
}
