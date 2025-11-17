import { FeatureFlagKey } from '@repo/feature-flags'

import { useFlag } from 'core/flags'
import type { HelpCenterPageEmbedment } from 'models/helpCenter/types'
import { useShopifyIntegrationAndScope } from 'pages/common/hooks/useShopifyIntegrationAndScope'

import HelpCenterAutoEmbedCard from '../HelpCenterAutoEmbedCard'
import type { HelpCenterAutoEmbedWarningBannerProps } from '../HelpCenterAutoEmbedWarningBanner'
import HelpCenterAutoEmbedWarningBanner from '../HelpCenterAutoEmbedWarningBanner'
import { HelpCenterAutoEmbedReadinessStatus } from './types'

import css from './HelpCenterAutoEmbedPublishSection.less'

export type HelpCenterAutoEmbedPublishSectionProps = {
    helpCenterShopName: string | null
    helpCenterId: number
    pageEmbedments: HelpCenterPageEmbedment[]
    isDisabled?: boolean
}

const HelpCenterAutoEmbedPublishSection = (
    props: HelpCenterAutoEmbedPublishSectionProps,
) => {
    const { helpCenterShopName, helpCenterId, pageEmbedments } = props

    const isAutoEmbedFlagActive = useFlag(FeatureFlagKey.HelpCenterAutoEmbed)

    const { integrationId, needScopeUpdate } = useShopifyIntegrationAndScope(
        helpCenterShopName ?? '',
    )

    // hide this entire section if the flag is not active
    if (!isAutoEmbedFlagActive) return null

    // HC connected to a Shopify store and not needing a scope update
    const canAutoEmbed = Boolean(integrationId && !needScopeUpdate)

    // Compute the banner details
    let bannerDetails: HelpCenterAutoEmbedWarningBannerProps['details'] =
        undefined
    if (!canAutoEmbed) {
        if (!helpCenterShopName) {
            bannerDetails = {
                type: HelpCenterAutoEmbedReadinessStatus.NOT_CONNECTED,
                entityId: helpCenterId,
            }
        } else if (needScopeUpdate && integrationId) {
            bannerDetails = {
                type: HelpCenterAutoEmbedReadinessStatus.NEED_PERMISSION_UPDATE,
                entityId: integrationId,
            }
        }
    }

    return (
        <div className={css.container}>
            <HelpCenterAutoEmbedWarningBanner details={bannerDetails} />
            <HelpCenterAutoEmbedCard
                isDisabled={props.isDisabled}
                isNotConnected={helpCenterShopName === null}
                shopifyIntegrationId={integrationId}
                needScopeUpdate={needScopeUpdate}
                pageEmbedments={pageEmbedments}
                hasEmbeddedPages={pageEmbedments.length > 0}
                helpCenterId={helpCenterId}
            />
        </div>
    )
}

export default HelpCenterAutoEmbedPublishSection
