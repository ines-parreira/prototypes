import {TicketMessageSourceType} from 'business/types/ticket'
import {logEvent, SegmentEvent} from 'common/segment'
import {channelsQueryKeys as mockChannelsQueryKeys} from 'models/channel/queries'
import {
    CustomFieldSavedFilter,
    FilterKey,
    SavedFilterAPI,
    SavedFilterWithLogicalOperator,
    TagFilterInstanceId,
    TagsSavedFilter,
    WithLogicalOperator,
} from 'models/stat/types'
import {LogicalOperatorEnum} from 'pages/stats/common/components/Filter/constants'
import {FilterLabels} from 'pages/stats/common/filters/constants'
import {ActiveFilter} from 'pages/stats/common/filters/FiltersPanel'
import {
    activeFiltersToOptions,
    filterChannels,
    fromApiFormatted,
    logSegmentEvent,
    QUALITY_MANAGEMENT_FILTERS_LABEL,
    STANDARD_FILTERS_LABEL,
    TICKET_FIELDS_FILTERS_LABEL,
    toApiFormatted,
} from 'pages/stats/common/filters/helpers'
import {Channel} from 'services/channels'
import {mockQueryClient} from 'tests/reactQueryTestingUtils'

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

describe('toApiFormatted', () => {
    const agentsEmptySavedFilter: SavedFilterWithLogicalOperator = {
        member: FilterKey.Agents,
        operator: LogicalOperatorEnum.ONE_OF,
        values: [],
    }
    const customFieldEmptySavedFilter: CustomFieldSavedFilter = {
        member: FilterKey.CustomFields,
        values: [
            {
                operator: LogicalOperatorEnum.ONE_OF,
                values: [],
                custom_field_id: 1,
            },
            {
                operator: LogicalOperatorEnum.ONE_OF,
                values: ['123'],
                custom_field_id: 2,
            },
        ],
    }
    const tagsEmptySavedFilter: TagsSavedFilter = {
        member: FilterKey.Tags,
        values: [
            {
                operator: LogicalOperatorEnum.ONE_OF,
                values: [],
                filterInstanceId: TagFilterInstanceId.First,
            },
            {
                operator: LogicalOperatorEnum.NOT_ONE_OF,
                values: ['A'],
                filterInstanceId: TagFilterInstanceId.Second,
            },
        ],
    }
    it('should remove filters without values', () => {
        const savedFilterFilterGroup = [
            agentsEmptySavedFilter,
            customFieldEmptySavedFilter,
            tagsEmptySavedFilter,
        ]

        expect(toApiFormatted(savedFilterFilterGroup)).toEqual([
            {
                member: FilterKey.CustomFields,
                values: [
                    {
                        operator: LogicalOperatorEnum.ONE_OF,
                        values: ['123'],
                        custom_field_id: 2,
                    },
                ],
            },
            {
                member: FilterKey.Tags,
                values: [
                    {
                        operator: LogicalOperatorEnum.NOT_ONE_OF,
                        values: ['A'],
                    },
                ],
            },
        ])
    })
})

describe('fromApiFormatted', () => {
    const apiAgentFilter: SavedFilterWithLogicalOperator = {
        member: FilterKey.Agents,
        operator: LogicalOperatorEnum.NOT_ONE_OF,
        values: ['123'],
    }
    const apiTagFilter: Omit<TagsSavedFilter, 'values'> & {
        values: WithLogicalOperator<string>[]
    } = {
        member: FilterKey.Tags,
        values: [
            {
                operator: LogicalOperatorEnum.NOT_ONE_OF,
                values: ['A'],
            },
            {
                operator: LogicalOperatorEnum.ONE_OF,
                values: ['B'],
            },
        ],
    }

    const savedFilterFromAPI: SavedFilterAPI = {
        id: 123,
        name: 'someName',
        filter_group: [apiAgentFilter, apiTagFilter],
    }

    it('should add filterInstanceId to Tag filters', () => {
        expect(fromApiFormatted(savedFilterFromAPI)).toEqual({
            ...savedFilterFromAPI,
            filter_group: [
                apiAgentFilter,
                {
                    ...apiTagFilter,
                    values: [
                        {
                            ...apiTagFilter.values[0],
                            filterInstanceId: TagFilterInstanceId.First,
                        },
                        {
                            ...apiTagFilter.values[1],
                            filterInstanceId: TagFilterInstanceId.Second,
                        },
                    ],
                },
            ],
        })
    })
})

describe('activeFiltersToOptions', () => {
    const agentFilter: ActiveFilter = {
        key: FilterKey.Agents,
        active: false,
        initializeAsOpen: false,
        type: FilterKey.Agents,
    }
    const qaFilter: ActiveFilter = {
        key: FilterKey.LanguageProficiency,
        active: false,
        initializeAsOpen: false,
        type: FilterKey.LanguageProficiency,
    }
    const anotherQaFilter: ActiveFilter = {
        key: FilterKey.ResolutionCompleteness,
        active: false,
        initializeAsOpen: false,
        type: FilterKey.ResolutionCompleteness,
    }
    const tagsFilter: ActiveFilter = {
        key: FilterKey.Tags,
        active: false,
        initializeAsOpen: false,
        type: FilterKey.Tags,
        filterInstanceId: TagFilterInstanceId.First,
    }
    const ticketFieldFilter: ActiveFilter = {
        key: FilterKey.CustomFields,
        active: false,
        initializeAsOpen: false,
        type: FilterKey.CustomFields,
        customFieldId: 123,
        filterName: 'Some Custom Filter name',
    }
    const anotherTicketFieldFilter: ActiveFilter = {
        key: FilterKey.CustomFields,
        active: false,
        initializeAsOpen: false,
        type: FilterKey.CustomFields,
        customFieldId: 456,
        filterName: 'Another Custom Filter name',
    }

    it('should group active filters by filter type', () => {
        const activeFilters: ActiveFilter[] = [
            tagsFilter,
            qaFilter,
            ticketFieldFilter,
            agentFilter,
        ]

        const groupedFilters = activeFiltersToOptions(activeFilters)

        const standardFiltersGroup = groupedFilters.find(
            (group) => group.title === STANDARD_FILTERS_LABEL
        )
        const ticketFieldsFiltersGroup = groupedFilters.find(
            (group) => group.title === TICKET_FIELDS_FILTERS_LABEL
        )
        const qualityManagementFiltrsGroup = groupedFilters.find(
            (group) => group.title === QUALITY_MANAGEMENT_FILTERS_LABEL
        )

        expect(standardFiltersGroup?.options).toContainEqual({
            label: FilterLabels[agentFilter.type],
            type: agentFilter.type,
            value: agentFilter.key,
        })
        expect(standardFiltersGroup?.options).toContainEqual({
            label: FilterLabels[tagsFilter.type],
            type: tagsFilter.type,
            value: tagsFilter.key,
        })
        expect(ticketFieldsFiltersGroup?.options).toContainEqual({
            label: ticketFieldFilter.filterName,
            type: ticketFieldFilter.type,
            value: ticketFieldFilter.key,
        })
        expect(qualityManagementFiltrsGroup?.options).toContainEqual({
            label: FilterLabels[qaFilter.type],
            type: qaFilter.type,
            value: qaFilter.key,
        })
    })

    it('should order filters alphabetically within each group', () => {
        const activeFilters: ActiveFilter[] = [
            tagsFilter,
            qaFilter,
            ticketFieldFilter,
            anotherQaFilter,
            agentFilter,
            anotherQaFilter,
            anotherTicketFieldFilter,
        ]

        const groupedFilters = activeFiltersToOptions(activeFilters)

        const standardFiltersGroup = groupedFilters.find(
            (group) => group.title === STANDARD_FILTERS_LABEL
        )
        const ticketFieldsFiltersGroup = groupedFilters.find(
            (group) => group.title === TICKET_FIELDS_FILTERS_LABEL
        )
        const qualityManagementFiltrsGroup = groupedFilters.find(
            (group) => group.title === QUALITY_MANAGEMENT_FILTERS_LABEL
        )

        expect(standardFiltersGroup?.options[0].label).toEqual(
            FilterLabels[agentFilter.type]
        )
        expect(standardFiltersGroup?.options[1].label).toEqual(
            FilterLabels[tagsFilter.type]
        )
        expect(ticketFieldsFiltersGroup?.options[0].label).toEqual(
            anotherTicketFieldFilter.filterName
        )
        expect(ticketFieldsFiltersGroup?.options[1].label).toEqual(
            ticketFieldFilter.filterName
        )
        expect(qualityManagementFiltrsGroup?.options[0].label).toEqual(
            FilterLabels[qaFilter.type]
        )
        expect(qualityManagementFiltrsGroup?.options[1].label).toEqual(
            FilterLabels[anotherQaFilter.type]
        )
    })
})
