import React from 'react'

import {assetsUrl} from 'utils'

import Button from 'pages/common/components/button/Button'
import Modal from 'pages/common/components/modal/Modal'
import ModalHeader from 'pages/common/components/modal/ModalHeader'
import ModalBody from 'pages/common/components/modal/ModalBody'

import css from './SuccessModal.less'

export enum SuccessModalIcon {
    PinchingHand = 'pinching-hand',
    PartyPopper = 'party-popper',
}

type Props = {
    icon: SuccessModalIcon
    buttonLabel: string
    isOpen: boolean
    onClose: () => void
}

const SuccessModal: React.FC<Props> = ({
    icon,
    buttonLabel,
    isOpen,
    onClose,
    children,
}) => (
    <Modal isOpen={isOpen} onClose={onClose} size="small">
        <ModalHeader title="" className={css.header} />
        <ModalBody className={css.body}>
            <img
                alt="success icon"
                src={assetsUrl(`/img/icons/${icon}.png`)}
                width={48}
            />
            <div className={css.content}>{children}</div>
            <Button onClick={onClose}>{buttonLabel}</Button>
        </ModalBody>
    </Modal>
)

export default SuccessModal
