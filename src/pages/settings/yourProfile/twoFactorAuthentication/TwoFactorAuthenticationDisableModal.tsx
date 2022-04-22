import React, {ReactNode, useCallback, useState} from 'react'
import {AxiosError} from 'axios'
import useAppDispatch from 'hooks/useAppDispatch'
import {User} from 'config/types/user'
import DEPRECATED_Modal from 'pages/common/components/DEPRECATED_Modal'
import css from 'pages/common/components/PrivateReplyToFBComment/PrivateReplyModal/PrivateReplyModal.less'
import {deleteTwoFASecret} from 'models/twoFactorAuthentication/resources'
import Button from 'pages/common/components/button/Button'
import {update2FAEnabled} from 'state/currentUser/actions'
import Alert, {AlertType} from 'pages/common/components/Alert/Alert'
import {notify} from 'state/notifications/actions'
import {NotificationStatus} from 'state/notifications/types'

export type OwnProps = {
    user?: User
    title: string
    actionButtonText: string
    children: ReactNode
    isOpen: boolean
    onClose: () => void
    onSuccess: () => void
}

export default function TwoFactorAuthenticationDisableModal({
    user,
    title,
    actionButtonText,
    children,
    isOpen,
    onClose,
    onSuccess,
}: OwnProps) {
    const dispatch = useAppDispatch()

    const [errorText, setErrorText] = useState('')
    const [isLoading, setIsLoading] = useState(false)

    const disableTwoFA = useCallback(async () => {
        try {
            setIsLoading(true)
            setErrorText('')

            if (!user) {
                await deleteTwoFASecret()
                void dispatch(update2FAEnabled(false))
            } else {
                await deleteTwoFASecret(user.id)
                void dispatch(
                    notify({
                        status: NotificationStatus.Success,
                        message: `Two-Factor Authentication token has been reset for <b>${user.name}</b>.`,
                        allowHTML: true,
                    })
                )
            }

            onSuccess()
        } catch (error) {
            const {response} = error as AxiosError<{error: {msg: string}}>
            if (response) {
                setErrorText(response.data.error.msg)
            }
            console.error(error)
        } finally {
            setIsLoading(false)
        }
    }, [dispatch, onSuccess, user])

    return (
        <DEPRECATED_Modal
            isOpen={isOpen}
            header={title}
            onClose={onClose}
            style={{maxWidth: '600px'}}
            footerClassName={css.modalFooter}
            footer={
                <>
                    <Button
                        intent="secondary"
                        onClick={onClose}
                        isDisabled={isLoading}
                        className="mr-auto"
                    >
                        Cancel
                    </Button>
                    <Button
                        intent="destructive"
                        onClick={disableTwoFA}
                        isLoading={isLoading}
                    >
                        {actionButtonText}
                    </Button>
                </>
            }
        >
            {errorText && (
                <Alert type={AlertType.Error} className="mb-3" icon>
                    {errorText}
                </Alert>
            )}
            {children}
        </DEPRECATED_Modal>
    )
}
