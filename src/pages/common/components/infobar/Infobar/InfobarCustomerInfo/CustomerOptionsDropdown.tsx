import React, { useRef, useState } from 'react'

import { Map } from 'immutable'

import useAppSelector from 'hooks/useAppSelector'
import { IntegrationType } from 'models/integration/constants'
import IconButton from 'pages/common/components/button/IconButton'
import DropdownBody from 'pages/common/components/dropdown/DropdownBody'
import DropdownItem from 'pages/common/components/dropdown/DropdownItem'
import UncontrolledDropdown from 'pages/common/components/dropdown/UncontrolledDropdown'
import Modal from 'pages/common/components/modal/Modal'
import ModalHeader from 'pages/common/components/modal/ModalHeader'
import CustomerForm from 'pages/customers/common/components/CustomerForm'
import { makeHasIntegrationOfTypes } from 'state/integrations/selectors'

import CustomerSyncForm from './CustomerSyncForm/CustomerSyncForm'

import css from './CustomerOptionsDropdown.less'

interface Props {
    activeCustomer: Map<string, any>
}

export default function CustomerOptionsDropdownButton({
    activeCustomer,
}: Props) {
    const dropdownTargetRef = useRef<HTMLDivElement>(null)
    const [isCustomerEditFormOpen, setIsCustomerEditFormOpen] = useState(false)
    const [isCustomerSyncFormOpen, setIsCustomerSyncFormOpen] = useState(false)
    const hasIntegrationsOfTypes = useAppSelector(makeHasIntegrationOfTypes)

    const hasShopifyIntegration = hasIntegrationsOfTypes(
        IntegrationType.Shopify,
    )
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
                        {hasShopifyIntegration && (
                            <DropdownItem
                                option={{
                                    label: 'Sync profile to Shopify',
                                    value: 'sync',
                                }}
                                onClick={() => setIsCustomerSyncFormOpen(true)}
                                shouldCloseOnSelect
                                className={css.item}
                            />
                        )}
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
                {isCustomerSyncFormOpen && (
                    <CustomerSyncForm
                        isCustomerSyncFormOpen={isCustomerSyncFormOpen}
                        activeCustomer={activeCustomer}
                        setIsCustomerSyncFormOpen={setIsCustomerSyncFormOpen}
                    />
                )}
            </>
        </>
    )
}
