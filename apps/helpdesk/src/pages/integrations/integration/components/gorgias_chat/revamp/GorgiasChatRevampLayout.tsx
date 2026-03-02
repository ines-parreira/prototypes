import type { ReactNode } from 'react'
import { useMemo } from 'react'

import type { Map } from 'immutable'

import { IntegrationType } from 'models/integration/types'
import ChatSettingsPageHeader from 'pages/integrations/integration/components/gorgias_chat/revamp/components/ChatSettingsPageHeader/ChatSettingsPageHeader'

import { GorgiasChatRevampNavigation } from './GorgiasChatRevampNavigation'

type Props = {
    integration: Map<any, any>
    onSave?: () => void
    isSaveDisabled?: boolean
    isSaving?: boolean
    children: ReactNode
}

export const GorgiasChatRevampLayout = ({
    integration,
    onSave,
    isSaveDisabled,
    isSaving,
    children,
}: Props) => {
    const chatIntegrationsLink = `/app/settings/channels/${IntegrationType.GorgiasChat}`

    const breadcrumbItems = useMemo(
        () => [
            {
                link: chatIntegrationsLink,
                label: 'All chats',
                id: '1',
            },
            {
                label: integration.get('name') as string,
                id: '2',
            },
        ],
        [integration, chatIntegrationsLink],
    )

    return (
        <div className="full-width">
            <ChatSettingsPageHeader
                breadcrumbItems={breadcrumbItems}
                backButtonLink={chatIntegrationsLink}
                title="Settings"
                onSave={onSave ?? (() => {})}
                isSaveDisabled={isSaveDisabled}
                isSaveLoading={isSaving}
            />
            <GorgiasChatRevampNavigation integration={integration} />
            {children}
        </div>
    )
}
