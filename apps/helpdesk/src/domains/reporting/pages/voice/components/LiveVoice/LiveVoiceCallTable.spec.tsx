import React from 'react'

import { assumeMock } from '@repo/testing'
import { act, render } from '@testing-library/react'

import { LiveCallQueueVoiceCall } from '@gorgias/helpdesk-queries'

import LiveVoiceCallTable from 'domains/reporting/pages/voice/components/LiveVoice/LiveVoiceCallTable'
import { LiveVoiceStatusFilterOption } from 'domains/reporting/pages/voice/components/LiveVoice/types'
import {
    filterLiveCallsByStatus,
    formatVoiceCallsData,
    orderLiveVoiceCallsByOngoingTime,
} from 'domains/reporting/pages/voice/components/LiveVoice/utils'
import { VoiceCallTableColumnName } from 'domains/reporting/pages/voice/components/VoiceCallTable/constants'
import VoiceCallTableContent from 'domains/reporting/pages/voice/components/VoiceCallTable/VoiceCallTableContent'
import { VoiceCallSummary } from 'domains/reporting/pages/voice/models/types'
import * as ToggleButton from 'pages/common/components/ToggleButton'

const renderComponent = () => {
    return render(<LiveVoiceCallTable voiceCalls={[]} isLoading={false} />)
}

jest.mock(
    'domains/reporting/pages/voice/components/VoiceCallTable/VoiceCallTableContent',
)
jest.mock('domains/reporting/pages/voice/components/LiveVoice/utils')

const VoiceCallTableContentMock = assumeMock(VoiceCallTableContent)
const toggleButtonSpy = jest.spyOn(ToggleButton, 'Wrapper')
const filterLiveCallsByStatusMock = assumeMock(filterLiveCallsByStatus)
const orderLiveVoiceCallsByOngoingTimeMock = assumeMock(
    orderLiveVoiceCallsByOngoingTime,
)
const formatVoiceCallsDataMock = assumeMock(formatVoiceCallsData)

describe('LiveVoiceCallTable', () => {
    beforeEach(() => {
        VoiceCallTableContentMock.mockReturnValue(
            <div>VoiceCallTableContent</div>,
        )
        filterLiveCallsByStatusMock.mockReturnValue([])
        orderLiveVoiceCallsByOngoingTimeMock.mockReturnValue([])
        formatVoiceCallsDataMock.mockReturnValue([])
    })

    describe('status filters (toggle buttons)', () => {
        it('the "ALL" status filter should be selected by default', () => {
            renderComponent()

            expect(toggleButtonSpy).toHaveBeenLastCalledWith(
                expect.objectContaining({
                    value: LiveVoiceStatusFilterOption.ALL,
                }),
                expect.anything(),
            )
        })

        it.each(['In progress', 'In queue'])(
            'should toggle selected filter to "%s"',
            (statusFilter) => {
                renderComponent()

                act(() => {
                    toggleButtonSpy.mock.calls?.[0]?.[0]?.onChange?.(
                        statusFilter,
                    )
                })

                expect(toggleButtonSpy).toHaveBeenLastCalledWith(
                    expect.objectContaining({
                        value: statusFilter,
                    }),
                    expect.anything(),
                )
                expect(filterLiveCallsByStatusMock).toHaveBeenCalledWith(
                    [],
                    statusFilter,
                )

                act(() => {
                    toggleButtonSpy.mock.calls?.[0]?.[0]?.onChange?.(
                        LiveVoiceStatusFilterOption.ALL,
                    )
                })

                expect(toggleButtonSpy).toHaveBeenLastCalledWith(
                    expect.objectContaining({
                        value: LiveVoiceStatusFilterOption.ALL,
                    }),
                    expect.anything(),
                )
            },
        )
    })

    it('should process voice calls in correct order before displaying them', () => {
        renderComponent()

        filterLiveCallsByStatusMock.mockImplementation(
            (voiceCalls: any) => [...voiceCalls, 1] as LiveCallQueueVoiceCall[],
        )
        orderLiveVoiceCallsByOngoingTimeMock.mockImplementation(
            (voiceCalls: any) => [...voiceCalls, 2] as LiveCallQueueVoiceCall[],
        )
        formatVoiceCallsDataMock.mockImplementation(
            (voiceCalls: any) => [...voiceCalls, 3] as VoiceCallSummary[],
        )

        act(() => {
            toggleButtonSpy.mock.calls?.[0]?.[0]?.onChange?.(
                LiveVoiceStatusFilterOption.IN_PROGRESS,
            )
        })
        expect(VoiceCallTableContentMock).toHaveBeenCalledWith(
            expect.objectContaining({
                data: [1, 2, 3],
            }),
            {},
        )
    })

    it('should toggle order direction', () => {
        renderComponent()

        act(() => {
            VoiceCallTableContentMock.mock.lastCall?.[0]?.onColumnClick?.(
                VoiceCallTableColumnName.OngoingTime,
            )
        })

        expect(orderLiveVoiceCallsByOngoingTimeMock).toHaveBeenCalledWith(
            [],
            'desc',
        )
        expect(VoiceCallTableContentMock).toHaveBeenLastCalledWith(
            expect.objectContaining({
                orderBy: VoiceCallTableColumnName.OngoingTime,
                orderDirection: 'desc',
            }),
            {},
        )
    })
})
