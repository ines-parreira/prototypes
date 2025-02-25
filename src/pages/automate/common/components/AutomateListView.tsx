import React, { ReactNode } from 'react'

import { NavLink } from 'react-router-dom'

import { LoadingSpinner } from '@gorgias/merchant-ui-kit'

import PageHeader from 'pages/common/components/PageHeader'
import SecondaryNavbar from 'pages/common/components/SecondaryNavbar/SecondaryNavbar'

import { useDisplayAiAgentMovedBanner } from '../hooks/useDisplayAiAgentMovedBanner'
import { AiAgentMovedBanner } from './AiAgentMovedBanner'

import css from './AutomateListView.less'

type NavbarItem = {
    route: string
    title: string
    exact?: boolean
    dataCanduId?: string
}

type Props = {
    title: ReactNode
    headerNavbarItems?: NavbarItem[]
    isLoading?: boolean
    children: ReactNode
}

const AutomateListView = ({
    title,
    headerNavbarItems,
    isLoading,
    children,
}: Props) => {
    const displayAiAgentMovedBanner = useDisplayAiAgentMovedBanner()

    return (
        <div className="full-width">
            <div className={css.header}>
                {displayAiAgentMovedBanner && <AiAgentMovedBanner />}
                <PageHeader title={title} />
                {headerNavbarItems && (
                    <SecondaryNavbar>
                        {headerNavbarItems.map(
                            ({ route, title, exact, dataCanduId }) => (
                                <NavLink
                                    key={route}
                                    to={route}
                                    exact={exact ?? true}
                                    {...(dataCanduId
                                        ? { 'data-candu-id': dataCanduId }
                                        : {})}
                                >
                                    {title}
                                </NavLink>
                            ),
                        )}
                    </SecondaryNavbar>
                )}
            </div>
            {isLoading ? (
                <div className={css.spinner}>
                    <LoadingSpinner size="big" />
                </div>
            ) : (
                children
            )}
        </div>
    )
}

export default AutomateListView
