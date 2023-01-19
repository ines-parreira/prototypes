import React, {ReactNode, useMemo, useRef, useState} from 'react'
import {Transition} from 'react-transition-group'
import classnames from 'classnames'

import css from './Collapse.less'

type Props = {
    isOpen?: boolean
    children: ReactNode
}

// Behaviour identical to the Collapse component from reactstrap, inspired by
// https://github.com/reactstrap/reactstrap/blob/master/src/Collapse.js with exclusion of things we don't need.
const Collapse = ({isOpen, children}: Props) => {
    const [dimension, setDimension] = useState<number | null>(null)
    const nodeRef = useRef<HTMLDivElement>(null)

    const {
        handleEntering,
        handleEntered,
        handleExit,
        handleExiting,
        handleExited,
    } = useMemo(() => {
        const getDimension = () => nodeRef.current?.scrollHeight ?? null

        return {
            handleEntering: () => {
                setDimension(getDimension())
            },
            handleEntered: () => {
                setDimension(null)
            },
            handleExit: () => {
                setDimension(getDimension())
            },
            handleExiting: () => {
                getDimension()
                setDimension(0)
            },
            handleExited: () => {
                setDimension(null)
            },
        }
    }, [])

    return (
        <Transition
            in={isOpen}
            nodeRef={nodeRef}
            onEntering={handleEntering}
            onEntered={handleEntered}
            onExit={handleExit}
            onExiting={handleExiting}
            onExited={handleExited}
            timeout={350}
        >
            {(status) => (
                <div
                    style={{
                        ...(dimension !== null ? {height: dimension} : {}),
                    }}
                    className={classnames(css.container, {
                        [css.isCollapsed]:
                            status === 'exited' || status === 'unmounted',
                        [css.isCollapsing]:
                            status === 'entering' || status === 'exiting',
                    })}
                    ref={nodeRef}
                >
                    {children}
                </div>
            )}
        </Transition>
    )
}

export default Collapse
