import { render, screen } from '@testing-library/react'

import { KnowledgeEditorSkillContent } from './KnowledgeEditorSkillContent'

jest.mock('domains/reporting/pages/common/drill-down/DrillDownModal', () => ({
    DrillDownModal: () => null,
}))
jest.mock('./context')
jest.mock(
    'pages/aiAgent/components/GuidanceEditor/useGetGuidancesAvailableActions',
    () => ({
        useGetGuidancesAvailableActions: () => ({ guidanceActions: [] }),
    }),
)
jest.mock('./SkillEditorHeader', () => ({
    SkillEditorHeader: ({ children }: { children: React.ReactNode }) => (
        <div>Header{children}</div>
    ),
}))
jest.mock(
    'pages/aiAgent/components/KnowledgeEditor/KnowledgeEditorTopBar/KnowledgeEditorTopBarSkillControls',
    () => ({
        SkillToolbarControls: () => null,
    }),
)
jest.mock('./edit/KnowledgeEditorSkillEditView', () => ({
    KnowledgeEditorSkillEditView: () => <div>Edit View</div>,
}))
jest.mock('./read/KnowledgeEditorSkillReadView', () => ({
    KnowledgeEditorSkillReadView: () => <div>Read View</div>,
}))
jest.mock('./sidePanel/SkillEditorSidePanel', () => ({
    SkillEditorSidePanel: () => <div>Side Panel</div>,
}))

const mockUseSkillEditorStore = jest.requireMock('./context')
    .useSkillEditorStore as jest.Mock

describe('KnowledgeEditorSkillContent', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        mockUseSkillEditorStore.mockImplementation((selector: Function) =>
            selector({
                state: {
                    mode: 'read',
                    title: 'Test Skill',
                    content: '<p>content</p>',
                },
                config: {
                    shopName: 'test-shop',
                    shopType: 'shopify',
                    onClose: jest.fn(),
                },
                dispatch: jest.fn(),
            }),
        )
    })

    it('renders the header and read view in read mode', () => {
        render(<KnowledgeEditorSkillContent />)

        expect(screen.getByText('Header')).toBeInTheDocument()
        expect(screen.getByText('Read View')).toBeInTheDocument()
        expect(screen.getByText('Side Panel')).toBeInTheDocument()
    })
})
