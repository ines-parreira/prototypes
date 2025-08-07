import { useCallback, useMemo } from 'react'

import { useQueryClient } from '@tanstack/react-query'

import {
    useGetCurrentUser,
    useListTicketTranslations,
    UserSettingType,
} from '@gorgias/helpdesk-queries'
import {
    GetCurrentUserResult,
    HttpResponse,
    ListTicketTranslations200,
    TicketTranslationCompact,
    UserPreferencesSetting,
    UserSetting,
} from '@gorgias/helpdesk-types'

import { FeatureFlagKey } from 'config/featureFlags'
import { useFlag } from 'core/flags'

type TicketPropertiesTranslationsParams = {
    ticket_ids: number[]
}

type CurrentUserPreferenceSettings = UserPreferencesSetting & {
    data: UserPreferencesSetting['data'] & {
        'language-preferences'?: {
            primary?: string
        }
    }
}

export type CurrentUser = GetCurrentUserResult & {
    data: GetCurrentUserResult['data'] & {
        settings: (
            | Exclude<UserSetting, UserPreferencesSetting>
            | CurrentUserPreferenceSettings
        )[]
    }
}

type TranslationMap = Record<number, TicketTranslationCompact>

type QueryKeyParams = {
    queryParams: {
        language: string
        ticket_ids: number[]
    }
}

export function useTicketsTranslatedProperties({
    ticket_ids,
}: TicketPropertiesTranslationsParams) {
    const queryClient = useQueryClient()
    const hasMessagesTranslations = useFlag(FeatureFlagKey.MessagesTranslations)

    const { data: currentUser } = useGetCurrentUser<CurrentUser>()

    const preferredLanguage = useMemo(() => {
        const preferences = currentUser?.data?.settings.find(
            (setting) => setting.type === UserSettingType.Preferences,
        ) as CurrentUserPreferenceSettings

        if (!preferences) {
            return currentUser?.data?.language
        }

        return preferences?.data?.['language-preferences']?.primary
    }, [currentUser])

    // So that the tanstack query cache is as stable as possible
    const stableTicketIds = useMemo(
        () => ticket_ids.sort((a, b) => a - b),
        [ticket_ids],
    )

    const { data: translations } = useListTicketTranslations(
        {
            language: preferredLanguage as string,
            ticket_ids: stableTicketIds,
        },
        {
            query: {
                enabled:
                    hasMessagesTranslations &&
                    Boolean(preferredLanguage) &&
                    stableTicketIds.length > 0,
            },
        },
    )

    // Placeholder translations since we cannot yet generate real ones
    // Swap this instead of the translationsMap to tests the UI
    // const placeholderTranslationsMap = useMemo(
    //     () =>
    //         stableTicketIds.reduce<TranslationMap>((acc, ticketId) => {
    //             acc[ticketId] = {
    //                 excerpt: 'Translated excerpt of the ticket',
    //                 subject: 'Translated subject of the ticket',
    //                 ticket_id: ticketId,
    //                 ticket_translation_id: `${ticketId}-translation`,
    //             }
    //             return acc
    //         }, {}),
    //     [stableTicketIds],
    // )

    const invalidateTicketTranslatedProperties = useCallback(
        (ticketIds: number[]) => {
            const queryCache = queryClient.getQueryCache()

            // tickets translations keys have the following shape:
            // ["tickets", "listTicketTranslations", { "queryParams": { "language": "en", "ticket_ids": [1, 2, 3] } }]
            const ticketTranslationsKeyPrefix = [
                'tickets',
                'listTicketTranslations',
            ]

            const ticketTranslationsKeys = queryCache.findAll({
                queryKey: ticketTranslationsKeyPrefix,
            })
            const ticketTranslationsKeysToInvalidate =
                ticketTranslationsKeys.filter((query) => {
                    const queryParams = query.queryKey[2] as QueryKeyParams

                    if (!Array.isArray(queryParams.queryParams.ticket_ids)) {
                        return false
                    }

                    return queryParams.queryParams.ticket_ids.some((ticketId) =>
                        ticketIds.includes(ticketId),
                    )
                })

            ticketTranslationsKeysToInvalidate.forEach((query) => {
                queryClient.setQueryData(
                    query.queryKey,
                    (
                        oldData:
                            | HttpResponse<ListTicketTranslations200>
                            | undefined,
                    ) => {
                        if (!oldData) return oldData

                        return {
                            ...oldData,
                            data: {
                                ...oldData.data,
                                data: oldData.data.data.filter(
                                    (ticket) =>
                                        !ticketIds.includes(ticket.ticket_id),
                                ),
                            },
                        }
                    },
                )
            })
        },
        [queryClient],
    )

    const translationMap = useMemo(() => {
        if (!translations || !translations.data) {
            return {}
        }

        return translations.data.data.reduce<TranslationMap>(
            (acc, ticketTranslation) => {
                acc[ticketTranslation.ticket_id] = ticketTranslation
                return acc
            },
            {},
        )
    }, [translations])

    if (!hasMessagesTranslations) {
        return {
            translationMap: {},
            invalidateTicketTranslatedProperties,
        }
    }

    return {
        translationMap,
        invalidateTicketTranslatedProperties,
    }
}
