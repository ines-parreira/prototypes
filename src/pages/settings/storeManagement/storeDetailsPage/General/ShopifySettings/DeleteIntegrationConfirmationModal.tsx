import React from 'react'

import ConfirmationModal from './ConfirmationModal'

type DeleteIntegrationConfirmationModalProps = {
    isOpen: boolean
    storeType: string
    setIsOpen: (value: boolean) => void
    onConfirm: () => void
    isLoading?: boolean
    title?: string
}

export default function DeleteIntegrationConfirmationModal({
    isOpen,
    setIsOpen,
    onConfirm,
    isLoading,
    storeType,
}: DeleteIntegrationConfirmationModalProps) {
    return (
        <ConfirmationModal
            isOpen={isOpen}
            setIsOpen={setIsOpen}
            onConfirm={onConfirm}
            isLoading={isLoading}
            title="Delete store"
            confirmButtonText="Delete"
        >
            Are you sure you want to delete your {storeType} store from Gorgias?
            This action cannot be undone. All views and rules associated with
            this store will be disabled. The store integration needs to be
            removed from Saved Filters manually.
        </ConfirmationModal>
    )
}
