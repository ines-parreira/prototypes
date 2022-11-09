import React from 'react'
import {Link, useParams} from 'react-router-dom'
import {Breadcrumb, BreadcrumbItem} from 'reactstrap'

import {
    PhoneIntegration,
    IntegrationType,
    SmsIntegration,
} from 'models/integration/types'
import {getPhoneNumber} from 'state/entities/phoneNumbers/selectors'
import useAppSelector from 'hooks/useAppSelector'

type Props = {
    type: IntegrationType.Phone | IntegrationType.Sms
    integration?: PhoneIntegration | SmsIntegration
}

export default function PhoneIntegrationBreadcrumbs({
    type,
    integration,
}: Props): JSX.Element {
    const {integrationId} = useParams<{integrationId: string}>()
    const phoneNumber = useAppSelector((state) => {
        if (integration) {
            return getPhoneNumber(integration?.meta.twilio_phone_number_id)(
                state
            )
        }
        return null
    })
    const baseUrl = `/app/settings/channels/${type}`
    const name = type === IntegrationType.Sms ? 'SMS' : 'Voice'
    return (
        <Breadcrumb>
            {integration && (
                <>
                    <BreadcrumbItem>
                        <Link to={`${baseUrl}/integrations`}>{name}</Link>
                    </BreadcrumbItem>
                    <BreadcrumbItem>
                        {integration.meta.emoji} {integration.name}
                        <small className="text-muted ml-2">
                            {phoneNumber?.meta.friendly_name}
                        </small>
                    </BreadcrumbItem>
                </>
            )}
            {!integration && integrationId === 'new' && (
                <>
                    <BreadcrumbItem>
                        <Link to={baseUrl}>{name}</Link>
                    </BreadcrumbItem>
                    <BreadcrumbItem>Add {name} Integration</BreadcrumbItem>
                </>
            )}
            {!integration && integrationId !== 'new' && (
                <BreadcrumbItem>{name}</BreadcrumbItem>
            )}
        </Breadcrumb>
    )
}
