import React from 'react'

import { Link } from 'react-router-dom'

import ConfirmationModal from './ConfirmationModal'

type ConfirmCustomerMatchingModalProps = {
    isOpen: boolean
    setIsOpen: (value: boolean) => void
    onConfirm: () => void
    onCancel?: () => void
    isLoading?: boolean
    title?: string
}

export default function ConfirmCustomerMatchingModal({
    isOpen,
    setIsOpen,
    onConfirm,
    isLoading,
    onCancel,
}: ConfirmCustomerMatchingModalProps) {
    return (
        <ConfirmationModal
            isOpen={isOpen}
            setIsOpen={setIsOpen}
            onConfirm={onConfirm}
            isLoading={isLoading}
            onCancel={onCancel}
            title="Enable customer matching"
            confirmButtonText="Enable"
        >
            Are you sure you want to activate this setting? Matching customers
            by default address may merged unrelated customers, especially if the
            same number is used by multiple customers.{' '}
            <Link to="https://docs.gorgias.com/en-US/shopify-faqs-81985">
                Learn more{' '}
            </Link>
        </ConfirmationModal>
    )
}
