import React from 'react'
import {Link, useParams} from 'react-router-dom'
import {Breadcrumb, BreadcrumbItem} from 'reactstrap'

import {PhoneIntegration, IntegrationType} from 'models/integration/types'
import {getPhoneNumber} from 'state/entities/phoneNumbers/selectors'
import useAppSelector from 'hooks/useAppSelector'

type Props = {
    integration?: PhoneIntegration
}

export default function VoiceIntegrationBreadcrumbs({
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

    return (
        <Breadcrumb>
            <BreadcrumbItem>
                <Link to="/app/settings/integrations">Integrations</Link>
            </BreadcrumbItem>
            {integration && (
                <>
                    <BreadcrumbItem>
                        <Link
                            to={`/app/settings/integrations/${IntegrationType.Phone}/integrations`}
                        >
                            Voice
                        </Link>
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
                        <Link
                            to={`/app/settings/integrations/${IntegrationType.Phone}`}
                        >
                            Voice
                        </Link>
                    </BreadcrumbItem>
                    <BreadcrumbItem>Add Voice Integration</BreadcrumbItem>
                </>
            )}
            {!integration && integrationId !== 'new' && (
                <BreadcrumbItem>Voice</BreadcrumbItem>
            )}
        </Breadcrumb>
    )
}
