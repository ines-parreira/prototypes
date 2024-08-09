import React, {ReactNode} from 'react'
import {Container} from 'reactstrap'
import {NavLink} from 'react-router-dom'
import classnames from 'classnames'

import Loader from 'pages/common/components/Loader/Loader'
import PageHeader from 'pages/common/components/PageHeader'
import SecondaryNavbar from 'pages/common/components/SecondaryNavbar/SecondaryNavbar'

import css from './AutomateFormView.less'

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

const AutomateFormView = ({
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
                )}
            </div>
            <Container
                fluid={isLoading}
                className={classnames(css.container, {
                    [css.isLoading]: isLoading,
                })}
            >
                {isLoading ? <Loader data-testid="loader" /> : children}
            </Container>
        </div>
    )
}

export default AutomateFormView
