import { render } from '@repo/testing'
import { screen } from '@testing-library/react'

import { KnowledgeEditorSkillContent } from './KnowledgeEditorSkillContent'

jest.mock('domains/reporting/pages/common/drill-down/DrillDownModal', () => ({
    DrillDownModal: () => null,
}))
jest.mock('./context')
jest.mock('./hooks/useSkillAutoSave', () => ({
    useSkillAutoSave: () => ({ onChangeField: jest.fn() }),
}))
jest.mock('./modals/SkillDeleteModal', () => ({
    SkillDeleteModal: () => null,
}))
jest.mock('./modals/SkillDisableModal', () => ({
    SkillDisableModal: () => null,
}))
jest.mock('./modals/SkillEnableModal', () => ({
    SkillEnableModal: () => null,
}))
jest.mock('./modals/SkillPublishModal', () => ({
    SkillPublishModal: () => null,
}))
jest.mock('./modals/SkillRestoreVersionModal', () => ({
    SkillRestoreVersionModal: () => null,
}))
jest.mock(
    'pages/aiAgent/components/GuidanceEditor/useGetGuidancesAvailableActions',
    () => ({
        useGetGuidancesAvailableActions: () => ({ guidanceActions: [] }),
    }),
)
jest.mock('./SkillEditorHeader', () => ({
    SkillEditorHeader: ({ children }: { children?: React.ReactNode }) => (
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
jest.mock('./sidePanel/SkillPreviewSidePanel', () => ({
    SkillPreviewSidePanel: () => <div>Preview Side Panel</div>,
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
                    isAutoSaving: false,
                    hasAutoSavedInSession: false,
                    autoSaveError: false,
                    skill: null,
                },
                config: {
                    shopName: 'test-shop',
                    shopType: 'shopify',
                    onClose: jest.fn(),
                    isPreviewMode: false,
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
                    isAutoSaving: false,
                    hasAutoSavedInSession: false,
                    autoSaveError: false,
                    skill: null,
                },
                config: {
                    shopName: 'test-shop',
                    shopType: 'shopify',
                    onClose: jest.fn(),
                    isPreviewMode: false,
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
                    isAutoSaving: false,
                    hasAutoSavedInSession: false,
                    autoSaveError: false,
                    skill: null,
                },
                config: {
                    shopName: 'test-shop',
                    shopType: 'shopify',
                    onClose: jest.fn(),
                    isPreviewMode: false,
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
                    isAutoSaving: false,
                    hasAutoSavedInSession: false,
                    autoSaveError: false,
                    skill: null,
                },
                config: {
                    shopName: 'test-shop',
                    shopType: 'shopify',
                    onClose: jest.fn(),
                    isPreviewMode: false,
                },
                dispatch: jest.fn(),
            }),
        )
        render(<KnowledgeEditorSkillContent />)

        expect(screen.getByText('Diff View')).toBeInTheDocument()
    })

    it('renders diff view with no comparison version', () => {
        mockUseSkillEditorStore.mockImplementation((selector: Function) =>
            selector({
                state: {
                    mode: 'diff',
                    title: 'Draft Title',
                    content: '<p>draft</p>',
                    historicalVersion: null,
                    comparisonVersion: null,
                    isAutoSaving: false,
                    hasAutoSavedInSession: false,
                    autoSaveError: false,
                    skill: null,
                },
                config: {
                    shopName: 'test-shop',
                    shopType: 'shopify',
                    onClose: jest.fn(),
                    isPreviewMode: false,
                },
                dispatch: jest.fn(),
            }),
        )
        render(<KnowledgeEditorSkillContent />)

        expect(screen.getByText('Diff View')).toBeInTheDocument()
    })

    it('renders diff view with historical version and no comparison version', () => {
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
                    comparisonVersion: null,
                    isAutoSaving: false,
                    hasAutoSavedInSession: false,
                    autoSaveError: false,
                    skill: null,
                },
                config: {
                    shopName: 'test-shop',
                    shopType: 'shopify',
                    onClose: jest.fn(),
                    isPreviewMode: false,
                },
                dispatch: jest.fn(),
            }),
        )
        render(<KnowledgeEditorSkillContent />)

        expect(screen.getByText('Diff View')).toBeInTheDocument()
    })

    describe('save status', () => {
        const makeStore = (state: Record<string, unknown>) => ({
            state: {
                mode: 'edit',
                title: 'Test Skill',
                content: '<p>content</p>',
                isAutoSaving: false,
                hasAutoSavedInSession: false,
                autoSaveError: false,
                skill: null,
                ...state,
            },
            config: {
                shopName: 'test-shop',
                shopType: 'shopify',
                onClose: jest.fn(),
                isPreviewMode: false,
            },
            dispatch: jest.fn(),
        })

        it('renders while auto-saving', () => {
            mockUseSkillEditorStore.mockImplementation((selector: Function) =>
                selector(makeStore({ isAutoSaving: true })),
            )
            render(<KnowledgeEditorSkillContent />)

            expect(screen.getByText('Header')).toBeInTheDocument()
        })

        it('renders with a last updated time after saving in session', () => {
            mockUseSkillEditorStore.mockImplementation((selector: Function) =>
                selector(
                    makeStore({
                        hasAutoSavedInSession: true,
                        skill: { lastUpdated: '2026-06-12T10:00:00.000Z' },
                    }),
                ),
            )
            render(<KnowledgeEditorSkillContent />)

            expect(screen.getByText('Header')).toBeInTheDocument()
        })

        it('renders after saving in session without a last updated time', () => {
            mockUseSkillEditorStore.mockImplementation((selector: Function) =>
                selector(
                    makeStore({
                        hasAutoSavedInSession: true,
                        skill: { lastUpdated: null },
                    }),
                ),
            )
            render(<KnowledgeEditorSkillContent />)

            expect(screen.getByText('Header')).toBeInTheDocument()
        })
    })

    describe('preview mode (isPreviewMode=true)', () => {
        const makePreviewStore = (isDetailsView: boolean) => ({
            state: {
                mode: 'read',
                title: 'Preview Skill',
                content: '<p>content</p>',
                isAutoSaving: false,
                hasAutoSavedInSession: false,
                autoSaveError: false,
                isDetailsView,
                skill: null,
            },
            config: {
                shopName: 'test-shop',
                shopType: 'shopify',
                onClose: jest.fn(),
                isPreviewMode: true,
            },
            dispatch: jest.fn(),
        })

        beforeEach(() => {
            mockUseSkillEditorStore.mockImplementation((selector: Function) =>
                selector(makePreviewStore(true)),
            )
        })

        it('renders SkillPreviewSidePanel when isDetailsView is true', () => {
            render(<KnowledgeEditorSkillContent />)

            expect(screen.getByText('Preview Side Panel')).toBeInTheDocument()
            expect(screen.queryByText('Side Panel')).not.toBeInTheDocument()
        })

        it('hides SkillPreviewSidePanel when isDetailsView is false', () => {
            mockUseSkillEditorStore.mockImplementation((selector: Function) =>
                selector(makePreviewStore(false)),
            )
            render(<KnowledgeEditorSkillContent />)

            expect(
                screen.queryByText('Preview Side Panel'),
            ).not.toBeInTheDocument()
            expect(screen.queryByText('Side Panel')).not.toBeInTheDocument()
        })

        it('renders the read view in preview mode', () => {
            render(<KnowledgeEditorSkillContent />)

            expect(screen.getByText('Read View')).toBeInTheDocument()
        })
    })
})
