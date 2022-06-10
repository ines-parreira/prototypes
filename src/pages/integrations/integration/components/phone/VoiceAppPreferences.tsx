import React, {useEffect, useState} from 'react'
import {Link} from 'react-router-dom'
import {fromJS} from 'immutable'
import {Col, Container, Form, FormGroup, Label, Row} from 'reactstrap'
import {useAsyncFn} from 'react-use'
import classnames from 'classnames'

import PageHeader from 'pages/common/components/PageHeader'
import {
    PhoneIntegration,
    PhoneIntegrationPreferences,
    isPhoneIntegration,
} from 'models/integration/types'
import {getPhoneNumber} from 'state/entities/phoneNumbers/selectors'
import EmojiTextInput from 'pages/common/forms/EmojiTextInput/EmojiTextInput'
import CheckBox from 'pages/common/forms/CheckBox'
import Button from 'pages/common/components/button/Button'
import ConfirmButton from 'pages/common/components/button/ConfirmButton'
import ButtonIconLabel from 'pages/common/components/button/ButtonIconLabel'
import PhoneNumberTitle from 'pages/phoneNumbers/PhoneNumberTitle'
import {
    deleteIntegration,
    updateOrCreateIntegration,
} from 'state/integrations/actions'
import useAppDispatch from 'hooks/useAppDispatch'
import {PhoneFunction} from 'business/twilio'
import settingsCss from 'pages/settings/settings.less'
import useAppSelector from 'hooks/useAppSelector'

import PhoneIntegrationNavigation from './PhoneIntegrationNavigation'
import PhoneIntegrationBreadcrumbs from './PhoneIntegrationBreadcrumbs'
import css from './VoiceAppPreferences.less'

type Props = {
    integration: PhoneIntegration
}

export default function VoiceAppPreferences({integration}: Props): JSX.Element {
    const [isInitialized, setIsInitialized] = useState(false)
    const [title, setTitle] = useState('')
    const [emoji, setEmoji] = useState<string | null>(null)
    const [preferences, setPreferences] = useState<PhoneIntegrationPreferences>(
        {
            record_inbound_calls: false,
            voicemail_outside_business_hours: false,
            record_outbound_calls: false,
        }
    )
    const phoneNumberId = integration?.meta?.twilio_phone_number_id
    const phoneNumber = useAppSelector(getPhoneNumber(phoneNumberId))

    const dispatch = useAppDispatch()

    const [{loading: isLoading}, handleSubmit] = useAsyncFn(
        async (event: React.FormEvent) => {
            event.preventDefault()
            await dispatch(
                updateOrCreateIntegration(
                    fromJS({
                        id: integration.id,
                        name: title,
                        meta: {
                            emoji,
                            preferences,
                        },
                    })
                )
            )
        },
        [integration, title, emoji, preferences, dispatch]
    )

    const [{loading: isDeleting}, handleDelete] = useAsyncFn(async () => {
        await dispatch(deleteIntegration(fromJS(integration)))
    }, [integration, dispatch])

    useEffect(() => {
        if (!isPhoneIntegration(integration) || isInitialized) {
            return
        }
        const {meta} = integration
        const {preferences} = meta

        setTitle(integration.name)
        setEmoji(meta.emoji)
        setPreferences(preferences)
        setIsInitialized(true)
    }, [integration, isInitialized])

    if (!isPhoneIntegration(integration)) {
        return <div />
    }

    const isIvr = integration?.meta?.function === PhoneFunction.Ivr

    return (
        <div className="full-width">
            <PageHeader
                title={
                    <PhoneIntegrationBreadcrumbs integration={integration} />
                }
            />

            <PhoneIntegrationNavigation integration={fromJS(integration)} />

            <Container fluid className={settingsCss.pageContainer}>
                <Row>
                    <Col lg={6} xl={7}>
                        <Form onSubmit={handleSubmit}>
                            <FormGroup>
                                <Label
                                    htmlFor="title"
                                    className="control-label"
                                >
                                    App title
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
                            <Row className="mt-5 mb-5">
                                <Col>
                                    <h4 className="mb-3">Phone number</h4>
                                    <Row
                                        className={classnames(
                                            css.appRow,
                                            'border-bottom',
                                            'ml-1',
                                            'mr-1'
                                        )}
                                    >
                                        <Col lg={8} className="pl-0">
                                            {phoneNumber && (
                                                <PhoneNumberTitle
                                                    phoneNumber={phoneNumber}
                                                />
                                            )}
                                        </Col>
                                        <Col lg={4} className={css.appLink}>
                                            <Link
                                                to={`/app/settings/phone-numbers/${integration.meta.twilio_phone_number_id}`}
                                            >
                                                Manage Phone Number
                                            </Link>
                                        </Col>
                                    </Row>
                                </Col>
                            </Row>
                            <Row>
                                <Col>
                                    <h4 className="mb-3">Inbound calls</h4>
                                    <FormGroup>
                                        {!isIvr && (
                                            <CheckBox
                                                isChecked={
                                                    preferences.record_inbound_calls
                                                }
                                                onChange={(value) =>
                                                    setPreferences(
                                                        (preferences) => ({
                                                            ...preferences,
                                                            record_inbound_calls:
                                                                value,
                                                        })
                                                    )
                                                }
                                            >
                                                Start recording automatically
                                            </CheckBox>
                                        )}
                                    </FormGroup>
                                </Col>
                            </Row>
                            <Row>
                                <Col>
                                    <FormGroup>
                                        <CheckBox
                                            isChecked={
                                                preferences.voicemail_outside_business_hours
                                            }
                                            onChange={(value) =>
                                                setPreferences(
                                                    (preferences) => ({
                                                        ...preferences,
                                                        voicemail_outside_business_hours:
                                                            value,
                                                    })
                                                )
                                            }
                                            caption="If a customer calls outside of
                                            business hours, they will be
                                            immediately forwarded to voicemail."
                                        >
                                            Send calls to voicemail outside
                                            business hours
                                        </CheckBox>
                                    </FormGroup>
                                </Col>
                            </Row>

                            {!isIvr && (
                                <Row className="mb-3">
                                    <Col>
                                        <h4 className="mb-3">Outbound calls</h4>
                                        <FormGroup>
                                            <CheckBox
                                                isChecked={
                                                    preferences.record_outbound_calls
                                                }
                                                onChange={(value) =>
                                                    setPreferences(
                                                        (preferences) => ({
                                                            ...preferences,
                                                            record_outbound_calls:
                                                                value,
                                                        })
                                                    )
                                                }
                                            >
                                                Start recording automatically
                                            </CheckBox>
                                        </FormGroup>
                                    </Col>
                                </Row>
                            )}
                            <div className="mt-5">
                                <Button
                                    type="submit"
                                    isDisabled={!isInitialized}
                                    isLoading={isLoading}
                                >
                                    Save changes
                                </Button>
                                <ConfirmButton
                                    className="float-right"
                                    intent="destructive"
                                    isDisabled={!isInitialized}
                                    isLoading={isDeleting}
                                    onConfirm={handleDelete}
                                    confirmationContent="Are you sure you want to delete this integration? All associated views will be disabled."
                                >
                                    <ButtonIconLabel icon="delete">
                                        Delete integration
                                    </ButtonIconLabel>
                                </ConfirmButton>
                            </div>
                        </Form>
                    </Col>
                </Row>
            </Container>
        </div>
    )
}
