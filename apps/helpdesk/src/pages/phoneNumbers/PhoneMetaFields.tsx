import { useCallback, useMemo } from 'react'

import { endsWith } from 'lodash'
import { Col, FormGroup, Label, Row } from 'reactstrap'

import {
    countryOptions,
    phoneCountryConfig,
    PhoneUseCase,
} from 'business/twilio'
import type { PhoneNumberMeta } from 'models/phoneNumber/types'
import { PhoneCountry, PhoneType } from 'models/phoneNumber/types'
import InputField from 'pages/common/forms/input/InputField'
import SelectField from 'pages/common/forms/SelectField/SelectField'
import type { SelectableOption } from 'pages/common/forms/SelectField/types'

import {
    getAvailableStates,
    getFirstAvailableType,
    getPhoneTypeOptions,
    shouldDisplayType,
} from './utils'

const useCaseOptions = [
    { label: 'Standard', value: PhoneUseCase.Standard },
    { label: 'Marketing', value: PhoneUseCase.Marketing },
]

type Props = {
    value: Partial<PhoneNumberMeta>
    onChange: (value: Partial<PhoneNumberMeta>) => void
    usecase?: PhoneUseCase
    onUseCaseChange: (usecase: PhoneUseCase) => void
    showUseCase?: boolean
}

export default function PhoneDetailsFields({
    value,
    onChange,
    usecase,
    onUseCaseChange,
    showUseCase = false,
}: Props): JSX.Element {
    const { country, type, state, area_code } = value

    const handleCountryChange = useCallback(
        (country: PhoneCountry) => {
            onChange({
                ...value,
                country,
                type: getFirstAvailableType(country),
                area_code: undefined,
                state: '',
            })
        },
        [onChange, value],
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
        [onChange, value, type],
    )

    const handleTypeChange = useCallback(
        (type: PhoneType) => {
            onChange({
                ...value,
                type,
                area_code: undefined,
            })
        },
        [onChange, value],
    )

    const handleStateChange = useCallback(
        (state: string) => {
            onChange({
                ...value,
                state,
                area_code: undefined,
            })
        },
        [onChange, value],
    )

    const areaCodeOptions: SelectableOption[] = useMemo(() => {
        if (
            !country ||
            !type ||
            !phoneCountryConfig[country].phoneTypeConfig?.[type]
        ) {
            return []
        }

        const areaCodeOptions =
            phoneCountryConfig[country].phoneTypeConfig?.[type]?.areaCodeOptions

        if (areaCodeOptions) {
            if (Array.isArray(areaCodeOptions)) {
                return areaCodeOptions
            }

            return state ? areaCodeOptions[state] : []
        }

        return []
    }, [type, country, state])

    const typeOptions: SelectableOption[] = useMemo(() => {
        return getPhoneTypeOptions(country)
    }, [country])

    const shouldShowState =
        type === PhoneType.Local && country === PhoneCountry.US
    const shouldShowType = shouldDisplayType(country)
    const shouldShowAreaCodes = !!areaCodeOptions.length

    const selectedAreaCode =
        (area_code &&
            areaCodeOptions.find(
                (option) =>
                    option.value === area_code.toString() ||
                    endsWith(option.value.toString(), `-${area_code}`),
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
                            onChange={(value) =>
                                handleCountryChange(value as PhoneCountry)
                            }
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
                                onChange={(value) =>
                                    handleTypeChange(value as PhoneType)
                                }
                                options={typeOptions}
                                disabled={typeOptions.length === 1}
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
                                onChange={(value) =>
                                    handleStateChange(value as string)
                                }
                                options={
                                    !!country
                                        ? getAvailableStates(country).map(
                                              (state) => ({
                                                  label: state.name,
                                                  value: state.code,
                                              }),
                                          )
                                        : []
                                }
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
                    {showUseCase && (
                        <FormGroup>
                            <Label htmlFor="usecase" className="control-label">
                                Use case
                            </Label>
                            <SelectField
                                id="usecase"
                                value={usecase}
                                onChange={(value) =>
                                    onUseCaseChange(value as PhoneUseCase)
                                }
                                options={useCaseOptions}
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
                            <InputField
                                value={area_code}
                                onChange={handleAreaCodeChange}
                                isDisabled
                            />
                        </FormGroup>
                    )}
                </Col>
            </Row>
        </>
    )
}
