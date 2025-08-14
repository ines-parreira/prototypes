import { Link } from 'react-router-dom'

import { Button } from '@gorgias/axiom'

import infoIcon from 'assets/img/icons/info.svg'
import { useSearchParam } from 'hooks/useSearchParam'
import Modal from 'pages/common/components/modal/Modal'
import ModalActionsFooter from 'pages/common/components/modal/ModalActionsFooter'
import ModalBody from 'pages/common/components/modal/ModalBody'
import ModalHeader from 'pages/common/components/modal/ModalHeader'

import css from './VerifyDomainModal.less'

export default function VerifyDomainModal() {
    const [isRedirectParam, setIsRedirectParam] = useSearchParam('is_redirect')

    const handleModalClose = () => {
        setIsRedirectParam(null)
    }

    return (
        <Modal isOpen={isRedirectParam === 'true'} onClose={handleModalClose}>
            <ModalHeader
                title={
                    <div className={css.title}>
                        <img src={infoIcon} alt="icon" />
                        <div>Verify your email domain</div>
                    </div>
                }
            />
            <ModalBody className={css.body}>
                Your email is connected! Complete your email setup by verifying
                your domain –{' '}
                <strong>
                    you will not be able to send emails from Gorgias until you
                    complete this step
                </strong>
                .
            </ModalBody>
            <ModalActionsFooter>
                <Link to="/app/settings/channels/email">
                    <Button intent="secondary">Finish later</Button>
                </Link>
                <Button onClick={handleModalClose}>Verify domain</Button>
            </ModalActionsFooter>
        </Modal>
    )
}
