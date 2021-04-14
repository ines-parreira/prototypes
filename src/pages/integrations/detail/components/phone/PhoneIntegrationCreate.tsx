import React, {useCallback, useState} from 'react'
import {Link} from 'react-router-dom'
import {fromJS, Map} from 'immutable'
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

import PageHeader from '../../../../common/components/PageHeader'
import {IntegrationType} from '../../../../../models/integration/types'
import EmojiTextInput from '../../../../common/forms/EmojiTextInput/EmojiTextInput'
import SelectField from '../../../../common/forms/SelectField/SelectField.js'
import type {Option} from '../../../../common/forms/SelectField/types'

import rawCountryOptions from './options/countries.json'
import rawTypeOptions from './options/types.json'
import rawStateOptions from './options/states.json'
import rawAreaCodeOptions from './options/area-codes.json'

interface StateOptions {
    [key: string]: Option[]
}

interface AreaCodeOptions {
    [key: string]: {
        [key: string]: Option[]
    }
}

const countryOptions: Option[] = rawCountryOptions
const typeOptions: Option[] = rawTypeOptions
const stateOptions: StateOptions = rawStateOptions
const areaCodeOptions: AreaCodeOptions = rawAreaCodeOptions

type Props = {
    actions: {
        updateOrCreateIntegration: (
            integration: Map<string, any>
        ) => Promise<void>
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

    const onCountryChange = useCallback(
        (country) => {
            setCountry(country)
            setState('')
            setAreaCode('')
        },
        [setCountry, setState, setAreaCode]
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

                await actions.updateOrCreateIntegration(
                    fromJS({
                        type: IntegrationType.PhoneIntegrationType,
                        name: title,
                        meta: {
                            emoji,
                            country,
                            type: phoneType,
                            state,
                            area_code: parseInt(
                                areaCode.split('-').pop() as string
                            ),
                            preferences: {
                                record_inbound_calls: true,
                                voicemail_outside_business_hours: true,
                                record_outbound_calls: true,
                            },
                            voicemail: {
                                voicemail_type: null,
                                voice_recording_file_path: null,
                                text_to_speech_content: null,
                                allow_to_leave_voicemail: false,
                            },
                        },
                    })
                )
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
                    <Col lg={6} xl={4}>
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
                                    onChange={setPhoneType}
                                    options={typeOptions}
                                    fullWidth
                                    required
                                />
                            </FormGroup>
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
                                    onChange={setAreaCode}
                                    options={
                                        !!country && !!state
                                            ? areaCodeOptions[country][state]
                                            : []
                                    }
                                    fullWidth
                                    required
                                />
                            </FormGroup>
                            <Button
                                type="submit"
                                color="success"
                                className={classnames('mt-3', {
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
