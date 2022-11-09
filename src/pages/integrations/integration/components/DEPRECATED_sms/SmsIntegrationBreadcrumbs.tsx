import React from 'react'
import {Link} from 'react-router-dom'
import {Breadcrumb, BreadcrumbItem} from 'reactstrap'

import {SmsIntegration, IntegrationType} from 'models/integration/types'
import {getPhoneNumber} from 'state/entities/phoneNumbers/selectors'
import useAppSelector from 'hooks/useAppSelector'

type Props = {
    integration: SmsIntegration
}

const SmsIntegrationBreadcrumbs = ({integration}: Props): JSX.Element => {
    const phoneNumber = useAppSelector(
        getPhoneNumber(integration.meta.twilio_phone_number_id)
    )
    return (
        <Breadcrumb>
            <BreadcrumbItem>
                <Link to={`/app/settings/channels/${IntegrationType.Sms}`}>
                    SMS
                </Link>
            </BreadcrumbItem>
            <BreadcrumbItem>
                {integration.meta.emoji} {integration.name}
                <small className="text-muted ml-2">
                    {phoneNumber?.meta.friendly_name}
                </small>
            </BreadcrumbItem>
        </Breadcrumb>
    )
}

export default SmsIntegrationBreadcrumbs
