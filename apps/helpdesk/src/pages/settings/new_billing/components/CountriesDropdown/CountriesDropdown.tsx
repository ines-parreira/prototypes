import React, { useRef, useState } from 'react'

import { countries, Country } from 'config/countries'
import Dropdown from 'pages/common/components/dropdown/Dropdown'
import DropdownBody from 'pages/common/components/dropdown/DropdownBody'
import DropdownItem from 'pages/common/components/dropdown/DropdownItem'
import DropdownSearch from 'pages/common/components/dropdown/DropdownSearch'
import SelectInputBox, {
    SelectInputBoxContext,
} from 'pages/common/forms/input/SelectInputBox'

import css from './CountriesDropdown.less'

type Props = {
    onChange: (country: Country) => void
    country: string
    error?: string
}

const CountriesDropdown = ({ country, onChange, error }: Props) => {
    const targetRef = useRef<HTMLDivElement>(null)
    const floatingRef = useRef<HTMLDivElement>(null)
    const [isSelectOpen, setIsSelectOpen] = useState(false)

    return (
        <>
            <SelectInputBox
                id="country"
                placeholder="e.g. United States"
                floating={floatingRef}
                onToggle={setIsSelectOpen}
                ref={targetRef}
                label={countries.find((c) => c.value === country)?.label}
                hasError={!!error}
            >
                <SelectInputBoxContext.Consumer>
                    {(context) => (
                        <Dropdown
                            isOpen={isSelectOpen}
                            onToggle={() => context!.onBlur()}
                            ref={floatingRef}
                            target={targetRef}
                            value={country}
                        >
                            <DropdownSearch autoFocus />
                            <DropdownBody>
                                {countries.map((option) => (
                                    <DropdownItem
                                        key={option.value}
                                        option={option}
                                        onClick={() => onChange(option)}
                                        shouldCloseOnSelect
                                    >
                                        {option.label}
                                    </DropdownItem>
                                ))}
                            </DropdownBody>
                        </Dropdown>
                    )}
                </SelectInputBoxContext.Consumer>
            </SelectInputBox>
            {error && <div className={css.error}>{error}</div>}
        </>
    )
}

export default CountriesDropdown
