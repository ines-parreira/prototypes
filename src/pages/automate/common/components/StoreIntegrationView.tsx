import React from 'react'

import storeIntegrations from 'assets/img/self-service/e-commerce-integrations.svg'
import LinkButton from 'pages/common/components/button/LinkButton'
import PageHeader from 'pages/common/components/PageHeader'

import css from './StoreIntegrationView.less'

const StoreIntegrationView = ({title}: {title: string}) => {
    return (
        <div className={css.layout}>
            <PageHeader title={title}></PageHeader>

            <div className={css.wrapper}>
                <img
                    src={storeIntegrations}
                    alt="Feature preview"
                    className="img-fluid"
                />
                <div className={css.title}>
                    You don’t have a store connected
                </div>
                <div className={css.description}>
                    Connect Shopify, Magento or BigCommerce stores to start
                    using Automate!
                </div>

                <LinkButton
                    target=""
                    href="/app/settings/integrations?category=Ecommerce"
                >
                    Go to app store
                </LinkButton>
            </div>
        </div>
    )
}
export default StoreIntegrationView
