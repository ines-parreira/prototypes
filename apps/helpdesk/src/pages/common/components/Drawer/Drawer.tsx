import React, { HTMLAttributes, useEffect, useState } from 'react'

import { useKey } from '@repo/hooks'
import classNames from 'classnames'
import ReactDOM from 'react-dom'
import { Container } from 'reactstrap'

import { IconButton, ShortcutKey, Tooltip } from '@gorgias/axiom'

import Loader from '../Loader/Loader'

import css from './Drawer.less'

type CommonProps = {
    children?: React.ReactNode
    className?: string
}

type HeaderActionsProps = CommonProps & {
    onClose: () => void
    closeButtonId: string
}

const Header = ({ children, className, ...props }: CommonProps) => (
    <header className={classNames(css.header, className)} {...props}>
        {children}
    </header>
)

const HeaderActions = ({
    children,
    className,
    onClose,
    closeButtonId,
    ...props
}: HeaderActionsProps) => (
    <div className={classNames(css['header-actions'], className)} {...props}>
        {children}
        <IconButton
            id={closeButtonId}
            icon="keyboard_tab"
            onClick={onClose}
            fillStyle="ghost"
            intent="secondary"
            aria-label="close edit drawer"
        />
        <Tooltip placement="bottom-end" target={closeButtonId}>
            <div>
                <span>Close side panel</span>
                <ShortcutKey color="dark">esc</ShortcutKey>
            </div>
        </Tooltip>
    </div>
)

const Footer = ({ children, className, ...props }: CommonProps) => (
    <header className={classNames(css.footer, className)} {...props}>
        {children}
    </header>
)

const Content = ({ children, className, ...props }: CommonProps) => (
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
    rootClassName?: string
    withFooter?: boolean
    showBackdrop?: boolean
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
    containerZIndices = [20, -1],
    className,
    rootClassName,
    withFooter = true,
    showBackdrop = true,
    ['data-testid']: dataTestId,
}: Props): JSX.Element => {
    const [zIndexOpen, zIndexClosed] = containerZIndices
    const [containerZIndex, setContainerZIndex] = useState(
        open ? zIndexOpen : zIndexClosed,
    )
    const [portalRoot, setPortalRoot] = useState<HTMLElement | null>(null)
    const [isVisible, setIsVisible] = useState(open)

    useEffect(() => {
        portalRootId && setPortalRoot(document.getElementById(portalRootId))
    }, [portalRootId])

    useEffect(() => {
        setContainerZIndex(open ? zIndexOpen : zIndexClosed)
        if (open) {
            setIsVisible(true)
        } else {
            const timer = setTimeout(() => {
                setIsVisible(false)
            }, transitionDurationMs)
            return () => clearTimeout(timer)
        }
    }, [open, zIndexOpen, zIndexClosed, transitionDurationMs])

    useKey(
        'Escape',
        (event) => {
            event.stopPropagation()
            onBackdropClick?.()
        },
        undefined,
        [onBackdropClick],
    )

    const drawer = (
        <div
            className={classNames(css['drawer-container'], rootClassName, {
                [css.allowClickThrough]: !onBackdropClick,
            })}
            style={{
                zIndex: containerZIndex,
                transitionDelay: open ? '0ms' : `${transitionDurationMs}ms`,
            }}
            onKeyDown={(event) => {
                if (event.key === 'Escape') {
                    onBackdropClick?.()
                }
            }}
        >
            {showBackdrop && (
                <div
                    className={classNames({
                        backdrop: true,
                        opened: open,
                    })}
                    style={
                        {
                            '--animation-duration': `${transitionDurationMs}ms`,
                        } as React.CSSProperties
                    }
                    role="presentation"
                    onClick={() => onBackdropClick?.() ?? undefined}
                />
            )}
            <div
                aria-label={ariaLabel}
                data-testid={dataTestId}
                style={
                    {
                        '--animation-duration': `${transitionDurationMs}ms`,
                    } as React.CSSProperties
                }
                className={classNames(
                    {
                        [css.drawer]: true,
                        [css.fullscreen]: open && fullscreen,
                        [css.opened]: open,
                        [css.withoutFooter]: !withFooter,
                        opened: open,
                    },
                    className,
                )}
                {...(!open ? { inert: '' } : {})}
                role="dialog"
                aria-modal="true"
                hidden={!isVisible}
            >
                {isLoading ? (
                    <Container fluid className="page-container">
                        <Loader role="status" aria-label="Loading..." />
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

export { Drawer }
