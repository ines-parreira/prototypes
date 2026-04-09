import { screen, waitFor } from '@testing-library/react'
import { HttpResponse } from 'msw'
import { vi } from 'vitest'

import {
    mockListVoiceCallRecordingsHandler,
    mockListVoiceCallRecordingsResponse,
    mockVoiceCall,
} from '@gorgias/helpdesk-mocks'
import type { VoiceCall } from '@gorgias/helpdesk-queries'
import { VoiceCallStatus } from '@gorgias/helpdesk-types'

import { getCurrentUserHandler } from '../../../tests/getCurrentUser.mock'
import { render } from '../../../tests/render.utils'
import { server } from '../../../tests/server'
import { VoiceCallContainer } from '../components/VoiceCallContainer'

beforeAll(() => {
    window.HTMLMediaElement.prototype.play = vi
        .fn()
        .mockResolvedValue(undefined)
    window.HTMLMediaElement.prototype.pause = vi.fn()
    window.GORGIAS_STATE = {
        currentAccount: { domain: 'test' },
    } as typeof window.GORGIAS_STATE
})

afterAll(() => {
    delete (window as any).GORGIAS_STATE
})

const emptyRecordingsHandler = mockListVoiceCallRecordingsHandler(async () =>
    HttpResponse.json(mockListVoiceCallRecordingsResponse({ data: [] })),
)

beforeEach(() => {
    server.use(getCurrentUserHandler().handler, emptyRecordingsHandler.handler)
})

function renderContainer(
    voiceCall: VoiceCall,
    extra?: {
        renderMonitorCallButton?: (voiceCall: VoiceCall) => React.ReactNode
    },
) {
    return render(
        <VoiceCallContainer
            header={<span>Test Header</span>}
            callStatus={<span>Test Status</span>}
            dateTime="2024-03-21T11:00:00Z"
            voiceCall={voiceCall}
            directionIcon="arrow-down"
            avatarName="Test User"
            renderMonitorCallButton={extra?.renderMonitorCallButton}
        />,
    )
}

describe('VoiceCallContainer', () => {
    it('renders the provided header content', async () => {
        const voiceCall = mockVoiceCall({
            id: 1,
            status: VoiceCallStatus.Completed,
            has_call_recording: false,
            has_voicemail: false,
        }) as unknown as VoiceCall

        renderContainer(voiceCall)

        await waitFor(() => {
            expect(screen.getByText('Test Header')).toBeInTheDocument()
        })
    })

    it('renders the callStatus content', async () => {
        const voiceCall = mockVoiceCall({
            id: 1,
            status: VoiceCallStatus.Completed,
            has_call_recording: false,
            has_voicemail: false,
        }) as unknown as VoiceCall

        renderContainer(voiceCall)

        await waitFor(() => {
            expect(screen.getByText('Test Status')).toBeInTheDocument()
        })
    })

    it('renders monitor button when renderMonitorCallButton is provided and call status is not final', async () => {
        const voiceCall = mockVoiceCall({
            id: 1,
            status: VoiceCallStatus.Ringing,
            has_call_recording: false,
            has_voicemail: false,
        }) as unknown as VoiceCall

        renderContainer(voiceCall, {
            renderMonitorCallButton: () => <button>Monitor</button>,
        })

        await waitFor(() => {
            expect(
                screen.getByRole('button', { name: 'Monitor' }),
            ).toBeInTheDocument()
        })
    })

    it('does not render monitor button when call status is final', async () => {
        const voiceCall = mockVoiceCall({
            id: 1,
            status: VoiceCallStatus.Completed,
            has_call_recording: false,
            has_voicemail: false,
        }) as unknown as VoiceCall

        renderContainer(voiceCall, {
            renderMonitorCallButton: () => <button>Monitor</button>,
        })

        await waitFor(() => {
            expect(screen.getByText('Test Header')).toBeInTheDocument()
            expect(
                screen.queryByRole('button', { name: 'Monitor' }),
            ).not.toBeInTheDocument()
        })
    })

    it('renders "Call recording" section when has_call_recording is true', async () => {
        const voiceCall = mockVoiceCall({
            id: 1,
            status: VoiceCallStatus.Completed,
            has_call_recording: true,
            has_voicemail: false,
        }) as unknown as VoiceCall

        renderContainer(voiceCall)

        await waitFor(() => {
            expect(screen.getByText('Call recording')).toBeInTheDocument()
        })
    })

    it('renders "Voicemail left" section when has_voicemail is true', async () => {
        const voiceCall = mockVoiceCall({
            id: 1,
            status: VoiceCallStatus.Completed,
            has_call_recording: false,
            has_voicemail: true,
        }) as unknown as VoiceCall

        renderContainer(voiceCall)

        await waitFor(() => {
            expect(screen.getByText('Voicemail left')).toBeInTheDocument()
        })
    })
})
