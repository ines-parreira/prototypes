import { Skeleton } from '@gorgias/merchant-ui-kit'

import { IntegrationType } from 'models/integration/types'
import { useGetOnboardingStatusMap } from 'pages/convert/channelConnections/hooks/useGetOnboardingStatusMap'
import { useGetSortedIntegrations } from 'pages/convert/common/hooks/useGetSortedIntegrations'

import { ConvertNavbarSectionBlockV2 } from './ConvertNavbarSectionBlockV2'

import css from './ConvertNavbarView.less'

export const ConvertNavbarViewV2 = () => {
    const { onboardingMap, isLoading, isError } = useGetOnboardingStatusMap()

    const sortedIntegrations = useGetSortedIntegrations()

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
