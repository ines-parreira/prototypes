import type { ReactNode } from 'react'
import React from 'react'

import { NavLink } from 'react-router-dom'

import { LoadingSpinner } from '@gorgias/axiom'

import PageHeader from 'pages/common/components/PageHeader'
import SecondaryNavbar from 'pages/common/components/SecondaryNavbar/SecondaryNavbar'

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
    return (
        <div className="full-width">
            <div className={css.header}>
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
