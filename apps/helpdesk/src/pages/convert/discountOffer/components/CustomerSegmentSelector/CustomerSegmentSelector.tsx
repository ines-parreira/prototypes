import type { FC, HTMLAttributes } from 'react'
import React, { useMemo, useRef, useState } from 'react'

import { useListShopifyCustomerSegments } from 'models/integration/queries'
import Dropdown from 'pages/common/components/dropdown/Dropdown'
import DropdownBody from 'pages/common/components/dropdown/DropdownBody'
import DropdownItem from 'pages/common/components/dropdown/DropdownItem'
import DropdownSearch from 'pages/common/components/dropdown/DropdownSearch'
import SelectInputBox, {
    SelectInputBoxContext,
} from 'pages/common/forms/input/SelectInputBox'

import css from './CustomerSegmentSelector.less'

type Option = {
    label: string
    value: string | null
}

type Props = {
    integrationId: number
    value: string[] | string | null
    onChange: (nextValue: string | null) => void
} & Omit<HTMLAttributes<HTMLDivElement>, 'onChange'>

const CustomerSegmentSelector: FC<Props> = ({
    id,
    integrationId,
    value,
    onChange,
}) => {
    const targetRef = useRef<HTMLDivElement>(null)
    const floatingRef = useRef<HTMLDivElement>(null)
    const searchRef = useRef<HTMLInputElement>(null)

    const [search, setSearch] = useState<string>('')
    const [isSelectOpen, setIsSelectOpen] = useState(false)

    const { data: customerSegmentData } = useListShopifyCustomerSegments(
        integrationId,
        { enabled: !!integrationId },
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
                }),
            ) ?? []

        segments.push(...shopifySegements)

        return segments
    }, [customerSegmentData])

    const getLabel = () => {
        switch (value?.length) {
            case undefined:
                return 'All customers'
            case 1:
                return customerSegments.find((item) => item.value === value[0])
                    ?.label
            default:
                return `${value?.length} segments selected`
        }
    }

    return (
        <SelectInputBox
            ref={targetRef}
            id={id}
            floating={floatingRef}
            placeholder={'Select a Shopify customer segment'}
            onToggle={setIsSelectOpen}
            className={css.selectInput}
            label={getLabel()}
        >
            <SelectInputBoxContext.Consumer>
                {(context) => (
                    <Dropdown
                        isOpen={isSelectOpen}
                        onToggle={() => context!.onBlur()}
                        ref={floatingRef}
                        target={targetRef}
                        value={value}
                        isMultiple={true}
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
                                    shouldCloseOnSelect={false}
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
