import React, { ReactNode } from 'react'

import Modal from 'pages/common/components/modal/Modal'
import ModalHeader from 'pages/common/components/modal/ModalHeader'

import css from './MigrationBaseModal.less'

type Props = {
    title: string
    isOpen: boolean
    onClose: () => void
    children: ReactNode
}

const MigrationBaseModal: React.FC<Props> = ({
    title,
    isOpen,
    onClose,
    children,
}) => {
    return (
        <Modal size="small" isOpen={isOpen} onClose={onClose}>
            <ModalHeader className={css.modalHeader} title={title} />
            {children}
        </Modal>
    )
}

export default MigrationBaseModal
