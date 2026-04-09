import { render, screen } from '@testing-library/react'
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

jest.mock('./modals/SkillUnlinkIntentModal', () => ({
    SkillUnlinkIntentModal: ({ intentId }: { intentId: string | null }) =>
        intentId ? (
            <div data-testid="unlink-modal">Unlink Modal: {intentId}</div>
        ) : null,
}))

const defaultHookReturn = {
    displayedIntentIds: [] as string[],
    intentDiffParts: [] as {
        intentId: string
        diffStatus: 'added' | 'removed' | null
    }[],
    isDiffMode: false,
    linkIntentsDisabledTooltip: undefined,
    isLinkIntentsButtonDisabled: false,
    canUnlinkIntentsFromSidebar: true,
    isUpdating: false,
    getLinkedIntentLabelById: (id: string) =>
        id
            .split('::')
            .map((p) => p.replace(/\b\w/g, (c) => c.toUpperCase()))
            .join(' / '),
}

const setup = (overrides?: Partial<typeof defaultHookReturn>) => {
    mockUseLinkedIntentsSidebarSkill.mockReturnValue({
        ...defaultHookReturn,
        ...overrides,
    })
    return render(<SkillEditorSidePanelIntentsSection sectionId="intents" />)
}

describe('SkillEditorSidePanelIntentsSection', () => {
    afterEach(() => jest.clearAllMocks())

    it('renders title and subtitle', () => {
        setup()

        expect(screen.getByText('Intents')).toBeInTheDocument()
        expect(
            screen.getByText(/When AI Agent detects one of these intents/),
        ).toBeInTheDocument()
    })

    it('renders Link intents button when no intents', () => {
        setup()

        expect(
            screen.getByRole('button', { name: /Link intents/ }),
        ).toBeInTheDocument()
    })

    it('renders intent tags when intents exist', () => {
        setup({
            displayedIntentIds: ['order::status', 'order::cancel'],
        })

        expect(screen.getByText('Order / Status')).toBeInTheDocument()
        expect(screen.getByText('Order / Cancel')).toBeInTheDocument()
    })

    it('renders all intents without truncation', () => {
        setup({
            displayedIntentIds: [
                'order::status',
                'order::cancel',
                'order::edit',
                'order::refund',
            ],
        })

        expect(screen.getByText('Order / Status')).toBeInTheDocument()
        expect(screen.getByText('Order / Cancel')).toBeInTheDocument()
        expect(screen.getByText('Order / Edit')).toBeInTheDocument()
        expect(screen.getByText('Order / Refund')).toBeInTheDocument()
    })

    it('opens link modal when Link intents is clicked', async () => {
        const user = userEvent.setup()
        setup()

        await user.click(screen.getByRole('button', { name: /Link intents/ }))

        expect(screen.getByTestId('link-modal')).toBeInTheDocument()
    })

    it('hides Link intents button in diff mode', () => {
        setup({
            isDiffMode: true,
            intentDiffParts: [{ intentId: 'order::status', diffStatus: null }],
            displayedIntentIds: ['order::status'],
        })

        expect(
            screen.queryByRole('button', { name: /Link intents/ }),
        ).not.toBeInTheDocument()
    })
})
