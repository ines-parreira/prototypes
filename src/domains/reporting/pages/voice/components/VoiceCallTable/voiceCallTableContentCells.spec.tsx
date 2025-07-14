import { render, screen } from '@testing-library/react'

import { VoiceCallStatus } from '@gorgias/helpdesk-queries'

import LiveVoiceCallStatusLabel from 'domains/reporting/pages/voice/components/LiveVoice/LiveVoiceCallStatusLabel'
import VoiceCallRecording from 'domains/reporting/pages/voice/components/VoiceCallRecording/VoiceCallRecording'
import { VoiceCallTableColumnName } from 'domains/reporting/pages/voice/components/VoiceCallTable/constants'
import {
    getOrderedCells,
    getOrderedHeaderCells,
} from 'domains/reporting/pages/voice/components/VoiceCallTable/voiceCallTableContentCells'
import { VoiceCallSummary } from 'domains/reporting/pages/voice/models/types'
import { VoiceCallDisplayStatus } from 'models/voiceCall/types'
import VoiceCallStatusLabel from 'pages/common/components/VoiceCallStatusLabel/VoiceCallStatusLabel'
import VoiceCallTimerBadge from 'pages/common/components/VoiceCallTimerBadge/VoiceCallTimerBadge'
import { assumeMock } from 'utils/testing'

jest.mock(
    'domains/reporting/pages/voice/components/LiveVoice/LiveVoiceCallStatusLabel',
)
jest.mock('pages/common/components/VoiceCallTimerBadge/VoiceCallTimerBadge')
jest.mock(
    'domains/reporting/pages/voice/components/VoiceCallRecording/VoiceCallRecording',
)
jest.mock('pages/common/components/VoiceCallStatusLabel/VoiceCallStatusLabel')

const LiveVoiceCallStatusLabelMock = assumeMock(LiveVoiceCallStatusLabel)
const VoiceCallTimerBadgeMock = assumeMock(VoiceCallTimerBadge)
const VoiceCallRecordingMock = assumeMock(VoiceCallRecording)
const VoiceCallStatusLabelMock = assumeMock(VoiceCallStatusLabel)

describe('voiceCallTableContentCells', () => {
    describe('header cells ', () => {
        it('should return a list of {key, props} objects in the order specified by the columns arg', () => {
            const columns = [
                VoiceCallTableColumnName.Activity,
                VoiceCallTableColumnName.Integration,
                VoiceCallTableColumnName.Queue,
                VoiceCallTableColumnName.Date,
                VoiceCallTableColumnName.OngoingTime,
                VoiceCallTableColumnName.State,
                VoiceCallTableColumnName.LiveStatus,
                VoiceCallTableColumnName.Recording,
                VoiceCallTableColumnName.Duration,
                VoiceCallTableColumnName.TalkTime,
                VoiceCallTableColumnName.WaitTime,
                VoiceCallTableColumnName.Ticket,
                VoiceCallTableColumnName.OngoingTime,
                VoiceCallTableColumnName.LiveStatus,
            ]

            const result = getOrderedHeaderCells({
                columns,
                isTableScrolled: false,
            })

            expect(result.map((cell) => cell.key)).toEqual([
                VoiceCallTableColumnName.Activity,
                VoiceCallTableColumnName.Integration,
                VoiceCallTableColumnName.Queue,
                VoiceCallTableColumnName.Date,
                VoiceCallTableColumnName.OngoingTime,
                VoiceCallTableColumnName.State,
                VoiceCallTableColumnName.LiveStatus,
                VoiceCallTableColumnName.Recording,
                VoiceCallTableColumnName.Duration,
                VoiceCallTableColumnName.TalkTime,
                VoiceCallTableColumnName.WaitTime,
                VoiceCallTableColumnName.Ticket,
                VoiceCallTableColumnName.OngoingTime,
                VoiceCallTableColumnName.LiveStatus,
            ])

            /* each cell should have props */
            result.forEach((cell) => {
                expect(cell.props).toBeDefined()
            })
        })

        it('should return the custom title for the OngoingTime column when it is provided', () => {
            const columns = [VoiceCallTableColumnName.OngoingTime]

            const result = getOrderedHeaderCells({
                columns,
                isTableScrolled: false,
                ongoingTimeColumnTitle: 'Custom title',
            })

            expect(result[0].props.title).toEqual('Custom title')
        })
    })

    describe('getOrderedCells', () => {
        it('should return a list of {key, props} objects in the order specified by the columns arg', () => {
            const columns = [
                VoiceCallTableColumnName.Activity,
                VoiceCallTableColumnName.Integration,
                VoiceCallTableColumnName.Queue,
                VoiceCallTableColumnName.Date,
                VoiceCallTableColumnName.OngoingTime,
                VoiceCallTableColumnName.State,
                VoiceCallTableColumnName.LiveStatus,
                VoiceCallTableColumnName.Recording,
                VoiceCallTableColumnName.Duration,
                VoiceCallTableColumnName.TalkTime,
                VoiceCallTableColumnName.WaitTime,
                VoiceCallTableColumnName.Ticket,
                VoiceCallTableColumnName.OngoingTime,
                VoiceCallTableColumnName.LiveStatus,
            ]

            const result = getOrderedCells({
                item: {} as VoiceCallSummary,
                columns,
                isTableScrolled: false,
            })

            expect(result.map((cell) => cell.key)).toEqual([
                VoiceCallTableColumnName.Activity,
                VoiceCallTableColumnName.Integration,
                VoiceCallTableColumnName.Queue,
                VoiceCallTableColumnName.Date,
                VoiceCallTableColumnName.OngoingTime,
                VoiceCallTableColumnName.State,
                VoiceCallTableColumnName.LiveStatus,
                VoiceCallTableColumnName.Recording,
                VoiceCallTableColumnName.Duration,
                VoiceCallTableColumnName.TalkTime,
                VoiceCallTableColumnName.WaitTime,
                VoiceCallTableColumnName.Ticket,
                VoiceCallTableColumnName.OngoingTime,
                VoiceCallTableColumnName.LiveStatus,
            ])

            /* each cell should have props */
            result.forEach((cell) => {
                expect(cell.props).toBeDefined()
            })
        })

        it('should return correct props for the LiveStatus cell', () => {
            LiveVoiceCallStatusLabelMock.mockReturnValue(<div>LiveStatus</div>)

            const columns = [VoiceCallTableColumnName.LiveStatus]

            const result = getOrderedCells({
                item: {
                    direction: 'inbound',
                    status: VoiceCallStatus.InProgress,
                } as VoiceCallSummary,
                columns,
                isTableScrolled: false,
            })

            render(result[0].props.children as any)
            expect(LiveVoiceCallStatusLabelMock).toHaveBeenCalledWith(
                {
                    direction: 'inbound',
                    status: VoiceCallStatus.InProgress,
                },
                {},
            )

            expect(screen.getByText('LiveStatus')).toBeInTheDocument()
        })

        it('should return correct props for the Ongoing Time cell', () => {
            VoiceCallTimerBadgeMock.mockReturnValue(<div>TimerBadge</div>)

            const columns = [VoiceCallTableColumnName.OngoingTime]

            const result = getOrderedCells({
                item: {
                    createdAt: '123',
                } as VoiceCallSummary,
                columns,
                isTableScrolled: false,
            })

            render(result[0].props.children as any)
            expect(VoiceCallTimerBadgeMock).toHaveBeenCalledWith(
                {
                    datetime: '123',
                },
                {},
            )
            expect(screen.getByText('TimerBadge')).toBeInTheDocument()
        })

        describe('Recording cell', () => {
            it('should return correct props for the Recording cell when recording is downloadable', () => {
                VoiceCallRecordingMock.mockReturnValue(<div>Recording</div>)

                const columns = [VoiceCallTableColumnName.Recording]

                const result = getOrderedCells({
                    item: {} as VoiceCallSummary,
                    columns,
                    isTableScrolled: false,
                    isRecordingDownloadable: true,
                })

                render(result[0].props.children as any)
                expect(VoiceCallRecordingMock).toHaveBeenCalledWith(
                    {
                        isDownloadable: true,
                        voiceCall: {},
                    },
                    {},
                )
                expect(screen.getByText('Recording')).toBeInTheDocument()
            })

            it('should return correct props for the Recording cell when recording is not downloadable', () => {
                VoiceCallRecordingMock.mockReturnValue(<div>Recording</div>)

                const columns = [VoiceCallTableColumnName.Recording]

                const result = getOrderedCells({
                    item: {} as VoiceCallSummary,
                    columns,
                    isTableScrolled: false,
                    isRecordingDownloadable: false,
                })

                render(result[0].props.children as any)
                expect(VoiceCallRecordingMock).toHaveBeenCalledWith(
                    {
                        isDownloadable: false,
                        voiceCall: {},
                    },
                    {},
                )
                expect(screen.getByText('Recording')).toBeInTheDocument()
            })
        })

        it('should return correct props for the state cell', () => {
            VoiceCallStatusLabelMock.mockReturnValue(<div>Status</div>)

            const columns = [VoiceCallTableColumnName.State]

            const result = getOrderedCells({
                item: {
                    displayStatus: VoiceCallDisplayStatus.Answered,
                } as VoiceCallSummary,
                columns,
                isTableScrolled: false,
            })

            render(result[0].props.children as any)
            expect(VoiceCallStatusLabelMock).toHaveBeenCalledWith(
                {
                    displayStatus: VoiceCallDisplayStatus.Answered,
                },
                {},
            )
            expect(screen.getByText('Status')).toBeInTheDocument()
        })
    })
})
