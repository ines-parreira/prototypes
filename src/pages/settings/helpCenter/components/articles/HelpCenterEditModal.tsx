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
    isLoading: boolean
    onBackdropClick?: () => void
}

export const HelpCenterEditModal = ({
    children,
    open,
    fullscreen,
    portalRootId,
    isLoading,
    onBackdropClick,
}: Props) => {
    const [portalRoot, setPortalRoot] = useState<HTMLElement | null>(null)

    useEffect(() => {
        portalRootId && setPortalRoot(document.getElementById(portalRootId))
    }, [portalRootId])

    const modal = (
        <>
            {open && <div className="backdrop" onClick={onBackdropClick} />}
            <div
                className={classnames({
                    [css.modal]: true,
                    [css.fullscreen]: open && fullscreen,
                    [css.opened]: open,
                    [css.closed]: !open,
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
        </>
    )

    return (portalRoot && ReactDOM.createPortal(modal, portalRoot)) || modal
}

export default HelpCenterEditModal
