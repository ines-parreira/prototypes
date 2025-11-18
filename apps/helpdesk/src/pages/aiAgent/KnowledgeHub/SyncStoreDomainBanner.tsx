import { LegacyBanner } from '@gorgias/axiom'

import {
    IngestionLogStatus,
    PAGE_NAME,
} from 'pages/aiAgent/AiAgentScrapedDomainContent/constant'
import { useIngestionDomainBannerDismissed } from 'pages/aiAgent/AiAgentScrapedDomainContent/hooks/useIngestionDomainBannerDismissed'

import css from './SyncStoreDomainBanner.less'

type Props = {
    syncStatus: string | null | undefined
    shopName: string
}

export const SyncStoreDomainBanner = ({ syncStatus, shopName }: Props) => {
    const { isDismissed, dismissBanner } = useIngestionDomainBannerDismissed({
        shopName,
        pageName: PAGE_NAME.SOURCE,
    })

    if (isDismissed || !syncStatus) {
        return null
    }

    switch (syncStatus) {
        case IngestionLogStatus.Pending:
            return (
                <LegacyBanner
                    variant="inline"
                    icon
                    type="loading"
                    fillStyle="fill"
                    onClose={dismissBanner}
                    className={css.banner}
                >
                    Your store website is syncing. You will be notified once
                    complete.
                </LegacyBanner>
            )

        case IngestionLogStatus.Successful:
            return (
                <LegacyBanner
                    variant="inline"
                    icon
                    type="success"
                    fillStyle="fill"
                    onClose={dismissBanner}
                    className={css.banner}
                >
                    Your store website has been synced successfully and is in
                    use by AI Agent. Review generated content for accuracy.
                </LegacyBanner>
            )

        case IngestionLogStatus.Failed:
            return (
                <LegacyBanner
                    variant="inline"
                    icon
                    type="error"
                    fillStyle="fill"
                    onClose={dismissBanner}
                    className={css.banner}
                >
                    We couldn’t sync your store website. Please try again or
                    contact support if the issue persists.
                </LegacyBanner>
            )

        default:
            return null
    }
}
