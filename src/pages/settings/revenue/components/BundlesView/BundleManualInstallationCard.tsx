import React, {useEffect, useState} from 'react'
import classnames from 'classnames'

import IconButton from 'pages/common/components/button/IconButton'
import Collapse from 'pages/common/components/Collapse/Collapse'

import ManualInstallationShopifyWebsiteTab from 'pages/integrations/integration/components/gorgias_chat/GorgiasChatIntegrationInstall/GorgiasChatIntegrationManualInstallationTabs/ManualInstallationShopifyWebsiteTab'
import ManualInstallationOtherWebsiteTab from 'pages/integrations/integration/components/gorgias_chat/GorgiasChatIntegrationInstall/GorgiasChatIntegrationManualInstallationTabs/ManualInstallationOtherWebsiteTab'

import css from './BundleManualInstallationCard.less'

type Props = {
    bundleCode?: string
    isConnected: boolean
    isConnectedToShopify: boolean
    isInstalledManually: boolean
}

enum Tab {
    SHOPIFY = 1,
    OTHER,
}

const BundleManualInstallationCard = ({
    bundleCode,
    isConnected,
    isConnectedToShopify,
    isInstalledManually,
}: Props) => {
    const [isOpen, setIsOpen] = useState(!isConnected || !isConnectedToShopify)
    const [activeTab, setActiveTab] = useState<Tab>(
        isConnectedToShopify ? Tab.SHOPIFY : Tab.OTHER
    )

    useEffect(() => {
        setIsOpen(!isConnected || !isConnectedToShopify)
        setActiveTab(isConnectedToShopify ? Tab.SHOPIFY : Tab.OTHER)
    }, [isConnected, isConnectedToShopify])

    const tabs = {
        [Tab.OTHER]: (
            <ManualInstallationOtherWebsiteTab
                code={bundleCode}
                alertMessage={
                    <>
                        Please note that by inserting this snippet on your
                        webpage, it will load the campaigns on that specific
                        webpage only. Make sure to insert the snippet on all the
                        pages for which you wish to display the campaigns.
                    </>
                }
            />
        ),
        [Tab.SHOPIFY]: (
            <ManualInstallationShopifyWebsiteTab
                code={bundleCode}
                alertMessage={
                    <>
                        Please note that by copying the code to your Shopify{' '}
                        <b>theme.liquid</b> files, the campaigns will also be
                        shown on all webpages. Make sure to copy the code to
                        just specific pages if needed.
                    </>
                }
            />
        ),
    }
    const tabItems = [
        ...(!isConnected || isConnectedToShopify
            ? [{id: Tab.SHOPIFY, title: 'Shopify Website'}]
            : []),
        {id: Tab.OTHER, title: 'Any Other Website'},
    ]

    return (
        <div className={css.container}>
            <div
                className={css.header}
                onClick={() => {
                    setIsOpen(!isOpen)
                }}
            >
                {isInstalledManually ? (
                    <i
                        className="material-icons text-success"
                        style={{fontSize: 24}}
                    >
                        check_circle
                    </i>
                ) : null}
                <div>
                    <div className={css.title}>Manual installation</div>
                    <div>
                        Add the Campaign bundle to specific pages on a Shopify
                        store and to other e-commerce platforms or website,
                        follow the instructions below. For more details,{' '}
                        <a
                            target="_blank"
                            rel="noopener noreferrer"
                            href="https://docs.gorgias.com/en-US/campaigns-81793"
                        >
                            see this article
                        </a>
                        .
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
                        {tabItems.map(({id, title}) => (
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
