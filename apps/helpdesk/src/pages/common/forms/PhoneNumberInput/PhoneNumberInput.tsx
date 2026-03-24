import type { ComponentProps, ForwardedRef, ReactNode } from 'react'
import type React from 'react'
import {
    forwardRef,
    useCallback,
    useEffect,
    useImperativeHandle,
    useMemo,
    useRef,
    useState,
} from 'react'

import { useUpdateEffect } from '@repo/hooks'
import { reportError } from '@repo/logging'
import classnames from 'classnames'
import type { CountryCode } from 'libphonenumber-js'
import {
    getCountryCallingCode,
    isValidPhoneNumber,
    parsePhoneNumber,
} from 'libphonenumber-js'
import { ReactCountryFlag as CountryFlag } from 'react-country-flag'

import { LegacyButton as Button, LegacyLabel as Label } from '@gorgias/axiom'

import { countries } from 'config/countries'
import IconButton from 'pages/common/components/button/IconButton'
import Loader from 'pages/common/components/Loader/Loader'
import Caption from 'pages/common/forms/Caption/Caption'
import InputGroup, {
    InputGroupContext,
} from 'pages/common/forms/input/InputGroup'
import TextInput from 'pages/common/forms/input/TextInput'
import SelectField from 'pages/common/forms/SelectField/SelectField'
import { useOnClickOutside } from 'pages/common/hooks/useOnClickOutside'
import {
    buildInternationalNumber,
    formatAsNationalNumber,
    getCountryFromPhoneNumber,
} from 'pages/phoneNumbers/utils'
import { getCountryCountryCallingCodeSelectOptions } from 'pages/settings/helpCenter/utils/phoneCodeSelectOptions'

import css from './PhoneNumberInput.less'

const typedCountries = countries as { value: CountryCode; label: string }[]

export type PhoneNumberInputHandle = {
    onChange: (value: string) => void
    onCountryChange: (country: CountryCode) => void
    inputValue: string
}

type Props = {
    allowedCountries?: CountryCode[]
    defaultCountry?: CountryCode
    disabled?: boolean
    label?: ReactNode
    caption?: ReactNode
    error?: string
    value: string
    onCountryChange?: (country: CountryCode) => void
    onLetterEntered?: (input: string) => void
    isClearable?: boolean
    isLoading?: boolean
    onKeyDown?: (event: React.KeyboardEvent<HTMLInputElement>) => void
    suppressUIJumps?: boolean
} & ComponentProps<typeof TextInput>

const PhoneNumberInput = (
    {
        allowedCountries,
        autoFocus = false,
        className,
        defaultCountry = 'US',
        disabled = false,
        label,
        onChange,
        onCountryChange,
        onLetterEntered,
        value,
        isRequired,
        error,
        caption,
        isClearable,
        isLoading,
        onKeyDown,
        suppressUIJumps = false,
        ...other
    }: Props,
    ref: ForwardedRef<PhoneNumberInputHandle>,
) => {
    const containerRef = useRef<HTMLDivElement>(null)
    const inputRef = useRef<HTMLInputElement>(null)
    const [isPhoneNumberTooLong, setIsPhoneNumberTooLong] = useState(false)
    const [currentCountry, setCurrentCountry] = useState<CountryCode>(
        getCountryFromPhoneNumber(value) ?? defaultCountry,
    )
    const [isCountrySelectVisible, setCountrySelectVisible] =
        useState<boolean>(false)

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
                allowedCountries,
            ),
        [allowedCountries],
    )

    const handleNumberChange = useCallback(
        (number: string, oldCountry: CountryCode) => {
            const containsLetters = /[a-zA-Z]/.test(number)

            if (containsLetters && onLetterEntered) {
                onLetterEntered(number)
                return
            }

            const phoneNumber = isValidPhoneNumber(number)
                ? parsePhoneNumber(number)
                : null

            const country = phoneNumber?.country ?? oldCountry

            setCurrentCountry(country)
            number === ''
                ? onChange?.('')
                : onChange?.(buildInternationalNumber(number, country))
        },
        [onChange, setCurrentCountry, onLetterEntered],
    )

    const handleCountryChange = useCallback(
        (number: string, country: CountryCode) => {
            setCurrentCountry(country)
            setCountrySelectVisible(false)

            if (number !== '') {
                const newNumber = buildInternationalNumber(number, country)

                onChange?.(
                    getCountryFromPhoneNumber(newNumber) === country
                        ? newNumber
                        : '',
                )
            }
        },
        [onChange, setCurrentCountry],
    )

    useEffect(() => {
        onCountryChange?.(currentCountry)
    }, [onCountryChange, currentCountry])

    useOnClickOutside<HTMLDivElement>(containerRef, () => {
        setCountrySelectVisible(false)
    })

    useImperativeHandle(
        ref,
        () => ({
            onChange: (value: string) => {
                handleNumberChange(value, currentCountry)
            },
            onCountryChange: (country: CountryCode) => {
                handleCountryChange(value, country)
            },
            inputValue: inputRef.current?.value ?? '',
        }),
        [handleNumberChange, currentCountry, handleCountryChange, value],
    )

    const hasError = !!error || isPhoneNumberTooLong

    return (
        <div ref={containerRef} className={classnames(css.wrapper, className)}>
            {label && (
                <Label isRequired={isRequired} className={css.label}>
                    {label}
                </Label>
            )}
            <InputGroup hasError={hasError} isDisabled={disabled}>
                <InputGroupContext.Consumer>
                    {(inputGroupContext) => (
                        <Button
                            className={css.button}
                            isDisabled={disabled}
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
                {/* Wrapped into Fragment to avoid the TextInput component from
                remounting when the country select becomes visible (causing the
                number input to be focused instead of the country one when
                "autofocus" is true) */}
                <>
                    {isCountrySelectVisible && (
                        <div className={css.selectContainer}>
                            <SelectField
                                value={currentCountry}
                                options={options}
                                onChange={(nextCountry) => {
                                    handleCountryChange(
                                        formatAsNationalNumber(value),
                                        nextCountry as CountryCode,
                                    )
                                    inputRef.current?.focus()
                                }}
                                style={{ width: '100%' }}
                                fullWidth
                                shouldFocus
                                container={containerRef.current!}
                            />
                        </div>
                    )}
                </>
                <TextInput
                    {...other}
                    {...(other.name && {
                        'aria-label': other.name,
                    })}
                    ref={inputRef}
                    className={classnames({
                        [css.hiddenInput]: isCountrySelectVisible,
                    })}
                    value={formatAsNationalNumber(value)}
                    hasError={hasError}
                    onChange={(value) => {
                        const numberOfDigits = value.replace(/\s+/g, '').length
                        if (numberOfDigits > 15) {
                            setIsPhoneNumberTooLong(true)
                            return
                        }
                        setIsPhoneNumberTooLong(false)
                        handleNumberChange(value, currentCountry)
                    }}
                    onKeyDown={onKeyDown}
                    autoFocus={autoFocus}
                    suffix={
                        <>
                            {isLoading && (
                                <Loader size={'18px'} className={css.loader} />
                            )}
                            {value && isClearable && (
                                <IconButton
                                    onClick={() =>
                                        handleNumberChange('', currentCountry)
                                    }
                                    fillStyle="ghost"
                                    intent="secondary"
                                >
                                    close
                                </IconButton>
                            )}
                        </>
                    }
                />
            </InputGroup>
            {!error && isPhoneNumberTooLong && (
                <Caption
                    error="A phone number can't have more than 15
                                digits"
                />
            )}
            {error && <Caption error={error}>{error}</Caption>}
            {!hasError && caption && <Caption>{caption}</Caption>}
            {/** Show empty caption to avoid jumping up and down based on error presence */}
            {suppressUIJumps && !hasError && !caption && <Caption></Caption>}
        </div>
    )
}

export default forwardRef<PhoneNumberInputHandle, Props>(PhoneNumberInput)
