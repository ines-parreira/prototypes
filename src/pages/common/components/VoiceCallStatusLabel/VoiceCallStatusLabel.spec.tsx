import React from 'react'
import {render} from '@testing-library/react'
import {VoiceCallStatus} from 'models/voiceCall/types'
import VoiceCallStatusLabel from './VoiceCallStatusLabel'

describe('VoiceCallStatusLabel', () => {
    it.each([
        VoiceCallStatus.Initiated,
        VoiceCallStatus.Ringing,
        VoiceCallStatus.InProgress,
        VoiceCallStatus.Queued,
    ])(
        'should render ringing for inbound calls',
        (voiceCallStatus: VoiceCallStatus) => {
            const {getByText} = render(
                <VoiceCallStatusLabel
                    voiceCallStatus={voiceCallStatus}
                    direction={'inbound'}
                />
            )
            const status = getByText('Ringing')
            expect(status).toBeInTheDocument()
            expect(status).not.toHaveClass('redStatus')
            expect(status).not.toHaveClass('greenStatus')
        }
    )

    it.each([
        VoiceCallStatus.Initiated,
        VoiceCallStatus.Ringing,
        VoiceCallStatus.InProgress,
        VoiceCallStatus.Queued,
    ])(
        'should render ringing for outbound calls',
        (voiceCallStatus: VoiceCallStatus) => {
            const {getByText} = render(
                <VoiceCallStatusLabel
                    voiceCallStatus={voiceCallStatus}
                    direction={'outbound'}
                />
            )
            const status = getByText('Ringing')
            expect(status).toBeInTheDocument()
            expect(status).not.toHaveClass('redStatus')
            expect(status).not.toHaveClass('greenStatus')
        }
    )

    it.each([VoiceCallStatus.Failed, VoiceCallStatus.NoAnswer])(
        'should render failed for inbound calls',
        (voiceCallStatus: VoiceCallStatus) => {
            const {getByText} = render(
                <VoiceCallStatusLabel
                    voiceCallStatus={voiceCallStatus}
                    direction={'inbound'}
                />
            )
            const status = getByText('Failed')
            expect(status).toBeInTheDocument()
            expect(status).toHaveClass('redStatus')
            expect(status).not.toHaveClass('greenStatus')
        }
    )

    it('should render failed for outbound calls', () => {
        const {getByText} = render(
            <VoiceCallStatusLabel
                voiceCallStatus={VoiceCallStatus.Failed}
                direction={'outbound'}
            />
        )
        const status = getByText('Failed')
        expect(status).toBeInTheDocument()
        expect(status).toHaveClass('redStatus')
        expect(status).not.toHaveClass('greenStatus')
    })

    it.each([
        VoiceCallStatus.Missed,
        VoiceCallStatus.Busy,
        VoiceCallStatus.Canceled,
        VoiceCallStatus.Ending,
    ])(
        'should render missed for inbound calls',
        (voiceCallStatus: VoiceCallStatus) => {
            const {getByText} = render(
                <VoiceCallStatusLabel
                    voiceCallStatus={voiceCallStatus}
                    direction={'inbound'}
                />
            )
            const status = getByText('Missed')
            expect(status).toBeInTheDocument()
            expect(status).toHaveClass('redStatus')
            expect(status).not.toHaveClass('greenStatus')
        }
    )

    it.each([
        VoiceCallStatus.Missed,
        VoiceCallStatus.Busy,
        VoiceCallStatus.Canceled,
        VoiceCallStatus.NoAnswer,
    ])(
        'should render missed for outbound calls',
        (voiceCallStatus: VoiceCallStatus) => {
            const {getByText} = render(
                <VoiceCallStatusLabel
                    voiceCallStatus={voiceCallStatus}
                    direction={'outbound'}
                />
            )
            const status = getByText('Missed')
            expect(status).toBeInTheDocument()
            expect(status).toHaveClass('redStatus')
            expect(status).not.toHaveClass('greenStatus')
        }
    )

    it.each([VoiceCallStatus.Answered, VoiceCallStatus.Connected])(
        'should render in progress for inbound calls',
        (voiceCallStatus: VoiceCallStatus) => {
            const {getByText} = render(
                <VoiceCallStatusLabel
                    voiceCallStatus={voiceCallStatus}
                    direction={'inbound'}
                />
            )
            const status = getByText('In progress')
            expect(status).toBeInTheDocument()
            expect(status).not.toHaveClass('redStatus')
            expect(status).toHaveClass('greenStatus')
        }
    )

    it.each([VoiceCallStatus.Answered, VoiceCallStatus.Connected])(
        'should render in progress for outbound calls',
        (voiceCallStatus: VoiceCallStatus) => {
            const {getByText} = render(
                <VoiceCallStatusLabel
                    voiceCallStatus={voiceCallStatus}
                    direction={'outbound'}
                />
            )
            const status = getByText('In progress')
            expect(status).toBeInTheDocument()
            expect(status).not.toHaveClass('redStatus')
            expect(status).toHaveClass('greenStatus')
        }
    )

    it.each(['inbound', 'outbound'])('should render answered', (direction) => {
        const {getByText} = render(
            <VoiceCallStatusLabel
                voiceCallStatus={VoiceCallStatus.Completed}
                direction={direction}
            />
        )
        const status = getByText('Answered')
        expect(status).toBeInTheDocument()
        expect(status).not.toHaveClass('redStatus')
        expect(status).toHaveClass('greenStatus')
    })

    it('should render missed', () => {
        const {getByText} = render(
            <VoiceCallStatusLabel
                voiceCallStatus={VoiceCallStatus.Completed}
                direction={'inbound'}
                lastAnsweredByAgentId={null}
            />
        )
        const status = getByText('Missed')
        expect(status).toBeInTheDocument()
        expect(status).toHaveClass('redStatus')
        expect(status).not.toHaveClass('greenStatus')
    })
})
