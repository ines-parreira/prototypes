import { useEffect, useMemo } from 'react'
import type { ReactNode } from 'react'

import {
    CopilotProvider as BaseCopilotProvider,
    useCopilot,
    useCopilotPanel,
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
import { useCopilotCacheInvalidation } from './useCopilotCacheInvalidation'

type Props = {
    children: ReactNode
}

export const COPILOT_CONVERSATION_ID_QUERY_PARAM = 'copilotConversationId'

export function CopilotProvider({ children }: Props) {
    const agent = useMemo(() => createCopilotAgent(), [])

    return (
        <BaseCopilotProvider
            agent={agent}
            accountDomain={window.GORGIAS_STATE?.currentAccount?.domain}
            showInternals={!!window.USER_IMPERSONATED}
            renderReference={renderReference}
            renderConfirmationPreview={renderConfirmationPreview}
            attachmentsConfig={copilotAttachmentsConfig}
            fetchShops={fetchCopilotShops}
        >
            <CopilotContextAttachmentProvider>
                <CopilotCacheInvalidator />
                <CopilotContextAttachmentSynchronizer />
                <ForcedCopilotConversationSynchronizer />
                <CopilotConversationStarters />
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

function ForcedCopilotConversationSynchronizer() {
    const [forcedConversationIdParam, setForcedConversationIdParam] =
        useSearchParam(COPILOT_CONVERSATION_ID_QUERY_PARAM)
    const forcedConversationId = forcedConversationIdParam?.trim() || undefined
    const { threadId, switchThread } = useCopilot()
    const { setIsOpen } = useCopilotPanel()

    useEffect(() => {
        if (!forcedConversationId) return

        if (forcedConversationId !== threadId) {
            switchThread(forcedConversationId)
        }

        setIsOpen(true)

        setForcedConversationIdParam(null)
    }, [
        forcedConversationId,
        setForcedConversationIdParam,
        setIsOpen,
        switchThread,
        threadId,
    ])

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
