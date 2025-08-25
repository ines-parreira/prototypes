import { Card } from '@gorgias/analytics-ui-kit'

import {
    HeaderType,
    PAGE_NAME,
} from 'pages/aiAgent/AiAgentScrapedDomainContent/constant'
import BackLink from 'pages/common/components/BackLink'

import { useAiAgentNavigation } from '../hooks/useAiAgentNavigation'
import AiAgentScrapedDomainContentHeader from './AiAgentScrapedDomainContentHeader'
import SyncIngestionDomainBanner from './SyncIngestionDomainBanner'

import css from './AiAgentScrapedDomainContentLayout.less'

type Props = {
    shopName: string
    storeDomain: string | null
    storeUrl: string | null
    latestSync?: string | null
    isFetchLoading: boolean
    syncTriggered: boolean
    handleOnSync?: () => void
    handleOnCancel?: () => void
    handleTriggerSync?: () => void
    syncStoreDomainStatus: string | null
    children?: React.ReactNode
    title: string
    pageType: HeaderType
}

const AiAgentScrapedDomainContentLayout = ({
    shopName,
    storeDomain,
    storeUrl,
    latestSync,
    isFetchLoading,
    syncTriggered,
    handleOnSync,
    handleOnCancel,
    handleTriggerSync,
    syncStoreDomainStatus,
    children,
    title,
    pageType,
}: Props) => {
    const { routes } = useAiAgentNavigation({ shopName })

    return (
        <div className={css.container}>
            <BackLink path={routes.knowledge} label="Back to Sources" />

            {(pageType === HeaderType.Domain ||
                pageType === HeaderType.URL) && (
                <SyncIngestionDomainBanner
                    syncStoreDomainStatus={syncStoreDomainStatus}
                    shopName={shopName}
                    syncEntityType={
                        pageType === HeaderType.Domain
                            ? PAGE_NAME.STORE_WEBSITE
                            : PAGE_NAME.URL
                    }
                    className={css.banner}
                />
            )}

            <Card className={css.wrapper}>
                <AiAgentScrapedDomainContentHeader
                    latestSync={latestSync}
                    storeUrl={storeUrl}
                    isFetchLoading={isFetchLoading}
                    syncTriggered={syncTriggered}
                    handleOnSync={handleOnSync}
                    handleOnCancel={handleOnCancel}
                    handleTriggerSync={handleTriggerSync}
                    syncStoreDomainStatus={syncStoreDomainStatus}
                    title={title}
                    pageType={pageType}
                    storeDomain={storeDomain}
                />
                <div>{children}</div>
            </Card>
        </div>
    )
}

export default AiAgentScrapedDomainContentLayout
