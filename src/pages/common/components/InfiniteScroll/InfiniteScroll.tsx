import React, {ReactNode, useCallback, useEffect, useRef, useState} from 'react'
import classnames from 'classnames'

import Loader from '../Loader/Loader'

import css from './InfiniteScroll.less'

type Props = {
    children: ReactNode
    className?: string
    onLoad: () => Promise<void>
    shouldLoadMore: boolean
    threshold?: number
    loaderSize?: number
}

const InfiniteScroll = ({
    children,
    className = '',
    onLoad = () => Promise.resolve(),
    shouldLoadMore = true,
    threshold = 50,
    loaderSize = 40,
}: Props): JSX.Element => {
    const [isLoading, setIsLoading] = useState(false)
    const ref = useRef<HTMLDivElement>(null)

    const handleLoad = useCallback(async () => {
        const {current} = ref

        if (!shouldLoadMore || isLoading || !current) {
            return
        }

        const {clientHeight, scrollHeight, scrollTop} = current

        const containerScroll = scrollTop + clientHeight

        if (
            containerScroll !== 0 &&
            scrollHeight !== 0 &&
            (clientHeight === scrollHeight ||
                containerScroll + threshold >= scrollHeight)
        ) {
            setIsLoading(true)
            await onLoad()
            setIsLoading(false)
        }
    }, [isLoading, onLoad, setIsLoading, shouldLoadMore, threshold])

    useEffect(() => {
        void handleLoad()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [shouldLoadMore, children, onLoad])

    return (
        <div
            ref={ref}
            onScroll={handleLoad}
            className={classnames(
                css.component,
                {
                    [css.loading]: isLoading,
                },
                className
            )}
        >
            {children}
            <Loader
                className={css.loader}
                minHeight="0"
                size={`${loaderSize}px`}
            />
        </div>
    )
}

InfiniteScroll.displayName = 'InfiniteScroll'

export default InfiniteScroll
