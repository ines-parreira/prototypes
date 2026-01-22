import { assumeMock } from '@repo/testing'
import { render, screen } from '@testing-library/react'

import { VoiceCallStatus } from '@gorgias/helpdesk-queries'

import LiveVoiceCallStatusLabel from 'domains/reporting/pages/voice/components/LiveVoice/LiveVoiceCallStatusLabel'
import MonitorCell from 'domains/reporting/pages/voice/components/LiveVoice/MonitorCell'
import VoiceCallRecording from 'domains/reporting/pages/voice/components/VoiceCallRecording/VoiceCallRecording'
import {
    VoiceCallTableColumn,
    voiceCallTableColumnName,
} from 'domains/reporting/pages/voice/components/VoiceCallTable/constants'
import {
    getOrderedCells,
    getOrderedHeaderCells,
} from 'domains/reporting/pages/voice/components/VoiceCallTable/voiceCallTableContentCells'
import VoiceCallTransferActivity from 'domains/reporting/pages/voice/components/VoiceCallTransferActivity/VoiceCallTransferActivity'
import type { VoiceCallSummary } from 'domains/reporting/pages/voice/models/types'
import { VoiceCallDisplayStatus } from 'models/voiceCall/types'
import VoiceCallStatusLabel from 'pages/common/components/VoiceCallStatusLabel/VoiceCallStatusLabel'
import VoiceCallTimerBadge from 'pages/common/components/VoiceCallTimerBadge/VoiceCallTimerBadge'

jest.mock(
    'domains/reporting/pages/voice/components/LiveVoice/LiveVoiceCallStatusLabel',
)
jest.mock('domains/reporting/pages/voice/components/LiveVoice/MonitorCell')
jest.mock('pages/common/components/VoiceCallTimerBadge/VoiceCallTimerBadge')
jest.mock(
    'domains/reporting/pages/voice/components/VoiceCallRecording/VoiceCallRecording',
)
jest.mock(
    'domains/reporting/pages/voice/components/VoiceCallTransferActivity/VoiceCallTransferActivity',
)
jest.mock('pages/common/components/VoiceCallStatusLabel/VoiceCallStatusLabel')

const LiveVoiceCallStatusLabelMock = assumeMock(LiveVoiceCallStatusLabel)
const MonitorCellMock = assumeMock(MonitorCell)
const VoiceCallTimerBadgeMock = assumeMock(VoiceCallTimerBadge)
const VoiceCallRecordingMock = assumeMock(VoiceCallRecording)
const VoiceCallTransferActivityMock = assumeMock(VoiceCallTransferActivity)
const VoiceCallStatusLabelMock = assumeMock(VoiceCallStatusLabel)

describe('voiceCallTableContentCells', () => {
    describe('header cells ', () => {
        it('should return a list of {key, props} objects in the order specified by the columns arg', () => {
            const columns = [
                VoiceCallTableColumn.Activity,
                VoiceCallTableColumn.TransferActivity,
                VoiceCallTableColumn.Integration,
                VoiceCallTableColumn.Queue,
                VoiceCallTableColumn.Date,
                VoiceCallTableColumn.OngoingTime,
                VoiceCallTableColumn.State,
                VoiceCallTableColumn.LiveStatus,
                VoiceCallTableColumn.Recording,
                VoiceCallTableColumn.Duration,
                VoiceCallTableColumn.TalkTime,
                VoiceCallTableColumn.WaitTime,
                VoiceCallTableColumn.Ticket,
                VoiceCallTableColumn.OngoingTime,
                VoiceCallTableColumn.LiveStatus,
            ]

            const result = getOrderedHeaderCells({
                columns,
                isTableScrolled: false,
            })

            expect(result.map((cell) => cell.key)).toEqual([
                VoiceCallTableColumn.Activity,
                VoiceCallTableColumn.TransferActivity,
                VoiceCallTableColumn.Integration,
                VoiceCallTableColumn.Queue,
                VoiceCallTableColumn.Date,
                VoiceCallTableColumn.OngoingTime,
                VoiceCallTableColumn.State,
                VoiceCallTableColumn.LiveStatus,
                VoiceCallTableColumn.Recording,
                VoiceCallTableColumn.Duration,
                VoiceCallTableColumn.TalkTime,
                VoiceCallTableColumn.WaitTime,
                VoiceCallTableColumn.Ticket,
                VoiceCallTableColumn.OngoingTime,
                VoiceCallTableColumn.LiveStatus,
            ])

            /* each cell should have props */
            result.forEach((cell) => {
                expect(cell.props).toBeDefined()
                expect(cell.props.title).toEqual(
                    voiceCallTableColumnName[cell.key],
                )
            })
        })

        it('should return the custom title for the OngoingTime column when it is provided', () => {
            const columns = [VoiceCallTableColumn.OngoingTime]

            const result = getOrderedHeaderCells({
                columns,
                isTableScrolled: false,
                ongoingTimeColumnTitle: 'Custom title',
            })

            expect(result[0].props.title).toEqual('Custom title')
        })

        it('should include SlaStatus column when present', () => {
            const columns = [VoiceCallTableColumn.SlaStatus]

            const result = getOrderedHeaderCells({
                columns,
                isTableScrolled: false,
            })

            expect(result[0].props.title).toEqual(
                voiceCallTableColumnName[VoiceCallTableColumn.SlaStatus],
            )
        })
    })

    describe('getOrderedCells', () => {
        it('should return a list of {key, props} objects in the order specified by the columns arg', () => {
            const columns = [
                VoiceCallTableColumn.Activity,
                VoiceCallTableColumn.TransferActivity,
                VoiceCallTableColumn.Integration,
                VoiceCallTableColumn.Queue,
                VoiceCallTableColumn.Date,
                VoiceCallTableColumn.OngoingTime,
                VoiceCallTableColumn.State,
                VoiceCallTableColumn.LiveStatus,
                VoiceCallTableColumn.Recording,
                VoiceCallTableColumn.Duration,
                VoiceCallTableColumn.TalkTime,
                VoiceCallTableColumn.WaitTime,
                VoiceCallTableColumn.Ticket,
                VoiceCallTableColumn.OngoingTime,
                VoiceCallTableColumn.LiveStatus,
            ]

            const result = getOrderedCells({
                item: {} as VoiceCallSummary,
                columns,
                isTableScrolled: false,
            })

            expect(result.map((cell) => cell.key)).toEqual([
                VoiceCallTableColumn.Activity,
                VoiceCallTableColumn.TransferActivity,
                VoiceCallTableColumn.Integration,
                VoiceCallTableColumn.Queue,
                VoiceCallTableColumn.Date,
                VoiceCallTableColumn.OngoingTime,
                VoiceCallTableColumn.State,
                VoiceCallTableColumn.LiveStatus,
                VoiceCallTableColumn.Recording,
                VoiceCallTableColumn.Duration,
                VoiceCallTableColumn.TalkTime,
                VoiceCallTableColumn.WaitTime,
                VoiceCallTableColumn.Ticket,
                VoiceCallTableColumn.OngoingTime,
                VoiceCallTableColumn.LiveStatus,
            ])

            /* each cell should have props */
            result.forEach((cell) => {
                expect(cell.props).toBeDefined()
            })
        })

        it('should return correct props for the LiveStatus cell', () => {
            LiveVoiceCallStatusLabelMock.mockReturnValue(<div>LiveStatus</div>)

            const columns = [VoiceCallTableColumn.LiveStatus]

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

            const columns = [VoiceCallTableColumn.OngoingTime]

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

                const columns = [VoiceCallTableColumn.Recording]

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

                const columns = [VoiceCallTableColumn.Recording]

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

            const columns = [VoiceCallTableColumn.State]

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

        it('should return correct props for the TransferActivity cell', () => {
            VoiceCallTransferActivityMock.mockReturnValue(
                <div>TransferActivity</div>,
            )

            const columns = [VoiceCallTableColumn.TransferActivity]
            const mockVoiceCall = {
                id: 'test-call-id',
            } as unknown as VoiceCallSummary

            const result = getOrderedCells({
                item: mockVoiceCall,
                columns,
                isTableScrolled: false,
            })

            render(result[0].props.children as any)
            expect(VoiceCallTransferActivityMock).toHaveBeenCalledWith(
                {
                    voiceCall: mockVoiceCall,
                },
                {},
            )
            expect(screen.getByText('TransferActivity')).toBeInTheDocument()
        })

        it('should return correct props for the Monitor cell', () => {
            MonitorCellMock.mockReturnValue(<div>MonitorCell</div>)

            const columns = [VoiceCallTableColumn.Monitor]
            const mockVoiceCall = {
                callSid: 'CA123456',
            } as VoiceCallSummary

            const result = getOrderedCells({
                item: mockVoiceCall,
                columns,
                isTableScrolled: false,
            })

            render(result[0].props.children as any)
            expect(MonitorCellMock).toHaveBeenCalledWith(
                {
                    voiceCall: mockVoiceCall,
                },
                {},
            )
            expect(screen.getByText('MonitorCell')).toBeInTheDocument()
        })

        describe('SlaStatus cell', () => {
            it('should render "Achieved" when callSlaStatus is 0', () => {
                const columns = [VoiceCallTableColumn.SlaStatus]
                const mockVoiceCall = {
                    callSlaStatus: '0',
                } as VoiceCallSummary

                const result = getOrderedCells({
                    item: mockVoiceCall,
                    columns,
                    isTableScrolled: false,
                })

                render(result[0].props.children as any)
                expect(screen.getByText('Achieved')).toBeInTheDocument()
            })

            it('should render "Breached" when callSlaStatus is 1', () => {
                const columns = [VoiceCallTableColumn.SlaStatus]
                const mockVoiceCall = {
                    callSlaStatus: '1',
                } as VoiceCallSummary

                const result = getOrderedCells({
                    item: mockVoiceCall,
                    columns,
                    isTableScrolled: false,
                })

                render(result[0].props.children as any)
                expect(screen.getByText('Breached')).toBeInTheDocument()
            })

            it('should render "-" when callSlaStatus is null', () => {
                const columns = [VoiceCallTableColumn.SlaStatus]
                const mockVoiceCall = {
                    callSlaStatus: null,
                } as VoiceCallSummary

                const result = getOrderedCells({
                    item: mockVoiceCall,
                    columns,
                    isTableScrolled: false,
                })

                render(result[0].props.children as any)
                expect(screen.getByText('-')).toBeInTheDocument()
            })
        })
    })
})
