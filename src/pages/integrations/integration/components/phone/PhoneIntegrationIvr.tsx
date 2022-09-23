import React, {useCallback, useState, useEffect} from 'react'
import {fromJS} from 'immutable'
import {Col, Container, Form, Row} from 'reactstrap'

import {
    PhoneIntegration,
    PhoneIntegrationIvrSettings,
    isPhoneIntegration,
} from 'models/integration/types'
import useAppDispatch from 'hooks/useAppDispatch'
import PageHeader from 'pages/common/components/PageHeader'
import Button from 'pages/common/components/button/Button'
import {
    DEFAULT_VOICE_MESSAGE,
    IntegrationType,
} from 'models/integration/constants'
import {updatePhoneIvrConfiguration} from 'pages/integrations/integration/components/phone/actions'
import PhoneIntegrationNavigation from 'pages/integrations/integration/components/phone/PhoneIntegrationNavigation'
import PhoneIntegrationBreadcrumbs from 'pages/integrations/integration/components/phone/PhoneIntegrationBreadcrumbs'
import VoiceMessageField from 'pages/integrations/integration/components/phone/VoiceMessageField'
import IvrMenuActionsFieldArray from 'pages/integrations/integration/components/phone/IvrMenuActionsFieldArray'

import settingsCss from 'pages/settings/settings.less'

type Props = {
    integration: Maybe<PhoneIntegration>
}

const PhoneIntegrationIvr = (props: Props): JSX.Element | null => {
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
        <div className="full-width">
            <PageHeader
                title={
                    <PhoneIntegrationBreadcrumbs
                        type={IntegrationType.Phone}
                        integration={integration}
                    />
                }
            />

            <PhoneIntegrationNavigation integration={fromJS(integration)} />
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
        </div>
    )
}

export default PhoneIntegrationIvr
