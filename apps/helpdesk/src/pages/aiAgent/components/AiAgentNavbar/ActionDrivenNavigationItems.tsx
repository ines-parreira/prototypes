import React from 'react'

import { NavLink } from 'react-router-dom'

import { Skeleton, Tag } from '@gorgias/axiom'

import dotError from 'assets/img/icons/dot-error.svg'
import dotSuccess from 'assets/img/icons/dot-success.svg'
import { Navigation } from 'components/Navigation/Navigation'
import useAppSelector from 'hooks/useAppSelector'
import { useGetStoresConfigurationForAccount } from 'models/aiAgent/queries'
import { OPPORTUNITIES } from 'pages/aiAgent/constants'
import type { NavigationItem } from 'pages/aiAgent/hooks/useAiAgentNavigation'
import { useOpportunitiesCount } from 'pages/aiAgent/hooks/useOpportunitiesCount'
import { HELP_CENTER_DEFAULT_LOCALE } from 'pages/settings/helpCenter/constants'
import { getCurrentAccountState } from 'state/currentAccount/selectors'
import { getViewLanguage } from 'state/ui/helpCenter'

import type { NavigationChannelType } from './utils'

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
    const locale = useAppSelector(getViewLanguage) || HELP_CENTER_DEFAULT_LOCALE

    const currentAccount = useAppSelector(getCurrentAccountState)
    const accountDomain = currentAccount.get('domain')

    const { data } = useGetStoresConfigurationForAccount(
        { accountDomain },
        {
            enabled: !!selectedStore && !!accountDomain,
            staleTime: 5 * 60 * 1000,
        },
    )

    const storeConfig = data?.storeConfigurations.find(
        (config) => config.storeName === selectedStore,
    )

    const { count: opportunitiesCount, isLoading: isLoadingOpportunities } =
        useOpportunitiesCount(
            storeConfig?.helpCenterId ?? 0,
            locale,
            selectedStore,
        )

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
                                        subItem.title === 'Email' ||
                                        subItem.title === 'SMS' ? (
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
                                        ) : subItem.title === OPPORTUNITIES ? (
                                            <div
                                                className={css.navItemWithBadge}
                                            >
                                                <div
                                                    className={
                                                        css.navItemWithBadgeContent
                                                    }
                                                >
                                                    <span>{subItem.title}</span>
                                                    <Tag
                                                        size="sm"
                                                        color="purple"
                                                    >
                                                        Beta
                                                    </Tag>
                                                </div>
                                                <div
                                                    className={css.navItemCount}
                                                >
                                                    {isLoadingOpportunities ? (
                                                        <Skeleton
                                                            width={24}
                                                            height={24}
                                                        />
                                                    ) : (
                                                        opportunitiesCount
                                                    )}
                                                </div>
                                            </div>
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
                        {item.title === OPPORTUNITIES ? (
                            <div className={css.navItemWithBadge}>
                                <div className={css.navItemWithBadgeContent}>
                                    <span>{item.title}</span>
                                    <Tag size="sm" color="purple">
                                        Beta
                                    </Tag>
                                </div>
                                <div className={css.navItemCount}>
                                    {isLoadingOpportunities ? (
                                        <Skeleton width={24} height={24} />
                                    ) : (
                                        opportunitiesCount
                                    )}
                                </div>
                            </div>
                        ) : (
                            item.title
                        )}
                    </Navigation.SectionItem>
                )
            })}
        </>
    )
}
