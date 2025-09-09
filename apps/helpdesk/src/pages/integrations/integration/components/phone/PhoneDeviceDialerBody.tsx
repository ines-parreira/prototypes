import { UserSearchResult } from 'models/search/types'

import DialPad from './DialPad'
import PhoneSearchResultsContent from './PhoneSearchResultsContent'

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

    return (
        <PhoneSearchResultsContent
            results={results}
            isLoading={isLoading}
            isSearchTypeCustomer={isSearchTypeCustomer}
            onCustomerSelect={onCustomerSelect}
            highlightedResultIndex={highlightedResultIndex}
            fallbackContent={dialPad}
        />
    )
}
