import React from 'react'
import {Container} from 'reactstrap'
import settingsCss from 'pages/settings/settings.less'
import EmailDomainVerification, {Props} from './EmailDomainVerification'

export default function EmailDomainVerificationContainer(props: Props) {
    return (
        <Container fluid className={settingsCss.pageContainer}>
            <EmailDomainVerification {...props} />
        </Container>
    )
}
