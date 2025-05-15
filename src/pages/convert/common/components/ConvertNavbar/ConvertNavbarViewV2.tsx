import { IntegrationType } from 'models/integration/types'
import { useGetOnboardingStatusMap } from 'pages/convert/channelConnections/hooks/useGetOnboardingStatusMap'
import { useGetSortedIntegrations } from 'pages/convert/common/hooks/useGetSortedIntegrations'

import { ConvertNavbarSectionBlockV2 } from './ConvertNavbarSectionBlockV2'

import css from './ConvertNavbarViewV2.less'

export const ConvertNavbarViewV2 = () => {
    const { onboardingMap, isLoading, isError } = useGetOnboardingStatusMap()

    const sortedIntegrations = useGetSortedIntegrations()

    if (isLoading || isError) {
        return (
            <div
                className={css.skeleton}
                aria-busy="true"
                aria-live="polite"
                role="status"
                aria-label="Loading navigation items"
            >
                <div className={css.skeletonTitle} />
                <div className={css.subSkeleton}>
                    <div className={css.skeletonItem} />
                    <div className={css.skeletonItem} />
                    <div className={css.skeletonItem} />
                    <div className={css.skeletonItem} />
                </div>
            </div>
        )
    }

    return (
        <>
            {sortedIntegrations.map((integration) => (
                <ConvertNavbarSectionBlockV2
                    key={`${integration.type}:${integration.id}`}
                    name={integration.name}
                    chatIntegrationId={integration.id}
                    hasStore={
                        !!integration.meta.shop_integration_id &&
                        integration.meta.shop_type === IntegrationType.Shopify
                    }
                    isOnboarded={
                        !!integration.meta.app_id &&
                        (onboardingMap[integration.meta.app_id] ?? false)
                    }
                />
            ))}
        </>
    )
}
