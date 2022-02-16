import React, {useEffect, useCallback, useState} from 'react'
import {fromJS} from 'immutable'
import classnames from 'classnames'
import {
    Breadcrumb,
    BreadcrumbItem,
    Col,
    Container,
    Form,
    FormGroup,
    Label,
    Row,
} from 'reactstrap'
import {Link} from 'react-router-dom'
import {useAsyncFn} from 'react-use'

import {
    DEFAULT_IVR_SETTINGS,
    DEFAULT_VOICE_MESSAGE,
} from 'models/integration/constants'
import {notify} from 'state/notifications/actions'
import {phoneNumbersFetched} from 'state/entities/phoneNumbers/actions'
import {getPhoneNumbers} from 'state/entities/phoneNumbers/selectors'
import {NotificationStatus} from 'state/notifications/types'
import {IntegrationType, VoiceMessageType} from 'models/integration/types'
import {PhoneFunction} from 'business/twilio'
import {updateOrCreateIntegration} from 'state/integrations/actions'
import {PhoneNumber} from 'models/phoneNumber/types'
import {fetchPhoneNumbers} from 'models/phoneNumber/resources'
import useAppDispatch from 'hooks/useAppDispatch'
import PageHeader from 'pages/common/components/PageHeader'
import EmojiTextInput from 'pages/common/forms/EmojiTextInput/EmojiTextInput'
import SelectField from 'pages/common/forms/SelectField/SelectField'
import {SelectableOption} from 'pages/common/forms/SelectField/types'
import Button, {ButtonIntent} from 'pages/common/components/button/Button'
import PhoneNumberSelectField from 'pages/phoneNumbers/PhoneNumberSelectField'
import useAppSelector from 'hooks/useAppSelector'

import css from 'pages/settings/settings.less'

import rawPhoneFunctionOptions from './options/functions.json'

const phoneFunctionOptions: SelectableOption[] = rawPhoneFunctionOptions

type Props = {
    selectedPhoneNumberId?: number
}

function PhoneIntegrationCreate({selectedPhoneNumberId}: Props): JSX.Element {
    const [, handleFetchPhoneNumbers] = useAsyncFn(async () => {
        try {
            const res = await fetchPhoneNumbers()
            if (!res) {
                return
            }
            dispatch(phoneNumbersFetched(res.data))
        } catch (error) {
            void dispatch(
                notify({
                    message: 'Failed to fetch phone numbers',
                    status: NotificationStatus.Error,
                })
            )
        }
    })

    useEffect(() => {
        void handleFetchPhoneNumbers()
    }, [handleFetchPhoneNumbers])

    const phoneNumbers = useAppSelector(getPhoneNumbers)
    const [title, setTitle] = useState('')
    const [phoneNumber, setPhoneNumber] = useState<Maybe<PhoneNumber>>(null)
    const [emoji, setEmoji] = useState<string | null>(null)
    const [phoneFunction, setPhoneFunction] = useState(PhoneFunction.Standard)
    const [isLoading, setIsLoading] = useState(false)
    const dispatch = useAppDispatch()

    useEffect(() => {
        if (!selectedPhoneNumberId) {
            return
        }

        const selectedNumber = phoneNumbers[selectedPhoneNumberId]
        setPhoneNumber(selectedNumber)
    }, [phoneNumbers, selectedPhoneNumberId])

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
                                Voice
                            </Link>
                        </BreadcrumbItem>
                        <BreadcrumbItem active>
                            Add Voice Integration
                        </BreadcrumbItem>
                    </Breadcrumb>
                }
            />

            <Container fluid className={css.pageContainer}>
                <Row>
                    <Col lg={6}>
                        <Form onSubmit={onSubmit}>
                            <FormGroup>
                                <Label
                                    htmlFor="title"
                                    className="control-label"
                                >
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
                                intent={ButtonIntent.Creation}
                                isLoading={isLoading}
                                className={classnames('mt-5', 'mb-5')}
                            >
                                Add voice integration
                            </Button>
                        </Form>
                    </Col>
                </Row>
            </Container>
        </div>
    )
}

export default PhoneIntegrationCreate
