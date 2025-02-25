import React, { ReactNode } from 'react'

import Button from 'pages/common/components/button/Button'
import Modal from 'pages/common/components/modal/Modal'
import ModalBody from 'pages/common/components/modal/ModalBody'

import css from './ThankYouModal.less'

type Props = {
    isOpen: boolean
    image: ReactNode
    title: string
    description: string
    actionLabel: string
    onClick: React.MouseEventHandler
    closeLabel: string
    onClose: () => void
}

const ThankYouModal: React.FC<Props> = ({
    isOpen,
    image,
    title,
    description,
    actionLabel,
    closeLabel,
    onClick,
    onClose,
}: Props) => {
    return (
        <Modal classNameDialog={css.modal} isOpen={isOpen} onClose={onClose}>
            <div className={css.modalImage}>{image}</div>
            <ModalBody>
                <h3 className="heading-page-semibold">{title}</h3>
                <p>{description}</p>
                <div className={css.buttonWrapper}>
                    <Button
                        className={css.buttonSpaced}
                        intent="primary"
                        fillStyle="fill"
                        onClick={onClick}
                    >
                        {actionLabel}
                    </Button>
                    <Button
                        intent="secondary"
                        fillStyle="fill"
                        onClick={onClose}
                    >
                        {closeLabel}
                    </Button>
                </div>
            </ModalBody>
        </Modal>
    )
}

export default ThankYouModal
