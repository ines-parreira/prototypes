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
    type?: 'domain' | 'url'
}

export const SyncStoreDomainBanner = ({
    syncStatus,
    shopName,
    type,
}: Props) => {
    const pageName = type === 'url' ? PAGE_NAME.URL : PAGE_NAME.SOURCE
    const contentType = type === 'url' ? 'URL' : 'store website'
    const { isDismissed, dismissBanner } = useIngestionDomainBannerDismissed({
        shopName,
        pageName,
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
                    Your {contentType} is syncing. You will be notified once
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
                    Your {contentType} has been synced successfully and is in
                    use by AI Agent.
                    {type === 'domain' &&
                        ' Review generated content for accuracy.'}
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
                    We couldn’t sync your {contentType}. Please try again or
                    contact support if the issue persists.
                </LegacyBanner>
            )

        default:
            return null
    }
}
