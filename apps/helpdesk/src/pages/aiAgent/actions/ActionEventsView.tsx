import classnames from 'classnames'
import { useParams } from 'react-router-dom'

import { useGetWorkflowConfiguration } from 'models/workflows/queries'
import { AiAgentLayout } from 'pages/aiAgent/components/AiAgentLayout/AiAgentLayout'
import { useActionsLabel } from 'pages/aiAgent/hooks/useActionsLabel'

import ActionEventsContent from './ActionEventsContent'

import css from './ActionEventsView.less'

export default function ActionExecutionsView() {
    const actionsLabel = useActionsLabel()
    const { shopName, id: configurationId } = useParams<{
        id: string
        shopName: string
    }>()
    const { isFetching } = useGetWorkflowConfiguration(configurationId)

    return (
        <AiAgentLayout
            isLoading={isFetching}
            shopName={shopName}
            className={classnames(css.container, css.actionLogsView)}
            title={actionsLabel}
        >
            <ActionEventsContent />
        </AiAgentLayout>
    )
}
