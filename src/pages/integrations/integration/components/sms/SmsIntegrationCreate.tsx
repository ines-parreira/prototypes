import React, {useEffect, useCallback, useState} from 'react'
import {fromJS} from 'immutable'
import classnames from 'classnames'
import {Col, Container, Form, FormGroup, Label, Row} from 'reactstrap'
import {getPhoneNumbers} from 'state/entities/phoneNumbers/selectors'
import {IntegrationType} from 'models/integration/types'
import {updateOrCreateIntegration} from 'state/integrations/actions'
import {PhoneNumber} from 'models/phoneNumber/types'
import useAppDispatch from 'hooks/useAppDispatch'
import EmojiTextInput from 'pages/common/forms/EmojiTextInput/EmojiTextInput'
import Button from 'pages/common/components/button/Button'
import PhoneNumberSelectField from 'pages/phoneNumbers/PhoneNumberSelectField'
import useAppSelector from 'hooks/useAppSelector'
import Alert from 'pages/common/components/Alert/Alert'

import css from 'pages/settings/settings.less'

type Props = {
    selectedPhoneNumberId?: number
    pricingLink?: string
}

function SmsIntegrationCreate({
    selectedPhoneNumberId,
    pricingLink,
}: Props): JSX.Element {
    const phoneNumbers = useAppSelector(getPhoneNumbers)
    const [title, setTitle] = useState('')
    const [phoneNumber, setPhoneNumber] = useState<Maybe<PhoneNumber>>(null)
    const [emoji, setEmoji] = useState<string | null>(null)
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
            setTitle(`${selectedNumber.name} - SMS`)
        }
    }, [phoneNumbers, selectedPhoneNumberId, phoneNumber, title])

    const onSubmit = useCallback(
        async (event: React.FormEvent) => {
            event.preventDefault()
            setIsLoading(true)

            const payload = fromJS({
                type: IntegrationType.Sms,
                name: title,
                meta: {
                    emoji,
                    twilio_phone_number_id: phoneNumber?.id,
                },
            })

            try {
                await dispatch(updateOrCreateIntegration(payload))
            } finally {
                setIsLoading(false)
            }
        },
        [title, emoji, phoneNumber, dispatch]
    )

    return (
        <Container fluid className={css.pageContainer}>
            <Row>
                <Col lg={6}>
                    <Alert icon className="mb-4">
                        With the SMS Add-on, you can easily add text message
                        capabilities to an existing phone number in Gorgias.{' '}
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
                                Phone Number
                            </Label>
                            <PhoneNumberSelectField
                                value={phoneNumber}
                                onChange={setPhoneNumber}
                                onCreate={setPhoneNumber}
                                integrationType={IntegrationType.Sms}
                            />
                        </FormGroup>
                        <Button
                            type="submit"
                            isLoading={isLoading}
                            className={classnames('mt-4', 'mb-4')}
                        >
                            Add SMS
                        </Button>
                    </Form>
                </Col>
            </Row>
        </Container>
    )
}

export default SmsIntegrationCreate
