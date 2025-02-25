import React, {
    ComponentProps,
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react'

import classnames from 'classnames'
import { ReactCountryFlag as CountryFlag } from 'react-country-flag'

import { Label } from '@gorgias/merchant-ui-kit'

import { countries } from 'config/countries'
import Dropdown from 'pages/common/components/dropdown/Dropdown'
import DropdownBody from 'pages/common/components/dropdown/DropdownBody'
import DropdownItem from 'pages/common/components/dropdown/DropdownItem'
import DropdownSearch from 'pages/common/components/dropdown/DropdownSearch'
import DropdownSection from 'pages/common/components/dropdown/DropdownSection'
import SelectInputBox, {
    SelectInputBoxContext,
} from 'pages/common/forms/input/SelectInputBox'
import TextInput from 'pages/common/forms/input/TextInput'

import { getCountryLabel, getCountrySelectOptions } from './utils'

import css from './CountryInput.less'

type Props = {
    allowedCountries?: string[]
    disabled?: boolean
    label?: string
    value?: string
    popularCountries?: string[]
    onChange: (nextValue: string) => void
    defaultCountry?: string
} & ComponentProps<typeof TextInput>

const CountryInput = ({
    className,
    label,
    value,
    defaultCountry = 'US',
    popularCountries = ['US'],
    onChange,
}: Props) => {
    const inputRef = useRef<HTMLInputElement>(null)
    const floatingRef = useRef<HTMLInputElement>(null)
    const [currentCountry, setCurrentCountry] = useState(
        value || defaultCountry,
    )
    const [isDropdownOpen, setIsDropdownOpen] = useState(false)

    const popularOptions = useMemo(
        () => getCountrySelectOptions(countries, popularCountries),
        [popularCountries],
    )

    const handleChange = useCallback(
        (countryCode: string) => {
            setCurrentCountry(countryCode)
            setIsDropdownOpen(false)
            onChange(countryCode)
        },
        [onChange, setCurrentCountry],
    )

    useEffect(() => {
        setCurrentCountry(value || defaultCountry)
    }, [defaultCountry, value])

    return (
        <div className={classnames(css.wrapper, className)}>
            {label && <Label className={css.label}>{label}</Label>}

            <SelectInputBox
                ref={inputRef}
                floating={floatingRef}
                label={getCountryLabel(currentCountry)}
                onToggle={setIsDropdownOpen}
                prefix={
                    <CountryFlag
                        countryCode={currentCountry}
                        style={{
                            fontSize: '20px',
                        }}
                    />
                }
            >
                <SelectInputBoxContext.Consumer>
                    {(context) => (
                        <Dropdown
                            target={inputRef}
                            isOpen={isDropdownOpen}
                            ref={floatingRef}
                            onToggle={() => context!.onBlur()}
                            value={currentCountry}
                            contained
                        >
                            <DropdownSearch autoFocus />
                            <DropdownBody className={css.addressDropDown}>
                                <DropdownSection
                                    key={'popular'}
                                    title={'POPULAR'}
                                >
                                    {popularOptions.map((option) => (
                                        <DropdownItem
                                            key={option.value}
                                            option={option}
                                            onClick={handleChange}
                                            shouldCloseOnSelect
                                        >
                                            <CountryFlag
                                                countryCode={option.value}
                                                style={{
                                                    fontSize: '20px',
                                                }}
                                            />
                                            <div className={css.countryLabel}>
                                                {option.label}
                                            </div>
                                        </DropdownItem>
                                    ))}
                                </DropdownSection>
                                <DropdownSection key={'all'} title={'ALL'}>
                                    {countries.map((option) => (
                                        <DropdownItem
                                            key={option.value}
                                            option={option}
                                            onClick={handleChange}
                                            shouldCloseOnSelect
                                        >
                                            <CountryFlag
                                                countryCode={option.value}
                                                style={{
                                                    fontSize: '20px',
                                                }}
                                            />
                                            <div className={css.countryLabel}>
                                                {option.label}
                                            </div>
                                        </DropdownItem>
                                    ))}
                                </DropdownSection>
                            </DropdownBody>
                        </Dropdown>
                    )}
                </SelectInputBoxContext.Consumer>
            </SelectInputBox>
        </div>
    )
}

export default CountryInput
