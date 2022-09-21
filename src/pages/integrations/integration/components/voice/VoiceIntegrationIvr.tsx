import React, {useCallback, useState, useEffect} from 'react'
import {Col, Container, Form, Row} from 'reactstrap'

import {
    PhoneIntegration,
    PhoneIntegrationIvrSettings,
    isPhoneIntegration,
} from 'models/integration/types'
import useAppDispatch from 'hooks/useAppDispatch'
import Button from 'pages/common/components/button/Button'
import {DEFAULT_VOICE_MESSAGE} from 'models/integration/constants'
import {updatePhoneIvrConfiguration} from 'pages/integrations/integration/components/phone/actions'
import VoiceMessageField from 'pages/integrations/integration/components/voice/VoiceMessageField'
import IvrMenuActionsFieldArray from 'pages/integrations/integration/components/voice/IvrMenuActionsFieldArray'

import settingsCss from 'pages/settings/settings.less'

type Props = {
    integration: Maybe<PhoneIntegration>
}

export default function VoiceIntegrationIvr(props: Props): JSX.Element | null {
    const {integration} = props
    const dispatch = useAppDispatch()
    const [payload, setPayload] = useState<
        PhoneIntegrationIvrSettings | undefined
    >(integration?.meta?.ivr)

    useEffect(() => {
        if (!payload) {
            setPayload(integration?.meta?.ivr)
        }
    }, [integration, payload, setPayload])

    const [isLoading, setIsLoading] = useState(false)

    const onSubmit = useCallback(
        async (event: React.FormEvent) => {
            event.preventDefault()
            setIsLoading(true)
            const payloadOrDefault = payload ?? {
                menu_options: [],
                greeting_message: DEFAULT_VOICE_MESSAGE,
            }
            try {
                await dispatch(updatePhoneIvrConfiguration(payloadOrDefault))
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
            <h4 className="mb-3">Greeting message</h4>
            <Row>
                <Col lg={6} xl={7}>
                    <Form onSubmit={onSubmit}>
                        <div className="mb-4">
                            <VoiceMessageField
                                value={
                                    payload?.greeting_message ??
                                    DEFAULT_VOICE_MESSAGE
                                }
                                onChange={(message) =>
                                    setPayload((payload) => ({
                                        menu_options:
                                            payload?.menu_options ?? [],
                                        greeting_message: message,
                                    }))
                                }
                                allowNone
                            />
                        </div>

                        <IvrMenuActionsFieldArray
                            value={payload?.menu_options ?? []}
                            onChange={(options) => {
                                setPayload((payload) => ({
                                    ...payload,
                                    greeting_message:
                                        payload?.greeting_message ??
                                        DEFAULT_VOICE_MESSAGE,
                                    menu_options: options,
                                }))
                            }}
                        />

                        <Button
                            className="mt-5"
                            type="submit"
                            isDisabled={isLoading}
                        >
                            Save changes
                        </Button>
                    </Form>
                </Col>
            </Row>
        </Container>
    )
}
