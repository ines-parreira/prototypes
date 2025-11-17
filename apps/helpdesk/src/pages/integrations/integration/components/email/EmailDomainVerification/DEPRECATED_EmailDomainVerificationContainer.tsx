import { Container } from 'reactstrap'

import settingsCss from 'pages/settings/settings.less'

import type { Props } from './DEPRECATED_EmailDomainVerification'
import DEPRECATED_EmailDomainVerification from './DEPRECATED_EmailDomainVerification'

/**
 * @deprecated
 * @date 2024-11-08
 * @type feature-component
 */
export default function DEPRECATED_EmailDomainVerificationContainer(
    props: Props,
) {
    return (
        <Container fluid className={settingsCss.pageContainer}>
            <DEPRECATED_EmailDomainVerification {...props} />
        </Container>
    )
}
