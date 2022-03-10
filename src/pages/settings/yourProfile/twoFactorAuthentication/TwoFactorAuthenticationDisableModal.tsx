import React, {useCallback, useState} from 'react'
import {AxiosError} from 'axios'
import useAppDispatch from 'hooks/useAppDispatch'
import Modal from '../../../common/components/Modal'
import css from '../../../common/components/PrivateReplyToFBComment/PrivateReplyModal/PrivateReplyModal.less'
import {deleteTwoFASecret} from '../../../../models/twoFactorAuthentication/resources'
import Button, {ButtonIntent} from '../../../common/components/button/Button'
import {update2FAEnabled} from '../../../../state/currentUser/actions'
import Alert, {AlertType} from '../../../common/components/Alert/Alert'

export type OwnProps = {
    isOpen: boolean
    onClose: () => void
}

export default function TwoFactorAuthenticationDisableModal({
    isOpen,
    onClose,
}: OwnProps) {
    const dispatch = useAppDispatch()

    const [errorText, setErrorText] = useState('')
    const [isLoading, setIsLoading] = useState(false)

    const disableTwoFa = useCallback(async () => {
        try {
            setIsLoading(true)
            setErrorText('')
            await deleteTwoFASecret()
            void dispatch(update2FAEnabled(false))
            onClose()
        } catch (error) {
            const {response} = error as AxiosError<{error: {msg: string}}>
            if (response) {
                setErrorText(response.data.error.msg)
            }
            console.error(error)
        } finally {
            setIsLoading(false)
        }
    }, [dispatch, onClose])

    return (
        <Modal
            isOpen={isOpen}
            header="Deactivate Two-Factor Authentication?"
            onClose={onClose}
            style={{maxWidth: '600px'}}
            footerClassName={css.modalFooter}
            footer={
                <>
                    <Button
                        intent={ButtonIntent.Secondary}
                        onClick={onClose}
                        isDisabled={isLoading}
                        className="mr-auto"
                    >
                        Cancel
                    </Button>
                    <Button
                        intent={ButtonIntent.Destructive}
                        onClick={disableTwoFa}
                        isLoading={isLoading}
                    >
                        Deactivate Authentication
                    </Button>
                </>
            }
        >
            {errorText && (
                <Alert type={AlertType.Error} className="mb-3" icon>
                    {errorText}
                </Alert>
            )}
            Your account will no longer benefit from this extra layer of
            security.
        </Modal>
    )
}
