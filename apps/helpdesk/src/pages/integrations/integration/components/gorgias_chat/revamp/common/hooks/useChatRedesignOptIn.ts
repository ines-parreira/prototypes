import useAppSelector from 'hooks/useAppSelector'
import { IntegrationType } from 'models/integration/constants'
import type { GorgiasChatIntegration } from 'models/integration/types'
import { getIntegrationByIdAndType } from 'state/integrations/selectors'

export const useChatRedesignOptIn = (chatIntegrationId: number | undefined) => {
    const integration = useAppSelector(
        getIntegrationByIdAndType<GorgiasChatIntegration>(
            chatIntegrationId ?? 0,
            IntegrationType.GorgiasChat,
        ),
    )

    const optInDatetime = integration?.meta?.chat_redesign_opt_in_datetime
    const isOptedIn = optInDatetime != null

    return { isOptedIn, optInDatetime }
}
