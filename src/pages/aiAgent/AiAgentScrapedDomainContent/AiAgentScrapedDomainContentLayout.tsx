import { NavLink } from 'react-router-dom'

import { Card } from '@gorgias/analytics-ui-kit'

import BackLink from 'pages/common/components/BackLink'
import SecondaryNavbar from 'pages/common/components/SecondaryNavbar/SecondaryNavbar'

import { useAiAgentNavigation } from '../hooks/useAiAgentNavigation'
import AiAgentScrapedDomainContentHeader from './AiAgentScrapedDomainContentHeader'
import { SCRAPPING_CONTENT } from './constant'

import css from './AiAgentScrapedDomainContentLayout.less'

type Props = {
    shopName: string
    children?: React.ReactNode
}

const AiAgentScrapedDomainContentLayout = ({ shopName, children }: Props) => {
    const { routes } = useAiAgentNavigation({ shopName })
    const mockedStoreDomain = 'loopearplugs.com'
    const mockedLastSyncDate = new Date().toDateString()
    const onSync = () => {}

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

            <Card className={css.wrapper}>
                <AiAgentScrapedDomainContentHeader
                    storeDomain={mockedStoreDomain}
                    lastSyncDate={mockedLastSyncDate}
                    onSync={onSync}
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
