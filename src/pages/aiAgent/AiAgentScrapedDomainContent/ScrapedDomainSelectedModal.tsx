import React, { useEffect, useRef, useState } from 'react'

import classnames from 'classnames'
import ReactDOM from 'react-dom'

import useKey from 'hooks/useKey'
import { SCREEN_SIZE, useScreenSize } from 'hooks/useScreenSize'
import Loader from 'pages/common/components/Loader/Loader'
import settingsCss from 'pages/settings/settings.less'

import css from './ScrapedDomainSelectedModal.less'

type Props = {
    portalRootId?: string
    children: React.ReactNode | null
    onBackdropClick?: () => void
    isLoading: boolean
    transitionDurationMs?: number
    containerZIndices?: [number, number]
    isOpened: boolean
}

export const ScrapedDomainSelectedModal = ({
    children,
    portalRootId,
    onBackdropClick,
    isLoading,
    transitionDurationMs = 300,
    containerZIndices = [5, -1],
    isOpened,
}: Props): JSX.Element => {
    const ref = useRef<HTMLDivElement>(null)
    const [zIndexOpen, zIndexClosed] = containerZIndices
    const [containerZIndex, setContainerZIndex] = useState(
        isOpened ? zIndexOpen : zIndexClosed,
    )
    const [portalRoot, setPortalRoot] = useState<HTMLElement | null>(null)

    const screenSize = useScreenSize()
    const [isFullscreen, setIsFullscreen] = useState(
        isOpened && screenSize === SCREEN_SIZE.SMALL,
    )

    useKey(
        'Escape',
        (event) => {
            if (isOpened && onBackdropClick) {
                event.stopPropagation()

                onBackdropClick()
            }
        },
        undefined,
        [isOpened, onBackdropClick],
    )

    useEffect(() => {
        portalRootId && setPortalRoot(document.getElementById(portalRootId))
    }, [portalRootId])

    useEffect(() => {
        setContainerZIndex(isOpened ? zIndexOpen : zIndexClosed)
        if (ref.current) {
            // @ts-ignore https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/inert
            ref.current.inert = !isOpened
        }
        setIsFullscreen(isOpened && screenSize === SCREEN_SIZE.SMALL)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpened, screenSize])

    const modal = (
        <div
            className={css['modal-container']}
            style={{
                zIndex: containerZIndex,
                transitionDelay: isOpened ? '0ms' : `${transitionDurationMs}ms`,
            }}
        >
            <div
                className={classnames({
                    backdrop: true,
                    opened: isOpened,
                })}
                style={{
                    transitionDelay: isOpened
                        ? `${transitionDurationMs / 2}ms`
                        : '0ms',
                    transitionDuration: `${transitionDurationMs / 2}ms`,
                }}
                onClick={onBackdropClick}
            />
            <div
                ref={ref}
                style={{
                    transitionDuration: `${transitionDurationMs}ms`,
                }}
                className={classnames({
                    [css.modal]: true,
                    [css.fullscreen]: isOpened && isFullscreen,
                    [css.opened]: isOpened,
                })}
            >
                {isLoading ? (
                    <div className={settingsCss.pageContainer}>
                        <Loader />
                    </div>
                ) : (
                    children
                )}
            </div>
        </div>
    )

    return (portalRoot && ReactDOM.createPortal(modal, portalRoot)) || modal
}

export default ScrapedDomainSelectedModal
