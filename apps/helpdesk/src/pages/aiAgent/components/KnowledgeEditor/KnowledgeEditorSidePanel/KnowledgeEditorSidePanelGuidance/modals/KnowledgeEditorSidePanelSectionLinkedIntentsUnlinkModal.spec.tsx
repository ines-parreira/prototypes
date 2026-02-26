import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { KnowledgeEditorSidePanelSectionLinkedIntentsUnlinkModal } from './KnowledgeEditorSidePanelSectionLinkedIntentsUnlinkModal'

const mockPersistLinkedIntents = jest.fn()

type MockGuidanceStoreState = {
    state: {
        guidance: {
            intents: string[]
        }
        isUpdating: boolean
    }
}

const createMockGuidanceStoreState = (): MockGuidanceStoreState => ({
    state: {
        guidance: {
            intents: ['order-status', 'order-cancel'],
        },
        isUpdating: false,
    },
})

let mockGuidanceStoreState = createMockGuidanceStoreState()

jest.mock(
    'pages/aiAgent/components/KnowledgeEditor/KnowledgeEditorGuidance/context',
    () => ({
        useGuidanceStore: (selector: (state: unknown) => unknown) =>
            selector(mockGuidanceStoreState),
    }),
)

jest.mock('../hooks/usePersistLinkedIntents', () => ({
    usePersistLinkedIntents: () => ({
        persistLinkedIntents: mockPersistLinkedIntents,
        isUpdating: mockGuidanceStoreState.state.isUpdating,
        isAutoSaving: false,
    }),
}))

const renderComponent = ({
    intentId = 'order-status' as string | null,
    onClose = jest.fn(),
}: {
    intentId?: string | null
    onClose?: jest.Mock
} = {}) =>
    render(
        <KnowledgeEditorSidePanelSectionLinkedIntentsUnlinkModal
            intentId={intentId}
            onClose={onClose}
        />,
    )

describe('KnowledgeEditorSidePanelSectionLinkedIntentsUnlinkModal', () => {
    beforeEach(() => {
        mockGuidanceStoreState = createMockGuidanceStoreState()
    })

    afterEach(() => {
        jest.clearAllMocks()
    })

    it('renders modal title, body and actions when open', () => {
        renderComponent()

        const modal = screen.getByRole('dialog')

        expect(
            within(modal).getByRole('heading', {
                name: 'Unlink intents from this guidance?',
            }),
        ).toBeInTheDocument()
        expect(
            within(modal).getByText(
                "AI Agent won't prioritize this guidance when responding to the linked intents.",
            ),
        ).toBeInTheDocument()
        expect(
            within(modal).getByRole('button', { name: 'Cancel' }),
        ).toBeInTheDocument()
        expect(
            within(modal).getByRole('button', { name: 'Unlink' }),
        ).toBeInTheDocument()
    })

    it('does not render modal when intentId is null', () => {
        renderComponent({ intentId: null })

        expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })

    it('calls onClose when clicking cancel', async () => {
        const user = userEvent.setup()
        const onClose = jest.fn()

        renderComponent({ onClose })

        await user.click(screen.getByRole('button', { name: 'Cancel' }))

        expect(onClose).toHaveBeenCalledTimes(1)
    })

    it('calls persistLinkedIntents with filtered intents when clicking unlink', async () => {
        const user = userEvent.setup()

        renderComponent({ intentId: 'order-status' })

        await user.click(screen.getByRole('button', { name: 'Unlink' }))

        expect(mockPersistLinkedIntents).toHaveBeenCalledTimes(1)
        expect(mockPersistLinkedIntents).toHaveBeenCalledWith(
            ['order-cancel'],
            expect.any(Function),
        )
    })

    it('calls onClose when clicking top-right close button', async () => {
        const user = userEvent.setup()
        const onClose = jest.fn()

        renderComponent({ onClose })

        const modal = screen.getByRole('dialog')
        const closeIcon = within(modal).getByRole('img', { name: 'close' })
        const dismissButton = closeIcon.closest('button')

        expect(dismissButton).not.toBeNull()

        await user.click(dismissButton as HTMLButtonElement)

        expect(onClose).toHaveBeenCalledTimes(1)
    })
})
