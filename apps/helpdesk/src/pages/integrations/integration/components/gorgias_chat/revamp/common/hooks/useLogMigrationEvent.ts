import { useCallback, useMemo } from 'react'

import { logEvent, SegmentEvent } from '@repo/logging'
import { useParams } from 'react-router-dom'

import { useAppSelector } from 'hooks/useAppSelector'
import { getCurrentAccountState } from 'state/currentAccount/selectors'
import { getIntegrations } from 'state/integrations/selectors'

export type MigrationPreviewMode = 'old-chat' | 'new-chat'

export type MigrationBusinessHoursMode = 'within' | 'outside'

/**
 * `account_id` `account_domain`, `shop_type`, `shop_name` and `chat_integration_id` properties, derived
 * from the current account and the chat integration.
 *
 * The chat integration id defaults to the route's `integrationId` param, but
 * callers without that route (e.g. the integration list) can pass an explicit
 * `chatIntegrationId`.
 */
export const useLogMigrationEvent = (chatIntegrationId?: number) => {
    const { integrationId } = useParams<{ integrationId: string }>()

    const currentAccount = useAppSelector(getCurrentAccountState)
    const integrations = useAppSelector(getIntegrations)

    const resolvedIntegrationId =
        chatIntegrationId ?? (Number(integrationId) || undefined)

    const log = useCallback(
        (event: SegmentEvent, data?: Record<string, unknown>) => {
            const integration = integrations.find(
                (item) => item.id === resolvedIntegrationId,
            )
            const meta = integration?.meta as
                | { shop_type?: string; shop_name?: string }
                | undefined
            const shopType = meta?.shop_type
            const shopName = meta?.shop_name

            logEvent(event, {
                account_id: currentAccount.get('id') as number | undefined,
                account_domain: currentAccount.get('domain'),
                shop_type: shopType,
                shop_name: shopName,
                chat_integration_id: resolvedIntegrationId,
                ...data,
            })
        },
        [currentAccount, integrations, resolvedIntegrationId],
    )

    return useMemo(
        () => ({
            logBannerViewed: () => log(SegmentEvent.ChatMigrationBannerViewed),
            logPreviewModeSwitched: (params: {
                from: MigrationPreviewMode
                to: MigrationPreviewMode
            }) =>
                log(SegmentEvent.ChatMigrationPreviewModeSwitched, {
                    from: params.from,
                    to: params.to,
                }),
            logBusinessHoursToggled: (params: {
                to: MigrationBusinessHoursMode
            }) =>
                log(SegmentEvent.ChatMigrationBusinessHoursToggled, {
                    to: params.to,
                }),
            logOptInConfirmed: () =>
                log(SegmentEvent.ChatMigrationOptInConfirmed),
            logOptOutClicked: (params: { timeSinceOptInSeconds: number }) =>
                log(SegmentEvent.ChatMigrationOptOutClicked, {
                    time_since_opt_in_seconds: params.timeSinceOptInSeconds,
                }),
        }),
        [log],
    )
}
