import { NavLink } from 'react-router-dom'

import { Card } from '@gorgias/analytics-ui-kit'

import BackLink from 'pages/common/components/BackLink'
import SecondaryNavbar from 'pages/common/components/SecondaryNavbar/SecondaryNavbar'

import { useAiAgentNavigation } from '../hooks/useAiAgentNavigation'
import AiAgentScrapedDomainContentHeader from './AiAgentScrapedDomainContentHeader'
import { SCRAPPING_CONTENT } from './constant'
import SyncIngestionDomainBanner from './SyncIngestionDomainBanner'
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

    return (
        <div className={css.container}>
            <BackLink path={routes.knowledge} label="Back to Sources" />

            <SyncIngestionDomainBanner
                syncStoreDomainStatus={syncStoreDomainStatus}
                shopName={shopName}
                isSourcePage={false}
                className={css.banner}
            />

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
                    <SecondaryNavbar>
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
