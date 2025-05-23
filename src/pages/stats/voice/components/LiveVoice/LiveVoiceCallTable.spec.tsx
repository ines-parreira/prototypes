import React from 'react'

import { act, render } from '@testing-library/react'

import { LiveCallQueueVoiceCall } from '@gorgias/helpdesk-queries'

import * as ToggleButton from 'pages/common/components/ToggleButton'
import { assumeMock } from 'utils/testing'

import { VoiceCallSummary } from '../../models/types'
import { VoiceCallTableColumnName } from '../VoiceCallTable/constants'
import VoiceCallTableContent from '../VoiceCallTable/VoiceCallTableContent'
import LiveVoiceCallTable from './LiveVoiceCallTable'
import { LiveVoiceStatusFilterOption } from './types'
import {
    filterLiveCallsByStatus,
    formatVoiceCallsData,
    orderLiveVoiceCallsByOngoingTime,
} from './utils'

const renderComponent = () => {
    return render(<LiveVoiceCallTable voiceCalls={[]} isLoading={false} />)
}

jest.mock('pages/stats/voice/components/VoiceCallTable/VoiceCallTableContent')
jest.mock('pages/stats/voice/components/LiveVoice/utils')

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
