import { Banner, Button } from '@gorgias/merchant-ui-kit'

import {
    IngestionLogStatus,
    PAGE_NAME,
} from 'pages/aiAgent/AiAgentScrapedDomainContent/constant'
import { useIngestionDomainBannerDismissed } from 'pages/aiAgent/AiAgentScrapedDomainContent/hooks/useIngestionDomainBannerDismissed'
import { useAiAgentNavigation } from 'pages/aiAgent/hooks/useAiAgentNavigation'
import history from 'pages/history'

type Props = {
    syncStoreDomainStatus: string | null
    shopName: string
    className?: string
    syncEntityType: (typeof PAGE_NAME)[keyof typeof PAGE_NAME]
}

const SyncIngestionDomainBanner = ({
    syncStoreDomainStatus,
    shopName,
    className,
    syncEntityType,
}: Props) => {
    const { routes } = useAiAgentNavigation({ shopName })

    // Derive values from syncEntityType (which is now a PAGE_NAME value)
    const isUrlSync = syncEntityType === PAGE_NAME.URL
    const isReviewButtonVisible = syncEntityType === PAGE_NAME.SOURCE
    const pageName = syncEntityType // syncEntityType is already a PAGE_NAME value

    const { isDismissed, dismissBanner } = useIngestionDomainBannerDismissed({
        shopName,
        pageName,
    })
    const onReview = () => {
        history.push(routes.pagesContent)
    }

    const reviewButton = (
        <Button fillStyle="ghost" onClick={onReview}>
            Review
        </Button>
    )

    const PendingBanner = () => (
        <Banner
            variant="inline"
            icon
            type="loading"
            fillStyle="fill"
            onClose={dismissBanner}
            className={className}
        >
            {isUrlSync
                ? 'Your URL is syncing. You will be notified once complete. In the meantime, AI Agent may not have your latest content.'
                : 'Your store website is syncing. This may take a while. You will be notified once it is complete. In the meantime, the AI Agent may not have your latest content.'}
        </Banner>
    )

    const SuccessBanner = () => (
        <Banner
            variant="inline"
            icon
            type="success"
            fillStyle="fill"
            onClose={dismissBanner}
            className={className}
            action={isReviewButtonVisible ? reviewButton : undefined}
        >
            {isUrlSync
                ? 'Your URL has been synced successfully and is in use by AI Agent. Review newly generated content for accuracy.'
                : 'Your store website has been synced successfully and is in use by AI Agent. Review newly generated content for accuracy.'}
        </Banner>
    )

    const FailedBanner = () => (
        <Banner
            variant="inline"
            icon
            type="error"
            fillStyle="fill"
            onClose={dismissBanner}
            className={className}
        >
            {isUrlSync
                ? "We couldn't sync your URL. AI Agent is using your previous content. Please try again or contact support if the issue persists."
                : "We couldn't sync your store website. AI Agent is using your previous content. Please try again or contact support if the issue persists."}
        </Banner>
    )

    const IngestionDomainBanner = () => {
        if (isDismissed || !syncStoreDomainStatus) return null

        switch (syncStoreDomainStatus) {
            case IngestionLogStatus.Pending:
                return <PendingBanner />
            case IngestionLogStatus.Successful:
                return <SuccessBanner />
            case IngestionLogStatus.Failed:
                return <FailedBanner />
            default:
                return null
        }
    }

    return <IngestionDomainBanner />
}

export default SyncIngestionDomainBanner
