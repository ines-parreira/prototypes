import React from 'react'
import {useAsyncFn} from 'react-use'
import {AxiosError} from 'axios'
import {EmailMigration, MigrationStatus} from 'models/integration/types'
import Button from 'pages/common/components/button/Button'
import ButtonIconLabel from 'pages/common/components/button/ButtonIconLabel'
import {verifyMigrationIntegration} from 'models/integration/resources/email'
import useAppDispatch from 'hooks/useAppDispatch'
import {NotificationStatus} from 'state/notifications/types'
import {notify} from 'state/notifications/actions'
import {UPDATE_EMAIL_MIGRATION_VERIFICATION_STATUS} from 'state/integrations/constants'
import {EmailVerificationStatus} from '../EmailVerificationStatusLabel'
import {computeMigrationInboundVerificationStatus} from './utils'

type Props = {
    migration: EmailMigration
}

export default function EmailForwardingButton({migration}: Props) {
    const dispatch = useAppDispatch()

    const verificationStatus =
        computeMigrationInboundVerificationStatus(migration)

    const [{loading: isLoading}, verifyIntegration] = useAsyncFn(
        async (migration: EmailMigration) => {
            try {
                await verifyMigrationIntegration(migration.integration.id)
                dispatch({
                    type: UPDATE_EMAIL_MIGRATION_VERIFICATION_STATUS,
                    integrationId: migration.integration.id,
                    emailMigrationVerificationStatus:
                        MigrationStatus.InboundPending,
                })
            } catch (error) {
                const {response} = error as AxiosError<{error: {msg: string}}>
                const errorMsg =
                    response && response.data.error
                        ? response.data.error.msg
                        : 'Failed to verify integration'
                void dispatch(
                    notify({
                        message: errorMsg,
                        status: NotificationStatus.Error,
                    })
                )
            }
        }
    )

    const handleVerifyClick = () => {
        void verifyIntegration(migration)
    }

    if (isLoading || verificationStatus === EmailVerificationStatus.Pending) {
        return (
            <Button fillStyle="ghost" isLoading={true}>
                Verifying
            </Button>
        )
    }

    if (verificationStatus === EmailVerificationStatus.Unverified) {
        return (
            <Button fillStyle="ghost" onClick={handleVerifyClick}>
                Verify forwarding
            </Button>
        )
    }

    return (
        <Button
            fillStyle="ghost"
            intent="secondary"
            onClick={handleVerifyClick}
        >
            <ButtonIconLabel icon="refresh">Retry verification</ButtonIconLabel>
        </Button>
    )
}
