import React, { useState } from 'react'

import { Map } from 'immutable'

import { Button } from '@gorgias/merchant-ui-kit'

import { IntegrationType } from 'models/integration/constants'
import CustomerSyncForm from 'pages/common/components/infobar/Infobar/InfobarCustomerInfo/CustomerSyncForm/CustomerSyncForm'
import { getIconFromType } from 'state/integrations/helpers'

import css from './ShopifyCustomerProfileSync.less'

interface Props {
    activeCustomer: Map<string, any>
}
/**
 * Render a section with option to sync customer profile to Shopify.
 */
export default function ShopifyCustomerProfileSync({ activeCustomer }: Props) {
    const [isCustomerSyncFormOpen, setIsCustomerSyncFormOpen] = useState(false)

    const openSyncModal = () => {
        setIsCustomerSyncFormOpen(true)
    }

    return (
        <div className={css.customerProfileSyncButtonContainer}>
            <div className={css.customerProfileSyncButtonItem}>
                <div className={css.customerProfileSyncButtonContent}>
                    <img
                        src={getIconFromType(IntegrationType.Shopify)}
                        alt="Shopify logo"
                        className={css.shopifyLogo}
                    />
                    Sync customer to Shopify
                    <Button type="button" size="small" onClick={openSyncModal}>
                        Sync Profile
                    </Button>
                </div>
                <CustomerSyncForm
                    isCustomerSyncFormOpen={isCustomerSyncFormOpen}
                    activeCustomer={activeCustomer}
                    setIsCustomerSyncFormOpen={setIsCustomerSyncFormOpen}
                />
            </div>
        </div>
    )
}
