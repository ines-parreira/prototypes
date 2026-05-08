import { render } from '@repo/testing'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { ThemeProvider } from 'core/theme'

import { SkillsHeader } from './SkillsHeader'

describe('SkillsHeader', () => {
    it('should render the title and all action buttons', () => {
        render(
            <ThemeProvider>
                <SkillsHeader />
            </ThemeProvider>,
        )

        expect(
            screen.getByRole('heading', { name: 'Skills' }),
        ).toBeInTheDocument()
        expect(
            screen.getByRole('link', { name: /How skills work/i }),
        ).toBeInTheDocument()
        expect(
            screen.getByRole('button', { name: /View intents/i }),
        ).toBeInTheDocument()
        expect(
            screen.getByRole('button', { name: /Create skill/i }),
        ).toBeInTheDocument()
    })

    it('should call callbacks when buttons are clicked', async () => {
        const user = userEvent.setup()
        const onViewIntents = jest.fn()
        const onCreateSkillFromScratch = jest.fn()
        const onCreateSkillFromTemplate = jest.fn()

        render(
            <ThemeProvider>
                <SkillsHeader
                    onViewIntents={onViewIntents}
                    onCreateSkillFromScratch={onCreateSkillFromScratch}
                    onCreateSkillFromTemplate={onCreateSkillFromTemplate}
                />
            </ThemeProvider>,
        )

        await user.click(screen.getByRole('button', { name: /View intents/i }))
        expect(onViewIntents).toHaveBeenCalledTimes(1)

        await user.click(screen.getByRole('button', { name: /Create skill/i }))
        await user.click(
            screen.getByRole('menuitem', { name: /From scratch/i }),
        )
        expect(onCreateSkillFromScratch).toHaveBeenCalledTimes(1)

        await user.click(screen.getByRole('button', { name: /Create skill/i }))
        await user.click(
            screen.getByRole('menuitem', { name: /From template/i }),
        )
        expect(onCreateSkillFromTemplate).toHaveBeenCalledTimes(1)
    })

    it('should hide the action buttons when showActions is false', () => {
        render(
            <ThemeProvider>
                <SkillsHeader showActions={false} />
            </ThemeProvider>,
        )

        expect(
            screen.getByRole('heading', { name: 'Skills' }),
        ).toBeInTheDocument()
        expect(
            screen.getByRole('link', { name: /How skills work/i }),
        ).toBeInTheDocument()
        expect(
            screen.queryByRole('button', { name: /View intents/i }),
        ).not.toBeInTheDocument()
        expect(
            screen.queryByRole('button', { name: /Create skill/i }),
        ).not.toBeInTheDocument()
    })

    it('should open the "How skills work" side panel when the link is clicked', async () => {
        const user = userEvent.setup()

        render(
            <ThemeProvider>
                <SkillsHeader />
            </ThemeProvider>,
        )

        await user.click(screen.getByRole('link', { name: /How skills work/i }))

        expect(
            await screen.findByRole('heading', { name: 'How skills work' }),
        ).toBeInTheDocument()
        expect(
            screen.getByRole('button', { name: /What are skills\?/i }),
        ).toBeInTheDocument()
        expect(
            screen.getByRole('button', {
                name: /How do skills, knowledge and guidance work together\?/i,
            }),
        ).toBeInTheDocument()
        expect(
            screen.getByRole('button', {
                name: /Do I need to set up everything manually\?/i,
            }),
        ).toBeInTheDocument()
        expect(
            screen.getByRole('button', {
                name: /How many skills do I need\?/i,
            }),
        ).toBeInTheDocument()
    })
})
