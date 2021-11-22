import React, {useState, useEffect, useMemo, useRef, useCallback} from 'react'
import {
    FormGroup,
    Label,
    Input,
    InputGroup,
    InputGroupAddon,
    InputGroupText,
} from 'reactstrap'
import CountryFlag from 'react-country-flag'
import classnames from 'classnames'
import {getCountryCallingCode, CountryCode} from 'libphonenumber-js'
import {useUpdateEffect} from 'react-use'

import countries from '../../../../config/countries.json'
import {useOnClickOutside} from '../../../common/hooks/useOnClickOutside'
import SelectField from '../../../common/forms/SelectField/SelectField'
import {reportError} from '../../../../utils/errors'
import Errors from '../Errors.js'

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
    error?: string
    onChange: (value: string) => void
    allowedCountries?: CountryCode[]
    defaultCountry?: CountryCode
}

const PhoneNumberInput = ({
    label,
    value,
    error,
    onChange,
    allowedCountries,
    defaultCountry = 'US',
}: Props): JSX.Element => {
    const [currentCountry, setCurrentCountry] = useState<CountryCode>(
        getCountryFromPhoneNumber(value) ?? defaultCountry
    )

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

    const [isCountrySelectVisible, setCountrySelectVisible] =
        useState<boolean>(false)

    const containerRef = useRef<HTMLDivElement>(null)

    const options = useMemo(
        () =>
            allowedCountries
                ? typedCountries.filter((country) =>
                      allowedCountries.includes(country.value)
                  )
                : typedCountries,
        [allowedCountries]
    )

    const handleChange = useCallback(
        (number: string, country: CountryCode) => {
            setCurrentCountry(country)
            setCountrySelectVisible(false)
            number === ''
                ? onChange('')
                : onChange(buildInternationalNumber(number, country))
        },
        [setCurrentCountry, onChange]
    )

    useOnClickOutside<HTMLDivElement>(containerRef, () => {
        setCountrySelectVisible(false)
    })

    return (
        <div ref={containerRef}>
            <FormGroup>
                {label && <Label className="control-label">{label}</Label>}
                <InputGroup>
                    <InputGroupAddon
                        addonType="prepend"
                        className={classnames(
                            css.countryFlagButton,
                            'dropdown'
                        )}
                    >
                        <InputGroupText
                            onClick={() => {
                                setCountrySelectVisible(!isCountrySelectVisible)
                            }}
                        >
                            <CountryFlag
                                countryCode={currentCountry}
                                svg
                                style={{
                                    width: '1.5em',
                                }}
                            />
                            <span className="ml-2 dropdown-toggle">
                                +{getCountryCallingCode(currentCountry)}
                            </span>
                        </InputGroupText>
                    </InputGroupAddon>
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
                        <Input
                            className={classnames({
                                'form-control-danger': error,
                                'is-invalid': error,
                            })}
                            value={formatAsNationalNumber(value)}
                            onChange={(event) => {
                                handleChange(event.target.value, currentCountry)
                            }}
                        />
                    )}
                    {error && <Errors>{error}</Errors>}
                </InputGroup>
            </FormGroup>
        </div>
    )
}

export default PhoneNumberInput
