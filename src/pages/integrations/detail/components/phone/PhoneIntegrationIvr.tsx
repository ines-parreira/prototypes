import React, {useCallback, useState, useEffect} from 'react'
import {Link} from 'react-router-dom'
import {fromJS} from 'immutable'

import {
    Breadcrumb,
    BreadcrumbItem,
    Button,
    Col,
    Container,
    Form,
    Row,
} from 'reactstrap'
import classnames from 'classnames'

import useAppDispatch from '../../../../../hooks/useAppDispatch'
import PageHeader from '../../../../common/components/PageHeader'
import {
    IntegrationType,
    PhoneIntegration,
    PhoneIntegrationIvrSettings,
    isPhoneIntegration,
} from '../../../../../models/integration/types'
import {DEFAULT_VOICE_MESSAGE} from '../../../../../models/integration/constants'

import {updatePhoneIvrConfiguration} from './actions'
import PhoneIntegrationNavigation from './PhoneIntegrationNavigation'
import IvrMenuActionsFieldArray from './IvrMenuActionsFieldArray'
import VoiceMessageField from './VoiceMessageField'

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
                                Phone
                            </Link>
                        </BreadcrumbItem>
                        <BreadcrumbItem>
                            {integration.meta.emoji} {integration.name}
                            <small className="text-muted ml-2">
                                {
                                    integration.meta.twilio
                                        ?.incoming_phone_number.friendly_name
                                }
                            </small>
                        </BreadcrumbItem>
                    </Breadcrumb>
                }
            />

            <PhoneIntegrationNavigation integration={fromJS(integration)} />
            <Container fluid className="page-container">
                <h4 className="mb-4">IVR Setup</h4>
                <h5 className="mb-3">Greeting message</h5>
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

export default PhoneIntegrationIvr
