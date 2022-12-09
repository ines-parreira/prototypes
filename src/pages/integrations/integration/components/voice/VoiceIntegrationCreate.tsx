import React, {useEffect, useCallback, useState} from 'react'
import {fromJS} from 'immutable'
import classnames from 'classnames'
import {Col, Container, Form, FormGroup, Label, Row} from 'reactstrap'

import {
    DEFAULT_IVR_SETTINGS,
    DEFAULT_VOICE_MESSAGE,
} from 'models/integration/constants'
import {getOldPhoneNumbers} from 'state/entities/phoneNumbers/selectors'
import {IntegrationType, VoiceMessageType} from 'models/integration/types'
import {PhoneFunction} from 'business/twilio'
import {updateOrCreateIntegration} from 'state/integrations/actions'
import {OldPhoneNumber} from 'models/phoneNumber/types'
import useAppDispatch from 'hooks/useAppDispatch'
import EmojiTextInput from 'pages/common/forms/EmojiTextInput/EmojiTextInput'
import SelectField from 'pages/common/forms/SelectField/SelectField'
import {SelectableOption} from 'pages/common/forms/SelectField/types'
import Button from 'pages/common/components/button/Button'
import PhoneNumberSelectField from 'pages/phoneNumbers/PhoneNumberSelectField'
import Alert from 'pages/common/components/Alert/Alert'
import useAppSelector from 'hooks/useAppSelector'
import rawPhoneFunctionOptions from 'pages/integrations/integration/components/phone/options/functions.json'

import css from 'pages/settings/settings.less'

const phoneFunctionOptions: SelectableOption[] = rawPhoneFunctionOptions

type Props = {
    selectedPhoneNumberId?: number
    pricingLink?: string
}

function VoiceIntegrationCreate({
    selectedPhoneNumberId,
    pricingLink,
}: Props): JSX.Element {
    const phoneNumbers = useAppSelector(getOldPhoneNumbers)
    const [title, setTitle] = useState('')
    const [phoneNumber, setPhoneNumber] = useState<Maybe<OldPhoneNumber>>(null)
    const [emoji, setEmoji] = useState<string | null>(null)
    const [phoneFunction, setPhoneFunction] = useState(PhoneFunction.Standard)
    const [isLoading, setIsLoading] = useState(false)
    const dispatch = useAppDispatch()

    useEffect(() => {
        if (!selectedPhoneNumberId) {
            return
        }
        const selectedNumber = phoneNumbers[selectedPhoneNumberId]
        if (!selectedNumber) {
            return
        }
        if (!phoneNumber) {
            setPhoneNumber(selectedNumber)
        }
        if (!title) {
            setTitle(`${selectedNumber.name} - Voice`)
        }
    }, [phoneNumbers, selectedPhoneNumberId, phoneNumber, title])

    const onSubmit = useCallback(
        async (event: React.FormEvent) => {
            event.preventDefault()
            setIsLoading(true)

            const payload = fromJS({
                type: IntegrationType.Phone,
                name: title,
                meta: {
                    emoji,
                    function: phoneFunction,
                    twilio_phone_number_id: phoneNumber?.id,
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
                },
            })

            try {
                await dispatch(updateOrCreateIntegration(payload))
            } finally {
                setIsLoading(false)
            }
        },
        [title, emoji, phoneFunction, phoneNumber, dispatch]
    )

    return (
        <Container fluid className={css.pageContainer}>
            <Row>
                <Col lg={6}>
                    <Alert icon className="mb-4">
                        With the Voice Add-on, you can seamlessly integrate
                        phone support into your existing Gorgias workflow.{' '}
                        {pricingLink && (
                            <a
                                href={pricingLink}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                Learn more about pricing
                            </a>
                        )}
                    </Alert>
                    <Form onSubmit={onSubmit}>
                        <FormGroup>
                            <Label htmlFor="title" className="control-label">
                                Integration title
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
                                htmlFor="phoneNumber"
                                className="control-label"
                            >
                                Phone number
                            </Label>
                            <PhoneNumberSelectField
                                value={phoneNumber}
                                onChange={setPhoneNumber}
                                onCreate={setPhoneNumber}
                                integrationType={IntegrationType.Phone}
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
                        <Button
                            type="submit"
                            isLoading={isLoading}
                            className={classnames('mt-4', 'mb-4')}
                        >
                            Add Voice
                        </Button>
                    </Form>
                </Col>
            </Row>
        </Container>
    )
}

export default VoiceIntegrationCreate
