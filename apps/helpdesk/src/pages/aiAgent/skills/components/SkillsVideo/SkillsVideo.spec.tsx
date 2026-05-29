import { render } from '@repo/testing'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { SkillsVideo } from './SkillsVideo'

const PLAY_BUTTON = { name: /play skills for ai agent/i }
const VIDEO_SRC = 'https://fast.wistia.net/embed/iframe/wcktmr0zwn'

describe('SkillsVideo', () => {
    it('plays the Wistia video in a modal when the play button is clicked', async () => {
        const user = userEvent.setup()
        render(<SkillsVideo />)

        expect(
            screen.queryByTitle('Skills for AI Agent'),
        ).not.toBeInTheDocument()

        await user.click(screen.getByRole('button', PLAY_BUTTON))

        expect(
            screen.getByTitle('Skills for AI Agent').getAttribute('src'),
        ).toContain(VIDEO_SRC)
    })

    it('plays the Wistia video inline when the play button is clicked', async () => {
        const user = userEvent.setup()
        render(<SkillsVideo inline />)

        expect(
            screen.queryByTitle('Skills for AI Agent'),
        ).not.toBeInTheDocument()

        await user.click(screen.getByRole('button', PLAY_BUTTON))

        expect(
            screen.getByTitle('Skills for AI Agent').getAttribute('src'),
        ).toContain(VIDEO_SRC)
    })
})
