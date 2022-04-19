import classnames from 'classnames'
import React, {useEffect, useState} from 'react'
import ReactDOM from 'react-dom'
import {Container} from 'reactstrap'

import {SCREEN_SIZE, useScreenSize} from '../../../../../hooks/useScreenSize'

import Loader from '../../../../common/components/Loader/Loader'
import settingsCss from '../../../settings.less'
import {useEditionManager} from '../../providers/EditionManagerContext'

import css from './HelpCenterEditModal.less'

type Props = {
    portalRootId?: string
    children: React.ReactNode | null
    onBackdropClick?: () => void
    isLoading: boolean
    transitionDurationMs?: number
    containerZIndices?: [number, number]
}

export const HelpCenterEditModal = ({
    children,
    portalRootId,
    onBackdropClick,
    isLoading,
    transitionDurationMs = 300,
    containerZIndices = [5, -1],
}: Props): JSX.Element => {
    const {isFullscreenEditModal, editModal} = useEditionManager()
    const [zIndexOpen, zIndexClosed] = containerZIndices
    const [containerZIndex, setContainerZIndex] = useState(
        editModal.isOpened ? zIndexOpen : zIndexClosed
    )
    const [portalRoot, setPortalRoot] = useState<HTMLElement | null>(null)

    const screenSize = useScreenSize()

    useEffect(() => {
        portalRootId && setPortalRoot(document.getElementById(portalRootId))
    }, [portalRootId])

    useEffect(() => {
        setContainerZIndex(editModal.isOpened ? zIndexOpen : zIndexClosed)
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
                style={{
                    transitionDuration: `${transitionDurationMs}ms`,
                }}
                className={classnames({
                    [css.modal]: true,
                    [css.fullscreen]: editModal.isOpened && isFullscreen,
                    [css.opened]: editModal.isOpened,
                })}
            >
                {isLoading ? (
                    <Container fluid className={settingsCss.pageContainer}>
                        <Loader />
                    </Container>
                ) : (
                    children
                )}
            </div>
        </div>
    )

    return (portalRoot && ReactDOM.createPortal(modal, portalRoot)) || modal
}

export default HelpCenterEditModal
