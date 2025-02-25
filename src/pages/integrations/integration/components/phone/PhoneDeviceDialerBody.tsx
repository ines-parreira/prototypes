import React from 'react'

import classNames from 'classnames'

import { Skeleton } from '@gorgias/merchant-ui-kit'

import { UserSearchResult } from 'models/search/types'

import DialPad from './DialPad'
import PhoneDeviceDialerBodyResultsList from './PhoneDeviceDialerBodyResultsList'

import css from './PhoneDevice.less'

type Props = {
    value: string
    onChange: (value: string) => void
    results?: UserSearchResult[]
    isLoading: boolean
    isSearchTypeCustomer: boolean
    selectedCustomer: UserSearchResult | null
    onCustomerSelect: (customer: UserSearchResult) => void
    highlightedResultIndex: number | null
}

export default function PhoneDeviceDialerBody({
    value,
    onChange,
    results,
    isLoading,
    isSearchTypeCustomer,
    selectedCustomer,
    onCustomerSelect,
    highlightedResultIndex,
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
                {Array.from({ length: 4 }).map((_, index) => (
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
            <PhoneDeviceDialerBodyResultsList
                results={results}
                onCustomerSelect={onCustomerSelect}
                highlightedResultIndex={highlightedResultIndex}
            />
        )
    }

    return dialPad
}
