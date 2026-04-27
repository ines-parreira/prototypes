import { render } from '@repo/testing'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { SkillEditorSidePanel } from './SkillEditorSidePanel'

jest.mock('../context')
jest.mock('./SkillEditorSidePanelInfoTab', () => ({
    SkillEditorSidePanelInfoTab: () => <div>Info Tab Content</div>,
}))
jest.mock('./SkillEditorSidePanelPerformanceTab', () => ({
    SkillEditorSidePanelPerformanceTab: () => (
        <div>Performance Tab Content</div>
    ),
}))

const mockDispatch = jest.fn()
const mockUseSkillEditorStore = jest.requireMock('../context')
    .useSkillEditorStore as jest.Mock

const setStoreData = (isDetailsView = true) => {
    mockUseSkillEditorStore.mockImplementation((selector: Function) =>
        selector({
            state: { isDetailsView },
            dispatch: mockDispatch,
        }),
    )
}

describe('SkillEditorSidePanel', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        setStoreData(true)
    })

    it('renders info tab content by default when panel is expanded', () => {
        render(<SkillEditorSidePanel />)

        expect(screen.getByText('Info Tab Content')).toBeInTheDocument()
        expect(
            screen.queryByText('Performance Tab Content'),
        ).not.toBeInTheDocument()
    })

    it('switches to performance tab when performance button is clicked', async () => {
        const user = userEvent.setup()
        render(<SkillEditorSidePanel />)

        await user.click(screen.getByRole('button', { name: /performance/i }))

        expect(screen.getByText('Performance Tab Content')).toBeInTheDocument()
        expect(screen.queryByText('Info Tab Content')).not.toBeInTheDocument()
    })

    it('dispatches TOGGLE_DETAILS_VIEW when collapse button is clicked', async () => {
        const user = userEvent.setup()
        render(<SkillEditorSidePanel />)

        await user.click(screen.getByRole('button', { name: /collapse/i }))

        expect(mockDispatch).toHaveBeenCalledWith({
            type: 'TOGGLE_DETAILS_VIEW',
        })
    })

    it('hides content area when panel is collapsed', () => {
        setStoreData(false)
        render(<SkillEditorSidePanel />)

        expect(screen.queryByText('Info Tab Content')).not.toBeInTheDocument()
        expect(
            screen.getByRole('button', { name: /expand/i }),
        ).toBeInTheDocument()
    })

    it('renders all icon bar buttons', () => {
        render(<SkillEditorSidePanel />)

        expect(
            screen.getByRole('button', { name: /collapse/i }),
        ).toBeInTheDocument()
        expect(
            screen.getByRole('button', { name: /info/i }),
        ).toBeInTheDocument()
        expect(
            screen.getByRole('button', { name: /performance/i }),
        ).toBeInTheDocument()
    })
})
