import React, {useCallback, useEffect, useState} from 'react'
import {Link} from 'react-router-dom'
import {fromJS, Map} from 'immutable'
import Clipboard from 'clipboard'
import {
    Alert,
    Breadcrumb,
    BreadcrumbItem,
    Button,
    Col,
    Container,
    Form,
    FormGroup,
    FormText,
    Input,
    InputGroup,
    InputGroupAddon,
    Label,
    Row,
} from 'reactstrap'

import classnames from 'classnames'

import PageHeader from '../../../../common/components/PageHeader'
import {IntegrationType} from '../../../../../models/integration/types'
import EmojiTextInput from '../../../../common/forms/EmojiTextInput/EmojiTextInput'
import ConfirmButton from '../../../../common/components/ConfirmButton'
import BooleanField from '../../../../common/forms/BooleanField.js'

import PhoneIntegrationNavigation from './PhoneIntegrationNavigation'

type Props = {
    integration: Map<string, any>
    actions: {
        deleteIntegration: (integration: Map<string, any>) => Promise<void>
        updateOrCreateIntegration: (
            integration: Map<string, any>
        ) => Promise<void>
    }
}

export default function PhoneIntegrationPreferences({
    integration,
    actions,
}: Props): JSX.Element {
    const [isInitialized, setIsInitialized] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [isPhoneNumberCopied, setIsPhoneNumberCopied] = useState(false)
    const [error, setError] = useState<Error | null>(null)
    const [title, setTitle] = useState('')
    const [emoji, setEmoji] = useState<string | null>(null)
    const [recordInboundCalls, setRecordInboundCalls] = useState(true)
    const [recordOutboundCalls, setRecordOutboundCalls] = useState(true)
    const [
        voicemailOutsideBusinessHours,
        setVoicemailOutsideBusinessHours,
    ] = useState(true)

    const onSubmit = useCallback(
        async (event: React.FormEvent) => {
            event.preventDefault()

            try {
                setIsLoading(true)
                setError(null)

                await actions.updateOrCreateIntegration(
                    fromJS({
                        id: integration.get('id'),
                        name: title,
                        meta: {
                            emoji,
                            preferences: {
                                record_inbound_calls: recordInboundCalls,
                                voicemail_outside_business_hours: voicemailOutsideBusinessHours,
                                record_outbound_calls: recordOutboundCalls,
                            },
                        },
                    })
                )
            } catch (error) {
                console.error(error)
                setError(error)
            } finally {
                setIsLoading(false)
            }
        },
        [
            integration,
            title,
            emoji,
            recordInboundCalls,
            voicemailOutsideBusinessHours,
            recordOutboundCalls,
            actions,
            setIsLoading,
            setError,
        ]
    )

    const onDelete = useCallback(async () => {
        try {
            setIsLoading(true)
            setError(null)

            await actions.deleteIntegration(integration)
        } catch (error) {
            setError(error)
        } finally {
            setIsLoading(false)
        }
    }, [integration, actions])

    useEffect(() => {
        if (integration.isEmpty() || isInitialized) {
            return
        }

        const title = integration.get('name', '')
        const emoji = integration.getIn(['meta', 'emoji'])
        const recordInboundCalls = integration.getIn(
            ['meta', 'preferences', 'record_inbound_calls'],
            false
        )
        const voicemailOutsideBusinessHours = integration.getIn(
            ['meta', 'preferences', 'voicemail_outside_business_hours'],
            false
        )
        const recordOutboundCalls = integration.getIn(
            ['meta', 'preferences', 'record_outbound_calls'],
            false
        )

        setTitle(title)
        setEmoji(emoji)
        setRecordInboundCalls(recordInboundCalls)
        setVoicemailOutsideBusinessHours(voicemailOutsideBusinessHours)
        setRecordOutboundCalls(recordOutboundCalls)

        setIsInitialized(true)

        const clipboard = new Clipboard('.copy-phone-number-button')

        clipboard.on('success', () => {
            setIsPhoneNumberCopied(true)

            setTimeout(() => {
                setIsPhoneNumberCopied(false)
            }, 1500)
        })

        return () => {
            clipboard.destroy()
        }
    }, [
        integration,
        isInitialized,
        setTitle,
        setEmoji,
        setIsPhoneNumberCopied,
        setIsInitialized,
    ])

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
                        <BreadcrumbItem>
                            {integration.getIn(['meta', 'emoji'])}{' '}
                            {integration.get('name')}
                            <small className="text-muted ml-2">
                                {integration.getIn([
                                    'meta',
                                    'twilio',
                                    'incoming_phone_number',
                                    'friendly_name',
                                ])}
                            </small>
                        </BreadcrumbItem>
                        <BreadcrumbItem active>Preferences</BreadcrumbItem>
                    </Breadcrumb>
                }
            />

            <PhoneIntegrationNavigation integration={integration} />

            <Container fluid className="page-container">
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
                                    htmlFor="phone-number"
                                    className="control-label"
                                >
                                    Phone number
                                </Label>
                                <InputGroup>
                                    <Input
                                        id="phone-number"
                                        type="text"
                                        value={integration.getIn(
                                            [
                                                'meta',
                                                'twilio',
                                                'incoming_phone_number',
                                                'friendly_name',
                                            ],
                                            ''
                                        )}
                                        readOnly
                                    />
                                    <InputGroupAddon addonType="append">
                                        <Button
                                            className="copy-phone-number-button"
                                            data-clipboard-target="#phone-number"
                                            type="button"
                                        >
                                            <i className="material-icons mr-2">
                                                file_copy
                                            </i>
                                            {isPhoneNumberCopied
                                                ? 'Copied!'
                                                : 'Copy'}
                                        </Button>
                                    </InputGroupAddon>
                                </InputGroup>
                            </FormGroup>
                            <FormGroup>
                                <Label className="control-label">
                                    Inbound calls
                                </Label>
                                <BooleanField
                                    type="checkbox"
                                    label="Start recording automatically"
                                    value={recordInboundCalls}
                                    onChange={setRecordInboundCalls}
                                />
                                <BooleanField
                                    type="checkbox"
                                    label="Send calls to voicemail outside business hours"
                                    value={voicemailOutsideBusinessHours}
                                    onChange={setVoicemailOutsideBusinessHours}
                                />
                                <FormText color="muted" className="pl-4">
                                    If a customer calls outside of business
                                    hours, they will be immediately forwarded to
                                    voicemail.
                                </FormText>
                            </FormGroup>
                            <FormGroup>
                                <Label className="control-label">
                                    Outbound calls
                                </Label>
                                <BooleanField
                                    type="checkbox"
                                    label="Start recording automatically"
                                    value={recordOutboundCalls}
                                    onChange={setRecordOutboundCalls}
                                />
                            </FormGroup>
                            <div className="mt-3">
                                <Button
                                    type="submit"
                                    color="success"
                                    disabled={!isInitialized || isLoading}
                                    className={classnames({
                                        'btn-loading': isLoading,
                                    })}
                                >
                                    Save changes
                                </Button>
                                <ConfirmButton
                                    className="float-right"
                                    color="secondary"
                                    disabled={!isInitialized || isLoading}
                                    confirm={onDelete}
                                    content="Are you sure you want to delete this phone number?"
                                >
                                    <i className="material-icons mr-1 text-danger">
                                        delete
                                    </i>
                                    Delete phone number
                                </ConfirmButton>
                            </div>
                        </Form>
                    </Col>
                </Row>
            </Container>
        </div>
    )
}
