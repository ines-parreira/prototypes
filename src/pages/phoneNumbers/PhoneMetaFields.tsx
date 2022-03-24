import React, {useCallback, useMemo} from 'react'
import {Col, FormGroup, Label, Row} from 'reactstrap'
import {endsWith} from 'lodash'

import {
    PhoneNumberMeta,
    PhoneCountry,
    PhoneType,
} from 'models/phoneNumber/types'
import SelectField from 'pages/common/forms/SelectField/SelectField'
import DEPRECATED_InputField from 'pages/common/forms/DEPRECATED_InputField'
import type {SelectableOption} from 'pages/common/forms/SelectField/types'

import rawCountryOptions from './options/countries.json'
import rawStateOptions from './options/states.json'
import rawCaAreaCodeOptions from './options/area-codes/ca.json'
import rawUsAreaCodeOptions from './options/area-codes/us.json'
import rawGbAreaCodeOptions from './options/area-codes/gb.json'
import rawAuAreaCodeOptions from './options/area-codes/au.json'
import rawTollFreeAreaCodeOptions from './options/area-codes/toll-free.json'

type StateOptions = {
    [key: string]: SelectableOption[]
}

const countryOptions: SelectableOption[] = rawCountryOptions
const stateOptions: StateOptions = rawStateOptions

type LocalAreaCodes = {
    [PhoneCountry.US]: Record<string, SelectableOption[]>
    [PhoneCountry.CA]: SelectableOption[]
    [PhoneCountry.AU]: SelectableOption[]
    [PhoneCountry.GB]: SelectableOption[]
    [PhoneCountry.FR]: SelectableOption[]
}

const LOCAL_AREA_CODES: LocalAreaCodes = {
    [PhoneCountry.US]: rawUsAreaCodeOptions,
    [PhoneCountry.CA]: rawCaAreaCodeOptions,
    [PhoneCountry.AU]: rawAuAreaCodeOptions,
    [PhoneCountry.GB]: rawGbAreaCodeOptions,
    [PhoneCountry.FR]: [],
}

const TOLL_FREE_AREA_CODE_OPTIONS: SelectableOption[] =
    rawTollFreeAreaCodeOptions

const COUNTRY_PHONE_TYPES: Record<PhoneCountry, PhoneType[]> = {
    [PhoneCountry.US]: [PhoneType.Local, PhoneType.TollFree],
    [PhoneCountry.CA]: [PhoneType.Local, PhoneType.TollFree],
    [PhoneCountry.GB]: [PhoneType.Local, PhoneType.National, PhoneType.Mobile],
    [PhoneCountry.AU]: [PhoneType.Local],
    [PhoneCountry.FR]: [],
}

const PHONE_TYPE_LABELS = {
    [PhoneType.Local]: 'Local',
    [PhoneType.TollFree]: 'Toll-free',
    [PhoneType.Mobile]: 'Mobile',
    [PhoneType.National]: 'National',
}

const GB_AREA_CODES = {
    [PhoneType.Mobile]: 7,
    [PhoneType.National]: 330,
}

type Props = {
    value: Partial<PhoneNumberMeta>
    onChange: (value: Partial<PhoneNumberMeta>) => void
}

export default function PhoneDetailsFields({
    value,
    onChange,
}: Props): JSX.Element {
    const {country, type, state, area_code} = value

    const handleCountryChange = useCallback(
        (country) => {
            onChange({
                ...value,
                country,
                type: PhoneType.Local,
                area_code: undefined,
                state: '',
            })
        },
        [onChange, value]
    )

    const handleAreaCodeChange = useCallback(
        (areaCode: string | number) => {
            if (typeof areaCode === 'string') {
                onChange({
                    ...value,
                    area_code:
                        type === PhoneType.Local
                            ? parseInt(areaCode.split('-').pop() as string)
                            : parseInt(areaCode),
                })
            } else {
                onChange({
                    ...value,
                    area_code: areaCode,
                })
            }
        },
        [onChange, value, type]
    )

    const handleTypeChange = useCallback(
        (type) => {
            let area_code
            if (country === PhoneCountry.GB) {
                if (type === PhoneType.National) {
                    area_code = GB_AREA_CODES[PhoneType.National]
                }
                if (type === PhoneType.Mobile) {
                    area_code = GB_AREA_CODES[PhoneType.Mobile]
                }
            }

            onChange({
                ...value,
                type,
                area_code,
            })
        },
        [onChange, value, country]
    )

    const handleStateChange = useCallback(
        (state) => {
            onChange({
                ...value,
                state,
                area_code: undefined,
            })
        },
        [onChange, value]
    )

    const areaCodeOptions: SelectableOption[] = useMemo(() => {
        switch (type) {
            case PhoneType.TollFree:
                return TOLL_FREE_AREA_CODE_OPTIONS

            case PhoneType.Local: {
                if (!country) {
                    return []
                }
                if (country === PhoneCountry.US) {
                    return !!state ? LOCAL_AREA_CODES[country][state] : []
                }
                return LOCAL_AREA_CODES[country]
            }

            default:
                return []
        }
    }, [type, country, state])

    const typeOptions: SelectableOption[] = useMemo(() => {
        if (!country) {
            return []
        }

        const toTypeOption = (type: PhoneType) => ({
            value: type,
            label: PHONE_TYPE_LABELS[type],
        })

        return COUNTRY_PHONE_TYPES[country].map(toTypeOption)
    }, [country])

    const shouldShowState =
        type === PhoneType.Local && country === PhoneCountry.US
    const shouldShowType =
        country && country !== PhoneCountry.AU && country !== PhoneCountry.FR
    const shouldShowAreaCodes =
        (type === PhoneType.Local || type === PhoneType.TollFree) &&
        country !== PhoneCountry.FR

    const selectedAreaCode =
        (area_code &&
            areaCodeOptions.find(
                (option) =>
                    option.value === area_code.toString() ||
                    endsWith(option.value.toString(), `-${area_code}`)
            )?.value) ??
        area_code

    return (
        <>
            <Row>
                <Col>
                    <FormGroup>
                        <Label htmlFor="country" className="control-label">
                            Country
                        </Label>
                        <SelectField
                            id="country"
                            value={country}
                            onChange={handleCountryChange}
                            options={countryOptions}
                            fullWidth
                            required
                        />
                    </FormGroup>
                    {shouldShowType && (
                        <FormGroup>
                            <Label htmlFor="type" className="control-label">
                                Type
                            </Label>
                            <SelectField
                                id="type"
                                value={type}
                                onChange={handleTypeChange}
                                options={typeOptions}
                                fullWidth
                                required
                            />
                        </FormGroup>
                    )}
                    {shouldShowState && (
                        <FormGroup>
                            <Label htmlFor="state" className="control-label">
                                State
                            </Label>
                            <SelectField
                                id="state"
                                value={state}
                                onChange={handleStateChange}
                                options={!!country ? stateOptions[country] : []}
                                fullWidth
                                required
                            />
                        </FormGroup>
                    )}
                    {shouldShowAreaCodes && (
                        <FormGroup>
                            <Label
                                htmlFor="area-code"
                                className="control-label"
                            >
                                Area code
                            </Label>
                            <SelectField
                                id="area-code"
                                value={selectedAreaCode}
                                onChange={handleAreaCodeChange}
                                options={areaCodeOptions}
                                fullWidth
                                required
                            />
                        </FormGroup>
                    )}
                    {area_code && !shouldShowAreaCodes && (
                        <FormGroup>
                            <Label
                                htmlFor="area-code"
                                className="control-label"
                            >
                                Area code
                            </Label>
                            <DEPRECATED_InputField
                                value={area_code}
                                onChange={handleAreaCodeChange}
                                disabled
                            />
                        </FormGroup>
                    )}
                </Col>
            </Row>
        </>
    )
}
