import { Link } from 'react-router-dom'
import { Breadcrumb, BreadcrumbItem } from 'reactstrap'

import { EmailIntegration } from '@gorgias/api-queries'

import css from './EmailIntegrationOnboardingBreadcrumbs.less'

type Props = {
    integration: EmailIntegration | null | undefined
}

export default function EmailIntegrationOnboardingBreadcrumbs({
    integration,
}: Props) {
    return (
        <Breadcrumb>
            <BreadcrumbItem>
                <Link to="/app/settings/channels/email">Email</Link>
            </BreadcrumbItem>
            <BreadcrumbItem>
                <Link to="/app/settings/channels/email/new">
                    Add email address
                </Link>
            </BreadcrumbItem>
            <BreadcrumbItem active>
                {integration ? (
                    <div className={css.breadcrumbInfo}>
                        {integration.name}
                        <span className={css.emailAddress}>
                            {integration.meta.address}
                        </span>
                    </div>
                ) : (
                    'Connect other email provider'
                )}
            </BreadcrumbItem>
        </Breadcrumb>
    )
}
