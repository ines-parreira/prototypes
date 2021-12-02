import React from 'react'
import {Link} from 'react-router-dom'
import {Breadcrumb, BreadcrumbItem} from 'reactstrap'

import {
    PhoneIntegration,
    IntegrationType,
} from '../../../../../models/integration/types'

type Props = {
    integration: PhoneIntegration
}

const PhoneIntegrationBreadcrumbs = ({integration}: Props): JSX.Element => {
    return (
        <Breadcrumb>
            <BreadcrumbItem>
                <Link to="/app/settings/integrations">Integrations</Link>
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
                        integration.meta.twilio?.incoming_phone_number
                            .friendly_name
                    }
                </small>
            </BreadcrumbItem>
        </Breadcrumb>
    )
}

export default PhoneIntegrationBreadcrumbs
