import { screen, waitFor } from '@testing-library/react'

import { getCurrentUserHandler } from '../../../tests/getCurrentUser.mock'
import { render } from '../../../tests/render.utils'
import { server } from '../../../tests/server'
import { VoiceCallDateTime } from '../components/VoiceCallDateTime'

beforeEach(() => {
    server.use(getCurrentUserHandler().handler)
})

describe('VoiceCallDateTime', () => {
    it('renders a formatted date/time string after user preferences load', async () => {
        render(<VoiceCallDateTime datetime="2024-03-21T11:00:00Z" />)

        await waitFor(() => {
            expect(screen.getByText(/2024/)).toBeInTheDocument()
        })
    })
})
