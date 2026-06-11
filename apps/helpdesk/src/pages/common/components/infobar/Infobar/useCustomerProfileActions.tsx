import { useCallback, useMemo, useState } from 'react'

import { appQueryClient } from '@repo/api-resources'
import { fromJS } from 'immutable'

import { queryKeys } from '@gorgias/helpdesk-queries'
import type { TicketCustomer } from '@gorgias/helpdesk-types'

import { CustomerSyncForm } from 'pages/common/components/infobar/Infobar/InfobarCustomerInfo/CustomerSyncForm/CustomerSyncForm'
import { DefaultExportModal as Modal } from 'pages/common/components/modal/Modal'
import { ModalHeader } from 'pages/common/components/modal/ModalHeader'
import { DefaultExportCustomerForm as CustomerForm } from 'pages/customers/common/components/CustomerForm'

export function useCustomerProfileActions() {
    const [isCustomerEditFormOpen, setIsCustomerEditFormOpen] = useState(false)
    const [isCustomerSyncFormOpen, setIsCustomerSyncFormOpen] = useState(false)
    const [selectedCustomerForModal, setSelectedCustomerForModal] =
        useState<TicketCustomer | null>(null)

    const handleEditCustomer = useCallback((customer: TicketCustomer) => {
        setSelectedCustomerForModal(customer)
        setIsCustomerEditFormOpen(true)
    }, [])

    const handleSyncToShopify = useCallback((customer: TicketCustomer) => {
        setSelectedCustomerForModal(customer)
        setIsCustomerSyncFormOpen(true)
    }, [])

    const closeCustomerEditForm = useCallback(() => {
        setIsCustomerEditFormOpen(false)
        setSelectedCustomerForModal(null)
    }, [])

    const handleCustomerUpdated = useCallback(() => {
        if (!selectedCustomerForModal?.id) {
            return
        }

        void appQueryClient.invalidateQueries({
            queryKey: queryKeys.customers.getCustomer(
                selectedCustomerForModal.id,
            ),
        })
    }, [selectedCustomerForModal])

    const setCustomerSyncFormOpen = useCallback((isOpen: boolean) => {
        setIsCustomerSyncFormOpen(isOpen)
        if (!isOpen) {
            setSelectedCustomerForModal(null)
        }
    }, [])

    const customerProfileActionModals = useMemo(() => {
        if (!selectedCustomerForModal) {
            return null
        }

        const modalTitle = selectedCustomerForModal.name
            ? `Update customer: ${selectedCustomerForModal.name}`
            : 'Update customer'

        return (
            <>
                <Modal
                    isOpen={isCustomerEditFormOpen}
                    onClose={closeCustomerEditForm}
                >
                    <ModalHeader title={modalTitle} />
                    <CustomerForm
                        customer={fromJS(selectedCustomerForModal)}
                        onSuccess={handleCustomerUpdated}
                        closeModal={closeCustomerEditForm}
                    />
                </Modal>
                {isCustomerSyncFormOpen && (
                    <CustomerSyncForm
                        isCustomerSyncFormOpen={isCustomerSyncFormOpen}
                        activeCustomer={fromJS(selectedCustomerForModal)}
                        setIsCustomerSyncFormOpen={setCustomerSyncFormOpen}
                    />
                )}
            </>
        )
    }, [
        closeCustomerEditForm,
        handleCustomerUpdated,
        isCustomerEditFormOpen,
        isCustomerSyncFormOpen,
        selectedCustomerForModal,
        setCustomerSyncFormOpen,
    ])

    return {
        handleEditCustomer,
        handleSyncToShopify,
        customerProfileActionModals,
    }
}
