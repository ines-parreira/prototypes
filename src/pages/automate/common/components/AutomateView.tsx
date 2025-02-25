import React, { ReactNode } from 'react'

import classnames from 'classnames'
import { NavLink } from 'react-router-dom'
import { Container } from 'reactstrap'

import { LoadingSpinner } from '@gorgias/merchant-ui-kit'

import PageHeader from 'pages/common/components/PageHeader'
import SecondaryNavbar from 'pages/common/components/SecondaryNavbar/SecondaryNavbar'

import { useDisplayAiAgentMovedBanner } from '../hooks/useDisplayAiAgentMovedBanner'
import { AiAgentMovedBanner } from './AiAgentMovedBanner'

import css from './AutomateView.less'

type NavbarItem = {
    route: string
    title: string
    exact?: boolean
    dataCanduId?: string
}

type Props = {
    title?: ReactNode
    headerNavbarItems?: NavbarItem[]
    action?: ReactNode
    isLoading?: boolean
    children: ReactNode
    className?: string
    fullWidth?: boolean
}

const AutomateView = ({
    title,
    action,
    headerNavbarItems,
    isLoading,
    children,
    className,
    fullWidth = true,
}: Props) => {
    const displayAiAgentMovedBanner = useDisplayAiAgentMovedBanner()

    return (
        <div
            className={classnames(css.parentContainer, {
                'full-width': fullWidth,
            })}
        >
            <div className={css.pageHeaderContainer}>
                {displayAiAgentMovedBanner && <AiAgentMovedBanner />}
                {title && <PageHeader title={title}>{action}</PageHeader>}
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
            <Container
                fluid
                className={classnames(className, {
                    [css.container]: !isLoading,
                })}
            >
                {isLoading ? (
                    <div className={css.spinner}>
                        <LoadingSpinner size="big" />
                    </div>
                ) : (
                    children
                )}
            </Container>
        </div>
    )
}

export default AutomateView
