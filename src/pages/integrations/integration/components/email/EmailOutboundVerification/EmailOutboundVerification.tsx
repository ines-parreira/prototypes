import React from 'react'
import {Route, Switch} from 'react-router-dom'
import {Col, Container} from 'reactstrap'
import settingsCss from 'pages/settings/settings.less'
import {EmailIntegration} from 'models/integration/types'
import history from 'pages/history'
import EmailDomainVerification from '../EmailDomainVerification/EmailDomainVerification'
import EmailVerification from './EmailVerification'
import SingleSenderVerification from './SingleSenderVerification/SingleSenderVerification'
import BackButton from './BackButton'

type Props = {
    integration: EmailIntegration
    loading: Record<string, boolean>
}

export default function EmailOutboundVerification({
    loading,
    integration,
}: Props) {
    const baseURL = `/app/settings/channels/email/${integration.id}/outbound-verification`

    return (
        <Container fluid className={settingsCss.pageContainer}>
            <Col lg={6} xl={7}>
                <Switch>
                    <Route exact path={baseURL}>
                        <EmailVerification
                            integration={integration}
                            baseURL={baseURL}
                            loading={
                                loading?.integration || loading?.emailDomain
                            }
                        />
                    </Route>
                    <Route exact path={`${baseURL}/domain`}>
                        <>
                            <BackButton baseURL={baseURL} />
                            <EmailDomainVerification
                                integration={integration}
                                onDeleteDomain={() => history.push(baseURL)}
                            />
                        </>
                    </Route>
                    <Route exact path={`${baseURL}/single-sender`}>
                        <SingleSenderVerification
                            baseURL={baseURL}
                            integration={integration}
                        />
                    </Route>
                </Switch>
            </Col>
        </Container>
    )
}
