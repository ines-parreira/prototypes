import React, {useCallback, useState} from 'react'
import {Link} from 'react-router-dom'
import {Map} from 'immutable'
import {
    Alert,
    Breadcrumb,
    BreadcrumbItem,
    Button,
    Col,
    Container,
    Form,
    Row,
} from 'reactstrap'

import PageHeader from '../../../../common/components/PageHeader'
import {IntegrationType} from '../../../../../models/integration/types'

import PhoneIntegrationNavigation from './PhoneIntegrationNavigation'

type Props = {
    integration: Map<string, any>
    actions: {
        updateOrCreateIntegration: (
            integration: Map<string, any>
        ) => Promise<void>
    }
}

export default function PhoneIntegrationVoicemail({
    integration,
}: Props): JSX.Element {
    const [isLoading /*, setIsLoading*/] = useState(false)
    const [error /*, setError*/] = useState<Error | null>(null)

    const onSubmit = useCallback((event: React.FormEvent) => {
        event.preventDefault()
        alert('TODO')
    }, [])

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
                                to={`/app/settings/integrations/${IntegrationType.PhoneIntegrationType}`}
                            >
                                Phone
                            </Link>
                        </BreadcrumbItem>
                        <BreadcrumbItem>
                            {integration.getIn(['meta', 'emoji'])}{' '}
                            {integration.get('name')}
                            <small className="text-muted ml-2">
                                {integration.getIn([
                                    'meta',
                                    'twilio',
                                    'incoming_phone_number',
                                    'friendly_name',
                                ])}
                            </small>
                        </BreadcrumbItem>
                        <BreadcrumbItem active>Voicemail</BreadcrumbItem>
                    </Breadcrumb>
                }
            />

            <PhoneIntegrationNavigation integration={integration} />

            <Container fluid className="page-container">
                <Row>
                    <Col lg={6} xl={4}>
                        <Form onSubmit={onSubmit}>
                            {!!error && (
                                <Alert color="danger">{error.toString()}</Alert>
                            )}
                            <p>
                                {/*TODO(@samy): voicemail form*/}
                                TODO - WIP
                            </p>
                            <Button
                                type="submit"
                                color="success"
                                className="mt-3"
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
