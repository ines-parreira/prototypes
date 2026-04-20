import { render, screen } from '@testing-library/react'

import { SkillEditorPlaygroundBanner } from './SkillEditorPlaygroundBanner'

jest.mock('zustand/react/shallow', () => ({
    useShallow: (selector: Function) => selector,
}))

const mockUseSkillEditorStore = jest.fn()

jest.mock('./context', () => ({
    useSkillEditorStore: (selector: Function) =>
        mockUseSkillEditorStore(selector),
}))

const setupStore = ({
    title = 'My skill',
    content = '<p>Instructions here</p>',
    intents = ['intent_a'],
}: {
    title?: string
    content?: string
    intents?: string[]
} = {}) => {
    mockUseSkillEditorStore.mockImplementation((selector: Function) =>
        selector({
            state: { title, content, intents },
        }),
    )
}

describe('SkillEditorPlaygroundBanner', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('does not render when title, instructions, and intents are all provided', () => {
        setupStore()
        render(<SkillEditorPlaygroundBanner />)

        expect(
            screen.queryByText('Testing may not work as expected'),
        ).not.toBeInTheDocument()
    })

    it('renders the banner when the title is missing', () => {
        setupStore({ title: '' })
        render(<SkillEditorPlaygroundBanner />)

        expect(
            screen.getByText('Testing may not work as expected'),
        ).toBeInTheDocument()
        expect(
            screen.getByText(
                'A title, instructions and at least one intent are required to test this draft.',
            ),
        ).toBeInTheDocument()
    })

    it('renders the banner when the title only contains whitespace', () => {
        setupStore({ title: '   ' })
        render(<SkillEditorPlaygroundBanner />)

        expect(
            screen.getByText('Testing may not work as expected'),
        ).toBeInTheDocument()
    })

    it('renders the banner when the instructions are missing', () => {
        setupStore({ content: '' })
        render(<SkillEditorPlaygroundBanner />)

        expect(
            screen.getByText('Testing may not work as expected'),
        ).toBeInTheDocument()
    })

    it('renders the banner when the instructions only contain empty HTML', () => {
        setupStore({ content: '<p></p>' })
        render(<SkillEditorPlaygroundBanner />)

        expect(
            screen.getByText('Testing may not work as expected'),
        ).toBeInTheDocument()
    })

    it('renders the banner when no intents are selected', () => {
        setupStore({ intents: [] })
        render(<SkillEditorPlaygroundBanner />)

        expect(
            screen.getByText('Testing may not work as expected'),
        ).toBeInTheDocument()
    })
})
