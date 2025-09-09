import classNames from 'classnames'

import { Skeleton } from '@gorgias/axiom'

import { UserSearchResult } from 'models/search/types'

import PhoneDeviceDialerBodyResultsList from './PhoneDeviceDialerBodyResultsList'

import css from './PhoneDevice.less'

type Props = {
    results?: UserSearchResult[]
    isLoading: boolean
    isSearchTypeCustomer: boolean
    onCustomerSelect: (customer: UserSearchResult) => void
    highlightedResultIndex: number | null
    className?: string
    fallbackContent?: React.ReactNode
}

export default function PhoneSearchResultsContent({
    results,
    isLoading,
    isSearchTypeCustomer,
    onCustomerSelect,
    highlightedResultIndex,
    className,
    fallbackContent,
}: Props) {
    if (isLoading) {
        return (
            <div className={classNames(css.skeleton, css.results, className)}>
                {Array.from({ length: 4 }).map((_, index) => (
                    <Skeleton key={index} height={52} count={1} />
                ))}
            </div>
        )
    }

    if (isSearchTypeCustomer && !results?.length) {
        return (
            <div className={classNames(css.results, css.noResults, className)}>
                No results
            </div>
        )
    }

    if (results?.length) {
        return (
            <PhoneDeviceDialerBodyResultsList
                results={results}
                onCustomerSelect={onCustomerSelect}
                highlightedResultIndex={highlightedResultIndex}
                className={className}
            />
        )
    }

    return fallbackContent || <></>
}
