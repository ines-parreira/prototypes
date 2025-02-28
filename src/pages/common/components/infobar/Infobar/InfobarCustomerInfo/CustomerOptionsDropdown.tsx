import React, { useRef, useState } from 'react'

import { Map } from 'immutable'

import IconButton from 'pages/common/components/button/IconButton'
import DropdownBody from 'pages/common/components/dropdown/DropdownBody'
import DropdownItem from 'pages/common/components/dropdown/DropdownItem'
import UncontrolledDropdown from 'pages/common/components/dropdown/UncontrolledDropdown'
import Modal from 'pages/common/components/modal/Modal'
import ModalHeader from 'pages/common/components/modal/ModalHeader'
import CustomerForm from 'pages/customers/common/components/CustomerForm'

import css from './CustomerOptionsDropdown.less'

export default function CustomerOptionsDropdownButton({
    activeCustomer,
}: {
    activeCustomer: Map<string, any>
}) {
    const dropdownTargetRef = useRef<HTMLDivElement>(null)
    const [isCustomerEditFormOpen, setIsCustomerEditFormOpen] = useState(false)
    const [isCustomerSyncFormOpen, setIsCustomerSyncFormOpen] = useState(false)

    return (
        <>
            <>
                <div
                    ref={dropdownTargetRef}
                    data-testid="test-customer-options-dropdown-button"
                >
                    <IconButton intent={'secondary'}>more_vert</IconButton>
                </div>

                <UncontrolledDropdown
                    target={dropdownTargetRef}
                    placement="bottom-end"
                >
                    <DropdownBody>
                        <DropdownItem
                            option={{
                                label: 'Edit Customer',
                                value: 'edit',
                            }}
                            onClick={() => setIsCustomerEditFormOpen(true)}
                            shouldCloseOnSelect
                            className={css.item}
                        />

                        <DropdownItem
                            option={{
                                label: 'Sync profile in Shopify',
                                value: 'sync',
                            }}
                            onClick={() => setIsCustomerSyncFormOpen(true)}
                            shouldCloseOnSelect
                            className={css.item}
                        />
                    </DropdownBody>
                </UncontrolledDropdown>

                <Modal
                    isOpen={isCustomerEditFormOpen}
                    onClose={() => setIsCustomerEditFormOpen(false)}
                >
                    <ModalHeader
                        title={`Update customer: ${
                            activeCustomer.get('name') as string
                        }`}
                    />
                    <CustomerForm
                        customer={activeCustomer}
                        closeModal={() => setIsCustomerEditFormOpen(false)}
                    />
                </Modal>

                <Modal
                    isOpen={isCustomerSyncFormOpen}
                    onClose={() => setIsCustomerSyncFormOpen(false)}
                >
                    <ModalHeader
                        title={`Sync customer  ${activeCustomer.get('name') as string} with Shopify`}
                    />
                </Modal>
            </>
        </>
    )
}
