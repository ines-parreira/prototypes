import { Banner } from '@gorgias/axiom'

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
                <Banner
                    variant="inline"
                    icon
                    type="loading"
                    fillStyle="fill"
                    onClose={dismissBanner}
                    className={css.banner}
                >
                    Your store website is syncing. You will be notified once
                    complete.
                </Banner>
            )

        case IngestionLogStatus.Successful:
            return (
                <Banner
                    variant="inline"
                    icon
                    type="success"
                    fillStyle="fill"
                    onClose={dismissBanner}
                    className={css.banner}
                >
                    Your store website has been synced successfully and is in
                    use by AI Agent. Review generated content for accuracy.
                </Banner>
            )

        case IngestionLogStatus.Failed:
            return (
                <Banner
                    variant="inline"
                    icon
                    type="error"
                    fillStyle="fill"
                    onClose={dismissBanner}
                    className={css.banner}
                >
                    We couldn’t sync your store website. Please try again or
                    contact support if the issue persists.
                </Banner>
            )

        default:
            return null
    }
}
