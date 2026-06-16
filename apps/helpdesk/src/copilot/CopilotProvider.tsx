import { useMemo } from 'react'
import type { ReactNode } from 'react'

import {
    CopilotProvider as BaseCopilotProvider,
    useCopilot,
    useRunLifecycle,
    useThreadLifecycle,
} from '@gorgias/copilot'
import type {
    RenderConfirmationPreview,
    RenderCopilotReference,
} from '@gorgias/copilot'

import '@gorgias/copilot/copilot.css'

import { copilotAttachmentsConfig } from 'common/copilot/copilotAttachmentsConfig'

import { useSearchParam } from 'hooks/useSearchParam'

import { createCopilotAgent, fetchCopilotShops } from 'utils/sdk'

import { GuidanceConfirmationPreview } from './confirmation/GuidanceConfirmationPreview'
import { SkillConfirmationPreview } from './confirmation/SkillConfirmationPreview'
import { CopilotContextAttachmentProvider } from './contextAttachments/CopilotContextAttachmentProvider'
import { useCopilotContextAttachmentSync } from './contextAttachments/useCopilotContextAttachmentSync'
import { CopilotConversationStarters } from './CopilotConversationStarters'
import { ReferenceLink } from './reference/ReferenceLink'
import { CopilotTracking } from './tracking/CopilotTracking'
import { CopilotUiActionsProvider } from './uiActions/CopilotUiActionsProvider'
import { useCopilotCacheInvalidation } from './useCopilotCacheInvalidation'

export const GAIA_CONVERSATION_ID_QUERY_PARAM = 'gaia_conv_id'

type Props = {
    children: ReactNode
}

export function CopilotProvider({ children }: Props) {
    const agent = useMemo(() => createCopilotAgent(), [])
    const [conversationThreadId] = useSearchParam(
        GAIA_CONVERSATION_ID_QUERY_PARAM,
    )

    return (
        <BaseCopilotProvider
            agent={agent}
            accountDomain={window.GORGIAS_STATE?.currentAccount?.domain}
            showInternals={!!window.USER_IMPERSONATED}
            renderReference={renderReference}
            renderConfirmationPreview={renderConfirmationPreview}
            attachmentsConfig={copilotAttachmentsConfig}
            fetchShops={fetchCopilotShops}
            initialThreadId={conversationThreadId ?? undefined}
            conversationLinkParam={GAIA_CONVERSATION_ID_QUERY_PARAM}
        >
            <CopilotContextAttachmentProvider>
                <CopilotCacheInvalidator />
                <CopilotUiActionsProvider />
                <CopilotContextAttachmentSynchronizer />
                <CopilotConversationUrlSynchronizer />
                <CopilotConversationStarters />
                <CopilotTracking />
                {children}
            </CopilotContextAttachmentProvider>
        </BaseCopilotProvider>
    )
}

function CopilotCacheInvalidator() {
    useCopilotCacheInvalidation()
    return null
}

function CopilotContextAttachmentSynchronizer() {
    useCopilotContextAttachmentSync()
    return null
}

function CopilotConversationUrlSynchronizer() {
    const { threadId } = useCopilot()
    const [, setConversationThreadId] = useSearchParam(
        GAIA_CONVERSATION_ID_QUERY_PARAM,
    )

    useRunLifecycle(
        {
            onStart: (info) => {
                if (info.userMessage) {
                    setConversationThreadId(info.threadId)
                }
            },
        },
        threadId,
    )

    useThreadLifecycle({
        onThreadCreated: () => {
            setConversationThreadId(null)
        },
        onThreadSwitched: (info) => {
            setConversationThreadId(info.toThreadId)
        },
    })

    return null
}

const renderReference: RenderCopilotReference = ({ reference, children }) => (
    <ReferenceLink reference={reference}>{children}</ReferenceLink>
)

const renderConfirmationPreview: RenderConfirmationPreview = ({
    payload,
    ...actions
}) => {
    switch (payload.type) {
        case 'guidance':
            return (
                <GuidanceConfirmationPreview payload={payload} {...actions} />
            )
        case 'skill':
            return <SkillConfirmationPreview payload={payload} {...actions} />
        default:
            return null
    }
}
