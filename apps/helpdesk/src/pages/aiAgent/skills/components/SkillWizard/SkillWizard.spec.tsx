import { render } from '@repo/testing'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { ThemeProvider } from 'core/theme'

import { SkillWizard } from './SkillWizard'

type CapturedDraftKnowledge =
    | { sourceId: number; sourceSetId: number }
    | undefined

const capturedDraftKnowledge: { current: CapturedDraftKnowledge } = {
    current: undefined,
}

jest.mock('common/knowledge-editor/components', () => ({
    EditorWithPlayground: ({
        children,
        draftKnowledge,
    }: {
        children: React.ReactNode
        draftKnowledge?: CapturedDraftKnowledge
    }) => {
        capturedDraftKnowledge.current = draftKnowledge
        return (
            <div>
                {draftKnowledge && (
                    <p>
                        draft: {draftKnowledge.sourceId}/
                        {draftKnowledge.sourceSetId}
                    </p>
                )}
                {children}
            </div>
        )
    },
}))

jest.mock('pages/aiAgent/hooks/usePlaygroundPanelInKnowledgeEditor', () => ({
    usePlaygroundPanelInKnowledgeEditor: () => ({
        isPlaygroundOpen: false,
        onTest: jest.fn(),
        onClosePlayground: jest.fn(),
        sidePanelWidth: '100vw',
        shouldHideFullscreenButton: false,
    }),
}))

const items = ['Returns', 'Cancellations', 'Damaged']

const renderWizard = (props?: {
    initialStep?: number
    onStepChange?: (step: number, prevStep: number) => void
    onClose?: () => void
    draftKnowledge?: (item: string, index: number) => CapturedDraftKnowledge
}) =>
    render(
        <ThemeProvider>
            <SkillWizard
                items={items}
                renderItem={(item, index) => (
                    <p>
                        Step {index + 1}: {item}
                    </p>
                )}
                renderRecap={() => <p>Recap content</p>}
                onClose={props?.onClose ?? jest.fn()}
                initialStep={props?.initialStep}
                onStepChange={props?.onStepChange}
                draftKnowledge={props?.draftKnowledge}
            />
        </ThemeProvider>,
    )

describe('SkillWizard', () => {
    beforeEach(() => {
        capturedDraftKnowledge.current = undefined
    })

    it('mounts on the first review step by default', () => {
        renderWizard()

        expect(screen.getByText('Step 1: Returns')).toBeInTheDocument()
        expect(screen.getByText('Reviewing draft 1 of 3')).toBeInTheDocument()
    })

    it('jumps to a specific review step when initialStep is provided', () => {
        renderWizard({ initialStep: 2 })

        expect(screen.getByText('Step 2: Cancellations')).toBeInTheDocument()
        expect(screen.getByText('Reviewing draft 2 of 3')).toBeInTheDocument()
    })

    it('advances and rewinds the active item via Next and Back', async () => {
        const user = userEvent.setup()
        renderWizard({ initialStep: 1 })

        await user.click(screen.getByRole('button', { name: /^Next/ }))
        expect(screen.getByText('Step 2: Cancellations')).toBeInTheDocument()

        await user.click(screen.getByRole('button', { name: /Back$/ }))
        expect(screen.getByText('Step 1: Returns')).toBeInTheDocument()
    })

    it('lands on the recap step after the last review item', async () => {
        const user = userEvent.setup()
        renderWizard({ initialStep: 3 })

        await user.click(screen.getByRole('button', { name: /^Next/ }))

        expect(screen.getByText('Recap content')).toBeInTheDocument()
        expect(
            screen.getByRole('heading', { name: 'Final approval' }),
        ).toBeInTheDocument()
        expect(
            screen.queryByRole('button', { name: /^Next/ }),
        ).not.toBeInTheDocument()
        expect(screen.queryByText(/Reviewing draft/i)).not.toBeInTheDocument()
    })

    it('calls onStepChange whenever the step changes', async () => {
        const user = userEvent.setup()
        const onStepChange = jest.fn()
        renderWizard({ initialStep: 1, onStepChange })

        await user.click(screen.getByRole('button', { name: /^Next/ }))
        expect(onStepChange).toHaveBeenLastCalledWith(2, 1)

        await user.click(screen.getByRole('button', { name: /Back$/ }))
        expect(onStepChange).toHaveBeenLastCalledWith(1, 2)
    })

    it('passes draftKnowledge for the active review item to EditorWithPlayground', async () => {
        const user = userEvent.setup()
        const draftKnowledge = jest.fn((_item: string, index: number) => ({
            sourceId: index + 100,
            sourceSetId: 7,
        }))
        renderWizard({ initialStep: 1, draftKnowledge })

        expect(capturedDraftKnowledge.current).toEqual({
            sourceId: 100,
            sourceSetId: 7,
        })
        expect(screen.getByText('draft: 100/7')).toBeInTheDocument()

        await user.click(screen.getByRole('button', { name: /^Next/ }))

        expect(capturedDraftKnowledge.current).toEqual({
            sourceId: 101,
            sourceSetId: 7,
        })
        expect(screen.getByText('draft: 101/7')).toBeInTheDocument()
    })

    it('passes undefined draftKnowledge on the recap step', async () => {
        const user = userEvent.setup()
        const draftKnowledge = jest.fn((_item: string, index: number) => ({
            sourceId: index + 1,
            sourceSetId: 1,
        }))
        renderWizard({ initialStep: 3, draftKnowledge })

        await user.click(screen.getByRole('button', { name: /^Next/ }))

        expect(capturedDraftKnowledge.current).toBeUndefined()
        expect(screen.queryByText(/draft:/i)).not.toBeInTheDocument()
    })

    it('triggers onClose when the back-to-skills arrow is clicked', async () => {
        const user = userEvent.setup()
        const onClose = jest.fn()
        renderWizard({ onClose })

        await user.click(screen.getByRole('button', { name: 'Back to skills' }))
        expect(onClose).toHaveBeenCalledTimes(1)
    })
})
