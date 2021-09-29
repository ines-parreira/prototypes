import classnames from 'classnames'
import React, {useEffect, useState} from 'react'
import ReactDOM from 'react-dom'
import {Container} from 'reactstrap'

import Loader from '../../../../common/components/Loader/Loader'

import css from './HelpCenterEditModal.less'

type Props = {
    open: boolean
    portalRootId?: string
    fullscreen: boolean
    children: React.ReactNode | null
    onBackdropClick?: () => void
    isLoading: boolean
    transitionDurationMs?: number
    containerZIndices?: [number, number]
}

export const HelpCenterEditModal = ({
    children,
    open,
    fullscreen,
    portalRootId,
    onBackdropClick,
    isLoading,
    transitionDurationMs = 300,
    containerZIndices = [5, -1],
}: Props) => {
    const [zIndexOpen, zIndexClosed] = containerZIndices
    const [containerZIndex, setContainerZIndex] = useState(
        open ? zIndexOpen : zIndexClosed
    )
    const [portalRoot, setPortalRoot] = useState<HTMLElement | null>(null)

    useEffect(() => {
        portalRootId && setPortalRoot(document.getElementById(portalRootId))
    }, [portalRootId])

    useEffect(() => {
        if (open) {
            setContainerZIndex(zIndexOpen)
        }
        // Wait for the transition to finish to change the container z-index
        else {
            setTimeout(
                () => setContainerZIndex(containerZIndices[1]),
                transitionDurationMs
            )
        }
    }, [open])

    const modal = (
        <div
            className={css['modal-container']}
            style={{zIndex: containerZIndex}}
        >
            {containerZIndex === zIndexOpen && (
                <div className="backdrop" onClick={onBackdropClick} />
            )}
            <div
                style={{
                    transitionDuration: `${transitionDurationMs}ms`,
                }}
                className={classnames({
                    [css.modal]: true,
                    [css.fullscreen]: open && fullscreen,
                    [css.opened]: open,
                })}
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

    return (portalRoot && ReactDOM.createPortal(modal, portalRoot)) || modal
}

export default HelpCenterEditModal
