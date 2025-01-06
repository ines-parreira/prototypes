import {renderHook} from '@testing-library/react-hooks'

import {useOptionalFiltersWithSatisfactionScoreFilterAndAutoQaFilters} from 'hooks/reporting/common/useOptionalFiltersWithSatisfactionScoreFilterAndAutoQaFilters'
import {getComponentConfig} from 'pages/stats/custom-reports/CustomReportChart'
import {
    CustomReportSchema,
    CustomReportChildType,
} from 'pages/stats/custom-reports/types'
import {useFiltersFromDashboard} from 'pages/stats/custom-reports/useFiltersFromDashboard'
import {assumeMock} from 'utils/testing'

jest.mock('pages/stats/custom-reports/CustomReportChart')
const getComponentConfigMock = assumeMock(getComponentConfig)

jest.mock(
    'hooks/reporting/common/useOptionalFiltersWithSatisfactionScoreFilterAndAutoQaFilters'
)
const useOptionalFiltersWithSatisfactionScoreFilterAndAutoQaFiltersMock =
    assumeMock(useOptionalFiltersWithSatisfactionScoreFilterAndAutoQaFilters)

const mockConfigs = {
    chart1: {
        config: {
            reportFilters: {
                persistent: ['persistent_1', 'persistent_2'],
                optional: ['optional_1'],
            },
        },
    },
    chart2: {
        config: {
            reportFilters: {
                persistent: ['persistent_1', 'persistent_3'],
                optional: ['optional_2'],
            },
        },
    },
} as unknown as Record<string, ReturnType<typeof getComponentConfig>>

const mockDashboard = {
    analytics_filter_id: 1,
    children: [],
    name: 'Dashboard',
    emoji: null,
    id: 1,
} satisfies CustomReportSchema

describe('useFiltersFromDashboard(dashboard)', () => {
    beforeEach(() => {
        getComponentConfigMock.mockImplementation((configId) => {
            return mockConfigs[configId] || {}
        })

        useOptionalFiltersWithSatisfactionScoreFilterAndAutoQaFiltersMock.mockImplementation(
            (val) => val
        )
    })

    it('returns object with persistentFilters and optionalFilters', () => {
        const {result} = renderHook(() =>
            useFiltersFromDashboard(mockDashboard)
        )

        expect(result.current.persistentFilters).toBeDefined()
        expect(result.current.optionalFilters).toBeDefined()

        expect(Array.isArray(result.current.persistentFilters)).toBeTruthy()
        expect(Array.isArray(result.current.optionalFilters)).toBeTruthy()
    })

    it('returns empty filters for an empty schema', () => {
        const emptyDashboard = {
            ...mockDashboard,
            children: [],
        }

        const {result} = renderHook(() =>
            useFiltersFromDashboard(emptyDashboard)
        )

        expect(result.current.persistentFilters.length).toBe(0)
        expect(result.current.optionalFilters.length).toBe(0)
    })

    it('aggregates filters from charts in the schema', () => {
        const chart1 = {
            type: CustomReportChildType.Chart,
            config_id: 'chart1',
            children: [],
        }

        const chart2 = {
            type: CustomReportChildType.Chart,
            config_id: 'chart2',
            children: [],
        }

        const customReport = {
            ...mockDashboard,
            children: [chart1, chart2],
        } satisfies CustomReportSchema

        const {result} = renderHook(() => useFiltersFromDashboard(customReport))

        expect(result.current.persistentFilters.length).toBe(3)
        expect(result.current.optionalFilters.length).toBe(2)

        expect(result.current).toEqual(
            expect.objectContaining({
                persistentFilters: expect.arrayContaining([
                    'persistent_1',
                    'persistent_2',
                    'persistent_3',
                ]),
                optionalFilters: expect.arrayContaining([
                    'optional_1',
                    'optional_2',
                ]),
            })
        )
    })

    it('returns empty filters for unknown chart ID', () => {
        const customReport = {
            ...mockDashboard,
            children: [
                {type: CustomReportChildType.Chart, config_id: 'unknown'},
            ],
        } satisfies CustomReportSchema

        const {result} = renderHook(() => useFiltersFromDashboard(customReport))

        expect(result.current.persistentFilters.length).toBe(0)
        expect(result.current.optionalFilters.length).toBe(0)
    })
})
