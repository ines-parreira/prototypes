import { Link } from 'react-router-dom'
import { Breadcrumb, BreadcrumbItem } from 'reactstrap'

import { EmailIntegration } from '@gorgias/helpdesk-queries'

import css from 'pages/integrations/integration/components/email/CustomerOnboarding/EmailIntegrationOnboardingBreadcrumbs.less'

type Props = {
    integration: EmailIntegration | null | undefined
    isForcedEmailOnboarding: boolean
}

export default function EmailIntegrationOnboardingBreadcrumbs({
    integration,
    isForcedEmailOnboarding,
}: Props) {
    return (
        <Breadcrumb>
            <BreadcrumbItem>
                <Link to="/app/settings/channels/email">Email</Link>
            </BreadcrumbItem>
            {!isForcedEmailOnboarding && (
                <BreadcrumbItem>
                    <Link to="/app/settings/channels/email/new">
                        Add email address
                    </Link>
                </BreadcrumbItem>
            )}
            <BreadcrumbItem active>
                {integration ? (
                    <div className={css.breadcrumbInfo}>
                        {integration.name}
                        <span className={css.emailAddress}>
                            {integration.meta.address}
                        </span>
                    </div>
                ) : (
                    'Add new email'
                )}
            </BreadcrumbItem>
        </Breadcrumb>
    )
}
