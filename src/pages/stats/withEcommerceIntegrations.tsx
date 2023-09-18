import React, {ComponentProps, ComponentType} from 'react'

import useAppSelector from 'hooks/useAppSelector'
import ecommerceIntegrations from 'assets/img/self-service/e-commerce-integrations.svg'
import {
    getIntegrationsList,
    hasIntegrationOfTypes,
} from 'state/integrations/selectors'
import {Category} from 'models/integration/types/app'
import LinkButton from 'pages/common/components/button/LinkButton'
import PageHeader from 'pages/common/components/PageHeader'
import HeaderTitle from 'pages/common/components/HeaderTitle'
import css from './withEcommerceIntegrations.less'

export const withEcommerceIntegration = (
    title: string,
    Component: ComponentType<Record<string, unknown>>
) => {
    return (ownProps: ComponentProps<typeof Component>) => {
        const integrationsList = useAppSelector(getIntegrationsList)
        const hasEcommerceIntegerations = useAppSelector(
            hasIntegrationOfTypes(
                integrationsList
                    .filter((integration) =>
                        integration.categories.includes(Category.ECOMMERCE)
                    )
                    .map((integration) => integration.type)
            )
        )

        return hasEcommerceIntegerations ? (
            <Component {...ownProps} />
        ) : (
            <div className={css.layout}>
                <PageHeader title={<HeaderTitle title={title} />}></PageHeader>

                <div className={css.wrapper}>
                    <img
                        src={ecommerceIntegrations}
                        alt="Feature preview"
                        className="img-fluid"
                    />
                    <div className={css.title}>
                        You don’t have a store connected
                    </div>
                    <div className={css.description}>
                        Connect Shopify, Magento or BigCommerce stores to start
                        using Automation add-on features!
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
}

export default withEcommerceIntegration
