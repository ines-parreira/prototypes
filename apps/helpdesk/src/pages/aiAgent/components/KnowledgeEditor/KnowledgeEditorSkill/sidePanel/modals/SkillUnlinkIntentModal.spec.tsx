import { render } from '@repo/testing'
import { screen, within } from '@testing-library/react'

import { SkillUnlinkIntentModal } from './SkillUnlinkIntentModal'

const mockUnlinkIntent = jest.fn()

jest.mock('../../context/KnowledgeEditorSkillContext', () => ({
    useSkillEditorStore: (selector: Function) =>
        selector({
            state: {
                intents: ['order::status', 'order::cancel'],
            },
        }),
}))

jest.mock('../hooks/usePersistLinkedIntentsSkill', () => ({
    usePersistLinkedIntentsSkill: () => ({
        unlinkIntent: mockUnlinkIntent,
        isUpdating: false,
    }),
}))

const renderComponent = (intentId: string | null = 'order::status') =>
    render(<SkillUnlinkIntentModal intentId={intentId} onClose={jest.fn()} />)

describe('SkillUnlinkIntentModal', () => {
    afterEach(() => jest.clearAllMocks())

    it('does not render when intentId is null', () => {
        renderComponent(null)
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })

    it('renders unlink text and CTA', () => {
        renderComponent()
        const modal = screen.getByRole('dialog')

        expect(
            within(modal).getByRole('heading', { name: 'Unlink intent?' }),
        ).toBeInTheDocument()
        expect(
            within(modal).getByText(/This intent will become unlinked/),
        ).toBeInTheDocument()
        expect(
            within(modal).getByRole('button', { name: 'Unlink' }),
        ).toBeInTheDocument()
    })
})
