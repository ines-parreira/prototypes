import { useParams } from 'react-router-dom'

import useAppSelector from 'hooks/useAppSelector'
import { IntegrationType } from 'models/integration/constants'
import type { HttpIntegration } from 'models/integration/types'
import { getIntegrationByIdAndType } from 'state/integrations/selectors'

import {
    EVENTS_PATH,
    INTEGRATIONS_LIST_PATH,
    NEW_INTEGRATION_PATH,
} from './constants'

export function useRouteParser() {
    const { integrationId, extra, subId } = useParams<{
        integrationId: string
        extra: string
        subId: string
    }>()

    const isDetail = !integrationId
    const isList = integrationId === INTEGRATIONS_LIST_PATH
    const isIntegration = Boolean(integrationId) && !isList && !extra && !subId
    const isNewIntegration = integrationId === NEW_INTEGRATION_PATH
    const isEvents =
        !isList && !isNewIntegration && extra === EVENTS_PATH && !subId
    const isEvent =
        !isList && !isNewIntegration && extra === EVENTS_PATH && Boolean(subId)

    const integration = useAppSelector(
        getIntegrationByIdAndType<HttpIntegration>(
            parseInt(integrationId, 10),
            IntegrationType.Http,
        ),
    )

    return {
        isDetail,
        isList,
        isIntegration,
        isNewIntegration,
        isEvents,
        isEvent,
        integrationId,
        integration,
        eventId: subId,
    }
}
