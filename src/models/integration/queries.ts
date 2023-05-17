import {useQuery} from '@tanstack/react-query'

import {reportError} from 'utils/errors'

import {
    getApplications,
    getInstallationSnippet,
} from 'state/integrations/actions/gorgias-chat.actions'

import {GetInstallationSnippetParams} from './types'

export const getInstallationSnippetQueryKey = (
    params: GetInstallationSnippetParams
) => ['integration', 'gorgias-chat', 'getInstallationSnippet', params]

export const useGetInstallationSnippet = (
    params: GetInstallationSnippetParams,
    overrides?: {enabled: boolean}
) =>
    useQuery({
        queryKey: getInstallationSnippetQueryKey(params),
        queryFn: () => getInstallationSnippet(params),
        onError: () => {
            reportError(
                new Error('Failed to fetch chat installation snippet'),
                {
                    extra: params,
                }
            )
        },
        ...overrides,
    })

export const useApplications = () =>
    useQuery({
        queryKey: ['integration', 'gorgias-chat', 'getApplications'],
        queryFn: getApplications,
        onError: () => {
            reportError(new Error('Failed to fetch chat applications'))
        },
    })
