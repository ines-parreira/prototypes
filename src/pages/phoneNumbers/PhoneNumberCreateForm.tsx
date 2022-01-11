import React, {useCallback, useState, useMemo} from 'react'
import classnames from 'classnames'
import {Button, Col, Form, FormGroup, Label, Row} from 'reactstrap'
import {useAsyncFn} from 'react-use'

import {
    PhoneNumber,
    AddressInformation,
    AddressType,
    PhoneCountry,
    PhoneType,
} from 'models/phoneNumber/types'
import {createPhoneNumber} from 'models/phoneNumber/resources'
import {phoneNumberCreated} from 'state/entities/phoneNumbers/actions'
import {NotificationStatus} from 'state/notifications/types'
import {notify} from 'state/notifications/actions'
import Alert from 'pages/common/components/Alert/Alert'
import SelectField from 'pages/common/forms/SelectField/SelectField'
import InputField from 'pages/common/forms/InputField.js'
import type {SelectableOption} from 'pages/common/forms/SelectField/types'
import useAppDispatch from 'hooks/useAppDispatch'
import history from 'pages/history'

import rawCountryOptions from './options/countries.json'
import rawStateOptions from './options/states.json'
import rawCaAreaCodeOptions from './options/area-codes/ca.json'
import rawUsAreaCodeOptions from './options/area-codes/us.json'
import rawGbAreaCodeOptions from './options/area-codes/gb.json'
import rawAuAreaCodeOptions from './options/area-codes/au.json'
import rawTollFreeAreaCodeOptions from './options/area-codes/toll-free.json'

import PhoneAddressInformation from './PhoneAddressInformation'

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
    [PhoneType.Mobile]: '7',
    [PhoneType.National]: '330',
}

export default function PhoneIntegrationCreate(): JSX.Element {
    const dispatch = useAppDispatch()

    const [name, setName] = useState('')
    const [country, setCountry] = useState<PhoneCountry | undefined>()
    const [phoneType, setPhoneType] = useState<PhoneType | undefined>()
    const [state, setState] = useState('')
    const [areaCode, setAreaCode] = useState('')
    const [addressInformation, setAddressInformation] =
        useState<Partial<AddressInformation> | null>({
            country,
            type: AddressType.Company,
        })
    const shouldValidateAddress = useCallback(
        (country) =>
            country === PhoneCountry.GB ||
            country === PhoneCountry.AU ||
            country === PhoneCountry.FR,
        []
    )
    const shouldShowState =
        phoneType === PhoneType.Local && country === PhoneCountry.US
    const shouldShowType =
        country && country !== PhoneCountry.AU && country !== PhoneCountry.FR
    const shouldShowAreaCodes =
        (phoneType === PhoneType.Local || phoneType === PhoneType.TollFree) &&
        country !== PhoneCountry.FR

    const onCountryChange = useCallback(
        (country) => {
            setCountry(country)
            setPhoneType(PhoneType.Local)
            setState('')
            setAreaCode('')
            if (shouldValidateAddress(country)) {
                setAddressInformation((addressInformation) => ({
                    ...(addressInformation ?? {type: AddressType.Company}),
                    country,
                }))
            } else {
                setAddressInformation(null)
            }
        },
        [
            setCountry,
            setPhoneType,
            setState,
            setAreaCode,
            setAddressInformation,
            shouldValidateAddress,
        ]
    )

    const onTypeChange = useCallback(
        (phoneType) => {
            setPhoneType(phoneType)
            setState('')

            if (country === PhoneCountry.GB) {
                if (phoneType === PhoneType.National) {
                    setAreaCode(GB_AREA_CODES[PhoneType.National])
                }
                if (phoneType === PhoneType.Mobile) {
                    setAreaCode(GB_AREA_CODES[PhoneType.Mobile])
                }
            } else {
                setAreaCode('')
            }
        },
        [setPhoneType, setState, setAreaCode, country]
    )

    const onStateChange = useCallback(
        (state) => {
            setState(state)
            setAreaCode('')
        },
        [setState, setAreaCode]
    )

    const [{loading: isLoading}, handlePhoneNumberCreate] =
        useAsyncFn(async () => {
            try {
                const parsedAreaCode =
                    phoneType === PhoneType.Local
                        ? parseInt(areaCode.split('-').pop() as string)
                        : parseInt(areaCode)

                const payload = {
                    name,
                    meta: {
                        emoji: null,
                        type: phoneType,
                        country,
                        state,
                        area_code: parsedAreaCode,
                    },
                    address: addressInformation,
                } as Partial<PhoneNumber>

                const phoneNumber = await createPhoneNumber(payload)
                dispatch(phoneNumberCreated(phoneNumber))
                void dispatch(
                    notify({
                        message: `Phone number created successfully.`,
                        status: NotificationStatus.Success,
                    })
                )
                history.push(`/app/settings/phone-numbers/${phoneNumber.id}`)
            } catch (error) {
                void dispatch(
                    notify({
                        message: 'Failed to create phone number',
                        status: NotificationStatus.Error,
                    })
                )
            }
        }, [dispatch, country, phoneType, state, areaCode, addressInformation])

    const onSubmit = useCallback(
        async (event: React.FormEvent) => {
            event.preventDefault()
            await handlePhoneNumberCreate()
        },
        [handlePhoneNumberCreate]
    )

    const areaCodeOptions: SelectableOption[] = useMemo(() => {
        switch (phoneType) {
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
    }, [phoneType, country, state])

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

    return (
        <>
            <Row>
                <Col lg={6}>
                    <p>
                        Create a new phone number in Gorgias or forward calls
                        from an existing number to a Gorgias internal number. To
                        learn more about forwarding existing calls, check out{' '}
                        <a
                            href="https://docs.gorgias.com/voice-and-phone/gorgias-phone-integration"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            our phone docs
                        </a>
                        .
                    </p>
                </Col>
            </Row>
            <Row>
                <Col lg={6} xl={7}>
                    {shouldValidateAddress(country) &&
                        country === PhoneCountry.FR && (
                            <Alert icon className="mt-3 mb-4">
                                French numbers are only available through the{' '}
                                <a
                                    href="https://gorgias.typeform.com/to/YhvfA3qK"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    French number request form.
                                </a>
                            </Alert>
                        )}
                    {shouldValidateAddress(country) &&
                        country !== PhoneCountry.FR && (
                            <Alert icon className="mt-3 mb-4">
                                Creating phone numbers from Australia and UK
                                requires address verification
                            </Alert>
                        )}
                    <Form onSubmit={onSubmit}>
                        <FormGroup>
                            {shouldValidateAddress(country) && (
                                <h4 className="mb-3">Phone number settings</h4>
                            )}
                            <Label htmlFor="type" className="control-label">
                                Title
                            </Label>
                            <InputField
                                placeholder="Ex: Company Support Line"
                                value={name}
                                onChange={setName}
                                required
                            />
                        </FormGroup>
                        <FormGroup>
                            <Label htmlFor="country" className="control-label">
                                Country
                            </Label>
                            <SelectField
                                id="country"
                                value={country}
                                onChange={onCountryChange}
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
                                    value={phoneType}
                                    onChange={onTypeChange}
                                    options={typeOptions}
                                    fullWidth
                                    required
                                />
                            </FormGroup>
                        )}
                        {shouldShowState && (
                            <FormGroup>
                                <Label
                                    htmlFor="state"
                                    className="control-label"
                                >
                                    State
                                </Label>
                                <SelectField
                                    id="state"
                                    value={state}
                                    onChange={onStateChange}
                                    options={
                                        !!country ? stateOptions[country] : []
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
                                    value={areaCode}
                                    onChange={(value) =>
                                        setAreaCode(value as string)
                                    }
                                    options={areaCodeOptions}
                                    fullWidth
                                    required
                                />
                            </FormGroup>
                        )}
                        {areaCode && !shouldShowAreaCodes && (
                            <FormGroup>
                                <Label
                                    htmlFor="area-code"
                                    className="control-label"
                                >
                                    Area code
                                </Label>
                                <InputField
                                    value={areaCode}
                                    onChange={(value) =>
                                        setAreaCode(value as string)
                                    }
                                    disabled
                                />
                            </FormGroup>
                        )}
                        {addressInformation &&
                            shouldValidateAddress(country) && (
                                <PhoneAddressInformation
                                    value={addressInformation}
                                    onChange={setAddressInformation}
                                />
                            )}
                        <Button
                            type="submit"
                            color="success"
                            className={classnames('mt-5', 'mb-5', {
                                'btn-loading': isLoading,
                            })}
                            disabled={isLoading || country === PhoneCountry.FR}
                        >
                            Add phone number
                        </Button>
                    </Form>
                </Col>
            </Row>
        </>
    )
}
