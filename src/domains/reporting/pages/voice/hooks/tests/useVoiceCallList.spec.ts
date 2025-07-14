import moment from 'moment/moment'

import { VoiceCallStatus } from '@gorgias/helpdesk-types'

import {
    VoiceCallDimension,
    VoiceCallMeasure,
} from 'domains/reporting/models/cubes/VoiceCallCube'
import {
    usePostReporting,
    UsePostReportingQueryData,
} from 'domains/reporting/models/queries'
import { voiceCallListQueryFactory } from 'domains/reporting/models/queryFactories/voice/voiceCall'
import { StatsFilters } from 'domains/reporting/models/stat/types'
import { CALL_LIST_PAGE_SIZE } from 'domains/reporting/pages/voice/constants/voiceOverview'
import {
    selectVoiceCallData,
    useVoiceCallList,
} from 'domains/reporting/pages/voice/hooks/useVoiceCallList'
import { VoiceCallStatListItem } from 'domains/reporting/pages/voice/models/types'
import { formatReportingQueryDate } from 'domains/reporting/utils/reporting'
import { OrderDirection } from 'models/api/types'
import { VoiceCallDisplayStatus } from 'models/voiceCall/types'
import { assumeMock } from 'utils/testing'
import { renderHook } from 'utils/testing/renderHook'

jest.mock('domains/reporting/models/queries')
const usePostReportingMock = assumeMock(usePostReporting)

describe('useVoiceCallList', () => {
    const statsFilters: StatsFilters = {
        period: {
            end_datetime: formatReportingQueryDate(moment()),
            start_datetime: formatReportingQueryDate(moment()),
        },
    }

    it('should usePostReporting with query and select', () => {
        renderHook(() => useVoiceCallList(statsFilters, 'UTC'))

        expect(usePostReportingMock.mock.calls[0]).toEqual([
            [
                voiceCallListQueryFactory(
                    statsFilters,
                    'UTC',
                    undefined,
                    CALL_LIST_PAGE_SIZE,
                    0,
                ),
            ],
            {
                select: selectVoiceCallData,
            },
        ])
    })

    it('should usePostReporting with order and sorting', () => {
        renderHook(() =>
            useVoiceCallList(
                statsFilters,
                'UTC',
                1,
                5,
                undefined,
                VoiceCallDimension.Duration,
                OrderDirection.Desc,
            ),
        )

        expect(usePostReportingMock.mock.calls[0]).toEqual([
            [
                voiceCallListQueryFactory(
                    statsFilters,
                    'UTC',
                    undefined,
                    5,
                    0,
                    VoiceCallDimension.Duration,
                    OrderDirection.Desc,
                ),
            ],
            {
                select: selectVoiceCallData,
            },
        ])
    })

    it('should usePostReporting with correct pagination', () => {
        renderHook(() => useVoiceCallList(statsFilters, 'UTC', 3, 5))

        expect(usePostReportingMock.mock.calls[0]).toEqual([
            [voiceCallListQueryFactory(statsFilters, 'UTC', undefined, 5, 10)],
            {
                select: selectVoiceCallData,
            },
        ])
    })

    it('should select voice call data correctly', () => {
        const mockedResponse = {
            data: {
                data: [
                    {
                        [VoiceCallDimension.AgentId]: '11',
                        [VoiceCallDimension.CustomerId]: '101',
                        [VoiceCallDimension.Direction]: 'inbound',
                        [VoiceCallDimension.IntegrationId]: '1',
                        [VoiceCallDimension.CreatedAt]: 'string',
                        [VoiceCallDimension.Status]: VoiceCallStatus.Answered,
                        [VoiceCallDimension.Duration]: '0',
                        [VoiceCallDimension.TicketId]: '123',
                        [VoiceCallDimension.PhoneNumberDestination]:
                            '+123456789',
                        [VoiceCallDimension.PhoneNumberSource]: '+123456788',
                        [VoiceCallMeasure.VoiceCallCount]: '1',
                        [VoiceCallDimension.TalkTime]: '12',
                        [VoiceCallDimension.WaitTime]: '65',
                        [VoiceCallDimension.VoicemailAvailable]: true,
                        [VoiceCallDimension.VoicemailUrl]: 'test-voicemail',
                        [VoiceCallDimension.CallRecordingAvailable]: true,
                        [VoiceCallDimension.CallRecordingUrl]: 'test-recording',
                        [VoiceCallDimension.DisplayStatus]:
                            VoiceCallDisplayStatus.Answered,
                        [VoiceCallDimension.QueueId]: '23',
                        [VoiceCallDimension.QueueName]: 'Test Queue',
                    },
                ],
            },
        } as UsePostReportingQueryData<VoiceCallStatListItem[]>
        const result = selectVoiceCallData(mockedResponse)

        expect(result).toEqual([
            {
                agentId: 11,
                customerId: 101,
                direction: 'inbound',
                integrationId: 1,
                createdAt: 'string',
                status: VoiceCallStatus.Answered,
                duration: 0,
                ticketId: 123,
                phoneNumberDestination: '+123456789',
                phoneNumberSource: '+123456788',
                talkTime: 12,
                waitTime: 65,
                voicemailAvailable: true,
                voicemailUrl: 'test-voicemail',
                callRecordingAvailable: true,
                callRecordingUrl: 'test-recording',
                displayStatus: VoiceCallDisplayStatus.Answered,
                queueId: 23,
                queueName: 'Test Queue',
            },
        ])
    })

    it('should select voice call data with null values', () => {
        const mockedResponse = {
            data: {
                data: [
                    {
                        [VoiceCallDimension.AgentId]: null,
                        [VoiceCallDimension.CustomerId]: null,
                        [VoiceCallDimension.Direction]: 'inbound',
                        [VoiceCallDimension.IntegrationId]: null,
                        [VoiceCallDimension.CreatedAt]: 'string',
                        [VoiceCallDimension.Status]: VoiceCallStatus.Answered,
                        [VoiceCallDimension.Duration]: null,
                        [VoiceCallDimension.TicketId]: null,
                        [VoiceCallDimension.PhoneNumberDestination]: 'test',
                        [VoiceCallDimension.PhoneNumberSource]: 'test',
                        [VoiceCallMeasure.VoiceCallCount]: '1',
                        [VoiceCallDimension.TalkTime]: null,
                        [VoiceCallDimension.WaitTime]: null,
                        [VoiceCallDimension.VoicemailAvailable]: null,
                        [VoiceCallDimension.VoicemailUrl]: null,
                        [VoiceCallDimension.CallRecordingAvailable]: null,
                        [VoiceCallDimension.CallRecordingUrl]: null,
                        [VoiceCallDimension.DisplayStatus]:
                            VoiceCallDisplayStatus.Answered,
                        [VoiceCallDimension.QueueId]: null,
                        [VoiceCallDimension.QueueName]: null,
                    },
                ],
            },
        } as UsePostReportingQueryData<VoiceCallStatListItem[]>
        const result = selectVoiceCallData(mockedResponse)

        expect(result).toEqual([
            {
                agentId: null,
                customerId: null,
                direction: 'inbound',
                integrationId: null,
                createdAt: 'string',
                status: VoiceCallStatus.Answered,
                duration: null,
                ticketId: null,
                phoneNumberDestination: 'test',
                phoneNumberSource: 'test',
                talkTime: null,
                waitTime: null,
                voicemailAvailable: null,
                voicemailUrl: null,
                callRecordingAvailable: null,
                callRecordingUrl: null,
                displayStatus: VoiceCallDisplayStatus.Answered,
                queueId: null,
                queueName: null,
            },
        ])
    })
})
