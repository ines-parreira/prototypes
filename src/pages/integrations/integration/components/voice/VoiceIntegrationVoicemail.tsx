import React, {useCallback, useEffect, useState} from 'react'
import {Col, Container, Form, Row} from 'reactstrap'

import {
    PhoneIntegration,
    PhoneIntegrationVoicemailSettings,
    isPhoneIntegration,
} from 'models/integration/types'
import {DEFAULT_VOICE_MESSAGE} from 'models/integration/constants'
import useAppDispatch from 'hooks/useAppDispatch'
import Button from 'pages/common/components/button/Button'
import CheckBox from 'pages/common/forms/CheckBox'
import {updatePhoneVoicemailConfiguration} from 'pages/integrations/integration/components/phone/actions'
import VoiceMessageField from 'pages/integrations/integration/components/phone/VoiceMessageField'

import settingsCss from 'pages/settings/settings.less'

type Props = {
    integration: Maybe<PhoneIntegration>
}

export function VoiceIntegrationVoicemail({
    integration,
}: Props): JSX.Element | null {
    const dispatch = useAppDispatch()
    const [payload, setPayload] = useState<
        PhoneIntegrationVoicemailSettings | undefined
    >(integration?.meta?.voicemail)

    useEffect(() => {
        if (!payload) {
            setPayload(integration?.meta?.voicemail)
        }
    }, [integration, payload, setPayload])

    const [isLoading, setIsLoading] = useState(false)

    const onSubmit = useCallback(
        async (event: React.FormEvent) => {
            event.preventDefault()
            setIsLoading(true)
            try {
                await dispatch(updatePhoneVoicemailConfiguration(payload ?? {}))
                setIsLoading(false)
            } catch (error) {
                setIsLoading(false)
            }
        },
        [payload, setIsLoading, dispatch]
    )

    if (!isPhoneIntegration(integration)) {
        return null
    }

    return (
        <Container fluid className={settingsCss.pageContainer}>
            <h4 className="mb-3">Set Voicemail</h4>
            <Row>
                <Col className="mb-4">
                    Create a voicemail by uploading an .MP3 file or typing out
                    the message with Text to speech.
                </Col>
            </Row>
            <Row>
                <Col lg={6} xl={7}>
                    <Form onSubmit={onSubmit}>
                        <div className="mb-4">
                            <VoiceMessageField
                                value={payload ?? DEFAULT_VOICE_MESSAGE}
                                onChange={(message) =>
                                    setPayload({
                                        ...message,
                                        allow_to_leave_voicemail:
                                            payload?.allow_to_leave_voicemail ??
                                            true,
                                    })
                                }
                                allowNone
                            />
                        </div>

                        <h5>Caller Options</h5>
                        <CheckBox
                            isChecked={
                                payload?.allow_to_leave_voicemail ?? false
                            }
                            onChange={(value: boolean) =>
                                setPayload((payload) => ({
                                    ...(payload ?? DEFAULT_VOICE_MESSAGE),
                                    allow_to_leave_voicemail: value,
                                }))
                            }
                        >
                            Allow caller to leave voicemail
                        </CheckBox>
                        <Button
                            className="mt-5"
                            type="submit"
                            isLoading={isLoading}
                        >
                            Save changes
                        </Button>
                    </Form>
                </Col>
            </Row>
        </Container>
    )
}

export default VoiceIntegrationVoicemail
