import type { ReactNode } from 'react'
import React, { useRef } from 'react'

import classnames from 'classnames'
import { NavLink } from 'react-router-dom'
import { Container } from 'reactstrap'

import { LegacyLoadingSpinner as LoadingSpinner } from '@gorgias/axiom'

import useInjectStyleToCandu from 'hooks/candu/useInjectStyleToCandu'
import PageHeader from 'pages/common/components/PageHeader'
import SecondaryNavbar from 'pages/common/components/SecondaryNavbar/SecondaryNavbar'

import css from './AiAgentView.less'

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

export const AiAgentView = ({
    title,
    action,
    headerNavbarItems,
    isLoading,
    children,
    className,
    fullWidth = true,
}: Props) => {
    const containerRef = useRef<HTMLDivElement>(null)
    useInjectStyleToCandu(containerRef.current)

    return (
        <div
            ref={containerRef}
            className={classnames(css.parentContainer, {
                'full-width': fullWidth,
            })}
        >
            <div className={css.pageHeaderContainer}>
                {title && <PageHeader title={title}>{action}</PageHeader>}
                {headerNavbarItems && (
                    <SecondaryNavbar>
                        {headerNavbarItems.map(
                            ({ route, title, exact, dataCanduId }) => (
                                <NavLink
                                    key={route}
                                    to={route}
                                    exact={exact}
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
