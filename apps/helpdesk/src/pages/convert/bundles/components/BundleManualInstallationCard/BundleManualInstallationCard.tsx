import React, { useEffect, useState } from 'react'

import classnames from 'classnames'

import IconButton from 'pages/common/components/button/IconButton'
import Collapse from 'pages/common/components/Collapse/Collapse'
import ManualInstallationOtherWebsiteTab from 'pages/integrations/integration/components/gorgias_chat/legacy/GorgiasChatIntegrationInstall/GorgiasChatIntegrationManualInstallationTabs/ManualInstallationOtherWebsiteTab'
import ManualInstallationShopifyWebsiteTab from 'pages/integrations/integration/components/gorgias_chat/legacy/GorgiasChatIntegrationInstall/GorgiasChatIntegrationManualInstallationTabs/ManualInstallationShopifyWebsiteTab'

import css from './BundleManualInstallationCard.less'

type Props = {
    bundleCode?: string
    isConnected: boolean
    isConnectedToShopify: boolean
    isBordered: boolean
}

enum Tab {
    SHOPIFY = 1,
    OTHER,
}

const BundleManualInstallationCard = ({
    bundleCode,
    isConnected,
    isConnectedToShopify,
    isBordered,
}: Props) => {
    const [isOpen, setIsOpen] = useState(!isConnected || !isConnectedToShopify)
    const [activeTab, setActiveTab] = useState<Tab>(
        isConnectedToShopify ? Tab.SHOPIFY : Tab.OTHER,
    )

    useEffect(() => {
        setIsOpen(!isConnected || !isConnectedToShopify)
        setActiveTab(isConnectedToShopify ? Tab.SHOPIFY : Tab.OTHER)
    }, [isConnected, isConnectedToShopify])

    const tabs = {
        [Tab.OTHER]: <ManualInstallationOtherWebsiteTab code={bundleCode} />,
        [Tab.SHOPIFY]: (
            <ManualInstallationShopifyWebsiteTab code={bundleCode} />
        ),
    }
    const tabItems = [
        ...(!isConnected || isConnectedToShopify
            ? [{ id: Tab.SHOPIFY, title: 'Shopify Website' }]
            : []),
        { id: Tab.OTHER, title: 'Any Other Website' },
    ]

    return (
        <div
            className={classnames({
                [css.container]: true,
                [css.isBordered]: isBordered,
            })}
        >
            <div
                className={css.header}
                onClick={() => {
                    setIsOpen(!isOpen)
                }}
            >
                <div>
                    <div className={css.title}>Manual installation</div>
                    <div>
                        Install the campaign bundle on Shopify Headless stores,
                        specific pages on a Shopify store, or any other website
                        by following the instructions below. For more details,{' '}
                        <a
                            target="_blank"
                            rel="noopener noreferrer"
                            href="https://docs.gorgias.com/en-US/install-campaign-bundle-442715"
                        >
                            see this article
                        </a>
                        . You will still be able to access these instructions
                        from the Installation tab after you finish setting up.
                    </div>
                </div>
                <IconButton
                    className={css.toggleCollapseButton}
                    fillStyle="ghost"
                    intent="secondary"
                >
                    {isOpen ? 'keyboard_arrow_up' : 'keyboard_arrow_down'}
                </IconButton>
            </div>

            <Collapse isOpen={isOpen}>
                <div className={css.content}>
                    <div className={css.tabs}>
                        {tabItems.map(({ id, title }) => (
                            <div
                                key={id}
                                className={classnames(css.tabItem, {
                                    [css.isActive]: activeTab === id,
                                })}
                                onClick={() => {
                                    setActiveTab(id)
                                }}
                            >
                                {title}
                            </div>
                        ))}
                    </div>
                    {tabs[activeTab]}
                </div>
            </Collapse>
        </div>
    )
}

export default BundleManualInstallationCard
