import type { ReactNode } from 'react'
import { useMemo } from 'react'

import type { Map } from 'immutable'

import { IntegrationType } from 'models/integration/types'
import { ChatRedesignOptInBanner } from 'pages/integrations/integration/components/gorgias_chat/revamp/common/components/ChatRedesignOptInBanner/ChatRedesignOptInBanner'
import { ChatSettingsPageHeader } from 'pages/integrations/integration/components/gorgias_chat/revamp/common/components/ChatSettingsPageHeader/ChatSettingsPageHeader'

import { GorgiasChatRevampNavigation } from './GorgiasChatRevampNavigation'

type Props = {
    integration: Map<any, any>
    onSave?: () => void
    isSaveDisabled?: boolean
    isSaving?: boolean
    isDirty?: boolean
    onSaveChanges?: () => Promise<unknown> | void
    onDiscardChanges?: () => void
    children: ReactNode
}

export const GorgiasChatRevampLayout = ({
    integration,
    onSave,
    isSaveDisabled,
    isSaving,
    isDirty,
    onSaveChanges,
    onDiscardChanges,
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
                onSave={onSave}
                isSaveDisabled={isSaveDisabled}
                isSaveLoading={isSaving}
            />
            <GorgiasChatRevampNavigation integration={integration} />
            <ChatRedesignOptInBanner
                integration={integration}
                isDirty={isDirty}
                onSaveChanges={onSaveChanges}
                onDiscardChanges={onDiscardChanges}
            />
            {children}
        </div>
    )
}
