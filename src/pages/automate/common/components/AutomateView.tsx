import React, {ReactNode} from 'react'
import classnames from 'classnames'
import {Container} from 'reactstrap'
import {NavLink} from 'react-router-dom'

import Loader from 'pages/common/components/Loader/Loader'
import PageHeader from 'pages/common/components/PageHeader'

import SecondaryNavbar from 'pages/common/components/SecondaryNavbar/SecondaryNavbar'
import css from './AutomateView.less'

type NavbarItem = {
    route: string
    title: string
    exact?: boolean
}

type Props = {
    title: ReactNode
    headerNavbarItems?: NavbarItem[]
    action?: ReactNode
    isLoading?: boolean
    children: ReactNode
    className?: string
}

const AutomateView = ({
    title,
    action,
    headerNavbarItems,
    isLoading,
    children,
    className,
}: Props) => {
    return (
        <div className="full-width">
            <PageHeader title={title}>{action}</PageHeader>
            {headerNavbarItems && (
                <SecondaryNavbar>
                    {headerNavbarItems.map(({route, title, exact}) => (
                        <NavLink key={route} to={route} exact={exact ?? true}>
                            {title}
                        </NavLink>
                    ))}
                </SecondaryNavbar>
            )}{' '}
            <Container
                fluid
                className={classnames(css.container, className, {
                    [css.isLoading]: isLoading,
                })}
            >
                {isLoading ? <Loader /> : children}
            </Container>
        </div>
    )
}

export default AutomateView
