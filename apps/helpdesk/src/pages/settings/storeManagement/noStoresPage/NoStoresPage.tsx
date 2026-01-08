import React from 'react'

import { Link } from 'react-router-dom'

import { Button } from '@gorgias/axiom'

import GenericStoreIcon from 'assets/img/icons/generic-store.svg'
import PageHeader from 'pages/common/components/PageHeader'

import css from './NoStoresPage.less'

export default function NoStoresPage() {
    return (
        <div className="full-width">
            <PageHeader title="Store Management"></PageHeader>

            <div className={css.wrapper}>
                <div className={css.container}>
                    <img
                        className={css.noStoreIcon}
                        src={GenericStoreIcon}
                        alt="store"
                    />
                    <h4 className={css.title}>Connect your first store</h4>
                    <p className={css.message}>
                        Connect Shopify, Magento or BigCommerce stores to start
                        managing customer interactions.
                    </p>
                    <Link to="/app/settings/integrations?category=Ecommerce">
                        <Button>Connect Store</Button>
                    </Link>
                </div>
            </div>
        </div>
    )
}
