import React from 'react'
import {render} from '@testing-library/react'
import {VOICE_OVERVIEW_PAGE_TITLE} from 'pages/stats/voice/constants/voiceOverview'
import VoiceOverview from '../VoiceOverview'

describe('VoiceOverview', () => {
    it('should render page title', async () => {
        const {findByText} = render(<VoiceOverview />)
        expect(await findByText(VOICE_OVERVIEW_PAGE_TITLE)).toBeInTheDocument()
    })
})
