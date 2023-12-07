import React, {useEffect, useRef} from 'react'
import classNames from 'classnames'
// [PLTOF-48] Please avoid importing more hooks from 'react-use', prefer using your own implementation of the hook rather than depending on external library
// eslint-disable-next-line no-restricted-imports
import {useAsyncFn} from 'react-use'
import {AxiosError} from 'axios'
import {useHistory} from 'react-router-dom'
import {
    SenderVerification,
    VerificationStatus,
} from 'models/singleSenderVerification/types'
import {resendVerificationEmail} from 'models/singleSenderVerification/resources'
import Button from 'pages/common/components/button/Button'
import useAppDispatch from 'hooks/useAppDispatch'
import {notify} from 'state/notifications/actions'
import {NotificationStatus} from 'state/notifications/types'
import Alert from 'pages/common/components/Alert/Alert'
import {EmailProvider} from 'models/integration/constants'
import DeleteVerificationButton from '../DeleteVerificationButton'

import css from './VerificationEmailSent.less'

export type Props = {
    verification: SenderVerification
    onConfirmDeleteVerification: () => void
    baseURL: string
    onVerificationUpdate: () => void
    refetchVerification: () => void
    provider: EmailProvider
}

export default function VerificationEmailSent({
    verification,
    onConfirmDeleteVerification,
    baseURL,
    onVerificationUpdate,
    refetchVerification,
    provider,
}: Props) {
    const dispatch = useAppDispatch()
    const pollingTimer = useRef<number>()
    const history = useHistory()

    useEffect(() => {
        if (verification.status !== VerificationStatus.Verified) {
            pollingTimer.current = setTimeout(
                refetchVerification,
                5000
            ) as unknown as number
        } else {
            onVerificationUpdate()
            history.push(baseURL)
        }
        return () => {
            clearTimeout(pollingTimer.current)
        }
    }, [
        verification,
        refetchVerification,
        onVerificationUpdate,
        history,
        baseURL,
    ])

    const [{loading: isLoading}, handleResendEmail] = useAsyncFn(async () => {
        try {
            await resendVerificationEmail(verification.integration_id)
            void dispatch(
                notify({
                    message: 'Verification email resent successfully.',
                    status: NotificationStatus.Success,
                })
            )
        } catch (error) {
            const {response} = error as AxiosError<{error: {msg: string}}>
            const errorMsg =
                response && response.data.error
                    ? response.data.error.msg
                    : 'Failed to resend verification email'

            void dispatch(
                notify({
                    message: errorMsg,
                    status: NotificationStatus.Error,
                })
            )
        }
    }, [dispatch, verification])

    return (
        <div data-testid="verification-email-sent-step">
            <h3 className="mb-2">Single Sender Verification in progress...</h3>
            <Alert
                className={classNames('my-4')}
                icon={<i className="material-icons md-spin">autorenew</i>}
            >
                We're waiting to receive your verification email on{' '}
                <strong>{verification.email}</strong> from our email provider,{' '}
                <span className="text-capitalize">{provider}</span>.
            </Alert>
            <p>
                If you haven't received an email from our email provider after a
                few minutes, please check that you have submitted the correct
                email for single-sender verification.{' '}
            </p>
            <div className={classNames('mt-5', css.buttonsWrapper)}>
                <div className={css.confirmButtonsWrapper}>
                    <Button
                        type="submit"
                        intent="primary"
                        className={classNames({
                            'btn-loading': isLoading,
                        })}
                        isDisabled={isLoading}
                        isLoading={isLoading}
                        onClick={handleResendEmail}
                    >
                        Re-send verification email
                    </Button>
                </div>
                <DeleteVerificationButton
                    onConfirm={onConfirmDeleteVerification}
                    verification={verification}
                    isDisabled={isLoading}
                />
            </div>
        </div>
    )
}
