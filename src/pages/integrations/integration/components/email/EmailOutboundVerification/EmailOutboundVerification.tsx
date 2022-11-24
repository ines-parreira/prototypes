import React from 'react'
import {Route, Switch} from 'react-router-dom'
import {Col, Container} from 'reactstrap'

import settingsCss from 'pages/settings/settings.less'
import Loader from 'pages/common/components/Loader/Loader'
import {EmailIntegration, isEmailIntegration} from 'models/integration/types'
import EmailVerification from './EmailVerification'
// import SingleSenderVerification from './SingleSenderVerification'

type Props = {
    integration: EmailIntegration
    loading: Record<string, boolean>
}

export default function EmailOutboundVerification({
    loading,
    integration,
}: Props) {
    const baseURL = `/app/settings/channels/email/${integration.id}/outbound`

    if (loading?.integration || loading?.emailDomain) {
        return <Loader />
    }

    if (!isEmailIntegration(integration)) return null

    return (
        <Container fluid className={settingsCss.pageContainer}>
            <Col lg={6} xl={7}>
                <Switch>
                    <Route exact path={baseURL}>
                        <EmailVerification
                            integration={integration}
                            baseURL={baseURL}
                        />
                    </Route>
                    {/* <Route exact path={`${baseURL}/single-sender`}>
                        <SingleSenderVerification baseURL={baseURL} />
                    </Route> */}
                </Switch>
            </Col>
        </Container>
    )
}
