import React from 'react'
import classNames from 'classnames'
import {UserSearchResult} from 'models/search/types'
import Skeleton from 'pages/common/components/Skeleton/Skeleton'

import css from './PhoneDevice.less'
import DialPad from './DialPad'

type Props = {
    value: string
    onChange: (value: string) => void
    results?: UserSearchResult[]
    isLoading: boolean
    isSearchTypeCustomer: boolean
    selectedCustomer: UserSearchResult | null
    onCustomerSelect: (customer: UserSearchResult) => void
}

export default function PhoneDeviceDialerBody({
    value,
    onChange,
    results,
    isLoading,
    isSearchTypeCustomer,
    selectedCustomer,
    onCustomerSelect,
}: Props) {
    const noSearchTriggered = !isLoading && !results

    const dialPad = (
        <div className={css.dialpad}>
            <DialPad onChange={onChange} value={value} />
        </div>
    )

    if (selectedCustomer || noSearchTriggered) {
        return dialPad
    }

    if (isLoading) {
        return (
            <div className={classNames(css.skeleton, css.results)}>
                {Array.from({length: 4}).map((_, index) => (
                    <Skeleton key={index} height={52} count={1} />
                ))}
            </div>
        )
    }

    if (isSearchTypeCustomer && !results?.length) {
        return (
            <div className={classNames(css.results, css.noResults)}>
                No results
            </div>
        )
    }

    if (results?.length) {
        return (
            <div className={classNames(css.results, css.resultsFound)}>
                {results.map((result) => (
                    <div
                        key={result.id}
                        className={css.result}
                        onClick={() => onCustomerSelect(result)}
                    >
                        <div>{result.customer.name}</div>
                        <div className={css.address}>{result.address}</div>
                    </div>
                ))}
            </div>
        )
    }

    return dialPad
}
