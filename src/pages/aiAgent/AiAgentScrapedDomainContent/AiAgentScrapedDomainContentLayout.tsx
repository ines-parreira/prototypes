import { NavLink } from 'react-router-dom'

import { Card } from '@gorgias/analytics-ui-kit'
import { Banner } from '@gorgias/merchant-ui-kit'

import BackLink from 'pages/common/components/BackLink'
import SecondaryNavbar from 'pages/common/components/SecondaryNavbar/SecondaryNavbar'

import { useAiAgentNavigation } from '../hooks/useAiAgentNavigation'
import AiAgentScrapedDomainContentHeader from './AiAgentScrapedDomainContentHeader'
import { IngestionLogStatus, SCRAPPING_CONTENT } from './constant'
import { IngestionLog } from './types'

import css from './AiAgentScrapedDomainContentLayout.less'

type Props = {
    shopName: string
    storeDomain: string | null
    storeUrl: string | null
    storeDomainIngestionLog?: IngestionLog
    isFetchLoading: boolean
    syncTriggered: boolean
    handleOnSync: () => void
    handleOnCancel: () => void
    handleTriggerSync: () => void
    syncStoreDomainStatus: string | null
    onBannerClose: () => void
    children?: React.ReactNode
}

const AiAgentScrapedDomainContentLayout = ({
    shopName,
    storeDomain,
    storeUrl,
    storeDomainIngestionLog,
    isFetchLoading,
    syncTriggered,
    handleOnSync,
    handleOnCancel,
    handleTriggerSync,
    syncStoreDomainStatus,
    onBannerClose,
    children,
}: Props) => {
    const { routes } = useAiAgentNavigation({ shopName })

    const headerNavbarItems = [
        {
            route: routes.pagesContent,
            title: SCRAPPING_CONTENT.QUESTIONS,
        },
        {
            route: routes.productsContent,
            title: SCRAPPING_CONTENT.PRODUCTS,
        },
    ]

    const pendingBanner = () => (
        <Banner
            variant="inline"
            icon
            type="loading"
            fillStyle="fill"
            onClose={onBannerClose}
            className={css.banner}
        >
            Your store domain is currently being synced. You will be notified
            once complete. In the meantime, AI Agent may not have your latest
            content.
        </Banner>
    )

    const successBanner = () => (
        <Banner
            variant="inline"
            icon
            type="success"
            fillStyle="fill"
            onClose={onBannerClose}
            className={css.banner}
        >
            Your store domain has been synced successfully and is in use by AI
            Agent. Review newly generated content for accuracy.
        </Banner>
    )

    const renderBanner = () => {
        switch (syncStoreDomainStatus) {
            case IngestionLogStatus.Pending:
                return pendingBanner()
            case IngestionLogStatus.Successful:
                return successBanner()
            default:
                return null
        }
    }

    return (
        <div className={css.container}>
            <BackLink path={routes.knowledge} label="Back to Sources" />

            {syncStoreDomainStatus &&
                (syncStoreDomainStatus === IngestionLogStatus.Pending ||
                    syncStoreDomainStatus === IngestionLogStatus.Successful) &&
                renderBanner()}

            <Card className={css.wrapper}>
                <AiAgentScrapedDomainContentHeader
                    storeDomainIngestionLog={storeDomainIngestionLog}
                    storeDomain={storeDomain}
                    storeUrl={storeUrl}
                    isFetchLoading={isFetchLoading}
                    syncTriggered={syncTriggered}
                    handleOnSync={handleOnSync}
                    handleOnCancel={handleOnCancel}
                    handleTriggerSync={handleTriggerSync}
                    syncStoreDomainStatus={syncStoreDomainStatus}
                />
                <div>
                    <SecondaryNavbar className={css.contentWrapper}>
                        {headerNavbarItems.map(({ route, title }) => (
                            <NavLink key={route} to={route} exact={true}>
                                {title}
                            </NavLink>
                        ))}
                    </SecondaryNavbar>
                    {children}
                </div>
            </Card>
        </div>
    )
}

export default AiAgentScrapedDomainContentLayout
