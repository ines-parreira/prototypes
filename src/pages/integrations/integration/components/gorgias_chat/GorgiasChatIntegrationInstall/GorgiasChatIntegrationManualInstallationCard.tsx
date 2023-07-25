import React, {useEffect, useState} from 'react'
import classnames from 'classnames'

import {useGetInstallationSnippet} from 'models/integration/queries'
import IconButton from 'pages/common/components/button/IconButton'
import Collapse from 'pages/common/components/Collapse/Collapse'
import ManualInstallationShopifyWebsiteTab from './GorgiasChatIntegrationManualInstallationTabs/ManualInstallationShopifyWebsiteTab'
import ManualInstallationOtherWebsiteTab from './GorgiasChatIntegrationManualInstallationTabs/ManualInstallationOtherWebsiteTab'
import ManualInstallationGTMTab from './GorgiasChatIntegrationManualInstallationTabs/ManualInstallationGTMTab'

import css from './GorgiasChatIntegrationManualInstallationCard.less'

type Props = {
    applicationId?: string
    isConnected: boolean
    isConnectedToShopify: boolean
    isInstalledManually: boolean
}

enum Tab {
    SHOPIFY = 1,
    OTHER,
    GTM,
}

const GorgiasChatIntegrationManualInstallationCard = ({
    applicationId,
    isConnected,
    isConnectedToShopify,
    isInstalledManually,
}: Props) => {
    const {data} = useGetInstallationSnippet(
        {applicationId: applicationId!},
        {enabled: !!applicationId}
    )

    const [isOpen, setIsOpen] = useState(!isConnected || !isConnectedToShopify)
    const [activeTab, setActiveTab] = useState<Tab>(
        isConnectedToShopify ? Tab.SHOPIFY : Tab.OTHER
    )

    useEffect(() => {
        setIsOpen(!isConnected || !isConnectedToShopify)
        setActiveTab(isConnectedToShopify ? Tab.SHOPIFY : Tab.OTHER)
    }, [isConnected, isConnectedToShopify])

    const {snippet, appKey} = data || {}

    const tabs = {
        [Tab.OTHER]: <ManualInstallationOtherWebsiteTab code={snippet} />,
        [Tab.GTM]: (
            <ManualInstallationGTMTab
                applicationId={applicationId}
                appKey={appKey}
            />
        ),
        [Tab.SHOPIFY]: <ManualInstallationShopifyWebsiteTab code={snippet} />,
    }
    const tabItems = [
        ...(!isConnected || isConnectedToShopify
            ? [{id: Tab.SHOPIFY, title: 'Shopify Website'}]
            : []),
        {id: Tab.OTHER, title: 'Any Other Website'},
        {id: Tab.GTM, title: 'Google Tag Manager'},
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
                        Add the chat widget to specific pages on a Shopify store
                        and to other e-commerce platforms or website, follow the
                        instructions below. For more details,{' '}
                        <a
                            target="_blank"
                            rel="noopener noreferrer"
                            href="https://docs.gorgias.com/gorgias-chat/chat-getting-started"
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

export default GorgiasChatIntegrationManualInstallationCard
