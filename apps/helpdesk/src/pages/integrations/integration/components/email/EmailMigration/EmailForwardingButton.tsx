import React, { useEffect, useState } from 'react'

import { useAsyncFn } from '@repo/hooks'
import { AxiosError } from 'axios'

import useAppDispatch from 'hooks/useAppDispatch'
import { verifyMigrationIntegration } from 'models/integration/resources/email'
import {
    EmailMigrationInboundVerification,
    EmailMigrationInboundVerificationStatus,
} from 'models/integration/types'
import { UPDATE_EMAIL_MIGRATION_VERIFICATION_STATUS } from 'state/integrations/constants'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'

import EmailVerificationButton from './EmailVerificationButton'
import { computeMigrationInboundVerificationStatus } from './utils'

type Props = {
    migration: EmailMigrationInboundVerification
}

export default function EmailForwardingButton({ migration }: Props) {
    const dispatch = useAppDispatch()
    const [lastSubmittedVerification, setLastSubmittedVerification] =
        useState<EmailMigrationInboundVerification>()

    const verificationStatus =
        computeMigrationInboundVerificationStatus(migration)

    const [{ loading: isLoading }, verifyIntegration] = useAsyncFn(
        async (migration: EmailMigrationInboundVerification) => {
            try {
                await verifyMigrationIntegration(migration.integration.id)
                setLastSubmittedVerification(migration)
            } catch (error) {
                const { response } = error as AxiosError<{
                    error: { msg: string }
                }>
                const errorMsg =
                    response && response.data.error
                        ? response.data.error.msg
                        : 'Failed to verify integration'
                void dispatch(
                    notify({
                        message: errorMsg,
                        status: NotificationStatus.Error,
                    }),
                )
            }
        },
    )

    useEffect(() => {
        if (lastSubmittedVerification) {
            dispatch({
                type: UPDATE_EMAIL_MIGRATION_VERIFICATION_STATUS,
                integrationId: migration.integration.id,
                emailMigrationVerificationStatus:
                    EmailMigrationInboundVerificationStatus.InboundPending,
            })
            void dispatch(
                notify({
                    message: `Verifying forwarding for ${migration.integration.meta.address}. This may take several minutes.`,
                    status: NotificationStatus.Loading,
                    dismissible: true,
                }),
            )
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [lastSubmittedVerification])

    const handleVerifyClick = () => {
        void verifyIntegration(migration)
    }

    return (
        <EmailVerificationButton
            status={verificationStatus}
            isLoading={isLoading}
            onLinkButtonClick={handleVerifyClick}
            onRetryClick={handleVerifyClick}
        />
    )
}
