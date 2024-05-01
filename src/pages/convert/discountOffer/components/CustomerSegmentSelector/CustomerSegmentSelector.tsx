import React, {useMemo, useRef, useState} from 'react'

import {useListShopifyCustomerSegments} from 'models/integration/queries'

import SelectInputBox, {
    SelectInputBoxContext,
} from 'pages/common/forms/input/SelectInputBox'
import Dropdown from 'pages/common/components/dropdown/Dropdown'
import DropdownBody from 'pages/common/components/dropdown/DropdownBody'
import DropdownItem from 'pages/common/components/dropdown/DropdownItem'
import DropdownSearch from 'pages/common/components/dropdown/DropdownSearch'

import css from './CustomerSegmentSelector.less'

type Option = {
    label: string
    value: string | null
}

type Props = {
    integrationId: number
    value: string | null
    onChange: (nextValue: string | null) => void
}

const CustomerSegmentSelector: React.FC<Props> = ({
    integrationId,
    value,
    onChange,
}) => {
    const targetRef = useRef<HTMLDivElement>(null)
    const floatingRef = useRef<HTMLDivElement>(null)
    const searchRef = useRef<HTMLInputElement>(null)

    const [search, setSearch] = useState<string>('')
    const [isSelectOpen, setIsSelectOpen] = useState(false)

    const {data: customerSegmentData} = useListShopifyCustomerSegments(
        integrationId,
        {enabled: !!integrationId}
    )

    const customerSegments = useMemo<Option[]>(() => {
        const segments: Option[] = [
            {
                label: 'All customers',
                value: null,
            },
        ]
        const shopifySegements =
            customerSegmentData?.map(
                (segment): Option => ({
                    label: segment.name,
                    value: segment.id.toString(),
                })
            ) ?? []

        segments.push(...shopifySegements)

        return segments
    }, [customerSegmentData])

    const label = customerSegments.find(
        (segment) => segment.value === value
    )?.label

    return (
        <SelectInputBox
            ref={targetRef}
            floating={floatingRef}
            placeholder={'Select a Shopify customer segment'}
            onToggle={setIsSelectOpen}
            className={css.selectInput}
            label={label}
        >
            <SelectInputBoxContext.Consumer>
                {(context) => (
                    <Dropdown
                        isOpen={isSelectOpen}
                        onToggle={() => context!.onBlur()}
                        ref={floatingRef}
                        target={targetRef}
                        value={''}
                    >
                        <DropdownSearch
                            ref={searchRef}
                            value={search}
                            onChange={setSearch}
                            autoFocus
                        />
                        <DropdownBody>
                            {customerSegments.map((segment) => (
                                <DropdownItem
                                    key={segment.value}
                                    option={segment}
                                    onClick={() => onChange(segment.value)}
                                    shouldCloseOnSelect
                                >
                                    <span>{segment.label}</span>
                                </DropdownItem>
                            ))}
                        </DropdownBody>
                    </Dropdown>
                )}
            </SelectInputBoxContext.Consumer>
        </SelectInputBox>
    )
}

export default CustomerSegmentSelector
