import { Banner, Button } from '@gorgias/merchant-ui-kit'

import history from 'pages/history'

import { useAiAgentNavigation } from '../hooks/useAiAgentNavigation'
import { IngestionLogStatus } from './constant'
import { useIngestionDomainBannerDismissed } from './hooks/useIngestionDomainBannerDismissed'

type Props = {
    syncStoreDomainStatus: string | null
    shopName: string
    isSourcePage: boolean
    className?: string
}

const SyncIngestionDomainBanner = ({
    syncStoreDomainStatus,
    shopName,
    isSourcePage,
    className,
}: Props) => {
    const { routes } = useAiAgentNavigation({ shopName })
    const { isDismissed, dismissBanner } = useIngestionDomainBannerDismissed({
        shopName,
        isSourcePage,
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
            Your store website is syncing. This may take a while. You will be
            notified once it is complete. In the meantime, the AI Agent may not
            have your latest content.
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
            action={isSourcePage ? reviewButton : undefined}
        >
            Your store website has been synced successfully and is in use by AI
            Agent. Review newly generated content for accuracy.
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
            We couldn’t sync your store website. AI Agent is using your previous
            content. Please try again or contact support if the issue persists.
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
