import React, { useEffect } from 'react'

import classNames from 'classnames'

import { UserSearchResult } from 'models/search/types'
import Avatar from 'pages/common/components/Avatar/Avatar'

import css from './PhoneDevice.less'

export type PhoneDeviceDialerBodyResultsListHandle = {
    focusFirstElement: () => void
}

type Props = {
    results: UserSearchResult[]
    onCustomerSelect: (customer: UserSearchResult) => void
    highlightedResultIndex: number | null
}

export default function PhoneDeviceDialerBodyResultsList({
    results,
    onCustomerSelect,
    highlightedResultIndex,
}: Props) {
    const listItemsRef = React.useRef<HTMLDivElement[]>([])

    useEffect(() => {
        listItemsRef.current = listItemsRef.current.slice(0, results.length)
    }, [results])

    return (
        <div className={classNames(css.results, css.resultsFound)}>
            {results.map((result, index) => (
                <div
                    key={result.id}
                    className={classNames(css.result, {
                        [css.highlighted]: highlightedResultIndex === index,
                    })}
                    onClick={() => onCustomerSelect(result)}
                    ref={(element) => {
                        if (element) {
                            listItemsRef.current?.push(element)
                        }
                    }}
                >
                    <Avatar name={result.customer.name} size={20} />
                    <div className={css.resultDetails}>
                        <div>{result.customer.name}</div>
                        <div className={css.address}>{result.address}</div>
                    </div>
                </div>
            ))}
        </div>
    )
}
