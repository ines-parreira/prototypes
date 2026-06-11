import cn from 'classnames'
import { CSSTransition } from 'react-transition-group'
import { Duration } from '@gorgias/toolkit'

import { useNotificationsOverlay } from '../hooks/useNotificationsOverlay'
import { Feed } from './Feed'

import css from './Overlay.less'

const transitionClassNames = {
    appear: css.enter,
    appearActive: css.enterActive,
    enter: css.enter,
    enterActive: css.enterActive,
    exit: css.exit,
    exitActive: css.exitActive,
}

export function Overlay() {
    const [isVisible, onToggle] = useNotificationsOverlay()

    return (
        <>
            {isVisible && <div className={css.backdrop} onClick={onToggle} />}
            <CSSTransition
                appear
                mountOnEnter
                unmountOnExit
                classNames={transitionClassNames}
                in={isVisible}
                timeout={Duration.millis(200)}
            >
                <div className={cn(css.container)}>
                    <Feed onClose={onToggle} />
                </div>
            </CSSTransition>
        </>
    )
}
