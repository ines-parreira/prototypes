import React, {useMemo} from 'react'
import {useRouteMatch} from 'react-router-dom'

import {GorgiasChatIntegration, IntegrationType} from 'models/integration/types'

import {
    CONVERT_NAVBAR_COLLAPSED_SECTIONS_KEY,
    CONVERT_ROUTING_PARAM,
    MAX_EXPANDED_SECTIONS_BY_DEFAULT,
} from 'pages/convert/common/constants'
import useEffectOnce from 'hooks/useEffectOnce'
import useLocalStorage from 'hooks/useLocalStorage'
import navbarCss from 'assets/css/navbar.less'
import {useGetSortedIntegrations} from 'pages/convert/common/hooks/useGetSortedIntegrations'
import ConvertNavbarSectionBlock from './ConvertNavbarSectionBlock'

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
            `${convertPathPrefix}/performance`,
            `${convertPathPrefix}/campaigns`,
            `${convertPathPrefix}/click-tracking`,
            `${convertPathPrefix}/installation`,
        ],
        exact: false,
    })

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

    return (
        <div className={navbarCss.category}>
            {sortedIntegrations.map((integration) => {
                const key: SectionKey = `${integration.type}:${integration.id}`

                return (
                    <ConvertNavbarSectionBlock
                        key={key}
                        name={integration.name}
                        chatIntegrationId={integration.id}
                        onToggle={() => {
                            handleToggle(key)
                        }}
                        isExpanded={
                            !!collapsedSections &&
                            !collapsedSections.includes(key)
                        }
                    />
                )
            })}
        </div>
    )
}

export default ConvertNavbarView
