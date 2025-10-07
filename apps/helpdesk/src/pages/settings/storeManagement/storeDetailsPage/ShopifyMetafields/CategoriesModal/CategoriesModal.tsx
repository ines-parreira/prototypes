import React from 'react'

import Modal from 'pages/common/components/modal/Modal'
import ModalBody from 'pages/common/components/modal/ModalBody'
import ModalHeader from 'pages/common/components/modal/ModalHeader'

import CategoriesList from '../CategoriesList/CategoriesList'

import styles from './CategoriesModal.less'

interface CategoriesModalProps {
    onClose: () => void
    isOpen: boolean
}

export default function CategoriesModal({
    onClose,
    isOpen,
}: CategoriesModalProps) {
    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            size="medium"
            classNameContent={styles.categoriesModalContent}
        >
            <ModalHeader
                className={styles.categoriesModalHeader}
                title="Import Shopify metafields to Gorgias"
            />
            <ModalBody>
                <CategoriesList />
            </ModalBody>
        </Modal>
    )
}
