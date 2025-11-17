import React, { useRef } from 'react'

import type { Map } from 'immutable'

import type { TicketCustomer } from '@gorgias/helpdesk-types'

import useAppSelector from 'hooks/useAppSelector'
import { IntegrationType } from 'models/integration/constants'
import IconButton from 'pages/common/components/button/IconButton'
import DropdownBody from 'pages/common/components/dropdown/DropdownBody'
import DropdownItem from 'pages/common/components/dropdown/DropdownItem'
import UncontrolledDropdown from 'pages/common/components/dropdown/UncontrolledDropdown'
import { makeHasIntegrationOfTypes } from 'state/integrations/selectors'

import css from './CustomerOptionsDropdown.less'

interface Props {
    activeCustomer: Map<string, any>
    onEditCustomer: (customer: TicketCustomer) => void
    onSyncToShopify: (customer: TicketCustomer) => void
}

export default function CustomerOptionsDropdownButton({
    activeCustomer,
    onEditCustomer,
    onSyncToShopify,
}: Props) {
    const dropdownTargetRef = useRef<HTMLDivElement>(null)
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
                            onClick={() => {
                                onEditCustomer(
                                    activeCustomer.toJS() as TicketCustomer,
                                )
                            }}
                            shouldCloseOnSelect
                            className={css.item}
                        />
                        {hasShopifyIntegration && (
                            <DropdownItem
                                option={{
                                    label: 'Sync profile to Shopify',
                                    value: 'sync',
                                }}
                                onClick={() => {
                                    onSyncToShopify(
                                        activeCustomer.toJS() as TicketCustomer,
                                    )
                                }}
                                shouldCloseOnSelect
                                className={css.item}
                            />
                        )}
                    </DropdownBody>
                </UncontrolledDropdown>
            </>
        </>
    )
}
