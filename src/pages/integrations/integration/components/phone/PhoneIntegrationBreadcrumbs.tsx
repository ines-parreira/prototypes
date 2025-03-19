import { LocationState } from 'history'
import { Link, matchPath, useLocation, useParams } from 'react-router-dom'
import { Breadcrumb, BreadcrumbItem } from 'reactstrap'

import useAppSelector from 'hooks/useAppSelector'
import {
    IntegrationType,
    PhoneIntegration,
    SmsIntegration,
    WhatsAppIntegration,
} from 'models/integration/types'
import { friendlyName } from 'pages/phoneNumbers/utils'
import { getNewPhoneNumber } from 'state/entities/phoneNumbers/selectors'

import VoiceQueueBreadcrumbs from './VoiceQueueBreadcrumbs'

type Props = {
    type: IntegrationType.Phone | IntegrationType.Sms | IntegrationType.WhatsApp
    integration?: PhoneIntegration | SmsIntegration | WhatsAppIntegration
}

export default function PhoneIntegrationBreadcrumbs({
    type,
    integration,
}: Props): JSX.Element {
    const { integrationId } = useParams<{ integrationId: string }>()
    const phoneNumber = useAppSelector((state) => {
        if (integration) {
            const phoneNumberId = integration.meta?.phone_number_id
            return getNewPhoneNumber(phoneNumberId)(state)
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

    const { pathname: path } = useLocation<LocationState>()
    const queuePathMatch = matchPath<{ queueId?: string }>(path, {
        path: `${baseUrl}/queues/:queueId`,
        exact: false,
        strict: false,
    })

    const queueId = queuePathMatch?.params.queueId

    return (
        <Breadcrumb>
            {type === IntegrationType.WhatsApp && (
                <BreadcrumbItem>
                    <Link to={`/app/settings/integrations`}>All apps</Link>
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
                            : `Add ${name} integration`}
                    </BreadcrumbItem>
                </>
            )}
            {type === IntegrationType.WhatsApp &&
                !integration &&
                integrationId === 'migration' && (
                    <>
                        <BreadcrumbItem>
                            <Link to={baseUrl}>{name}</Link>
                        </BreadcrumbItem>
                        <BreadcrumbItem>
                            Migrate From Another Provider
                        </BreadcrumbItem>
                    </>
                )}
            {!integration &&
                !queueId &&
                integrationId !== 'new' &&
                integrationId !== 'migration' && (
                    <BreadcrumbItem>{name}</BreadcrumbItem>
                )}
            {queueId && <VoiceQueueBreadcrumbs queueId={queueId} />}
        </Breadcrumb>
    )
}
