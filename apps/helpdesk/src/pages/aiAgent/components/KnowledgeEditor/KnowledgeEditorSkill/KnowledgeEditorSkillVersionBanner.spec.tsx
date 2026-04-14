import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { KnowledgeEditorSkillVersionBanner } from './KnowledgeEditorSkillVersionBanner'

const mockDispatch = jest.fn()
const mockSwitchVersion = jest.fn()
const mockOnGoToLatest = jest.fn()
const mockFetchQuery = jest.fn()

jest.mock('@repo/api-resources', () => ({
    appQueryClient: {
        fetchQuery: (...args: unknown[]) => mockFetchQuery(...args),
    },
}))

jest.mock('models/helpCenter/queries', () => ({
    getHelpCenterArticleQuery: jest.fn(() => ({ queryKey: ['test'] })),
}))

jest.mock(
    'pages/aiAgent/components/KnowledgeEditor/KnowledgeEditorGuidance/context/utils',
    () => ({
        fromArticleTranslation: jest.fn((response) => response),
    }),
)

jest.mock('pages/settings/helpCenter/hooks/useHelpCenterApi', () => ({
    useHelpCenterApi: () => ({ client: {} }),
}))

jest.mock('../shared/VersionBanner', () => ({
    VersionBanner: (props: {
        isViewingDraft?: boolean
        isViewingHistoricalVersion?: boolean
        isDiffMode?: boolean
        onToggleDiff?: () => void
    }) => (
        <div data-testid="version-banner">
            {props.isViewingDraft && <span>draft</span>}
            {props.isViewingHistoricalVersion && <span>historical</span>}
            {props.isDiffMode && <span>diff-mode</span>}
            {props.onToggleDiff && (
                <button onClick={props.onToggleDiff}>Toggle diff</button>
            )}
        </div>
    ),
}))

const mockUseSkillEditorStore = jest.fn()

jest.mock('./context', () => ({
    useSkillEditorStore: (selector: Function) =>
        mockUseSkillEditorStore(selector),
}))

jest.mock('./hooks/useSkillVersionBanner', () => ({
    useSkillVersionBanner: () => ({
        isViewingDraft: true,
        hasDraftVersion: true,
        hasPublishedVersion: true,
        isDisabled: false,
        switchVersion: mockSwitchVersion,
    }),
}))

jest.mock('./hooks/useSkillVersionHistory', () => ({
    useSkillVersionHistory: () => ({
        isViewingHistoricalVersion: false,
        onGoToLatest: mockOnGoToLatest,
    }),
}))

const setupStore = (overrides: Record<string, unknown> = {}) => {
    mockUseSkillEditorStore.mockImplementation((selector: Function) =>
        selector({
            state: {
                mode: 'read',
                skill: { id: 1 },
                historicalVersion: null,
                comparisonVersion: null,
                ...overrides,
            },
            config: {
                helpCenter: { id: 100, default_locale: 'en-US' },
            },
            dispatch: mockDispatch,
        }),
    )
}

describe('KnowledgeEditorSkillVersionBanner', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        setupStore()
    })

    it('renders the version banner', () => {
        render(<KnowledgeEditorSkillVersionBanner />)

        expect(screen.getByTestId('version-banner')).toBeInTheDocument()
        expect(screen.getByText('draft')).toBeInTheDocument()
    })

    it('shows diff toggle when viewing draft with published version', () => {
        render(<KnowledgeEditorSkillVersionBanner />)

        expect(
            screen.getByRole('button', { name: /toggle diff/i }),
        ).toBeInTheDocument()
    })

    it('dispatches SET_MODE diff when toggle diff is clicked', async () => {
        const user = userEvent.setup()
        render(<KnowledgeEditorSkillVersionBanner />)

        await user.click(screen.getByRole('button', { name: /toggle diff/i }))

        expect(mockDispatch).toHaveBeenCalledWith({
            type: 'SET_MODE',
            payload: 'diff',
        })
    })

    it('dispatches SET_MODE read when toggling off diff mode', async () => {
        setupStore({ mode: 'diff' })
        const user = userEvent.setup()
        render(<KnowledgeEditorSkillVersionBanner />)

        await user.click(screen.getByRole('button', { name: /toggle diff/i }))

        expect(mockDispatch).toHaveBeenCalledWith({
            type: 'SET_MODE',
            payload: 'read',
        })
    })

    it('eagerly fetches comparison version when viewing draft', () => {
        setupStore({ comparisonVersion: null })
        render(<KnowledgeEditorSkillVersionBanner />)

        expect(mockFetchQuery).toHaveBeenCalled()
    })

    it('does not fetch comparison version when already loaded', () => {
        setupStore({
            comparisonVersion: { title: 'Published', content: '<p>pub</p>' },
        })
        render(<KnowledgeEditorSkillVersionBanner />)

        expect(mockFetchQuery).not.toHaveBeenCalled()
    })
})
