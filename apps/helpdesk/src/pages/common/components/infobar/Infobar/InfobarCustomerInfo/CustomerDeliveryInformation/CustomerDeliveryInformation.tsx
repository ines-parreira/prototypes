import { CountryCode } from 'libphonenumber-js'

import { TextField } from '@gorgias/merchant-ui-kit'

import CountryInput from 'pages/common/forms/CountryInput/CountryInput'
import { getCountryLabel } from 'pages/common/forms/CountryInput/utils'
import ProvinceInput from 'pages/common/forms/ProvinceInput/ProvinceInput'

import { FormState } from '../CustomerSyncForm/useCustomerSyncForm'

import css from './CustomerDeliveryInformation.less'

interface Props {
    formState: FormState
    onChange: (formState: Partial<FormState>) => void
    performedValidation: boolean
}

export default function CustomerDeliveryInformation({
    formState,
    onChange,
    performedValidation,
}: Props) {
    const hasAddressError = performedValidation && !formState.address
    const hasCityError = performedValidation && !formState.city
    const hasPostalCodeError =
        performedValidation &&
        (!formState.postalCode || formState.postalCode.length < 2)
    const hasStateOrProvinceError =
        performedValidation && !formState.stateOrProvince
    return (
        <>
            <CountryInput
                label="Country"
                placeholder="Search country"
                className={css.inputField}
                value={formState.countryCode}
                onChange={(countryCode) =>
                    onChange({
                        countryCode: countryCode as CountryCode,
                        country: getCountryLabel(countryCode),
                        stateOrProvince: '',
                    })
                }
            />
            <TextField
                name="company"
                label="Company"
                placeholder="Gorgias"
                className={css.inputField}
                value={formState.company}
                onChange={(company) => onChange({ company })}
            />
            <TextField
                name="address"
                label="Address"
                className={css.inputField}
                value={formState.address}
                placeholder="Gorgias street"
                onChange={(address) => onChange({ address })}
                error={
                    hasAddressError
                        ? 'Please enter a street name and house number'
                        : ''
                }
            />

            <TextField
                name="apartment"
                label="Apartment, suite, etc"
                placeholder="Unit #2, Floor 5"
                className={css.inputField}
                value={formState.apartment}
                onChange={(apartment) => onChange({ apartment })}
            />

            <div className={css.areaContainer}>
                <TextField
                    name="city"
                    label="City"
                    className={css.areaItem}
                    placeholder="New York City"
                    value={formState.city}
                    onChange={(city) => onChange({ city })}
                    error={hasCityError ? 'Please enter a city' : ''}
                />

                <ProvinceInput
                    label="State"
                    name="stateOrProvince"
                    className={css.areaItem}
                    country={formState.country}
                    onChange={(stateOrProvince) =>
                        onChange({ stateOrProvince })
                    }
                    hasError={hasStateOrProvinceError}
                    error={
                        hasStateOrProvinceError ? 'Please select a state' : ''
                    }
                />
                <TextField
                    name="zip"
                    label="ZIP/Postal code"
                    className={css.areaItem}
                    placeholder="90210"
                    value={formState.postalCode}
                    onChange={(postalCode) => onChange({ postalCode })}
                    error={hasPostalCodeError ? 'Please enter a zip code' : ''}
                />
            </div>
        </>
    )
}
