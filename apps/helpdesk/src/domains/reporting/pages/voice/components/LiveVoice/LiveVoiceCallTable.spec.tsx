import React from 'react'

import { assumeMock } from '@repo/testing'
import { act, render } from '@testing-library/react'
import { fromJS } from 'immutable'

import type { LiveCallQueueVoiceCall } from '@gorgias/helpdesk-queries'

import { UserRole } from 'config/types/user'
import LiveVoiceCallTable from 'domains/reporting/pages/voice/components/LiveVoice/LiveVoiceCallTable'
import { LiveVoiceStatusFilterOption } from 'domains/reporting/pages/voice/components/LiveVoice/types'
import {
    filterLiveCallsByStatus,
    formatVoiceCallsData,
    orderLiveVoiceCallsByOngoingTime,
} from 'domains/reporting/pages/voice/components/LiveVoice/utils'
import { VoiceCallTableColumn } from 'domains/reporting/pages/voice/components/VoiceCallTable/constants'
import VoiceCallTableContent from 'domains/reporting/pages/voice/components/VoiceCallTable/VoiceCallTableContent'
import type { VoiceCallSummary } from 'domains/reporting/pages/voice/models/types'
import useAppSelector from 'hooks/useAppSelector'
import * as ToggleButton from 'pages/common/components/ToggleButton'

const renderComponent = () => {
    return render(<LiveVoiceCallTable voiceCalls={[]} isLoading={false} />)
}

jest.mock(
    'domains/reporting/pages/voice/components/VoiceCallTable/VoiceCallTableContent',
)
jest.mock('domains/reporting/pages/voice/components/LiveVoice/utils', () => {
    const actual = jest.requireActual(
        'domains/reporting/pages/voice/components/LiveVoice/utils',
    )
    return {
        ...actual,
        filterLiveCallsByStatus: jest.fn(),
        formatVoiceCallsData: jest.fn(),
        orderLiveVoiceCallsByOngoingTime: jest.fn(),
    }
})
jest.mock('hooks/useAppSelector')

const VoiceCallTableContentMock = assumeMock(VoiceCallTableContent)
const toggleButtonSpy = jest.spyOn(ToggleButton, 'Wrapper')
const filterLiveCallsByStatusMock = assumeMock(filterLiveCallsByStatus)
const orderLiveVoiceCallsByOngoingTimeMock = assumeMock(
    orderLiveVoiceCallsByOngoingTime,
)
const formatVoiceCallsDataMock = assumeMock(formatVoiceCallsData)
const useAppSelectorMock = assumeMock(useAppSelector)

describe('LiveVoiceCallTable', () => {
    beforeEach(() => {
        VoiceCallTableContentMock.mockReturnValue(
            <div>VoiceCallTableContent</div>,
        )
        filterLiveCallsByStatusMock.mockReturnValue([])
        orderLiveVoiceCallsByOngoingTimeMock.mockReturnValue([])
        formatVoiceCallsDataMock.mockReturnValue([])
        useAppSelectorMock.mockReturnValue(
            fromJS({ role: { name: UserRole.Admin } }),
        )
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
                VoiceCallTableColumn.OngoingTime,
            )
        })

        expect(orderLiveVoiceCallsByOngoingTimeMock).toHaveBeenCalledWith(
            [],
            'desc',
        )
        expect(VoiceCallTableContentMock).toHaveBeenLastCalledWith(
            expect.objectContaining({
                orderBy: VoiceCallTableColumn.OngoingTime,
                orderDirection: 'desc',
            }),
            {},
        )
    })

    describe('Monitor column', () => {
        it.each([UserRole.Admin, UserRole.Agent])(
            'should include Monitor column when user has permission',
            (role) => {
                useAppSelectorMock.mockReturnValue(
                    fromJS({ role: { name: role } }),
                )

                renderComponent()

                expect(VoiceCallTableContentMock).toHaveBeenCalledWith(
                    expect.objectContaining({
                        columns: expect.arrayContaining([
                            VoiceCallTableColumn.Monitor,
                        ]),
                    }),
                    {},
                )
            },
        )

        it('should not include Monitor column when user does not have permission', () => {
            useAppSelectorMock.mockReturnValue(
                fromJS({ role: { name: UserRole.LiteAgent } }),
            )

            renderComponent()

            expect(VoiceCallTableContentMock).toHaveBeenCalledWith(
                expect.objectContaining({
                    columns: expect.not.arrayContaining([
                        VoiceCallTableColumn.Monitor,
                    ]),
                }),
                {},
            )
        })
    })
})
