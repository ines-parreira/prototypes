import React from 'react'
import {Container} from 'reactstrap'

import settingsCss from 'pages/settings/settings.less'

import DEPRECATED_EmailDomainVerification, {
    Props,
} from './DEPRECATED_EmailDomainVerification'

export default function DEPRECATED_EmailDomainVerificationContainer(
    props: Props
) {
    return (
        <Container fluid className={settingsCss.pageContainer}>
            <DEPRECATED_EmailDomainVerification {...props} />
        </Container>
    )
}
