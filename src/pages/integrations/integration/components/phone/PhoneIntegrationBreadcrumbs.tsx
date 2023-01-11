import React from 'react'
import {Link, useParams} from 'react-router-dom'
import {Breadcrumb, BreadcrumbItem} from 'reactstrap'

import {
    PhoneIntegration,
    IntegrationType,
    SmsIntegration,
    WhatsAppIntegration,
    isWhatsAppIntegration,
} from 'models/integration/types'
import {getPhoneNumber} from 'state/entities/phoneNumbers/selectors'
import useAppSelector from 'hooks/useAppSelector'
import {friendlyName} from 'pages/phoneNumbers/utils'

type Props = {
    type: IntegrationType.Phone | IntegrationType.Sms | IntegrationType.WhatsApp
    integration?: PhoneIntegration | SmsIntegration | WhatsAppIntegration
}

export default function PhoneIntegrationBreadcrumbs({
    type,
    integration,
}: Props): JSX.Element {
    const {integrationId} = useParams<{integrationId: string}>()
    const phoneNumber = useAppSelector((state) => {
        if (integration) {
            // TODO(@anddon): remove this once the new API for phone is available
            const phoneNumberId = isWhatsAppIntegration(integration)
                ? integration.meta.phone_number_id
                : integration.meta?.twilio_phone_number_id

            return getPhoneNumber(phoneNumberId)(state)
        }
        return null
    })

    const [name, baseUrl] = {
        [IntegrationType.Phone]: ['Voice', `/app/settings/channels/${type}`],
        [IntegrationType.Sms]: ['SMS', `/app/settings/channels/${type}`],
        [IntegrationType.WhatsApp]: [
            'WhatsApp',
            `/app/settings/integrations/${type}`,
        ],
    }[type]

    return (
        <Breadcrumb>
            {type === IntegrationType.WhatsApp && (
                <BreadcrumbItem>
                    <Link to={`/app/settings/integrations`}>All Apps</Link>
                </BreadcrumbItem>
            )}
            {integration && (
                <>
                    <BreadcrumbItem>
                        <Link to={`${baseUrl}/integrations`}>{name}</Link>
                    </BreadcrumbItem>
                    <BreadcrumbItem>
                        {integration.meta.emoji} {integration.name}
                        <small className="text-muted ml-2">
                            {phoneNumber && friendlyName(phoneNumber)}
                        </small>
                    </BreadcrumbItem>
                </>
            )}
            {!integration && integrationId === 'new' && (
                <>
                    <BreadcrumbItem>
                        <Link to={baseUrl}>{name}</Link>
                    </BreadcrumbItem>
                    <BreadcrumbItem>
                        {type === IntegrationType.WhatsApp
                            ? 'Connect WhatsApp'
                            : `Add ${name} Integration`}
                    </BreadcrumbItem>
                </>
            )}
            {!integration && integrationId !== 'new' && (
                <BreadcrumbItem>{name}</BreadcrumbItem>
            )}
        </Breadcrumb>
    )
}
