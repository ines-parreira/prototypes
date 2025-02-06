import {renderHook} from '@testing-library/react-hooks'
import moment from 'moment/moment'

import {OrderDirection} from 'models/api/types'
import {
    VoiceCallDimension,
    VoiceCallMeasure,
} from 'models/reporting/cubes/VoiceCallCube'
import {
    usePostReporting,
    UsePostReportingQueryData,
} from 'models/reporting/queries'
import {voiceCallListQueryFactory} from 'models/reporting/queryFactories/voice/voiceCall'
import {StatsFilters} from 'models/stat/types'
import {VoiceCallStatus} from 'models/voiceCall/types'
import {formatReportingQueryDate} from 'utils/reporting'
import {assumeMock} from 'utils/testing'

import {CALL_LIST_PAGE_SIZE} from '../../constants/voiceOverview'
import {VoiceCallStatListItem} from '../../models/types'
import {selectVoiceCallData, useVoiceCallList} from '../useVoiceCallList'

jest.mock('models/reporting/queries')
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
                    0
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
                OrderDirection.Desc
            )
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
                    OrderDirection.Desc
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
            },
        ])
    })
})
