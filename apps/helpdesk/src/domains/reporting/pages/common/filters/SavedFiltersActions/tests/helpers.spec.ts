import { assumeMock } from '@repo/testing'

import type { StatsFiltersWithLogicalOperator } from 'domains/reporting/models/stat/types'
import {
    FilterComponentKey,
    FilterKey,
    TagFilterInstanceId,
} from 'domains/reporting/models/stat/types'
import { ReportingGranularity } from 'domains/reporting/models/types'
import { LogicalOperatorEnum } from 'domains/reporting/pages/common/components/Filter/constants'
import type { OptionalFilter } from 'domains/reporting/pages/common/filters/FiltersPanel'
import {
    areFiltersFilled,
    isFilterFilled,
} from 'domains/reporting/pages/common/filters/SavedFiltersActions/helpers'
import { isTeamLead } from 'utils'

jest.mock('utils')
const isTeamLeadMock = assumeMock(isTeamLead)

export const filterKeysMock: OptionalFilter[] = [
    FilterKey.Channels,
    FilterKey.Agents,
    FilterKey.Integrations,
    FilterKey.IsDuringBusinessHours,
    FilterKey.Tags,
    FilterKey.CustomFields,
    FilterKey.AggregationWindow,
    FilterKey.CampaignStatuses,
    FilterKey.Campaigns,
    FilterKey.LocaleCodes,
    FilterKey.Score,
    FilterKey.HelpCenters,
    FilterKey.SlaPolicies,
    FilterKey.Period,
    FilterKey.Integrations,
    FilterKey.Tags,
    FilterComponentKey.PhoneIntegrations,
]

export const filtersMock = {
    aggregationWindow: ReportingGranularity.Hour,
    channels: {
        operator: LogicalOperatorEnum.ONE_OF,
        values: ['test'],
    },
    customFields: [
        {
            customFieldId: 5868,
            operator: LogicalOperatorEnum.ONE_OF,
            values: ['test'],
        },
        {
            customFieldId: 5867,
            operator: LogicalOperatorEnum.ONE_OF,
            values: ['test2'],
        },
    ],
    agents: {
        operator: LogicalOperatorEnum.ONE_OF,
        values: [2, 3, 4],
    },
    campaigns: {
        operator: LogicalOperatorEnum.ONE_OF,
        values: ['test'],
    },
    campaignStatuses: {
        operator: LogicalOperatorEnum.ONE_OF,
        values: ['test'],
    },
    localeCodes: {
        operator: LogicalOperatorEnum.ONE_OF,
        values: ['test'],
    },
    score: {
        operator: LogicalOperatorEnum.ONE_OF,
        values: ['test'],
    },
    helpCenters: {
        operator: LogicalOperatorEnum.ONE_OF,
        values: [12],
    },
    slaPolicies: {
        operator: LogicalOperatorEnum.ONE_OF,
        values: ['test'],
    },
    period: {
        start_datetime: '2024-07-18T00:00:00+02:00',
        end_datetime: '2024-10-15T23:59:59+02:00',
    },
    integrations: {
        operator: LogicalOperatorEnum.ONE_OF,
        values: [212],
    },
    isDuringBusinessHours: {
        operator: LogicalOperatorEnum.ONE_OF,
        values: ['test'],
    },
    tags: [
        {
            values: [668188],
            operator: LogicalOperatorEnum.ONE_OF,
            filterInstanceId: TagFilterInstanceId.First,
        },
    ],
} as StatsFiltersWithLogicalOperator

export const emptyFiltersMock = {
    aggregationWindow: null,
    channels: {
        operator: LogicalOperatorEnum.ONE_OF,
        values: [],
    },
    customFields: [
        {
            customFieldId: 5868,
            operator: LogicalOperatorEnum.ONE_OF,
            values: [],
        },
    ],
    campaigns: {
        operator: LogicalOperatorEnum.ONE_OF,
        values: [],
    },
    campaignStatuses: {
        operator: LogicalOperatorEnum.ONE_OF,
        values: [],
    },
    localeCodes: {
        operator: LogicalOperatorEnum.ONE_OF,
        values: [],
    },
    score: {
        operator: LogicalOperatorEnum.ONE_OF,
        values: [],
    },
    helpCenters: {
        operator: LogicalOperatorEnum.ONE_OF,
        values: [],
    },
    slaPolicies: {
        operator: LogicalOperatorEnum.ONE_OF,
        values: [],
    },
    agents: {
        operator: LogicalOperatorEnum.ONE_OF,
        values: [],
    },
    period: {},
    integrations: {
        operator: LogicalOperatorEnum.ONE_OF,
        values: [],
    },
    tags: [],
} as unknown as StatsFiltersWithLogicalOperator

const filtersWithOnlyOneFilledFilter = {
    period: {},
    channels: {
        operator: LogicalOperatorEnum.ONE_OF,
        values: [],
    },
    agents: {
        operator: LogicalOperatorEnum.ONE_OF,
        values: [1, 2, 3],
    },
} as unknown as StatsFiltersWithLogicalOperator

describe('isFilterFilled', () => {
    beforeEach(() => {
        isTeamLeadMock.mockReturnValue(true)
    })

    it.each(filterKeysMock)(
        'should return true for filled values',
        (filterKey) => {
            expect(isFilterFilled(filterKey, filtersMock)).toBe(true)
        },
    )

    it.each(filterKeysMock)(
        'should return false for empty values',
        (filterKey) => {
            expect(isFilterFilled(filterKey, emptyFiltersMock)).toBe(false)
        },
    )
})

describe('areFiltersFilled', () => {
    it('should return true when all of the filters are filled', () => {
        expect(areFiltersFilled(filterKeysMock, filtersMock)).toBe(true)
    })
    it('should return false when all of the filters are empty', () => {
        expect(areFiltersFilled(filterKeysMock, emptyFiltersMock)).toBe(false)
    })
    it('should return true when theres one filled filter', () => {
        expect(
            areFiltersFilled(filterKeysMock, filtersWithOnlyOneFilledFilter),
        ).toBe(true)
    })
})
