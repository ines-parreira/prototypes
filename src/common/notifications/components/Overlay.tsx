import React from 'react'
import {CSSTransition} from 'react-transition-group'

import Feed from './Feed'
import css from './Overlay.less'

type Props = {
    isVisible?: boolean
    onClose: () => void
}

const transitionClassNames = {
    appear: css.enter,
    appearActive: css.enterActive,
    enter: css.enter,
    enterActive: css.enterActive,
    exit: css.exit,
    exitActive: css.exitActive,
}

export default function Overlay({isVisible = false, onClose}: Props) {
    return (
        <>
            {isVisible && <div className={css.backdrop} onClick={onClose} />}
            <CSSTransition
                appear
                mountOnEnter
                unmountOnExit
                classNames={transitionClassNames}
                in={isVisible}
                timeout={200}
            >
                <div className={css.container}>
                    <Feed onClose={onClose} />
                </div>
            </CSSTransition>
        </>
    )
}
