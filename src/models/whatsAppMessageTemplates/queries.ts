import { useQuery, UseQueryOptions } from '@tanstack/react-query'

import { listWhatsAppMessageTemplates } from 'models/whatsAppMessageTemplates/resources'
import { ListWhatsAppMessageTemplatesParams } from 'models/whatsAppMessageTemplates/types'

export const whatsAppMessageTemplatesKeys = {
    all: () => ['whatsAppMessageTemplates'] as const,
    lists: () => [...whatsAppMessageTemplatesKeys.all(), 'list'] as const,
    list: (params?: ListWhatsAppMessageTemplatesParams) => [
        ...whatsAppMessageTemplatesKeys.lists(),
        params,
    ],
}

export const useListWhatsAppMessageTemplates = (
    params?: ListWhatsAppMessageTemplatesParams,
    overrides?: UseQueryOptions<
        Awaited<ReturnType<typeof listWhatsAppMessageTemplates>>
    >,
) => {
    return useQuery({
        queryKey: whatsAppMessageTemplatesKeys.list(params),
        queryFn: () => listWhatsAppMessageTemplates(params),
        ...overrides,
    })
}
