import {useParams} from 'react-router-dom'
import useAppSelector from 'hooks/useAppSelector'
import {getIntegrationById} from 'state/integrations/selectors'
import {ConvertRouteParams} from 'pages/convert/common/types'
import {CONVERT_ROUTE_PARAM_NAME} from 'pages/convert/common/constants'

export const useChatIntegration = () => {
    const {[CONVERT_ROUTE_PARAM_NAME]: integrationId} =
        useParams<ConvertRouteParams>()
    const chatIntegrationId = parseInt(integrationId || '')
    return useAppSelector(getIntegrationById(chatIntegrationId))
}
