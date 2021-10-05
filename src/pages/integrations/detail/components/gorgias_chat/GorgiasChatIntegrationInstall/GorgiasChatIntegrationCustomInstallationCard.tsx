import React, {useState} from 'react'
import {
    Card,
    CardBody,
    Collapse,
    CardHeader,
    Nav,
    NavItem,
    NavLink,
    TabContent,
    TabPane,
} from 'reactstrap'
import classnames from 'classnames'

import CustomInstallationShopifyTab from './GorgiasChatIntegrationCustomInstallationTabs/CustomInstallationShopifyTab'
import CustomInstallationOtherWebsiteTab from './GorgiasChatIntegrationCustomInstallationTabs/CustomInstallationOtherWebsiteTab'
import css from './GorgiasChatIntegrationCustomInstallationCard.less'

enum CustomInstallationTab {
    SHOPIFY = 'SHOPIFY',
    OTHER_WEBSITE = 'OTHER_WEBSITE',
    GOOGLE_TAG_MANAGER = 'GOOGLE_TAG_MANAGER',
}

type Props = {
    code: string
    integrationId: string
    isShopifyChat: boolean
}

export function GorgiasChatIntegrationCustomInstallationCard({
    code,
    integrationId,
    isShopifyChat,
}: Props) {
    const [isOpen, setIsOpen] = useState(!isShopifyChat)
    const [activeTab, setActiveTab] = useState(
        isShopifyChat
            ? CustomInstallationTab.SHOPIFY
            : CustomInstallationTab.OTHER_WEBSITE
    )

    const toggleIsOpen = () => setIsOpen(!isOpen)
    const toggleActiveTab = (activeTab: CustomInstallationTab) =>
        setActiveTab(activeTab)

    let customInstallationTabs: {
        title: string
        tabId: CustomInstallationTab
        tabComponent: React.ReactNode
        disabled?: boolean
        hoverTitle?: string
    }[] = [
        {
            title: 'Any other website',
            tabId: CustomInstallationTab.OTHER_WEBSITE,
            tabComponent: <CustomInstallationOtherWebsiteTab code={code} />,
        },
        {
            title: 'Google Tag Manager',
            tabId: CustomInstallationTab.GOOGLE_TAG_MANAGER,
            tabComponent: null,
            disabled: true,
            hoverTitle: 'Coming soon!',
        },
    ]

    if (isShopifyChat) {
        customInstallationTabs = [
            {
                title: 'Shopify website',
                tabId: CustomInstallationTab.SHOPIFY,
                tabComponent: (
                    <CustomInstallationShopifyTab
                        sspAvailable={isShopifyChat}
                        code={code}
                        integrationId={integrationId}
                    />
                ),
            },
            ...customInstallationTabs,
        ]
    }

    return (
        <Card className={css['card']}>
            <CardHeader className={css['card-header']}>
                <h3>Custom installation</h3>
                <button
                    onClick={toggleIsOpen}
                    aria-label={isOpen ? 'collapse card' : 'expand card'}
                >
                    <i className={`material-icons`}>
                        {isOpen ? 'keyboard_arrow_up' : 'keyboard_arrow_down'}
                    </i>
                </button>
            </CardHeader>

            <Collapse isOpen={isOpen}>
                <CardBody className={css['card-body']}>
                    <p>
                        If you're not using Shopify or wish to add the chat
                        widget manually only to specific Shopify webpages,
                        follow the instructions below. For more details,{' '}
                        <a
                            target="_blank"
                            rel="noopener noreferrer"
                            href="https://docs.gorgias.com/gorgias-chat/chat-getting-started"
                        >
                            see this article
                        </a>
                        .
                    </p>
                    <h4>Install chat widget</h4>
                    <Nav className={css['tab-bar']} tabs>
                        {customInstallationTabs.map(
                            ({title, tabId, disabled, hoverTitle}) => (
                                <NavItem
                                    key={`tab-link-${tabId}`}
                                    className={css['tab-item']}
                                    title={hoverTitle}
                                >
                                    <NavLink
                                        href={disabled ? undefined : '#'}
                                        disabled={disabled}
                                        className={classnames({
                                            [css.activeTab]:
                                                activeTab === tabId,
                                            [css.tabLink]: true,
                                        })}
                                        onClick={() => {
                                            toggleActiveTab(tabId)
                                        }}
                                    >
                                        {title}
                                    </NavLink>
                                </NavItem>
                            )
                        )}
                    </Nav>
                    <TabContent activeTab={activeTab}>
                        {customInstallationTabs.map(({tabId, tabComponent}) => (
                            <TabPane key={`tab-pane-${tabId}`} tabId={tabId}>
                                {tabComponent}
                            </TabPane>
                        ))}
                    </TabContent>
                </CardBody>
            </Collapse>
        </Card>
    )
}

export default GorgiasChatIntegrationCustomInstallationCard
