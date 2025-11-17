import type React from 'react'
import { useEffect, useRef, useState } from 'react'

import { SCREEN_SIZE, useScreenSize } from '@repo/hooks'
import classnames from 'classnames'
import ReactDOM from 'react-dom'

import Loader from 'pages/common/components/Loader/Loader'
import { useEditionManager } from 'pages/settings/helpCenter/providers/EditionManagerContext'
import settingsCss from 'pages/settings/settings.less'

import css from './HelpCenterEditModal.less'

type Props = {
    portalRootId?: string
    children: React.ReactNode | null
    onBackdropClick?: () => void
    isLoading: boolean
    transitionDurationMs?: number
    containerZIndices?: [number, number]
    modalStyle?: React.CSSProperties
}

export const HelpCenterEditModal = ({
    children,
    portalRootId,
    onBackdropClick,
    isLoading,
    transitionDurationMs = 300,
    containerZIndices = [205, -1],
    modalStyle,
}: Props): JSX.Element => {
    const ref = useRef<HTMLDivElement>(null)
    const { isFullscreenEditModal, editModal } = useEditionManager()
    const [zIndexOpen, zIndexClosed] = containerZIndices
    const [containerZIndex, setContainerZIndex] = useState(
        editModal.isOpened ? zIndexOpen : zIndexClosed,
    )
    const [portalRoot, setPortalRoot] = useState<HTMLElement | null>(null)

    const screenSize = useScreenSize()

    useEffect(() => {
        portalRootId && setPortalRoot(document.getElementById(portalRootId))
    }, [portalRootId])

    useEffect(() => {
        setContainerZIndex(editModal.isOpened ? zIndexOpen : zIndexClosed)
        if (ref.current) {
            // @ts-ignore https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/inert
            ref.current.inert = !editModal.isOpened
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [editModal.isOpened])

    const isFullscreen =
        isFullscreenEditModal || screenSize === SCREEN_SIZE.SMALL

    const modal = (
        <div
            className={css['modal-container']}
            style={{
                zIndex: containerZIndex,
                transitionDelay: editModal.isOpened
                    ? '0ms'
                    : `${transitionDurationMs}ms`,
            }}
        >
            <div
                className={classnames({
                    backdrop: true,
                    opened: editModal.isOpened,
                })}
                style={{
                    transitionDelay: editModal.isOpened
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
                    ...modalStyle,
                }}
                className={classnames({
                    [css.modal]: true,
                    [css.fullscreen]: editModal.isOpened && isFullscreen,
                    [css.opened]: editModal.isOpened,
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

export default HelpCenterEditModal
