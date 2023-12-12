import React, {useEffect, useState} from 'react'
import {Link} from 'react-router-dom'
import {fromJS} from 'immutable'
import {Col, Container, Form, FormGroup, Label, Row} from 'reactstrap'
// [PLTOF-48] Please avoid importing more hooks from 'react-use', prefer using your own implementation of the hook rather than depending on external library
// eslint-disable-next-line no-restricted-imports
import {useAsyncFn} from 'react-use'
import classnames from 'classnames'

import {
    PhoneIntegration,
    PhoneIntegrationPreferences,
    PhoneRingingBehaviour,
    isPhoneIntegration,
} from 'models/integration/types'
import {getNewPhoneNumber} from 'state/entities/phoneNumbers/selectors'
import EmojiTextInput from 'pages/common/forms/EmojiTextInput/EmojiTextInput'
import CheckBox from 'pages/common/forms/CheckBox'
import RadioFieldSet from 'pages/common/forms/RadioFieldSet'
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
import useAppSelector from 'hooks/useAppSelector'

import settingsCss from 'pages/settings/settings.less'

import Alert, {AlertType} from 'pages/common/components/Alert/Alert'
import VoiceIntegrationPreferencesTeamSelect from './VoiceIntegrationPreferencesTeamSelect'
import css from './VoiceIntegrationPreferences.less'

type Props = {
    integration: PhoneIntegration
}

export default function VoiceIntegrationPreferences({
    integration,
}: Props): JSX.Element {
    const [isInitialized, setIsInitialized] = useState(false)
    const [title, setTitle] = useState('')
    const [emoji, setEmoji] = useState<string | null>(null)
    const [phoneTeamId, setPhoneTeamId] = useState<number | undefined>(
        integration?.meta?.phone_team_id
    )
    const [preferences, setPreferences] = useState<PhoneIntegrationPreferences>(
        {
            record_inbound_calls: false,
            voicemail_outside_business_hours: false,
            record_outbound_calls: false,
            ringing_behaviour: PhoneRingingBehaviour.RoundRobin,
        }
    )
    const phoneNumberId = integration?.meta?.phone_number_id
    const phoneNumber = useAppSelector(getNewPhoneNumber(phoneNumberId))
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
                            phone_team_id: phoneTeamId,
                        },
                    })
                )
            )
        },
        [integration, title, emoji, preferences, dispatch, phoneTeamId]
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
        <Container fluid className={settingsCss.pageContainer}>
            <Row>
                <Col lg={6} xl={7}>
                    <Form onSubmit={handleSubmit}>
                        <FormGroup>
                            <Label htmlFor="title" className="control-label">
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
                                            to={`/app/settings/phone-numbers/${integration.meta.phone_number_id}`}
                                        >
                                            Manage Phone Number
                                        </Link>
                                    </Col>
                                </Row>
                            </Col>
                        </Row>
                        <Row>
                            <Col>
                                <h4 className="mb-4">Inbound calls</h4>
                                {!isIvr && (
                                    <Row>
                                        <Col>
                                            <h5>Route the call to a team</h5>
                                            <Alert
                                                type={AlertType.Error}
                                                icon={true}
                                                className="mb-3"
                                            >
                                                This new configuration will be
                                                implemented from January 10th
                                                onwards. Kindly review and
                                                adjust your{' '}
                                                <strong>team preference</strong>{' '}
                                                prior to this date. During the
                                                transition period, your current
                                                routing rules will still be
                                                directing calls to your
                                                designated team as usual.
                                            </Alert>
                                            <FormGroup>
                                                <VoiceIntegrationPreferencesTeamSelect
                                                    value={phoneTeamId}
                                                    onChange={(teamId) =>
                                                        setPhoneTeamId(teamId)
                                                    }
                                                />
                                            </FormGroup>
                                            <h5 className="mt-4 mb-3">
                                                Set ringing behaviour
                                            </h5>
                                            <FormGroup>
                                                <RadioFieldSet
                                                    options={[
                                                        {
                                                            label: 'Round-robin ringing',
                                                            value: PhoneRingingBehaviour.RoundRobin,
                                                            caption:
                                                                'Calls assigned to a team will ring available agents one-by-one, ordered by the time since an agent last received a call.',
                                                        },
                                                        {
                                                            label: 'Broadcast ringing',
                                                            value: PhoneRingingBehaviour.Broadcast,
                                                            caption:
                                                                'Calls assigned to a team will ring all available agents simultaneously.',
                                                        },
                                                    ]}
                                                    onChange={(value) =>
                                                        setPreferences(
                                                            (preferences) => ({
                                                                ...preferences,
                                                                ringing_behaviour:
                                                                    value as PhoneRingingBehaviour,
                                                            })
                                                        )
                                                    }
                                                    selectedValue={
                                                        preferences.ringing_behaviour
                                                    }
                                                />
                                            </FormGroup>
                                        </Col>
                                    </Row>
                                )}
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
                                            className="mt-3"
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
                                            setPreferences((preferences) => ({
                                                ...preferences,
                                                voicemail_outside_business_hours:
                                                    value,
                                            }))
                                        }
                                        caption="If a customer calls outside of
                                            business hours, they will be
                                            immediately forwarded to voicemail."
                                    >
                                        Send calls to voicemail outside business
                                        hours
                                    </CheckBox>
                                </FormGroup>
                            </Col>
                        </Row>

                        {!isIvr && (
                            <Row className="mt-3">
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
                                fillStyle="ghost"
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
    )
}
