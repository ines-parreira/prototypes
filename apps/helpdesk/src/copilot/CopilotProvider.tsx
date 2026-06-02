import { useMemo } from 'react'
import type { ReactNode } from 'react'

import { CopilotProvider as BaseCopilotProvider } from '@gorgias/copilot'
import type { RenderCopilotReference } from '@gorgias/copilot'

import '@gorgias/copilot/copilot.css'

import { copilotAttachmentsConfig } from 'common/copilot/copilotAttachmentsConfig'

import { createCopilotAgent, fetchCopilotShops } from 'utils/sdk'

import { CopilotConversationStarters } from './CopilotConversationStarters'
import { ReferenceLink } from './reference/ReferenceLink'
import { useCopilotCacheInvalidation } from './useCopilotCacheInvalidation'

type Props = {
    children: ReactNode
}

export function CopilotProvider({ children }: Props) {
    const agent = useMemo(() => createCopilotAgent(), [])

    return (
        <BaseCopilotProvider
            agent={agent}
            accountDomain={window.GORGIAS_STATE?.currentAccount?.domain}
            showInternals={!!window.USER_IMPERSONATED}
            renderReference={renderReference}
            attachmentsConfig={copilotAttachmentsConfig}
            fetchShops={fetchCopilotShops}
        >
            <CopilotCacheInvalidator />
            <CopilotConversationStarters />
            {children}
        </BaseCopilotProvider>
    )
}

function CopilotCacheInvalidator() {
    useCopilotCacheInvalidation()
    return null
}

const renderReference: RenderCopilotReference = ({ reference, children }) => (
    <ReferenceLink reference={reference}>{children}</ReferenceLink>
)
