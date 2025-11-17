import { history } from '@repo/routing'
import { Route, Switch } from 'react-router-dom'
import { Col, Container } from 'reactstrap'

import type { EmailIntegration } from 'models/integration/types'
import settingsCss from 'pages/settings/settings.less'

import DEPRECATED_EmailDomainVerification from '../EmailDomainVerification/DEPRECATED_EmailDomainVerification'
import BackButton from './BackButton'
import EmailVerification from './EmailVerification'
import SingleSenderVerification from './SingleSenderVerification/SingleSenderVerification'

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
            <Switch>
                <Route exact path={baseURL}>
                    <Col lg={6} xl={7}>
                        <EmailVerification
                            integration={integration}
                            baseURL={baseURL}
                            loading={
                                loading?.integration || loading?.emailDomain
                            }
                        />
                    </Col>
                </Route>
                <Route exact path={`${baseURL}/domain`}>
                    <>
                        <BackButton baseURL={baseURL} />
                        <DEPRECATED_EmailDomainVerification
                            integration={integration}
                            onDeleteDomain={() => history.push(baseURL)}
                        />
                    </>
                </Route>
                <Route exact path={`${baseURL}/single-sender`}>
                    <Col lg={6} xl={7}>
                        <SingleSenderVerification
                            baseURL={baseURL}
                            integration={integration}
                        />
                    </Col>
                </Route>
            </Switch>
        </Container>
    )
}
