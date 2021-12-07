import React, {useCallback, useState, useMemo} from 'react'
import {Link} from 'react-router-dom'
import {fromJS} from 'immutable'
import classnames from 'classnames'
import {
    Breadcrumb,
    BreadcrumbItem,
    Button,
    Col,
    Container,
    Form,
    FormGroup,
    Label,
    Row,
} from 'reactstrap'

import {
    DEFAULT_IVR_SETTINGS,
    DEFAULT_VOICE_MESSAGE,
} from '../../../../../models/integration/constants'
import {updateOrCreateIntegration} from '../../../../../state/integrations/actions'
import PageHeader from '../../../../common/components/PageHeader'
import Alert, {AlertType} from '../../../../common/components/Alert/Alert'
import {
    IntegrationType,
    VoiceMessageType,
    AddressInformation,
    AddressType,
} from '../../../../../models/integration/types'
import EmojiTextInput from '../../../../common/forms/EmojiTextInput/EmojiTextInput'
import SelectField from '../../../../common/forms/SelectField/SelectField'
import InputField from '../../../../common/forms/InputField.js'
import type {SelectableOption} from '../../../../common/forms/SelectField/types'
import {
    PhoneCountry,
    PhoneFunction,
    PhoneType,
} from '../../../../../business/twilio'
import css from '../../../../settings/settings.less'

import rawPhoneFunctionOptions from './options/functions.json'
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

const phoneFunctionOptions: SelectableOption[] = rawPhoneFunctionOptions
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

type Props = {
    actions: {
        updateOrCreateIntegration: typeof updateOrCreateIntegration
    }
}

export default function PhoneIntegrationCreate({actions}: Props): JSX.Element {
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<Error | null>(null)
    const [title, setTitle] = useState('')
    const [emoji, setEmoji] = useState<string | null>(null)
    const [phoneFunction, setPhoneFunction] = useState(PhoneFunction.Standard)
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
        country !== PhoneCountry.AU && country !== PhoneCountry.FR
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

    const onSubmit = useCallback(
        async (event: React.FormEvent) => {
            event.preventDefault()

            try {
                setIsLoading(true)
                setError(null)
                const parsedAreaCode =
                    phoneType === PhoneType.Local
                        ? parseInt(areaCode.split('-').pop() as string)
                        : parseInt(areaCode)

                await (actions.updateOrCreateIntegration(
                    fromJS({
                        type: IntegrationType.Phone,
                        name: title,
                        meta: {
                            emoji,
                            function: phoneFunction,
                            country,
                            type: phoneType,
                            state,
                            area_code: parsedAreaCode,
                            preferences: {
                                record_inbound_calls: false,
                                voicemail_outside_business_hours: true,
                                record_outbound_calls: false,
                            },
                            voicemail: {
                                ...DEFAULT_VOICE_MESSAGE,
                                allow_to_leave_voicemail: true,
                            },
                            greeting_message: {
                                voice_message_type: VoiceMessageType.None,
                                text_to_speech_content: null,
                            },
                            ivr:
                                phoneFunction === PhoneFunction.Ivr
                                    ? DEFAULT_IVR_SETTINGS
                                    : undefined,
                            address_information: addressInformation,
                        },
                    })
                ) as unknown as Promise<any>)
            } catch (error) {
                setError(error)
            } finally {
                setIsLoading(false)
            }
        },
        [
            title,
            emoji,
            phoneFunction,
            country,
            phoneType,
            state,
            areaCode,
            actions,
            setIsLoading,
            setError,
            addressInformation,
        ]
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
        <div className="full-width">
            <PageHeader
                title={
                    <Breadcrumb>
                        <BreadcrumbItem>
                            <Link to="/app/settings/integrations">
                                Integrations
                            </Link>
                        </BreadcrumbItem>
                        <BreadcrumbItem>
                            <Link
                                to={`/app/settings/integrations/${IntegrationType.Phone}`}
                            >
                                Phone
                            </Link>
                        </BreadcrumbItem>
                        <BreadcrumbItem active>Add Phone Number</BreadcrumbItem>
                    </Breadcrumb>
                }
            />

            <Container fluid className={css.pageContainer}>
                <Row>
                    <Col lg={6}>
                        <p>
                            Create a new phone number in Gorgias or forward
                            calls from an existing number to a Gorgias internal
                            number. To learn more about forwarding existing
                            calls, check out{' '}
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
                                <Alert showIcon className="mt-3 mb-4">
                                    French numbers are only available through
                                    the{' '}
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
                                <Alert showIcon className="mt-3 mb-4">
                                    Creating phone numbers from Australia and UK
                                    requires address verification
                                </Alert>
                            )}
                        <Form onSubmit={onSubmit}>
                            {!!error && (
                                <Alert type={AlertType.Error}>
                                    {error.toString()}
                                </Alert>
                            )}
                            <FormGroup>
                                {shouldValidateAddress(country) && (
                                    <h4 className="mb-3">
                                        Phone number settings
                                    </h4>
                                )}
                                <Label
                                    htmlFor="title"
                                    className="control-label"
                                >
                                    Phone title
                                </Label>
                                <EmojiTextInput
                                    id="title"
                                    value={title}
                                    emoji={emoji}
                                    placeholder="Ex: Company Support Line"
                                    required
                                    onChange={setTitle}
                                    onEmojiChange={setEmoji}
                                />
                            </FormGroup>
                            <FormGroup>
                                <Label
                                    htmlFor="phoneFunction"
                                    className="control-label"
                                >
                                    Function
                                </Label>
                                <SelectField
                                    id="phoneFunction"
                                    value={phoneFunction}
                                    onChange={(value) => {
                                        setPhoneFunction(value as PhoneFunction)
                                    }}
                                    options={phoneFunctionOptions}
                                    fullWidth
                                    required
                                />
                            </FormGroup>
                            <FormGroup>
                                <Label
                                    htmlFor="country"
                                    className="control-label"
                                >
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
                                    <Label
                                        htmlFor="type"
                                        className="control-label"
                                    >
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
                                            !!country
                                                ? stateOptions[country]
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
                                disabled={
                                    isLoading || country === PhoneCountry.FR
                                }
                            >
                                Add phone number
                            </Button>
                        </Form>
                    </Col>
                </Row>
            </Container>
        </div>
    )
}
