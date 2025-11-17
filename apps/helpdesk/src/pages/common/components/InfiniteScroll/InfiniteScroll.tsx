import type { HTMLProps, ReactNode } from 'react'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import classnames from 'classnames'

import { LegacyLoadingSpinner as LoadingSpinner } from '@gorgias/axiom'

import css from 'pages/common/components/InfiniteScroll/InfiniteScroll.less'

type Props = {
    children: ReactNode
    className?: string
    isLoading?: boolean
    loaderSize?: number
    onLoad: () => Promise<any>
    shouldLoadMore?: boolean
    threshold?: number
}

const InfiniteScroll = ({
    children,
    className = '',
    isLoading,
    loaderSize,
    onLoad = () => Promise.resolve(),
    shouldLoadMore = true,
    threshold = 50,
    ...props
}: Props & HTMLProps<HTMLDivElement>) => {
    const [internalIsLoading, setInternalIsLoading] = useState(false)
    const ref = useRef<HTMLDivElement>(null)
    const isLoadingState = useMemo(
        () => isLoading ?? internalIsLoading,
        [internalIsLoading, isLoading],
    )

    const handleLoad = useCallback(async () => {
        const { current } = ref

        if (!shouldLoadMore || isLoadingState || !current) {
            return
        }

        const { clientHeight, scrollHeight, scrollTop } = current
        const containerScroll = scrollTop + clientHeight

        if (
            containerScroll !== 0 &&
            scrollHeight !== 0 &&
            (clientHeight === scrollHeight ||
                containerScroll + threshold >= scrollHeight)
        ) {
            setInternalIsLoading(true)
            await onLoad()
            setInternalIsLoading(false)
        }
    }, [
        isLoadingState,
        onLoad,
        setInternalIsLoading,
        shouldLoadMore,
        threshold,
    ])

    useEffect(() => {
        void handleLoad()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [shouldLoadMore, children, onLoad])

    return (
        <div
            ref={ref}
            onScroll={handleLoad}
            className={classnames(css.component, className)}
            {...props}
        >
            {children}
            {isLoadingState && (
                <div className={css.wrapper}>
                    <LoadingSpinner
                        className={css.spinner}
                        size={loaderSize ?? 'small'}
                    />
                </div>
            )}
        </div>
    )
}

export default InfiniteScroll
