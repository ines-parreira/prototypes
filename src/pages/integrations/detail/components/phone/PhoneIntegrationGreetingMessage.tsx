import React, {useCallback, useEffect, useState} from 'react'
import {fromJS} from 'immutable'
import {Button, Col, Container, Form, Row} from 'reactstrap'
import classnames from 'classnames'

import useAppDispatch from '../../../../../hooks/useAppDispatch'
import PageHeader from '../../../../common/components/PageHeader'
import settingsCss from '../../../../settings/settings.less'
import {
    PhoneIntegration,
    VoiceMessage,
    isPhoneIntegration,
} from '../../../../../models/integration/types'
import {DEFAULT_VOICE_MESSAGE} from '../../../../../models/integration/constants'

import {updatePhoneGreetingMessageConfiguration} from './actions'
import PhoneIntegrationNavigation from './PhoneIntegrationNavigation'
import PhoneIntegrationBreadcrumbs from './PhoneIntegrationBreadcrumbs'
import VoiceMessageField from './VoiceMessageField'

type Props = {
    integration: Maybe<PhoneIntegration>
}

const MAX_RECORDING_DURATION = 30

export function PhoneIntegrationGreetingMessage({
    integration,
}: Props): JSX.Element | null {
    const dispatch = useAppDispatch()
    const [payload, setPayload] = useState<VoiceMessage | undefined>(
        integration?.meta?.greeting_message
    )

    useEffect(() => {
        if (!payload) {
            setPayload(integration?.meta?.greeting_message)
        }
    }, [integration, payload, setPayload])

    const [isLoading, setIsLoading] = useState(false)

    const onSubmit = useCallback(
        async (event: React.FormEvent) => {
            event.preventDefault()
            setIsLoading(true)
            try {
                await dispatch(
                    updatePhoneGreetingMessageConfiguration(payload ?? {})
                )
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
        <div className="full-width">
            <PageHeader
                title={
                    <PhoneIntegrationBreadcrumbs integration={integration} />
                }
            />

            <PhoneIntegrationNavigation integration={fromJS(integration)} />
            <Container fluid className={settingsCss.pageContainer}>
                <h4 className="mb-3">Set greeting message</h4>
                <Row>
                    <Col className="mb-4">
                        Add a greeting message by uploading an .MP3 file or
                        typing out the message with text to speech.
                    </Col>
                </Row>
                <Row>
                    <Col lg={6} xl={7}>
                        <Form onSubmit={onSubmit}>
                            <div className="mb-4">
                                <VoiceMessageField
                                    value={payload ?? DEFAULT_VOICE_MESSAGE}
                                    onChange={setPayload}
                                    maxRecordingDuration={
                                        MAX_RECORDING_DURATION
                                    }
                                    allowNone
                                />
                            </div>

                            <Button
                                type="submit"
                                color="success"
                                className={classnames('mt-5', {
                                    'btn-loading': isLoading,
                                })}
                                disabled={isLoading}
                            >
                                Save changes
                            </Button>
                        </Form>
                    </Col>
                </Row>
            </Container>
        </div>
    )
}

export default PhoneIntegrationGreetingMessage
