import React, {ReactNode, useCallback, useEffect, useRef, useState} from 'react'
import classnames from 'classnames'

import Loader from '../Loader/Loader'

import css from './InfiniteScroll.less'

type Props = {
    children: ReactNode
    className: string
    onLoad: () => Promise<void>
    shouldLoadMore: boolean
    threshold?: number
}

const InfiniteScroll = ({
    children,
    className = '',
    onLoad = () => Promise.resolve(),
    shouldLoadMore = true,
    threshold = 50,
}: Props) => {
    const [isLoading, setIsLoading] = useState(false)
    const ref = useRef<HTMLDivElement>(null)

    useEffect(() => {
        void handleLoad()
    }, [shouldLoadMore])

    const handleLoad = useCallback(async () => {
        if (!shouldLoadMore || isLoading || !ref.current) {
            return
        }

        const containerScroll = ref.current.scrollTop + ref.current.clientHeight

        if (
            containerScroll !== 0 &&
            ref.current.scrollHeight !== 0 &&
            containerScroll + threshold >= ref.current.scrollHeight
        ) {
            setIsLoading(true)
            await onLoad()
            setIsLoading(false)
        }
    }, [isLoading, ref.current, setIsLoading, shouldLoadMore])

    return (
        <div
            className={classnames(
                css.component,
                {
                    [css.loading]: isLoading,
                },
                className
            )}
            ref={ref}
            onScroll={handleLoad}
        >
            {children}
            <Loader className={css.loader} minHeight="0" />
        </div>
    )
}

export default InfiniteScroll
