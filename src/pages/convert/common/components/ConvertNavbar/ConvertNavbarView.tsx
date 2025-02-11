import {Skeleton} from '@gorgias/merchant-ui-kit'
import React, {useMemo} from 'react'
import {useRouteMatch} from 'react-router-dom'

import navbarCss from 'assets/css/navbar.less'
import useEffectOnce from 'hooks/useEffectOnce'
import useLocalStorage from 'hooks/useLocalStorage'
import {GorgiasChatIntegration, IntegrationType} from 'models/integration/types'

import {useGetOnboardingStatusMap} from 'pages/convert/channelConnections/hooks/useGetOnboardingStatusMap'
import {
    CONVERT_NAVBAR_COLLAPSED_SECTIONS_KEY,
    CONVERT_ROUTING_PARAM,
    MAX_EXPANDED_SECTIONS_BY_DEFAULT,
} from 'pages/convert/common/constants'
import {useGetSortedIntegrations} from 'pages/convert/common/hooks/useGetSortedIntegrations'

import ConvertNavbarSectionBlock from './ConvertNavbarSectionBlock'
import css from './ConvertNavbarView.less'

type SectionKey = `${IntegrationType.GorgiasChat}:${string}`

const getSectionKeyFromIntegration = (
    integration: GorgiasChatIntegration
): SectionKey => {
    return `${integration.type}:${integration.id}`
}

const ConvertNavbarView = () => {
    const convertPathPrefix = `/app/convert/${CONVERT_ROUTING_PARAM}`
    const match = useRouteMatch<{id: string}>({
        path: [
            `${convertPathPrefix}/setup`,
            `${convertPathPrefix}/performance`,
            `${convertPathPrefix}/campaigns`,
            `${convertPathPrefix}/click-tracking`,
            `${convertPathPrefix}/installation`,
            `${convertPathPrefix}/settings`,
        ],
        exact: false,
    })
    const {onboardingMap, isLoading, isError} = useGetOnboardingStatusMap()

    const sortedIntegrations = useGetSortedIntegrations()
    const initialCollapsedSections = useMemo(
        () =>
            sortedIntegrations.length > MAX_EXPANDED_SECTIONS_BY_DEFAULT
                ? sortedIntegrations
                      .slice(MAX_EXPANDED_SECTIONS_BY_DEFAULT)
                      .map(getSectionKeyFromIntegration)
                : [],
        [sortedIntegrations]
    )
    const [collapsedSections, setCollapsedSections] = useLocalStorage<string[]>(
        CONVERT_NAVBAR_COLLAPSED_SECTIONS_KEY,
        initialCollapsedSections
    )

    useEffectOnce(() => {
        if (!collapsedSections || !match) {
            return
        }

        const {id} = match.params
        const key = `${IntegrationType.GorgiasChat}:${id}`

        const newCollapsedSections = [...collapsedSections]
        const index = newCollapsedSections.indexOf(key)

        if (index !== -1) {
            newCollapsedSections.splice(index, 1)

            setCollapsedSections(newCollapsedSections)
        }
    })

    const handleToggle = (key: SectionKey) => {
        if (!collapsedSections) {
            return
        }

        const newCollapsedSections = [...collapsedSections]

        const index = newCollapsedSections.indexOf(key)

        if (index !== -1) {
            newCollapsedSections.splice(index, 1)
        } else {
            newCollapsedSections.push(key)
        }

        setCollapsedSections(newCollapsedSections)
    }

    if (isLoading || isError) {
        return (
            <div className={css.skeleton}>
                <Skeleton
                    height={26}
                    className="mb-2"
                    baseColor="#444"
                    highlightColor="#555"
                />
                <div className={css.subSkeleton}>
                    <Skeleton
                        height={24}
                        className="mb-2"
                        count={4}
                        baseColor="#444"
                        highlightColor="#555"
                    />
                </div>
            </div>
        )
    }

    return (
        <div className={navbarCss.category}>
            {sortedIntegrations.map((integration) => {
                const key: SectionKey = `${integration.type}:${integration.id}`

                return (
                    <ConvertNavbarSectionBlock
                        key={key}
                        name={integration.name}
                        chatIntegrationId={integration.id}
                        hasStore={
                            !!integration.meta.shop_integration_id &&
                            integration.meta.shop_type ===
                                IntegrationType.Shopify
                        }
                        onToggle={() => {
                            handleToggle(key)
                        }}
                        isExpanded={
                            !!collapsedSections &&
                            !collapsedSections.includes(key)
                        }
                        isOnboarded={
                            !!integration.meta.app_id &&
                            (onboardingMap[integration.meta.app_id] ?? false)
                        }
                    />
                )
            })}
        </div>
    )
}

export default ConvertNavbarView
