import { screen, waitFor } from '@testing-library/react'
import { HttpResponse } from 'msw'
import { vi } from 'vitest'

import {
    mockDeleteVoiceCallRecordingHandler,
    mockListUsersHandler,
    mockListUsersResponse,
    mockUser,
    mockVoiceCallRecording,
} from '@gorgias/helpdesk-mocks'
import { queryKeys } from '@gorgias/helpdesk-queries'
import type { VoiceCallRecording } from '@gorgias/helpdesk-types'

import { createTestQueryClient, render } from '../../../tests/render.utils'
import { server } from '../../../tests/server'
import { VoiceCallAudioPlayer } from '../components/VoiceCallAudioPlayer'
import {
    VoiceCallRecordingErrorCode,
    VoiceCallRecordingType,
} from '../models/types'

const deletingAgent = mockUser({ id: 99, name: 'Deleting Agent' })

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

describe('VoiceCallAudioPlayer', () => {
    describe('when normal recording is available', () => {
        beforeEach(() => {
            server.use(mockDeleteVoiceCallRecordingHandler().handler)
        })

        it('renders the play button for a normal recording', () => {
            const audio = mockVoiceCallRecording({
                id: 1,
                url: 'https://example.com/audio.mp3',
                deleted_datetime: undefined,
                error_code: null,
            }) as VoiceCallRecording

            render(
                <VoiceCallAudioPlayer
                    audio={audio}
                    type={VoiceCallRecordingType.Recording}
                />,
            )

            expect(
                screen.getByRole('button', { name: /play/i }),
            ).toBeInTheDocument()
        })

        it('invalidates voice call recordings query cache on successful delete', async () => {
            const queryClient = createTestQueryClient()
            const invalidateQueriesSpy = vi.spyOn(
                queryClient,
                'invalidateQueries',
            )

            const audio = mockVoiceCallRecording({
                id: 1,
                url: 'https://example.com/audio.mp3',
                deleted_datetime: undefined,
                error_code: null,
            }) as VoiceCallRecording

            const { user } = render(
                <VoiceCallAudioPlayer
                    audio={audio}
                    type={VoiceCallRecordingType.Recording}
                />,
                { queryClient },
            )

            await user.click(
                screen.getByRole('button', { name: /more options/i }),
            )
            await waitFor(() => {
                expect(
                    screen.getByRole('menuitem', { name: /delete/i }),
                ).toBeInTheDocument()
            })
            await user.click(screen.getByRole('menuitem', { name: /delete/i }))
            await user.click(screen.getByRole('button', { name: /^delete$/i }))

            await waitFor(() => {
                expect(invalidateQueriesSpy).toHaveBeenCalledWith({
                    queryKey: queryKeys.voiceCallRecordings.all(),
                })
            })
        })
    })

    it('shows "Call recording manually deleted" when recording is deleted (Recording type)', () => {
        const audio = mockVoiceCallRecording({
            id: 2,
            deleted_datetime: '2024-01-01T00:00:00Z',
            deleted_by_user_id: undefined,
            error_code: null,
        }) as VoiceCallRecording

        render(
            <VoiceCallAudioPlayer
                audio={audio}
                type={VoiceCallRecordingType.Recording}
            />,
        )

        expect(
            screen.getByText('Call recording manually deleted'),
        ).toBeInTheDocument()
    })

    it('shows "Voicemail recording manually deleted" when voicemail is deleted', () => {
        const audio = mockVoiceCallRecording({
            id: 3,
            deleted_datetime: '2024-01-01T00:00:00Z',
            deleted_by_user_id: undefined,
            error_code: null,
        }) as VoiceCallRecording

        render(
            <VoiceCallAudioPlayer
                audio={audio}
                type={VoiceCallRecordingType.Voicemail}
            />,
        )

        expect(
            screen.getByText('Voicemail recording manually deleted'),
        ).toBeInTheDocument()
    })

    describe('when recording is deleted by user', () => {
        beforeEach(() => {
            server.use(
                mockListUsersHandler(async () =>
                    HttpResponse.json(
                        mockListUsersResponse({
                            data: [deletingAgent],
                            meta: { prev_cursor: null, next_cursor: null },
                        }),
                    ),
                ).handler,
            )
        })

        it('shows who deleted the recording when deleted_by_user_id is provided', async () => {
            const audio = mockVoiceCallRecording({
                id: 4,
                deleted_datetime: '2024-01-01T00:00:00Z',
                deleted_by_user_id: 99,
                error_code: null,
            }) as VoiceCallRecording

            render(
                <VoiceCallAudioPlayer
                    audio={audio}
                    type={VoiceCallRecordingType.Recording}
                />,
            )

            await waitFor(() => {
                expect(screen.getByText('Deleting Agent')).toBeInTheDocument()
            })
        })
    })

    it('shows "The call recording is not available." for RECORDING_IS_PRIVATE error', () => {
        const audio = mockVoiceCallRecording({
            id: 5,
            deleted_datetime: undefined,
            error_code: VoiceCallRecordingErrorCode.RECORDING_IS_PRIVATE,
        }) as VoiceCallRecording

        render(
            <VoiceCallAudioPlayer
                audio={audio}
                type={VoiceCallRecordingType.Recording}
            />,
        )

        expect(
            screen.getByText('The call recording is not available.'),
        ).toBeInTheDocument()
    })
})
