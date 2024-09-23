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
    icon?: SuccessModalIcon
    gif?: string
    size?: 'small' | 'medium' | 'large' | 'huge'
    buttonLabel: string
    isOpen: boolean
    onClose: () => void
}

const SuccessModal: React.FC<Props> = ({
    icon,
    gif,
    buttonLabel,
    isOpen,
    onClose,
    children,
    size = 'small',
}) => (
    <Modal isOpen={isOpen} onClose={onClose} size={size}>
        <ModalHeader title="" className={css.header} />
        <ModalBody className={css.body}>
            {icon && (
                <img
                    alt="success icon"
                    src={assetsUrl(`/img/icons/${icon}.png`)}
                    width={48}
                />
            )}
            {gif && (
                <img
                    alt="success modal gif"
                    src={assetsUrl(gif)}
                    width={485}
                    height={301}
                />
            )}
            <div className={css.content}>{children}</div>
            <Button onClick={onClose}>{buttonLabel}</Button>
        </ModalBody>
    </Modal>
)

export default SuccessModal
