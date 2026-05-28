import { render } from '@repo/testing'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { ThemeProvider } from 'core/theme'
import { AiAgentDataDelayBanner } from 'pages/aiAgent/analyticsAiAgent/components/AiAgentDataDelayBanner'
import {
    DATA_FILTERING_WARNING_MESSAGE,
    DISMISSED_FILTERING_MESSAGE_BANNER,
} from 'pages/aiAgent/analyticsAiAgent/constants'

const renderComponent = () =>
    render(
        <ThemeProvider>
            <AiAgentDataDelayBanner />
        </ThemeProvider>,
    )

describe('AiAgentDataDelayBanner', () => {
    beforeEach(() => {
        localStorage.clear()
    })

    it('renders the banner with the data filtering warning message by default', () => {
        renderComponent()

        expect(
            screen.getByText(DATA_FILTERING_WARNING_MESSAGE),
        ).toBeInTheDocument()
    })

    it('does not render the banner when the dismissed flag is set in localStorage', () => {
        localStorage.setItem(
            DISMISSED_FILTERING_MESSAGE_BANNER,
            JSON.stringify(true),
        )

        renderComponent()

        expect(
            screen.queryByText(DATA_FILTERING_WARNING_MESSAGE),
        ).not.toBeInTheDocument()
    })

    it('persists the dismissed flag to localStorage and hides the banner when the close button is clicked', async () => {
        const user = userEvent.setup()
        renderComponent()

        await user.click(screen.getByRole('button', { name: /close/i }))

        expect(
            screen.queryByText(DATA_FILTERING_WARNING_MESSAGE),
        ).not.toBeInTheDocument()
        expect(localStorage.getItem(DISMISSED_FILTERING_MESSAGE_BANNER)).toBe(
            'true',
        )
    })
})
