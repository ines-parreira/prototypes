import {AxiosError} from 'axios'
import React, {ReactNode, useCallback, useState} from 'react'

import {User} from 'config/types/user'
import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import {deleteTwoFASecret} from 'models/twoFactorAuthentication/resources'
import Alert, {AlertType} from 'pages/common/components/Alert/Alert'
import Button from 'pages/common/components/button/Button'
import DEPRECATED_Modal from 'pages/common/components/DEPRECATED_Modal'
import css from 'pages/common/components/PrivateReplyToFBComment/PrivateReplyModal/PrivateReplyModal.less'
import InputField from 'pages/common/forms/DEPRECATED_InputField'
import {update2FAEnabled} from 'state/currentUser/actions'
import {hasPassword as hasPasswordSelector} from 'state/currentUser/selectors'
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

    const hasPassword = useAppSelector(hasPasswordSelector)

    const [verificationCode, setVerificationCode] = useState('')
    const [userPassword, setUserPassword] = useState('')
    const [errorText, setErrorText] = useState('')
    const [isLoading, setIsLoading] = useState(false)

    const disableTwoFA = useCallback(async () => {
        try {
            setIsLoading(true)
            setErrorText('')

            if (!user) {
                await deleteTwoFASecret(
                    undefined,
                    verificationCode,
                    userPassword
                )
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
    }, [dispatch, onSuccess, user, verificationCode, userPassword])

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
                        isDisabled={!user && !verificationCode}
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
            {!user && (
                <>
                    {hasPassword && (
                        <>
                            <p className="mb-2 mt-3">Enter your password.</p>
                            <InputField
                                type="password"
                                name="userPassword"
                                placeholder="Enter your password"
                                onChange={setUserPassword}
                                className="mb-0"
                            />
                        </>
                    )}

                    <p className="mb-2 mt-3">
                        Enter a verification code from your authenticator app or
                        a recovery code.
                    </p>
                    <InputField
                        type="text"
                        name="verificationCode"
                        placeholder="Enter 6-digit verification code from app or recovery code"
                        onChange={setVerificationCode}
                        className="mb-0"
                    />
                </>
            )}
        </DEPRECATED_Modal>
    )
}
