import classnames from 'classnames'
import React, {ReactNode} from 'react'
import {NavLink} from 'react-router-dom'
import {Container} from 'reactstrap'

import Loader from 'pages/common/components/Loader/Loader'
import PageHeader from 'pages/common/components/PageHeader'
import SecondaryNavbar from 'pages/common/components/SecondaryNavbar/SecondaryNavbar'

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
    const content = (
        <>
            <div className={css.pageHeaderContainer}>
                {title && <PageHeader title={title}>{action}</PageHeader>}
                {headerNavbarItems && (
                    <SecondaryNavbar>
                        {headerNavbarItems.map(
                            ({route, title, exact, dataCanduId}) => (
                                <NavLink
                                    key={route}
                                    to={route}
                                    exact={exact ?? true}
                                    {...(dataCanduId
                                        ? {'data-candu-id': dataCanduId}
                                        : {})}
                                >
                                    {title}
                                </NavLink>
                            )
                        )}
                    </SecondaryNavbar>
                )}{' '}
            </div>
            <Container
                fluid
                className={classnames(className, {
                    [css.isLoading]: isLoading,
                    [css.container]: !isLoading,
                })}
            >
                {isLoading ? <Loader /> : children}
            </Container>
        </>
    )

    return fullWidth ? <div className="full-width">{content}</div> : content
}

export default AutomateView
