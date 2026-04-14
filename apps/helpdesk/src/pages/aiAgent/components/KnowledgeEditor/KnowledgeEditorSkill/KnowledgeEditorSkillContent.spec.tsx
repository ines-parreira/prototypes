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
jest.mock('./KnowledgeEditorSkillVersionBanner', () => ({
    KnowledgeEditorSkillVersionBanner: () => null,
}))
jest.mock('../shared/DiffView', () => ({
    DiffView: () => <div>Diff View</div>,
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

    it('renders edit view in edit mode', () => {
        mockUseSkillEditorStore.mockImplementation((selector: Function) =>
            selector({
                state: {
                    mode: 'edit',
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
        render(<KnowledgeEditorSkillContent />)

        expect(screen.getByText('Edit View')).toBeInTheDocument()
        expect(screen.queryByText('Read View')).not.toBeInTheDocument()
    })

    it('renders diff view in diff mode with comparison version', () => {
        mockUseSkillEditorStore.mockImplementation((selector: Function) =>
            selector({
                state: {
                    mode: 'diff',
                    title: 'Draft Title',
                    content: '<p>draft</p>',
                    historicalVersion: null,
                    comparisonVersion: {
                        title: 'Published Title',
                        content: '<p>published</p>',
                    },
                },
                config: {
                    shopName: 'test-shop',
                    shopType: 'shopify',
                    onClose: jest.fn(),
                },
                dispatch: jest.fn(),
            }),
        )
        render(<KnowledgeEditorSkillContent />)

        expect(screen.getByText('Diff View')).toBeInTheDocument()
        expect(screen.queryByText('Read View')).not.toBeInTheDocument()
        expect(screen.queryByText('Edit View')).not.toBeInTheDocument()
    })

    it('renders diff view with historical version data', () => {
        mockUseSkillEditorStore.mockImplementation((selector: Function) =>
            selector({
                state: {
                    mode: 'diff',
                    title: 'Draft Title',
                    content: '<p>draft</p>',
                    historicalVersion: {
                        title: 'Old Title',
                        content: '<p>old</p>',
                    },
                    comparisonVersion: {
                        title: 'Published Title',
                        content: '<p>published</p>',
                    },
                },
                config: {
                    shopName: 'test-shop',
                    shopType: 'shopify',
                    onClose: jest.fn(),
                },
                dispatch: jest.fn(),
            }),
        )
        render(<KnowledgeEditorSkillContent />)

        expect(screen.getByText('Diff View')).toBeInTheDocument()
    })
})
