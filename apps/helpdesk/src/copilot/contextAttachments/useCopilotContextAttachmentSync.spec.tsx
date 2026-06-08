import { assumeMock, render } from '@repo/testing'
import { waitFor } from '@testing-library/react'

import type { ContextAttachment } from '@gorgias/copilot'
import { useCopilotPanel, useMessageContextAttachments } from '@gorgias/copilot'

import {
    CopilotContextAttachmentProvider,
    useRegisterCopilotContextAttachment,
} from './CopilotContextAttachmentProvider'
import { useCopilotContextAttachmentSync } from './useCopilotContextAttachmentSync'

const mockUseCopilotPanel = assumeMock(useCopilotPanel)
const mockUseMessageContextAttachments = assumeMock(
    useMessageContextAttachments,
)
const setMessageAttachment = jest.fn()
const clearMessageAttachment = jest.fn()

const ticketAttachment: ContextAttachment = {
    kind: 'ticket',
    id: '123',
    title: 'Ticket #123',
}

const skillAttachment: ContextAttachment = {
    kind: 'skill',
    id: '456',
    title: 'Skill B',
    helpCenterId: '789',
}

describe('useCopilotContextAttachmentSync', () => {
    beforeEach(() => {
        setMessageAttachment.mockClear()
        clearMessageAttachment.mockClear()
        mockUseCopilotPanel.mockReturnValue({
            isOpen: false,
            setIsOpen: jest.fn(),
            width: 400,
            setWidth: jest.fn(),
        })
        mockUseMessageContextAttachments.mockReturnValue({
            messageAttachment: undefined,
            canAttach: true,
            setMessageAttachment,
            clearMessageAttachment,
        })
    })

    it('pins the current context attachment when the copilot panel opens', async () => {
        const { rerender } = render(
            renderComponent({ contextAttachment: ticketAttachment }),
        )

        expect(setMessageAttachment).not.toHaveBeenCalled()

        mockUseCopilotPanel.mockReturnValue({
            isOpen: true,
            setIsOpen: jest.fn(),
            width: 400,
            setWidth: jest.fn(),
        })
        rerender(renderComponent({ contextAttachment: ticketAttachment }))

        await waitFor(() => {
            expect(setMessageAttachment).toHaveBeenCalledWith(ticketAttachment)
        })
    })

    it('does not pin when context attachments are not accepted', () => {
        mockUseCopilotPanel.mockReturnValue({
            isOpen: true,
            setIsOpen: jest.fn(),
            width: 400,
            setWidth: jest.fn(),
        })
        mockUseMessageContextAttachments.mockReturnValue({
            messageAttachment: undefined,
            canAttach: false,
            setMessageAttachment,
            clearMessageAttachment,
        })

        render(renderComponent({ contextAttachment: ticketAttachment }))

        expect(setMessageAttachment).not.toHaveBeenCalled()
    })

    it('updates the pinned attachment when the context changes while copilot is open', async () => {
        mockUseCopilotPanel.mockReturnValue({
            isOpen: true,
            setIsOpen: jest.fn(),
            width: 400,
            setWidth: jest.fn(),
        })

        const { rerender } = render(
            renderComponent({ contextAttachment: ticketAttachment }),
        )

        await waitFor(() => {
            expect(setMessageAttachment).toHaveBeenLastCalledWith(
                ticketAttachment,
            )
        })

        setMessageAttachment.mockClear()
        rerender(renderComponent({ contextAttachment: skillAttachment }))

        await waitFor(() => {
            expect(setMessageAttachment).toHaveBeenLastCalledWith(
                skillAttachment,
            )
        })
    })

    it('clears the pinned attachment when open copilot loses page context', async () => {
        mockUseCopilotPanel.mockReturnValue({
            isOpen: true,
            setIsOpen: jest.fn(),
            width: 400,
            setWidth: jest.fn(),
        })

        const { rerender } = render(
            renderComponent({ contextAttachment: ticketAttachment }),
        )

        await waitFor(() => {
            expect(setMessageAttachment).toHaveBeenLastCalledWith(
                ticketAttachment,
            )
        })

        setMessageAttachment.mockClear()
        clearMessageAttachment.mockClear()
        rerender(renderComponent())

        await waitFor(() => {
            expect(clearMessageAttachment).toHaveBeenCalledTimes(1)
        })
        expect(setMessageAttachment).not.toHaveBeenCalled()
    })
})

function renderComponent({
    contextAttachment,
}: {
    contextAttachment?: ContextAttachment
} = {}) {
    return (
        <CopilotContextAttachmentProvider>
            <ContextAttachmentRegistration attachment={contextAttachment} />
            <CopilotContextAttachmentSynchronizer />
        </CopilotContextAttachmentProvider>
    )
}

function ContextAttachmentRegistration({
    attachment,
}: {
    attachment: ContextAttachment | undefined
}) {
    useRegisterCopilotContextAttachment(attachment)
    return null
}

function CopilotContextAttachmentSynchronizer() {
    useCopilotContextAttachmentSync()
    return null
}
