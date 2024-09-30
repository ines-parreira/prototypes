import React, {HTMLAttributes, useEffect, useState} from 'react'
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
    portalRootId?: string
    fullscreen: boolean
    children: React.ReactNode | null
    isLoading: boolean
    onBackdropClick?: () => void
    transitionDurationMs?: number
    containerZIndices?: [number, number]
    className?: string
    ['data-testid']?: string
} & Pick<HTMLAttributes<HTMLDivElement>, 'aria-label'>

const Drawer = ({
    ['aria-label']: ariaLabel,
    children,
    open,
    fullscreen,
    portalRootId,
    isLoading,
    onBackdropClick,
    transitionDurationMs = 300,
    containerZIndices = [5, -1],
    className,
    ['data-testid']: dataTestId,
}: Props): JSX.Element => {
    const [zIndexOpen, zIndexClosed] = containerZIndices
    const [containerZIndex, setContainerZIndex] = useState(
        open ? zIndexOpen : zIndexClosed
    )
    const [portalRoot, setPortalRoot] = useState<HTMLElement | null>(null)

    useEffect(() => {
        portalRootId && setPortalRoot(document.getElementById(portalRootId))
    }, [portalRootId])

    useEffect(() => {
        setContainerZIndex(open ? zIndexOpen : zIndexClosed)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open])

    const drawer = (
        <div
            className={classNames(css['drawer-container'], {
                [css.allowClickThrough]: !onBackdropClick,
            })}
            style={{
                zIndex: containerZIndex,
                transitionDelay: open ? '0ms' : `${transitionDurationMs}ms`,
            }}
        >
            {onBackdropClick && (
                <div
                    className={classNames({
                        backdrop: true,
                        opened: open,
                    })}
                    style={{
                        transitionDelay: open
                            ? `${transitionDurationMs / 2}ms`
                            : '0ms',
                        transitionDuration: `${transitionDurationMs / 2}ms`,
                    }}
                    onClick={onBackdropClick}
                />
            )}
            <div
                aria-label={ariaLabel}
                data-testid={dataTestId}
                style={{
                    transitionDuration: `${transitionDurationMs}ms`,
                }}
                className={classNames(
                    {
                        [css.drawer]: true,
                        [css.fullscreen]: open && fullscreen,
                        [css.opened]: open,
                        opened: open,
                    },
                    className
                )}
                {...(!open ? {inert: ''} : {})}
            >
                {isLoading ? (
                    <Container fluid className="page-container">
                        <Loader />
                    </Container>
                ) : (
                    children
                )}
            </div>
        </div>
    )

    return (portalRoot && ReactDOM.createPortal(drawer, portalRoot)) || drawer
}

Drawer.Header = Header
Drawer.HeaderActions = HeaderActions
Drawer.Footer = Footer
Drawer.Content = Content

export {Drawer}
