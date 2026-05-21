import { useCallback, useMemo } from 'react'

import { isRecord } from '@repo/utils'

import { useChannel } from '@gorgias/realtime'

import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import { getCurrentAccountId } from 'state/currentAccount/selectors'
import { getCurrentUserId } from 'state/currentUser/selectors'
import {
    onVerifyMigrationForwarding,
    onVerifyMigrationForwardingFailure,
} from 'state/integrations/actions'
import { getEmailMigrations } from 'state/integrations/selectors'

const EMAIL_INTEGRATION_MIGRATION_VERIFIED_EVENT =
    'email.integration-migration-verified'
const EMAIL_INTEGRATION_MIGRATION_FAILED_EVENT =
    'email.integration-migration-failed'

type EmailIntegrationMigrationEventType =
    | typeof EMAIL_INTEGRATION_MIGRATION_VERIFIED_EVENT
    | typeof EMAIL_INTEGRATION_MIGRATION_FAILED_EVENT

type AblyMessage = {
    name?: string
    data?: unknown
}

type EmailIntegrationMigrationMessageContext = {
    eventType: EmailIntegrationMigrationEventType
    integrationId: number
}

function isEmailIntegrationMigrationEventType(
    value: unknown,
): value is EmailIntegrationMigrationEventType {
    return (
        value === EMAIL_INTEGRATION_MIGRATION_VERIFIED_EVENT ||
        value === EMAIL_INTEGRATION_MIGRATION_FAILED_EVENT
    )
}

function parseMessageData(data: unknown): unknown {
    if (typeof data !== 'string') return data

    try {
        return JSON.parse(data)
    } catch {
        return undefined
    }
}

function getIntegrationId(data: unknown): number | undefined {
    if (!isRecord(data) || typeof data.integration_id !== 'number') {
        return undefined
    }

    return data.integration_id
}

function getEmailIntegrationMigrationMessageContext(
    message: AblyMessage,
): EmailIntegrationMigrationMessageContext | undefined {
    if (!isEmailIntegrationMigrationEventType(message.name)) return undefined

    const integrationId = getIntegrationId(parseMessageData(message.data))

    return integrationId === undefined
        ? undefined
        : { eventType: message.name, integrationId }
}

export function EmailIntegrationMigrationRealtimeHandler() {
    const accountId = useAppSelector(getCurrentAccountId)
    const userId = useAppSelector(getCurrentUserId)
    const emailMigrations = useAppSelector(getEmailMigrations)
    const dispatch = useAppDispatch()

    const channel = useMemo(() => {
        if (!accountId || !userId) return undefined

        return {
            name: 'user' as const,
            accountId,
            userId,
        }
    }, [accountId, userId])

    const handleMessage = useCallback(
        (message: AblyMessage) => {
            const messageContext =
                getEmailIntegrationMigrationMessageContext(message)

            if (!messageContext) return

            const migration = emailMigrations.find(
                (migration) =>
                    migration.integration.id === messageContext.integrationId,
            )

            if (!migration) return

            if (
                messageContext.eventType ===
                EMAIL_INTEGRATION_MIGRATION_VERIFIED_EVENT
            ) {
                onVerifyMigrationForwarding(
                    dispatch,
                    messageContext.integrationId,
                    migration.integration.meta.address,
                )
                return
            }

            onVerifyMigrationForwardingFailure(
                dispatch,
                messageContext.integrationId,
                migration.integration.meta.address,
            )
        },
        [dispatch, emailMigrations],
    )

    useChannel({
        channel,
        onMessage: handleMessage,
    })

    return null
}
