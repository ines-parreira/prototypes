import React from 'react'

import { NavLink } from 'react-router-dom'

import dotError from 'assets/img/icons/dot-error.svg'
import dotSuccess from 'assets/img/icons/dot-success.svg'
import { Navigation } from 'components/Navigation/Navigation'
import { NavigationItem } from 'pages/aiAgent/hooks/useAiAgentNavigation'

import { NavigationChannelType } from './utils'

import css from '../AiAgentNavbar/AiAgentNavbar.less'

type Props = {
    navigationItems: NavigationItem[]
    selectedStore?: string
    getChannelStatus?: (channelType: NavigationChannelType) => boolean
}

const StatusIndicator = ({
    title,
    isActive,
}: {
    title: string
    isActive: boolean
}) => {
    return (
        <div className={css.statusIndicator}>
            <span>{title}</span>
            <img
                alt="status icon"
                src={isActive ? dotSuccess : dotError}
                className={css.statusIcon}
            />
        </div>
    )
}

export const ActionDrivenNavigationItems = ({
    navigationItems,
    selectedStore,
    getChannelStatus,
}: Props) => {
    if (!selectedStore || !navigationItems) {
        return null
    }

    return (
        <>
            {navigationItems.map((item) => {
                if (
                    item.items &&
                    item.items.length > 0 &&
                    // if the item doesn't have a route, it's a top level item
                    !item.route
                ) {
                    const sectionValue = item.title.toLowerCase()
                    return (
                        <Navigation.Section
                            key={item.title}
                            value={sectionValue}
                        >
                            <Navigation.SectionTrigger
                                className={css.sectionTrigger}
                            >
                                {item.title}
                                <Navigation.SectionIndicator />
                            </Navigation.SectionTrigger>
                            <Navigation.SectionContent>
                                {item.items.map((subItem) => (
                                    <Navigation.SectionItem
                                        key={subItem.route}
                                        as={NavLink}
                                        to={subItem.route}
                                        displayType="indent"
                                        exact={subItem.exact}
                                    >
                                        {subItem.title === 'Chat' ||
                                        subItem.title === 'Email' ? (
                                            <StatusIndicator
                                                title={subItem.title}
                                                isActive={
                                                    getChannelStatus
                                                        ? getChannelStatus(
                                                              subItem.title.toLowerCase() as
                                                                  | 'chat'
                                                                  | 'email',
                                                          )
                                                        : false
                                                }
                                            />
                                        ) : (
                                            subItem.title
                                        )}
                                    </Navigation.SectionItem>
                                ))}
                            </Navigation.SectionContent>
                        </Navigation.Section>
                    )
                }

                return (
                    <Navigation.SectionItem
                        key={item.route}
                        as={NavLink}
                        to={item.route}
                        data-candu-id={item.dataCanduId}
                        exact={item.exact}
                        className={css.sectionItemHeading}
                    >
                        {item.title}
                    </Navigation.SectionItem>
                )
            })}
        </>
    )
}
