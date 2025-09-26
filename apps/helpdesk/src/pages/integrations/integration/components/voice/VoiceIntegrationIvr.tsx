import React, { useCallback, useEffect, useState } from 'react'

import _isEqual from 'lodash/isEqual'
import { Col, Container, Form, Row } from 'reactstrap'

import { Button } from '@gorgias/axiom'

import useAppDispatch from 'hooks/useAppDispatch'
import { DEFAULT_VOICE_MESSAGE } from 'models/integration/constants'
import {
    isPhoneIntegration,
    PhoneIntegration,
    PhoneIntegrationIvrSettings,
} from 'models/integration/types'
import UnsavedChangesPrompt from 'pages/common/components/UnsavedChangesPrompt'
import { updatePhoneIvrConfiguration } from 'pages/integrations/integration/components/phone/actions'
import IvrMenuActionsFieldArray from 'pages/integrations/integration/components/voice/DEPRECATED_IvrMenuActionsFieldArray'
import settingsCss from 'pages/settings/settings.less'

import DEPRECATED_VoiceMessageField from './DEPRECATED_VoiceMessageField'
import useVoiceMessageValidation from './hooks/useVoiceMessageValidation'

import css from './VoiceIntegrationIvr.less'

type Props = {
    integration: Maybe<PhoneIntegration>
}

export default function VoiceIntegrationIvr(props: Props): JSX.Element | null {
    const { integration } = props
    const dispatch = useAppDispatch()
    const [payload, setPayload] = useState<
        PhoneIntegrationIvrSettings | undefined
    >(integration?.meta?.ivr)
    const [initialSettings, setInitialSettings] = useState<
        PhoneIntegrationIvrSettings | undefined
    >(integration?.meta?.ivr)
    const [isLoading, setIsLoading] = useState(false)
    const { cleanUpIvrPayload } = useVoiceMessageValidation()

    useEffect(() => {
        if (!payload) {
            setPayload(integration?.meta?.ivr)
        }
    }, [integration, payload, setPayload])

    const isSubmittable = !_isEqual(
        cleanUpIvrPayload(payload),
        cleanUpIvrPayload(initialSettings),
    )

    const onSubmit = useCallback(
        async (event?: React.FormEvent) => {
            event?.preventDefault()

            setIsLoading(true)
            const payloadOrDefault = payload ?? {
                menu_options: [],
                greeting_message: DEFAULT_VOICE_MESSAGE,
            }
            try {
                await dispatch(updatePhoneIvrConfiguration(payloadOrDefault))
                setIsLoading(false)
                setInitialSettings(payloadOrDefault)
            } catch {
                setIsLoading(false)
            }
        },
        [payload, setIsLoading, dispatch, setInitialSettings],
    )

    if (!isPhoneIntegration(integration)) {
        return null
    }

    return (
        <Container fluid className={settingsCss.pageContainer}>
            <div className={css.greetingMessageInfo}>
                <h4 className={css.header}>Greeting message</h4>
                <p>
                    Callers will be informed of all IVR options through this
                    message, which must be updated if options change.
                </p>
            </div>

            <Row>
                <Col lg={8} xl={8}>
                    <Form onSubmit={onSubmit}>
                        <div className="mb-4">
                            <DEPRECATED_VoiceMessageField
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
                                horizontal={true}
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
                            isDisabled={isLoading || !isSubmittable}
                        >
                            Save changes
                        </Button>

                        <Button
                            onClick={() => setPayload(initialSettings)}
                            className="ml-2"
                            intent="secondary"
                        >
                            Cancel
                        </Button>
                    </Form>
                </Col>
            </Row>
            {isSubmittable && (
                <UnsavedChangesPrompt
                    onSave={() => onSubmit()}
                    when={isSubmittable}
                />
            )}
        </Container>
    )
}
