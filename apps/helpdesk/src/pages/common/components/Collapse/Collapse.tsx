import type { ReactNode } from 'react'
import React, { useMemo, useRef, useState } from 'react'

import { usePrevious } from '@repo/hooks'
import classnames from 'classnames'
import { Transition } from 'react-transition-group'

import css from './Collapse.less'

type Props = {
    isOpen?: boolean
    direction?: 'vertical' | 'horizontal'
    // https://reactcommunity.org/react-transition-group/transition#Transition-prop-appear
    appear?: boolean
    memoizeOnExit?: boolean
    children: ReactNode
}

// Behaviour identical to the Collapse component from reactstrap, inspired by
// https://github.com/reactstrap/reactstrap/blob/master/src/Collapse.js with exclusion of things we don't need.
const Collapse = ({
    isOpen,
    direction = 'vertical',
    appear,
    memoizeOnExit,
    children,
}: Props) => {
    const [dimension, setDimension] = useState<number | null>(null)
    const nodeRef = useRef<HTMLDivElement>(null)
    const prevChildren = usePrevious(children)
    const memoizedChildren = useRef(children)
    const prevIsOpen = usePrevious(isOpen)

    if (prevIsOpen && !isOpen) {
        memoizedChildren.current = prevChildren
    }

    const {
        handleEntering,
        handleEntered,
        handleExit,
        handleExiting,
        handleExited,
    } = useMemo(() => {
        const getDimension = () => {
            const node = nodeRef.current

            if (!node) {
                return null
            }

            return direction === 'vertical'
                ? node.scrollHeight
                : node.scrollWidth
        }

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
    }, [direction])

    return (
        <Transition
            in={isOpen}
            appear={appear}
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
                    style={
                        dimension !== null
                            ? {
                                  [direction === 'vertical'
                                      ? 'height'
                                      : 'width']: dimension,
                              }
                            : {}
                    }
                    className={classnames(css.container, {
                        [css.isVertical]: direction === 'vertical',
                        [css.isHorizontal]: direction === 'horizontal',
                        [css.isCollapsed]:
                            status === 'exited' || status === 'unmounted',
                        [css.isCollapsing]:
                            status === 'entering' || status === 'exiting',
                    })}
                    ref={nodeRef}
                >
                    {!isOpen && memoizeOnExit
                        ? memoizedChildren.current
                        : children}
                </div>
            )}
        </Transition>
    )
}

export default Collapse
