import React from 'react'
import ReactDOM from 'react-dom'
import classNames from 'classnames'
import {Container} from 'reactstrap'

import Loader from '../Loader/Loader'

import css from './Drawer.less'

type CommonProps = {
    children: React.ReactNode
    className?: string
}

const Header = ({children, className, ...props}: CommonProps) => (
    <header className={classNames(css.header, className)} {...props}>
        {children}
    </header>
)

const HeaderActions = ({children, className, ...props}: CommonProps) => (
    <div className={classNames(css['header-actions'], className)} {...props}>
        {children}
    </div>
)

const Footer = ({children, className, ...props}: CommonProps) => (
    <header className={classNames(css.footer, className)} {...props}>
        {children}
    </header>
)

const Content = ({children, className, ...props}: CommonProps) => (
    <div className={classNames(css.content, className)} {...props}>
        {children}
    </div>
)

type Props = {
    open: boolean
    name: string
    portalRootId?: string
    fullscreen: boolean
    children: React.ReactNode | null
    isLoading: boolean
}

const Drawer = ({
    children,
    open,
    name,
    fullscreen,
    portalRootId,
    isLoading,
}: Props): JSX.Element => {
    const [portalRoot, setPortalRoot] = React.useState<HTMLElement | null>(null)

    React.useEffect(() => {
        portalRootId && setPortalRoot(document.getElementById(portalRootId))
    }, [portalRootId])

    const modal = (
        <div
            data-testid={name}
            className={classNames({
                [css.drawer]: true,
                [css.fullscreen]: fullscreen,
                [css.opened]: open,
                [css.closed]: !open,
            })}
        >
            {isLoading ? (
                <Container
                    data-testid="spinner-loader"
                    fluid
                    className="page-container"
                >
                    <Loader />
                </Container>
            ) : (
                children
            )}
        </div>
    )

    return (portalRoot && ReactDOM.createPortal(modal, portalRoot)) || modal
}

Drawer.Header = Header
Drawer.HeaderActions = HeaderActions
Drawer.Footer = Footer
Drawer.Content = Content

export {Drawer}
