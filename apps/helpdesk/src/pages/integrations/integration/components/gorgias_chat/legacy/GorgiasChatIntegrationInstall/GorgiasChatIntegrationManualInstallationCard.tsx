import React, { useEffect, useState } from 'react'

import classnames from 'classnames'
import type { Map } from 'immutable'

import { LegacyLoadingSpinner as LoadingSpinner } from '@gorgias/axiom'

import { useGetInstallationSnippet } from 'models/integration/queries'
import IconButton from 'pages/common/components/button/IconButton'
import Collapse from 'pages/common/components/Collapse/Collapse'
import { useGetConvertBundle } from 'pages/convert/bundles/hooks/useGetConvertBundle'
import { useConvertBundleInChatSnippetEnabled } from 'pages/integrations/integration/components/gorgias_chat/legacy/hooks/useConvertBundleInChatSnippetEnabled'
import { useConvertBundleInstallationSnippet } from 'pages/integrations/integration/components/gorgias_chat/legacy/hooks/useConvertBundleInstallationSnippet'

import ManualInstallationGTMTab from './GorgiasChatIntegrationManualInstallationTabs/ManualInstallationGTMTab'
import ManualInstallationOtherWebsiteTab from './GorgiasChatIntegrationManualInstallationTabs/ManualInstallationOtherWebsiteTab'
import ManualInstallationShopifyWebsiteTab from './GorgiasChatIntegrationManualInstallationTabs/ManualInstallationShopifyWebsiteTab'

import css from './GorgiasChatIntegrationManualInstallationCard.less'

type Props = {
    integration: Map<any, any>
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
    integration,
    applicationId,
    isConnected,
    isConnectedToShopify,
    isInstalledManually,
}: Props) => {
    const { data } = useGetInstallationSnippet(
        { applicationId: applicationId! },
        { enabled: !!applicationId },
    )

    const [isOpen, setIsOpen] = useState(!isConnected || !isConnectedToShopify)
    const [activeTab, setActiveTab] = useState<Tab>(
        isConnectedToShopify ? Tab.SHOPIFY : Tab.OTHER,
    )

    useEffect(() => {
        setIsOpen(!isConnected || !isConnectedToShopify)
        setActiveTab(isConnectedToShopify ? Tab.SHOPIFY : Tab.OTHER)
    }, [isConnected, isConnectedToShopify])

    const { snippet, appKey } = data || {}

    const chatId = integration.get('id')
    const storeId = integration.get('meta')?.get('shop_integration_id')

    const { isLoading, bundle } = useGetConvertBundle(storeId, chatId, {
        staleTime: 0, // Always fetch when generating the snippet.
    })

    const bundleSnippet = useConvertBundleInstallationSnippet(bundle?.id)
    const isBundleSnippetEnabled = useConvertBundleInChatSnippetEnabled()

    let code = snippet

    if (isBundleSnippetEnabled) code += '\n' + bundleSnippet

    const tabs = {
        [Tab.OTHER]: (
            <ManualInstallationOtherWebsiteTab
                code={code}
                alertMessage={
                    <>
                        Please note that by inserting this snippet on your
                        webpage, it will load the chat on that specific webpage
                        only. Make sure to insert the snippet on all the pages
                        for which you wish to display the chat widget.
                    </>
                }
            />
        ),
        [Tab.GTM]: (
            <ManualInstallationGTMTab
                applicationId={applicationId}
                appKey={appKey}
                alertMessage={
                    <>
                        Please note that if you install chat through Google Tag
                        Managers, customers using ad-blockers might not be able
                        to see your chat widget.
                    </>
                }
            />
        ),
        [Tab.SHOPIFY]: (
            <ManualInstallationShopifyWebsiteTab
                code={code}
                alertMessage={
                    <>
                        Please note that by copying the code to your Shopify{' '}
                        <b>theme.liquid</b> files, the chat will also be shown
                        on all webpages. Make sure to copy the code to just
                        specific pages if needed.
                    </>
                }
            />
        ),
    }
    const tabItems = [
        ...(!isConnected || isConnectedToShopify
            ? [{ id: Tab.SHOPIFY, title: 'Shopify Website' }]
            : []),
        { id: Tab.OTHER, title: 'Any Other Website' },
        { id: Tab.GTM, title: 'Google Tag Manager' },
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
                        style={{ fontSize: 24 }}
                    >
                        check_circle
                    </i>
                ) : null}
                <div>
                    <div className={css.title}>Manual installation</div>
                    <div>
                        Add the chat widget to non-Shopify stores, Shopify
                        Headless, specific pages on a Shopify store, or any
                        other website by following the instructions below. For
                        more details,{' '}
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
                    {isLoading ? (
                        <LoadingSpinner size="big" />
                    ) : (
                        tabs[activeTab]
                    )}
                </div>
            </Collapse>
        </div>
    )
}

export default GorgiasChatIntegrationManualInstallationCard
