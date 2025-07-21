import React from 'react'

import { render } from '@testing-library/react'

import { VoiceCallDisplayStatus } from 'models/voiceCall/types'

import VoiceCallStatusLabel from './VoiceCallStatusLabel'

describe('VoiceCallStatusLabel', () => {
    it.each([
        [VoiceCallDisplayStatus.Ringing, 'Ringing', 'greyStatus'],
        [VoiceCallDisplayStatus.InProgress, 'In Progress', 'greenStatus'],
        [VoiceCallDisplayStatus.Answered, 'Answered', 'greenStatus'],
        [VoiceCallDisplayStatus.Missed, 'Missed', 'redStatus'],
        [VoiceCallDisplayStatus.Abandoned, 'Abandoned', 'redStatus'],
        [VoiceCallDisplayStatus.Cancelled, 'Cancelled', 'greyStatus'],
        [
            VoiceCallDisplayStatus.CallbackRequested,
            'Callback Requested',
            'redStatus',
        ],
        [VoiceCallDisplayStatus.Failed, 'Failed', 'redStatus'],
        [VoiceCallDisplayStatus.Unanswered, 'Unanswered', 'redStatus'],
    ])(
        'should render the ringing status',
        (displayStatus, prettyName, className) => {
            const { queryByText } = render(
                <VoiceCallStatusLabel displayStatus={displayStatus} />,
            )

            const status = queryByText(prettyName)
            expect(status).toBeInTheDocument()
            expect(status).toHaveClass(className)
        },
    )

    it('should not render anything if the display status is null', () => {
        const { container } = render(
            <VoiceCallStatusLabel displayStatus={null} />,
        )

        expect(container.firstChild).toBeNull()
    })
})
