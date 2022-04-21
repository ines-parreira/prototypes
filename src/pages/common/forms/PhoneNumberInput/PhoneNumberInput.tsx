import React, {
    useState,
    useEffect,
    useMemo,
    useRef,
    useCallback,
    ComponentProps,
} from 'react'
import CountryFlag from 'react-country-flag'
import {getCountryCallingCode, CountryCode} from 'libphonenumber-js'
import {usePrevious, useUpdateEffect} from 'react-use'

import countries from 'config/countries.json'
import Button from 'pages/common/components/button/Button'
import InputGroup, {
    InputGroupContext,
} from 'pages/common/forms/input/InputGroup'
import Caption from 'pages/common/forms/Caption/Caption'
import TextInput from 'pages/common/forms/input/TextInput'
import Label from 'pages/common/forms/Label/Label'
import {useOnClickOutside} from 'pages/common/hooks/useOnClickOutside'
import SelectField from 'pages/common/forms/SelectField/SelectField'
import {getCountryCountryCallingCodeSelectOptions} from 'pages/settings/helpCenter/utils/phoneCodeSelectOptions'
import {reportError} from 'utils/errors'

import {
    getCountryFromPhoneNumber,
    buildInternationalNumber,
    formatAsNationalNumber,
} from './utils'
import css from './PhoneNumberInput.less'

const typedCountries = countries as {value: CountryCode; label: string}[]

type Props = {
    label?: string
    value: string
    allowedCountries?: CountryCode[]
    defaultCountry?: CountryCode
    disabled?: boolean
} & ComponentProps<typeof TextInput>

const PhoneNumberInput = ({
    label,
    value,
    onChange,
    allowedCountries,
    defaultCountry = 'US',
    disabled = false,
    className,
    autoFocus = false,
    ...other
}: Props) => {
    const containerRef = useRef<HTMLDivElement>(null)

    const [isPhoneNumberTooLong, setIsPhoneNumberTooLong] = useState(false)
    const [currentCountry, setCurrentCountry] = useState<CountryCode>(
        getCountryFromPhoneNumber(value) ?? defaultCountry
    )
    const [isCountrySelectVisible, setCountrySelectVisible] =
        useState<boolean>(false)

    const previousIsCountrySelectVisible = usePrevious(isCountrySelectVisible)

    useEffect(() => {
        const isDefaultCountryNotAllowed =
            allowedCountries && !allowedCountries.includes(defaultCountry)
        const isCurrentCountryNotAllowed =
            allowedCountries && !allowedCountries.includes(currentCountry)

        if (isDefaultCountryNotAllowed || isCurrentCountryNotAllowed) {
            reportError(new Error('Wrong props passed to PhoneNumberInput'), {
                extra: {
                    allowedCountries,
                    defaultCountry,
                    currentCountry,
                },
            })
        }
    }, [allowedCountries, defaultCountry, currentCountry])

    useUpdateEffect(() => {
        const nextCountry = getCountryFromPhoneNumber(value)
        if (nextCountry) {
            setCurrentCountry(nextCountry)
        }
    }, [value])

    const options = useMemo(
        () =>
            getCountryCountryCallingCodeSelectOptions(
                typedCountries,
                allowedCountries
            ),
        [allowedCountries]
    )

    const handleChange = useCallback(
        (number: string, country: CountryCode) => {
            setCurrentCountry(country)
            setCountrySelectVisible(false)
            number === ''
                ? onChange?.('')
                : onChange?.(buildInternationalNumber(number, country))
        },
        [onChange, setCurrentCountry]
    )

    useOnClickOutside<HTMLDivElement>(containerRef, () => {
        setCountrySelectVisible(false)
    })

    const callbackRef = useCallback(
        (inputElement: HTMLInputElement | null) => {
            if (
                inputElement &&
                previousIsCountrySelectVisible &&
                !isCountrySelectVisible
            ) {
                inputElement.focus()
            }
        },
        [isCountrySelectVisible, previousIsCountrySelectVisible]
    )

    return (
        <div ref={containerRef} className={className}>
            {label && <Label className={css.label}>{label}</Label>}
            <InputGroup
                className={css.group}
                hasError={isPhoneNumberTooLong}
                isDisabled={disabled}
            >
                <InputGroupContext.Consumer>
                    {(inputGroupContext) => (
                        <Button
                            className={css.button}
                            intent="secondary"
                            onClick={() => {
                                inputGroupContext?.setIsFocused(true)
                                setCountrySelectVisible(!isCountrySelectVisible)
                            }}
                        >
                            <CountryFlag
                                countryCode={currentCountry}
                                style={{
                                    fontSize: '20px',
                                }}
                            />
                            <span className="ml-2 dropdown-toggle">
                                +{getCountryCallingCode(currentCountry)}
                            </span>
                        </Button>
                    )}
                </InputGroupContext.Consumer>
                {isCountrySelectVisible ? (
                    <div className={css.selectContainer}>
                        <SelectField
                            value={currentCountry}
                            options={options}
                            onChange={(nextCountry) =>
                                handleChange(
                                    formatAsNationalNumber(value),
                                    nextCountry as CountryCode
                                )
                            }
                            style={{width: '100%'}}
                            fullWidth
                            shouldFocus
                        />
                    </div>
                ) : (
                    <InputGroupContext.Consumer>
                        {(inputGroupContext) => {
                            return (
                                <TextInput
                                    {...other}
                                    ref={callbackRef}
                                    value={formatAsNationalNumber(value)}
                                    onFocus={() => {
                                        inputGroupContext?.setIsFocused(true)
                                    }}
                                    onBlur={() => {
                                        inputGroupContext?.setIsFocused(false)
                                    }}
                                    onChange={(value) => {
                                        const numberOfDigits = value.replace(
                                            /\s+/g,
                                            ''
                                        ).length
                                        if (numberOfDigits > 15) {
                                            setIsPhoneNumberTooLong(true)
                                            return
                                        }
                                        setIsPhoneNumberTooLong(false)
                                        handleChange(value, currentCountry)
                                    }}
                                    autoFocus={autoFocus}
                                />
                            )
                        }}
                    </InputGroupContext.Consumer>
                )}
            </InputGroup>
            {isPhoneNumberTooLong && (
                <Caption
                    error="A phone number can't have more than 15
                                digits"
                />
            )}
        </div>
    )
}

export default PhoneNumberInput
