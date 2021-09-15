import React, {useCallback, useState} from 'react'
import {Link} from 'react-router-dom'
import {fromJS} from 'immutable'
import classnames from 'classnames'
import {
    Alert,
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

import {updateOrCreateIntegration} from '../../../../../state/integrations/actions'
import PageHeader from '../../../../common/components/PageHeader'
import {IntegrationType} from '../../../../../models/integration/types'
import EmojiTextInput from '../../../../common/forms/EmojiTextInput/EmojiTextInput'
import SelectField from '../../../../common/forms/SelectField/SelectField'
import type {Option} from '../../../../common/forms/SelectField/types'
import {PhoneCountry, PhoneType} from '../../../../../business/twilio'

import rawCountryOptions from './options/countries.json'
import rawTypeOptions from './options/types.json'
import rawStateOptions from './options/states.json'
import rawCaAreaCodeOptions from './options/area-codes/ca.json'
import rawUsAreaCodeOptions from './options/area-codes/us.json'
import rawTollFreeAreaCodeOptions from './options/area-codes/toll-free.json'

import {VoiceMailType} from './PhoneIntegrationVoicemail'

interface StateOptions {
    [key: string]: Option[]
}

type AreaCodeOptions = Option[]

interface AreaCodeOptionsByState {
    [key: string]: AreaCodeOptions
}

const countryOptions: Option[] = rawCountryOptions
const typeOptions: Option[] = rawTypeOptions
const stateOptions: StateOptions = rawStateOptions
const caAreaCodeOptions: AreaCodeOptions = rawCaAreaCodeOptions
const usAreaCodeOptions: AreaCodeOptionsByState = rawUsAreaCodeOptions
const tollFreeAreaCodeOptions: AreaCodeOptions = rawTollFreeAreaCodeOptions
const DEFAULT_TEXT_TO_SPEECH_CONTENT =
    "Hello, unfortunately we aren't able to take your call right now. Please call us back later. Thank you!"

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
    const [country, setCountry] = useState('')
    const [phoneType, setPhoneType] = useState('')
    const [state, setState] = useState('')
    const [areaCode, setAreaCode] = useState('')
    const shouldRenderState =
        phoneType === PhoneType.Local && country === PhoneCountry.US

    const onCountryChange = useCallback(
        (country) => {
            setCountry(country)
            setPhoneType(PhoneType.Local)
            setState('')
            setAreaCode('')
        },
        [setCountry, setPhoneType, setState, setAreaCode]
    )

    const onTypeChange = useCallback(
        (phoneType) => {
            setPhoneType(phoneType)
            setState('')
            setAreaCode('')
        },
        [setPhoneType, setState, setAreaCode]
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

                await ((actions.updateOrCreateIntegration(
                    fromJS({
                        type: IntegrationType.PhoneIntegrationType,
                        name: title,
                        meta: {
                            emoji,
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
                                voicemail_type: VoiceMailType.TextToSpeech,
                                voice_recording_file_path: null,
                                text_to_speech_content: DEFAULT_TEXT_TO_SPEECH_CONTENT,
                                allow_to_leave_voicemail: true,
                            },
                        },
                    })
                ) as unknown) as Promise<any>)
            } catch (error) {
                setError(error)
            } finally {
                setIsLoading(false)
            }
        },
        [
            title,
            emoji,
            country,
            phoneType,
            state,
            areaCode,
            actions,
            setIsLoading,
            setError,
        ]
    )

    let areaCodes: AreaCodeOptions = []
    if (phoneType === PhoneType.Local) {
        switch (country) {
            case PhoneCountry.US:
                areaCodes = !!state ? usAreaCodeOptions[state] : []
                break
            case PhoneCountry.CA:
                areaCodes = caAreaCodeOptions
                break
            default:
                areaCodes = []
                break
        }
    } else if (phoneType === PhoneType.TollFree) {
        areaCodes = tollFreeAreaCodeOptions
    }

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
                                to={`/app/settings/integrations/${IntegrationType.PhoneIntegrationType}`}
                            >
                                Phone
                            </Link>
                        </BreadcrumbItem>
                        <BreadcrumbItem active>Add Phone Number</BreadcrumbItem>
                    </Breadcrumb>
                }
            />

            <Container fluid className="page-container">
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
                        <Form onSubmit={onSubmit}>
                            {!!error && (
                                <Alert color="danger">{error.toString()}</Alert>
                            )}
                            <FormGroup>
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
                            {shouldRenderState && (
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
                                    options={areaCodes}
                                    fullWidth
                                    required
                                />
                            </FormGroup>
                            <Button
                                type="submit"
                                color="success"
                                className={classnames('mt-5', {
                                    'btn-loading': isLoading,
                                })}
                                disabled={isLoading}
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
