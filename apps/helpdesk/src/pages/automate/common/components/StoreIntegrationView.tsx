import classNames from 'classnames'

import LinkButton from 'pages/common/components/button/LinkButton'
import PageHeader from 'pages/common/components/PageHeader'

import css from './StoreIntegrationView.less'

const StoreIntegrationView = ({ title }: { title: string }) => {
    return (
        <div className={css.layout}>
            <PageHeader title={title} />

            <div className={css.wrapper}>
                <div className={css.title}>
                    You don’t have a store connected
                </div>
                <p className={css.description}>
                    Connect your store to start using AI Agent.
                    <br />
                    <span className={classNames('caption-regular')}>
                        Note: AI Agent is currently available only with Shopify.
                    </span>
                </p>

                <LinkButton target="" href="/app/settings/integrations/shopify">
                    Connect My Shopify Store
                </LinkButton>
            </div>
        </div>
    )
}
export default StoreIntegrationView
