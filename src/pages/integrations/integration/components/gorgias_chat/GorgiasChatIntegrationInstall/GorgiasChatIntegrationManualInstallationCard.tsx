import React, {useEffect, useMemo, useState} from 'react'
import classnames from 'classnames'

import IconButton from 'pages/common/components/button/IconButton'
import Collapse from 'pages/common/components/Collapse/Collapse'
import {IntegrationType} from 'models/integration/constants'
import useAppSelector from 'hooks/useAppSelector'
import {getIntegrationTypeExtraState} from 'state/integrations/selectors'

import {renderChatCodeSnippet} from '../renderChatCodeSnippet'
import ManualInstallationShopifyWebsiteTab from './GorgiasChatIntegrationManualInstallationTabs/ManualInstallationShopifyWebsiteTab'
import ManualInstallationOtherWebsiteTab from './GorgiasChatIntegrationManualInstallationTabs/ManualInstallationOtherWebsiteTab'
import ManualInstallationGTMTab from './GorgiasChatIntegrationManualInstallationTabs/ManualInstallationGTMTab'

import css from './GorgiasChatIntegrationManualInstallationCard.less'

type Props = {
    applicationId: string
    isConnected: boolean
    isConnectedToShopify: boolean
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
}: Props) => {
    const getGorgiasChatExtraState = useMemo(
        () => getIntegrationTypeExtraState(IntegrationType.GorgiasChat),
        []
    )
    const gorgiasChatExtraState = useAppSelector(getGorgiasChatExtraState)
    const code = useMemo(
        () =>
            renderChatCodeSnippet({
                chatAppId: applicationId,
                gorgiasChatExtraState,
            }),
        [applicationId, gorgiasChatExtraState]
    )

    const [isOpen, setIsOpen] = useState(!isConnected || !isConnectedToShopify)
    const [activeTab, setActiveTab] = useState<Tab>(
        isConnectedToShopify ? Tab.SHOPIFY : Tab.OTHER
    )

    useEffect(() => {
        setIsOpen(!isConnected || !isConnectedToShopify)
        setActiveTab(isConnectedToShopify ? Tab.SHOPIFY : Tab.OTHER)
    }, [isConnected, isConnectedToShopify])

    const tabs = {
        [Tab.OTHER]: <ManualInstallationOtherWebsiteTab code={code} />,
        [Tab.GTM]: <ManualInstallationGTMTab applicationId={applicationId} />,
        [Tab.SHOPIFY]: <ManualInstallationShopifyWebsiteTab code={code} />,
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
                <IconButton fillStyle="ghost" intent="secondary">
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
