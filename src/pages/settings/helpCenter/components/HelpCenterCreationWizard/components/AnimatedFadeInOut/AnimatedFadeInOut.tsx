import React, { ReactNode } from 'react'

import { CSSTransition, SwitchTransition } from 'react-transition-group'

import css from './AnimatedFadeInOut.less'

type Props = {
    isLoading: boolean
    children: ReactNode
}

export const AnimatedFadeInOut = ({ isLoading, children }: Props) => (
    <SwitchTransition>
        <CSSTransition
            key={isLoading.toString()}
            classNames={{
                enter: css.fadeEnter,
                enterActive: css.fadeEnterActive,
                exit: css.fadeExit,
                exitActive: css.fadeExitActive,
            }}
            addEndListener={(node, done) =>
                node.addEventListener('transitionend', done, false)
            }
        >
            {children}
        </CSSTransition>
    </SwitchTransition>
)
