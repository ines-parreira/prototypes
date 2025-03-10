import React from 'react'

import { Map } from 'immutable'

import Modal from 'pages/common/components/modal/Modal'
import ModalHeader from 'pages/common/components/modal/ModalHeader'

interface Props {
    activeCustomer: Map<string, any>
    isOpen: boolean
    onClose: () => void
}

export default function ShopifyCustomerProfileSyncModal({
    activeCustomer,
    isOpen,
    onClose,
}: Props) {
    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <ModalHeader
                title={`Sync customer ${activeCustomer.get('name') as string} with Shopify`}
            />
        </Modal>
    )
}
