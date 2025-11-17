import type React from 'react'

import classNames from 'classnames'

import { Badge, LegacyButton as Button } from '@gorgias/axiom'

import Modal from 'pages/common/components/modal/Modal'
import ModalActionsFooter from 'pages/common/components/modal/ModalActionsFooter'
import ModalBody from 'pages/common/components/modal/ModalBody'
import ModalHeader from 'pages/common/components/modal/ModalHeader'

import css from './AIAgentTrialSuccessModal.less'

export const MODAL_NAME = 'AiAgentTrialModal'

type Props = {
    isOpen: boolean
    onClick: React.MouseEventHandler
    onClose: () => void
}

const AIAgentTrialSuccessModal: React.FC<Props> = ({
    isOpen,
    onClick,
    onClose,
}: Props) => {
    return (
        <Modal isOpen={isOpen} onClose={onClose} size="huge">
            <ModalHeader
                title={
                    <h3
                        className={classNames(
                            'heading-page-semibold',
                            css.headerTitle,
                        )}
                    >
                        Shopping Assistant is live on your site!
                    </h3>
                }
            />
            <ModalBody className={css.modalBody}>
                <div className={css.bodyWrapper}>
                    <div className={css.contentContainer}>
                        <div className={css.leftSide}>
                            <h4>You’re ready to turn shoppers into buyers!</h4>
                            <p>
                                Complete Shopping Assistant’s set up to unlock
                                its full potential.
                            </p>
                        </div>
                        <div className={css.rightSide}>
                            <div className={css.stateWrapper}>
                                <div
                                    className={classNames(
                                        css.state,
                                        css.success,
                                    )}
                                >
                                    <div className={css.line}>
                                        <div className={css.icon}>
                                            <i className="material-icons">
                                                check_circle_outline
                                            </i>
                                        </div>
                                    </div>
                                    <div>
                                        <div className={css.stateContainer}>
                                            <h5 className={css.title}>
                                                Activate Shopping Assistant
                                                Trial
                                            </h5>
                                        </div>
                                    </div>
                                </div>
                                <div className={classNames(css.state)}>
                                    <div className={css.line}>
                                        <div className={css.icon}>
                                            <i className="material-icons">
                                                check_circle_outline
                                            </i>
                                        </div>
                                    </div>
                                    <div>
                                        <div className={css.stateContainer}>
                                            <h5 className={css.title}>
                                                Turn on Customer Engagement
                                                Tools
                                            </h5>
                                            <Badge
                                                type="light"
                                                className={css.badge}
                                            >
                                                <i className="material-icons">
                                                    lock
                                                </i>
                                                Unlock your +15% conversion
                                                boost
                                            </Badge>
                                        </div>
                                    </div>
                                </div>
                                <div className={classNames(css.state)}>
                                    <div className={css.icon}>
                                        <i className="material-icons">
                                            check_circle_outline
                                        </i>
                                    </div>
                                    <div className={css.stateContainer}>
                                        <h5 className={css.title}>
                                            Set Up Discount Strategy
                                        </h5>
                                        <Badge
                                            type="light"
                                            className={css.badge}
                                        >
                                            <i className="material-icons">
                                                lock
                                            </i>
                                            Unlock your up to +50% conversion
                                            boost
                                        </Badge>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </ModalBody>
            <ModalActionsFooter className={css.modalActionsFooter}>
                <Button onClick={onClick}>Complete set up</Button>
            </ModalActionsFooter>
        </Modal>
    )
}

export default AIAgentTrialSuccessModal
