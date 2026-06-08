import type { ReactNode } from 'react'

import { renderHook } from '@repo/testing'

import type { ContextAttachment } from '@gorgias/copilot'

import {
    CopilotContextAttachmentProvider,
    useCopilotContextAttachmentCandidate,
    useRegisterCopilotContextAttachment,
} from './CopilotContextAttachmentProvider'

const ticketAttachment: ContextAttachment = {
    kind: 'ticket',
    id: '123',
    title: 'Ticket #123',
}

const guidanceAttachment: ContextAttachment = {
    kind: 'guidance',
    id: '7',
    title: 'Shipping guidance',
    helpCenterId: '55',
}

type AttachmentHookProps = {
    attachment: ContextAttachment | undefined
}

const wrapper = ({ children }: { children: ReactNode }) => (
    <CopilotContextAttachmentProvider>
        {children}
    </CopilotContextAttachmentProvider>
)

describe('CopilotContextAttachmentProvider', () => {
    it('registers the current attachment candidate', () => {
        const { result } = renderHook<
            AttachmentHookProps,
            ContextAttachment | undefined
        >(
            ({ attachment }) => {
                useRegisterCopilotContextAttachment(attachment)
                return useCopilotContextAttachmentCandidate()
            },
            {
                wrapper,
                initialProps: { attachment: ticketAttachment },
            },
        )

        expect(result.current).toBe(ticketAttachment)
    })

    it('updates the current attachment candidate when registration changes', () => {
        const { result, rerender } = renderHook<
            AttachmentHookProps,
            ContextAttachment | undefined
        >(
            ({ attachment }) => {
                useRegisterCopilotContextAttachment(attachment)
                return useCopilotContextAttachmentCandidate()
            },
            {
                wrapper,
                initialProps: { attachment: ticketAttachment },
            },
        )

        rerender({ attachment: guidanceAttachment })

        expect(result.current).toBe(guidanceAttachment)
    })

    it('falls back to the previous stack entry when the latest registration is removed', () => {
        const { result, rerender } = renderHook(
            ({ showGuidance }: { showGuidance: boolean }) => {
                useRegisterCopilotContextAttachment(ticketAttachment)
                useRegisterCopilotContextAttachment(
                    showGuidance ? guidanceAttachment : undefined,
                )

                return useCopilotContextAttachmentCandidate()
            },
            {
                wrapper,
                initialProps: { showGuidance: true },
            },
        )

        expect(result.current).toBe(guidanceAttachment)

        rerender({ showGuidance: false })

        expect(result.current).toBe(ticketAttachment)
    })
})
