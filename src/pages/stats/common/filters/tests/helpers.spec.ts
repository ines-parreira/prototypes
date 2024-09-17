import {Channel} from 'services/channels'
import {
    filterChannels,
    logSegmentEvent,
} from 'pages/stats/common/filters/helpers'
import {TicketMessageSourceType} from 'business/types/ticket'
import {channelsQueryKeys as mockChannelsQueryKeys} from 'models/channel/queries'
import {mockQueryClient} from 'tests/reactQueryTestingUtils'
import {SegmentEvent, logEvent} from 'common/segment'

const mockedChannels = [
    {
        id: '1',
        name: 'Email',
        slug: TicketMessageSourceType.Email,
    },
    {
        id: '2',
        name: 'Chat',
        slug: TicketMessageSourceType.Chat,
    },
    {
        id: '3',
        name: 'Phone',
        slug: TicketMessageSourceType.Phone,
    },
] as Channel[]

const mockedQueryClient = mockQueryClient({
    cachedData: [[mockChannelsQueryKeys.list(), mockedChannels]],
})

jest.mock('api/queryClient', () => ({
    appQueryClient: {
        ...mockedQueryClient,
        getQueryData: jest.fn(() => ({data: mockedChannels})),
    },
}))

jest.mock('common/segment', () => ({
    logEvent: jest.fn(),
    SegmentEvent: {StatFilterSelected: 'stat-filter-selected'},
}))

describe('filterChannels', () => {
    it('should return all channels when no filter is provided', () => {
        expect(filterChannels(mockedChannels)).toEqual(mockedChannels)
    })

    it('should return channels matching the filter array', () => {
        expect(
            filterChannels(mockedChannels, [
                TicketMessageSourceType.Email,
                TicketMessageSourceType.Phone,
            ])
        ).toEqual([mockedChannels[0], mockedChannels[2]])
    })

    it('should return channels matching the filter function', () => {
        expect(
            filterChannels(mockedChannels, (channel) =>
                channel.name.includes('Chat')
            )
        ).toEqual([mockedChannels[1]])
    })
})

describe('logSegmentEvent', () => {
    it('should call logEvent with the expected params', () => {
        logSegmentEvent('test', 'test-operator')
        expect(logEvent).toHaveBeenCalledWith(
            SegmentEvent.StatFilterSelected,
            expect.objectContaining({
                name: 'test',
                logical_operator: 'test-operator',
            })
        )
    })

    it('should call logEvent with the expected params when logicalOperator is null', () => {
        logSegmentEvent('test', null)
        expect(logEvent).toHaveBeenCalledWith(
            SegmentEvent.StatFilterSelected,
            expect.objectContaining({
                name: 'test',
                logical_operator: null,
            })
        )
    })
})
