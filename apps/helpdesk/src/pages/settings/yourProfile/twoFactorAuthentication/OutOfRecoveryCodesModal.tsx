import { useHistory } from 'react-router-dom'

import { Button } from '@gorgias/axiom'

import outOfRecoveryCodesImage from 'assets/img/auth/out-of-recovery-codes.svg'
import { useSearch } from 'hooks/useSearch'
import Modal from 'pages/common/components/modal/Modal'
import ModalActionsFooter from 'pages/common/components/modal/ModalActionsFooter'
import ModalBody from 'pages/common/components/modal/ModalBody'
import ModalHeader from 'pages/common/components/modal/ModalHeader'

export default function OutOfRecoveryCodesModal() {
    // Only show the modal when "?out_of_recovery_codes=true" is passed in the URL
    const showModal =
        useSearch<{
            out_of_recovery_codes?: string
        }>().out_of_recovery_codes?.toLowerCase() === 'true'

    // Go to the 2FA settings page when clicking the button
    const history = useHistory()
    const onResetAuthentication = () => {
        history.push('/app/settings/password-2fa')
    }

    return (
        <Modal isOpen={showModal} isClosable={false} onClose={() => {}}>
            <ModalHeader title="Reset Authentication Now" />
            <ModalBody>
                <div className="text-center mb-3">
                    <img src={outOfRecoveryCodesImage} alt="" />
                </div>
                <p className="mb-0">
                    You have used up your emergency backup codes.{' '}
                    <b>Reset your 2-factor authentication</b> to ensure you have
                    continued access to your account.
                </p>
            </ModalBody>
            <ModalActionsFooter>
                <Button intent="primary" onClick={onResetAuthentication}>
                    Reset Authentication
                </Button>
            </ModalActionsFooter>
        </Modal>
    )
}
