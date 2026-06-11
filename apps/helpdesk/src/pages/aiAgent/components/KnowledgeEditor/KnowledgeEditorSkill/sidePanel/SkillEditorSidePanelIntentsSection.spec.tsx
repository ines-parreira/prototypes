import { render } from '@repo/testing'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { SkillEditorSidePanelIntentsSection } from './SkillEditorSidePanelIntentsSection'

const mockUseLinkedIntentsSidebarSkill = jest.fn()

jest.mock('./hooks/useLinkedIntentsSidebarSkill', () => ({
    useLinkedIntentsSidebarSkill: () => mockUseLinkedIntentsSidebarSkill(),
}))

jest.mock(
    'pages/aiAgent/components/KnowledgeEditor/KnowledgeEditorSidePanel/KnowledgeEditorSidePanelSection',
    () => ({
        KnowledgeEditorSidePanelSection: ({
            children,
            header,
        }: {
            children: React.ReactNode
            header: { title: React.ReactNode; subtitle: React.ReactNode }
        }) => (
            <div>
                <div>{header.title}</div>
                <div>{header.subtitle}</div>
                {children}
            </div>
        ),
    }),
)

jest.mock('./modals/SkillLinkedIntentsModal', () => ({
    SkillLinkedIntentsModal: ({ isOpen }: { isOpen: boolean }) =>
        isOpen ? <div data-testid="link-modal">Link Modal</div> : null,
}))

jest.mock('./SkillIntentTag', () => ({
    SkillIntentTag: ({
        label,
        onClose,
    }: {
        label: string
        onClose?: () => void
    }) => (
        <span>
            {label}
            {onClose && (
                <button
                    type="button"
                    aria-label={`Unlink ${label}`}
                    onClick={onClose}
                >
                    x
                </button>
            )}
        </span>
    ),
}))

const mockUnlinkIntent = jest.fn()

jest.mock('./hooks/usePersistLinkedIntentsSkill', () => ({
    usePersistLinkedIntentsSkill: () => ({
        unlinkIntent: mockUnlinkIntent,
    }),
}))

let mockIsReadOnly = false

jest.mock('../context/KnowledgeEditorSkillContext', () => ({
    useSkillEditorStore: (selector: Function) =>
        selector({
            state: { intents: ['order::status', 'order::cancel'] },
            config: { isReadOnly: mockIsReadOnly },
        }),
}))

const defaultHookReturn = {
    items: [] as {
        intentId: string
        label: string
        color?: string
        showLeadingDot: boolean
        tooltip?: string
    }[],
    showBanner: false,
    showLinkButton: true,
    linkButton: {
        isDisabled: false,
        disabledTooltip: undefined as string | undefined,
        canUnlink: true,
        isUpdating: false,
    },
    intentsCount: 0,
    isPreview: false,
}

const setup = (overrides?: Partial<typeof defaultHookReturn>) => {
    mockUseLinkedIntentsSidebarSkill.mockReturnValue({
        ...defaultHookReturn,
        ...overrides,
    })
    return render(<SkillEditorSidePanelIntentsSection sectionId="intents" />)
}

describe('SkillEditorSidePanelIntentsSection', () => {
    beforeEach(() => {
        mockIsReadOnly = false
    })
    afterEach(() => jest.clearAllMocks())

    it('renders title and subtitle', () => {
        setup()

        expect(screen.getByText('Intents')).toBeInTheDocument()
        expect(
            screen.getByText(/When AI Agent detects one of these intents/),
        ).toBeInTheDocument()
    })

    it('renders Link intents button when showLinkButton is true', () => {
        setup()

        expect(
            screen.getByRole('button', { name: /Link intents/ }),
        ).toBeInTheDocument()
    })

    it('hides Link intents button when showLinkButton is false', () => {
        setup({ showLinkButton: false })

        expect(
            screen.queryByRole('button', { name: /Link intents/ }),
        ).not.toBeInTheDocument()
    })

    it('renders intent tags from items', () => {
        setup({
            items: [
                {
                    intentId: 'order::status',
                    label: 'Order / Status',
                    showLeadingDot: false,
                },
                {
                    intentId: 'order::cancel',
                    label: 'Order / Cancel',
                    showLeadingDot: false,
                },
            ],
            intentsCount: 2,
        })

        expect(screen.getByText('Order / Status')).toBeInTheDocument()
        expect(screen.getByText('Order / Cancel')).toBeInTheDocument()
    })

    it('opens link modal when Link intents is clicked', async () => {
        const user = userEvent.setup()
        setup()

        await user.click(screen.getByRole('button', { name: /Link intents/ }))

        expect(screen.getByTestId('link-modal')).toBeInTheDocument()
    })

    it('renders warning banner when showBanner is true', () => {
        setup({
            showBanner: true,
            items: [
                {
                    intentId: 'order::status',
                    label: 'Order / Status',
                    showLeadingDot: true,
                    tooltip: 'Intent already linked to an existing skill',
                },
            ],
            intentsCount: 1,
        })

        expect(
            screen.getByText('Some intents below are used in other skills'),
        ).toBeInTheDocument()
        expect(
            screen.getByText('Publish this skill to reassign them to this one'),
        ).toBeInTheDocument()
    })

    it('does not render banner when showBanner is false', () => {
        setup({
            showBanner: false,
            items: [
                {
                    intentId: 'order::status',
                    label: 'Order / Status',
                    showLeadingDot: false,
                },
            ],
            intentsCount: 1,
        })

        expect(
            screen.queryByText('Some intents below are used in other skills'),
        ).not.toBeInTheDocument()
    })

    it('unlinks the intent directly when its tag close button is clicked', async () => {
        const user = userEvent.setup()
        setup({
            items: [
                {
                    intentId: 'order::status',
                    label: 'Order / Status',
                    showLeadingDot: false,
                },
            ],
            intentsCount: 1,
        })

        await user.click(
            screen.getByRole('button', { name: 'Unlink Order / Status' }),
        )

        expect(mockUnlinkIntent).toHaveBeenCalledWith(
            'order::status',
            ['order::status', 'order::cancel'],
            expect.any(Function),
        )
    })

    describe('read-only mode', () => {
        beforeEach(() => {
            mockIsReadOnly = true
        })

        it('disables the Link intents button', () => {
            setup()

            expect(
                screen.getByRole('button', { name: /Link intents/ }),
            ).toBeDisabled()
        })

        it('does not render the unlink button on intent tags', () => {
            setup({
                items: [
                    {
                        intentId: 'order::status',
                        label: 'Order / Status',
                        showLeadingDot: false,
                    },
                ],
                intentsCount: 1,
            })

            expect(
                screen.queryByRole('button', {
                    name: 'Unlink Order / Status',
                }),
            ).not.toBeInTheDocument()
        })
    })
})
