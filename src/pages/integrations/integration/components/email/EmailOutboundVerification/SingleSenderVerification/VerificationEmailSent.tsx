import React from 'react'

import classNames from 'classnames'
import {useAsyncFn} from 'react-use'
import {AxiosError} from 'axios'
import {SenderVerification} from 'models/singleSenderVerification/types'
import Button from 'pages/common/components/button/Button'
import {
    checkVerification,
    resendVerificationEmail,
} from 'models/singleSenderVerification/resources'
import useAppDispatch from 'hooks/useAppDispatch'
import {notify} from 'state/notifications/actions'
import {NotificationStatus} from 'state/notifications/types'
import {setVerification} from 'state/entities/singleSenderVerification/actions'
import history from 'pages/history'
import DeleteVerificationButton from '../DeleteVerificationButton'
import css from './VerificationEmailSent.less'

export type Props = {
    verification: SenderVerification
    onConfirmDeleteVerification: () => void
    isDeleteInProgress: boolean
    baseURL: string
    onVerificationUpdate: () => void
}

export default function VerificationEmailSent({
    verification,
    onConfirmDeleteVerification,
    isDeleteInProgress,
    baseURL,
    onVerificationUpdate,
}: Props) {
    const dispatch = useAppDispatch()

    const [{loading: isResendInProgress}, handleResendEmail] =
        useAsyncFn(async () => {
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

    const [{loading: isConfirmInProgress}, handleConfirmVerification] =
        useAsyncFn(async () => {
            try {
                const response = await checkVerification(
                    verification.integration_id
                )
                onVerificationUpdate()
                dispatch(setVerification(response))
                void dispatch(
                    notify({
                        message: 'Email successfully verified',
                        status: NotificationStatus.Success,
                    })
                )
                history.push(baseURL)
            } catch (error) {
                const {response} = error as AxiosError<{error: {msg: string}}>
                const errorMsg =
                    response && response.data.error
                        ? response.data.error.msg
                        : 'Failed to confirm verification'

                void dispatch(
                    notify({
                        message: errorMsg,
                        status: NotificationStatus.Error,

                        buttons:
                            response?.status === 400
                                ? [
                                      {
                                          primary: false,
                                          name: 'Re-Send Verification',
                                          onClick: handleResendEmail,
                                      },
                                  ]
                                : undefined,
                    })
                )
            }
        }, [dispatch, verification])

    const isLoading =
        isConfirmInProgress || isResendInProgress || isDeleteInProgress

    return (
        <div data-testid="verification-email-sent-step">
            <h3 className="mb-2">Verify Single Sender</h3>
            <p>
                A verification email has been sent to{' '}
                <strong>{verification.email}</strong>.{' '}
            </p>
            <p>
                Check your inbox and click the link in the email to verify the
                sender address. Once you have done so, return to this page and
                confirm verification below.
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
                        onClick={handleConfirmVerification}
                    >
                        Confirm verification
                    </Button>
                    <Button
                        type="submit"
                        intent="secondary"
                        className={classNames({
                            'btn-loading': isLoading,
                        })}
                        isDisabled={isLoading}
                        onClick={handleResendEmail}
                    >
                        Re-Send verification email
                    </Button>
                </div>
                <DeleteVerificationButton
                    onConfirm={onConfirmDeleteVerification}
                    isLoading={isLoading}
                />
            </div>
        </div>
    )
}
