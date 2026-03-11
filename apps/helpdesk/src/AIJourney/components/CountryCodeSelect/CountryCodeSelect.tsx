import { useMemo, useState } from 'react'

import type { CountryCode } from 'libphonenumber-js'
import { isSupportedCountry } from 'libphonenumber-js'

import {
    FlagIcon,
    Icon,
    ListItem,
    Select,
    SelectPlacement,
    SelectTrigger,
    Text,
} from '@gorgias/axiom'

import { countries } from 'config/countries'
import { getCountryCallingCodeFixed } from 'pages/settings/helpCenter/utils/phoneCodeSelectOptions'

import css from './CountryCodeSelect.less'

type CountryItem = {
    id: CountryCode
    name: string
    callingCode: string
}

const typedCountries = countries as { value: CountryCode; label: string }[]

const countryItems: CountryItem[] = typedCountries
    .filter((c) => isSupportedCountry(c.value))
    .map((c) => ({
        id: c.value,
        name: c.label,
        callingCode: String(getCountryCallingCodeFixed(c.value)),
    }))

const DEFAULT_ITEM = countryItems.find((c) => c.id === 'US') ?? countryItems[0]

const CountryCodeSelectTrigger = ({
    displayItem,
    isOpen,
}: {
    displayItem: CountryItem
    isOpen: boolean
}) => (
    <div className={css.trigger}>
        <FlagIcon code={displayItem.id} />
        <Text>+{displayItem.callingCode}</Text>
        <Icon name={isOpen ? 'arrow-chevron-up' : 'arrow-chevron-down'} />
    </div>
)

export const CountryCodeSelect = ({
    selectedCountryCode,
    onCountryChange,
}: {
    selectedCountryCode?: CountryCode
    onCountryChange: (code: CountryCode) => void
}) => {
    const [search, setSearch] = useState('')
    const [visibleCount, setVisibleCount] = useState(10)

    const filteredItems = useMemo(() => {
        if (!search) return countryItems.slice(0, visibleCount)
        const lower = search.toLowerCase()
        return countryItems.filter((c) => c.name.toLowerCase().includes(lower))
    }, [search, visibleCount])

    const displayItem =
        countryItems.find((c) => c.id === selectedCountryCode) ?? DEFAULT_ITEM

    return (
        <Select
            data-name="select-field"
            aria-label="Country code"
            trigger={({ ref, isOpen }) => (
                <SelectTrigger ref={ref}>
                    <CountryCodeSelectTrigger
                        displayItem={displayItem}
                        isOpen={isOpen}
                    />
                </SelectTrigger>
            )}
            items={filteredItems}
            onSelect={(item: CountryItem) => onCountryChange(item.id)}
            isSearchable
            searchValue={search}
            onSearchChange={(value) => {
                setSearch(value)
                setVisibleCount(10)
            }}
            onOpenChange={(isOpen) => {
                if (!isOpen) {
                    setVisibleCount(10)
                    setSearch('')
                }
            }}
            isLoading={!search && visibleCount < countryItems.length}
            onLoadMore={() =>
                setVisibleCount((prev) =>
                    Math.min(prev + 10, countryItems.length),
                )
            }
            maxHeight={300}
            minWidth={320}
            placement={SelectPlacement.BottomLeft}
            shouldFlip={false}
        >
            {(item: CountryItem) => (
                <ListItem
                    id={item.id}
                    label={`${item.name} (+${item.callingCode})`}
                    textValue={item.name}
                />
            )}
        </Select>
    )
}
