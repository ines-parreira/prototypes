import React, {ReactNode, useEffect, useMemo, useState} from 'react'
import {useDebounce, useWindowSize} from 'react-use'

import SynchronizedScrollTopContext, {
    SynchronizedScrollTopValue,
} from './SynchronizedScrollTopContext'

type Props = {
    children?: ReactNode
}

export default function SynchronizedScrollTopProvider({children}: Props) {
    const [scrollTop, setScrollTop] = useState(0)
    const [scrollHeight, setScrollHeight] = useState(0)
    const {width: windowWidth} = useWindowSize()

    const value = useMemo<SynchronizedScrollTopValue>(
        () => ({
            scrollTop,
            setScrollTop,
            scrollHeight,
            setScrollHeight,
        }),
        [scrollTop, scrollHeight]
    )

    const reset = () => {
        setScrollTop(0)
        setScrollHeight(0)
    }

    useDebounce(reset, 300, [windowWidth])

    useEffect(() => {
        window.addEventListener('load', reset)
        return () => {
            window.removeEventListener('load', reset)
        }
    }, [])

    return (
        <SynchronizedScrollTopContext.Provider value={value}>
            {children}
        </SynchronizedScrollTopContext.Provider>
    )
}
