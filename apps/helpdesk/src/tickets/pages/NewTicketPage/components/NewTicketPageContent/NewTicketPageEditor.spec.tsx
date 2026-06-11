import type { ComponentProps, ReactNode } from 'react'
import React from 'react'

import { render } from '@repo/testing'
import { screen } from '@testing-library/react'

import { useWhatsAppEditor } from 'pages/integrations/integration/components/whatsapp/useWhatsAppEditor'

import { NewTicketPageEditor } from './NewTicketPageEditor'

jest.mock(
    'pages/integrations/integration/components/whatsapp/useWhatsAppEditor',
    () => ({ useWhatsAppEditor: jest.fn() }),
)

jest.mock('hooks/aiAgent/useAiAgentAccess', () => ({
    useAiAgentAccess: jest.fn(() => ({ hasAccess: true })),
}))

jest.mock('pages/common/editor/hooks/useForm', () => ({
    useForm: jest.fn((submit) => ({
        formRef: { current: null },
        onSubmit: submit,
    })),
}))

jest.mock('pages/common/editor/hooks/useInitialMacroFilters', () => ({
    useInitialMacroFilters: jest.fn(() => ({ languages: [], tags: [] })),
}))

jest.mock('pages/common/editor/hooks/useMacros', () => ({
    useMacros: jest.fn(() => ({
        hasShown: false,
        filters: { languages: [], tags: [] },
        isActive: false,
        query: '',
        onChangeActive: jest.fn(),
        onChangeFilters: jest.fn(),
        onChangeQuery: jest.fn(),
    })),
}))

jest.mock('pages/common/editor/hooks/useMacrosSearch', () => ({
    useMacrosSearch: jest.fn(() => ({
        data: [],
        fetchNextPage: jest.fn(),
        isLoading: false,
        nextCursor: null,
    })),
}))

jest.mock('pages/common/editor/components/EditorContainer', () => ({
    EditorContainer: ({
        children,
        className,
    }: {
        children: ReactNode
        className?: string
    }) => (
        <section className={className} data-testid="editor-container">
            {children}
        </section>
    ),
}))

jest.mock('pages/common/editor/components/EditorForm', () => ({
    EditorForm: React.forwardRef<
        HTMLFormElement,
        { children: ReactNode; onSubmit: () => void }
    >(({ children, onSubmit }, ref) => (
        <form ref={ref} onSubmit={onSubmit}>
            {children}
        </form>
    )),
}))

jest.mock('pages/common/editor/components/EditorReplyChannelContainer', () => ({
    EditorReplyChannelContainer: ({ children }: { children: ReactNode }) => (
        <div data-testid="reply-channel-container">{children}</div>
    ),
}))

jest.mock('pages/tickets/detail/components/ReplyArea/ChannelSelect', () => ({
    ChannelSelect: jest.fn(() => <div>ChannelSelect</div>),
}))

jest.mock(
    'pages/tickets/detail/components/ReplyArea/MessageSourceFields/MessageSourceFields',
    () => ({
        MessageSourceFields: jest.fn(() => <div>MessageSourceFields</div>),
    }),
)

jest.mock('pages/tickets/detail/components/ReplyArea/TicketReplyArea', () => ({
    TicketReplyAreaWithStandaloneAiContext: jest.fn(() => (
        <div>TicketReplyArea</div>
    )),
}))

jest.mock('pages/tickets/detail/components/ReplyForm', () => ({
    ReplyForm: jest.fn(({ children }) => (
        <div data-testid="reply-form">{children}</div>
    )),
}))

jest.mock(
    'pages/tickets/detail/components/ReplyArea/WhatsAppTemplateReplyArea',
    () => ({
        WhatsAppMessageTemplateReplyArea: jest.fn(() => (
            <div>WhatsAppMessageTemplateReplyArea</div>
        )),
    }),
)

jest.mock(
    'tickets/pages/NewTicketPage/components/NewTicketSubmitButtons',
    () => ({
        NewTicketSubmitButtons: jest.fn(() => (
            <div>NewTicketSubmitButtons</div>
        )),
    }),
)

const useWhatsAppEditorSpy = useWhatsAppEditor as jest.Mock
const mockTicketReplyArea = jest.mocked(
    jest.requireMock(
        'pages/tickets/detail/components/ReplyArea/TicketReplyArea',
    ).TicketReplyAreaWithStandaloneAiContext,
)
const mockUseMacrosSearch = jest.mocked(
    jest.requireMock('pages/common/editor/hooks/useMacrosSearch')
        .useMacrosSearch,
)

const renderComponent = (
    props: Partial<ComponentProps<typeof NewTicketPageEditor>> = {},
) => {
    const defaultProps: ComponentProps<typeof NewTicketPageEditor> = {
        submit: jest.fn(),
        subject: 'New ticket subject',
        onRecipientsChange: jest.fn(),
    }

    return render(<NewTicketPageEditor {...defaultProps} {...props} />)
}

describe('NewTicketPageEditor', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        useWhatsAppEditorSpy.mockReturnValue({
            showWhatsAppTemplateEditor: false,
        })
    })

    it('renders the regular ticket reply area by default', () => {
        renderComponent()

        expect(screen.getByText('TicketReplyArea')).toBeInTheDocument()
        expect(
            screen.queryByText('WhatsAppMessageTemplateReplyArea'),
        ).not.toBeInTheDocument()
        expect(mockTicketReplyArea).toHaveBeenCalledWith(
            expect.objectContaining({
                hasAutomate: true,
                filters: { languages: [], tags: [] },
                isMacrosLoading: false,
                isMacrosActive: false,
                macros: [],
                nextCursor: undefined,
                query: '',
            }),
            {},
        )
    })

    it('passes the next macros cursor to the regular ticket reply area', () => {
        mockUseMacrosSearch.mockReturnValue({
            data: [],
            fetchNextPage: jest.fn(),
            isLoading: false,
            nextCursor: 'next-macros-cursor',
        })

        renderComponent()

        expect(mockTicketReplyArea).toHaveBeenCalledWith(
            expect.objectContaining({
                nextCursor: 'next-macros-cursor',
            }),
            {},
        )
    })

    it('renders the WhatsApp template reply area when selected by the WhatsApp editor context', () => {
        useWhatsAppEditorSpy.mockReturnValue({
            showWhatsAppTemplateEditor: true,
        })

        renderComponent()

        expect(
            screen.getByText('WhatsAppMessageTemplateReplyArea'),
        ).toBeInTheDocument()
        expect(screen.queryByText('TicketReplyArea')).not.toBeInTheDocument()
    })
})
