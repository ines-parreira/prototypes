import React, {useCallback, useEffect, useState} from 'react'
import {fromJS} from 'immutable'
import {Button, Col, Container, Form, Row} from 'reactstrap'
import classnames from 'classnames'

import BooleanField from 'pages/common/forms/BooleanField'
import useAppDispatch from '../../../../../hooks/useAppDispatch'
import PageHeader from '../../../../common/components/PageHeader'
import {
    PhoneIntegration,
    PhoneIntegrationVoicemailSettings,
    isPhoneIntegration,
} from '../../../../../models/integration/types'
import {DEFAULT_VOICE_MESSAGE} from '../../../../../models/integration/constants'
import settingsCss from '../../../../settings/settings.less'

import {updatePhoneVoicemailConfiguration} from './actions'
import PhoneIntegrationBreadcrumbs from './PhoneIntegrationBreadcrumbs'
import PhoneIntegrationNavigation from './PhoneIntegrationNavigation'
import VoiceMessageField from './VoiceMessageField'

type Props = {
    integration: Maybe<PhoneIntegration>
}

export function PhoneIntegrationVoicemail({
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
        <div className="full-width">
            <PageHeader
                title={
                    <PhoneIntegrationBreadcrumbs integration={integration} />
                }
            />

            <PhoneIntegrationNavigation integration={fromJS(integration)} />
            <Container fluid className={settingsCss.pageContainer}>
                <h4 className="mb-3">Set Voicemail</h4>
                <Row>
                    <Col className="mb-4">
                        Create a voicemail by uploading an .MP3 file or typing
                        out the message with Text to speech.
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
                            <BooleanField
                                type="checkbox"
                                value={payload?.allow_to_leave_voicemail}
                                onChange={(value: boolean) =>
                                    setPayload((payload) => ({
                                        ...(payload ?? DEFAULT_VOICE_MESSAGE),
                                        allow_to_leave_voicemail: value,
                                    }))
                                }
                                label="Allow caller to leave voicemail"
                            />

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

export default PhoneIntegrationVoicemail
