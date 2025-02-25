import React, { HTMLProps, useContext, useEffect, useRef } from 'react'

import classNames from 'classnames'

import SynchronizedScrollTopContext from './SynchronizedScrollTopContext'

import css from './SynchronizedScrollTopContainer.less'

type Props = {
    height?: number
    hideScrollbar?: boolean
} & HTMLProps<HTMLDivElement>

export default function SynchronizedScrollTopContainer({
    children,
    className,
    height,
    hideScrollbar,
    ...containerProps
}: Props) {
    const { setScrollHeight, scrollHeight, setScrollTop, scrollTop } =
        useContext(SynchronizedScrollTopContext)
    const containerRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (containerRef.current && !scrollHeight) {
            setScrollHeight((currentHeight) => {
                return Math.max(
                    currentHeight,
                    containerRef.current?.scrollHeight || 0,
                )
            })
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [scrollHeight])

    if (containerRef.current) {
        containerRef.current.scrollTop = scrollTop
    }

    return (
        <div
            {...containerProps}
            ref={containerRef}
            className={classNames(css.container, className, {
                [css.hideScrollbar]: hideScrollbar,
            })}
            style={{ height: height || 'auto' }}
            onScroll={() => {
                setScrollTop(containerRef.current!.scrollTop)
            }}
        >
            <div style={{ height: scrollHeight || 'auto' }}>{children}</div>
        </div>
    )
}
