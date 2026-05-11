import { useMemo } from 'react'

import {
    NavigationSection,
    NavigationSectionGroup,
    NavigationSectionItem,
    useSidebar,
} from '@repo/navigation'

import { Icon, Skeleton } from '@gorgias/axiom'

import { IntegrationType } from 'models/integration/types'
import { useIsConvertSubscriber } from 'pages/common/hooks/useIsConvertSubscriber'
import { useGetOnboardingStatusMap } from 'pages/convert/channelConnections/hooks/useGetOnboardingStatusMap'
import { MAX_EXPANDED_SECTIONS_BY_DEFAULT } from 'pages/convert/common/constants'
import useCanAddContactFormFlag from 'pages/convert/common/hooks/useContactFormFlag'
import { useGetSortedIntegrations } from 'pages/convert/common/hooks/useGetSortedIntegrations'

const CONVERT_STORAGE_KEY = 'convert'

export function ConvertSidebar() {
    const { isCollapsed } = useSidebar()
    const isConvertSubscriber = useIsConvertSubscriber()
    const settingsEnabled = useCanAddContactFormFlag()
    const { onboardingMap, isLoading, isError } = useGetOnboardingStatusMap()
    const sortedIntegrations = useGetSortedIntegrations()

    const defaultExpandedKeys = useMemo(
        () =>
            sortedIntegrations
                .slice(0, MAX_EXPANDED_SECTIONS_BY_DEFAULT)
                .map(
                    (integration) =>
                        `${IntegrationType.GorgiasChat}:${integration.id}`,
                ),
        [sortedIntegrations],
    )

    if (isCollapsed) {
        return null
    }

    return (
        <>
            <NavigationSection
                to="/app/convert/overview"
                label="Overview"
                exact
            />
            {isLoading && <Skeleton />}
            {!isLoading && !isError && (
                <NavigationSectionGroup
                    storageKey={CONVERT_STORAGE_KEY}
                    defaultExpandedKeys={defaultExpandedKeys}
                >
                    {sortedIntegrations.map((integration) => {
                        const sectionKey = `${IntegrationType.GorgiasChat}:${integration.id}`
                        const isOnboarded =
                            !!integration.meta.app_id &&
                            (onboardingMap[integration.meta.app_id] ?? false)
                        const hasStore =
                            !!integration.meta.shop_integration_id &&
                            integration.meta.shop_type ===
                                IntegrationType.Shopify
                        const baseUrl = `/app/convert/${integration.id}`

                        if (!isOnboarded) {
                            return (
                                <NavigationSection
                                    key={sectionKey}
                                    id={sectionKey}
                                    label={integration.name}
                                >
                                    <NavigationSectionItem
                                        to={`${baseUrl}/setup`}
                                        label="Set up"
                                    />
                                </NavigationSection>
                            )
                        }

                        return (
                            <NavigationSection
                                key={sectionKey}
                                id={sectionKey}
                                label={integration.name}
                            >
                                {hasStore && (
                                    <NavigationSectionItem
                                        to={
                                            isConvertSubscriber
                                                ? `${baseUrl}/performance`
                                                : `${baseUrl}/performance/subscribe`
                                        }
                                        label="Performance"
                                        trailingSlot={
                                            !isConvertSubscriber ? (
                                                <Icon name="arrow-up-circle" />
                                            ) : undefined
                                        }
                                    />
                                )}
                                <NavigationSectionItem
                                    to={`${baseUrl}/campaigns`}
                                    label="Campaigns"
                                />
                                <NavigationSectionItem
                                    to={
                                        isConvertSubscriber
                                            ? `${baseUrl}/click-tracking`
                                            : `${baseUrl}/click-tracking/subscribe`
                                    }
                                    label="Click tracking"
                                    trailingSlot={
                                        !isConvertSubscriber ? (
                                            <Icon name="arrow-up-circle" />
                                        ) : undefined
                                    }
                                />
                                {settingsEnabled ? (
                                    <NavigationSectionItem
                                        to={`${baseUrl}/settings`}
                                        label="Settings"
                                    />
                                ) : (
                                    <NavigationSectionItem
                                        to={`${baseUrl}/installation`}
                                        label="Installation"
                                    />
                                )}
                            </NavigationSection>
                        )
                    })}
                </NavigationSectionGroup>
            )}
        </>
    )
}
