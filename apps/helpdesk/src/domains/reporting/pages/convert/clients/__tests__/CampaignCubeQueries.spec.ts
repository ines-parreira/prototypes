import {
    APIOnlyFilterKey,
    FilterKey,
} from 'domains/reporting/models/stat/types'
import { LogicalOperatorEnum } from 'domains/reporting/pages/common/components/Filter/constants'
import {
    getCampaignEventsOrdersPerformanceData,
    getCampaignEventsPerformanceData,
    getCampaignEventsTotalsData,
    getCampaignOrderPerformanceData,
    getCampaignOrderTotalsData,
    getCampaignsPerformanceGraphData,
    getDefaultApiStatsFilters,
    getRevenueGraphData,
    getRevenueShareGraphData,
    getStoreRevenueTotalData,
} from 'domains/reporting/pages/convert/clients/CampaignCubeQueries'
import { SharedDimension } from 'domains/reporting/pages/convert/clients/constants'
import type { GroupDimension } from 'domains/reporting/pages/convert/clients/types'

describe('Getting Cube queries', () => {
    const props = {
        // in UTC is already next day
        startDate: '2023-01-01T20:00:00-08:00',
        // in UTC is still prev day
        endDate: '2023-03-15T06:00:00-08:00',
        shopName: 'punched-tires-shop',
        campaignIds: ['1', '2'],
        campaignsOperator: LogicalOperatorEnum.ONE_OF,
        limit: 100,
        offset: 200,
        timezone: 'America/San_Francisco',
        groupDimension: SharedDimension.campaignId as GroupDimension,
    }

    it.each([
        [getCampaignEventsTotalsData],
        [getCampaignOrderTotalsData],
        [getStoreRevenueTotalData],
        [getCampaignEventsPerformanceData],
        [getCampaignOrderPerformanceData],
        [getCampaignEventsOrdersPerformanceData],
        [getRevenueShareGraphData],
        [getCampaignsPerformanceGraphData],
        [getRevenueGraphData],
    ])('%p should call load', (cubeFn) => {
        // act
        const query = cubeFn(props)

        // assert
        expect(query).toMatchSnapshot()
    })
})

describe('getDefaultApiStatsFilters', () => {
    const startDate = '2023-01-01T00:00:00.000'
    const endDate = '2023-03-15T23:59:59.000'

    it('should always include the period filter', () => {
        const result = getDefaultApiStatsFilters({
            startDate,
            endDate,
            campaignIds: [],
        })

        expect(result[FilterKey.Period]).toEqual({
            start_datetime: startDate,
            end_datetime: endDate,
        })
    })

    it('should add campaigns filter with provided operator when campaignIds are present', () => {
        const result = getDefaultApiStatsFilters({
            startDate,
            endDate,
            campaignIds: ['campaign-1', 'campaign-2'],
            campaignsOperator: LogicalOperatorEnum.ONE_OF,
        })

        expect(result[FilterKey.Campaigns]).toEqual({
            operator: LogicalOperatorEnum.ONE_OF,
            values: ['campaign-1', 'campaign-2'],
        })
    })

    it('should add campaigns filter with NOT_ONE_OF operator when campaignIds are present with NOT_ONE_OF', () => {
        const result = getDefaultApiStatsFilters({
            startDate,
            endDate,
            campaignIds: ['campaign-1'],
            campaignsOperator: LogicalOperatorEnum.NOT_ONE_OF,
        })

        expect(result[FilterKey.Campaigns]).toEqual({
            operator: LogicalOperatorEnum.NOT_ONE_OF,
            values: ['campaign-1'],
        })
    })

    it('should add default NOT_ONE_OF empty campaign filter when campaignIds are empty and allowNoCampaign is false', () => {
        const result = getDefaultApiStatsFilters({
            startDate,
            endDate,
            campaignIds: [],
        })

        expect(result[FilterKey.Campaigns]).toEqual({
            operator: LogicalOperatorEnum.NOT_ONE_OF,
            values: [''],
        })
    })

    it('should not add campaigns filter when campaignIds are empty and allowNoCampaign is true', () => {
        const result = getDefaultApiStatsFilters({
            startDate,
            endDate,
            campaignIds: [],
            allowNoCampaign: true,
        })

        expect(result[FilterKey.Campaigns]).toBeUndefined()
    })

    it('should add shopName filter with ONE_OF operator when shopName is provided', () => {
        const result = getDefaultApiStatsFilters({
            startDate,
            endDate,
            campaignIds: [],
            shopName: 'my-shop.myshopify.com',
        })

        expect(result[APIOnlyFilterKey.ShopName]).toEqual({
            operator: LogicalOperatorEnum.ONE_OF,
            values: ['my-shop.myshopify.com'],
        })
    })

    it('should not add shopName filter when shopName is not provided', () => {
        const result = getDefaultApiStatsFilters({
            startDate,
            endDate,
            campaignIds: [],
        })

        expect(result[APIOnlyFilterKey.ShopName]).toBeUndefined()
    })

    it('should add abVariant filter with ONE_OF operator when abVariant is provided', () => {
        const result = getDefaultApiStatsFilters({
            startDate,
            endDate,
            campaignIds: [],
            abVariant: 'variant-a',
        })

        expect(result[APIOnlyFilterKey.AbVariant]).toEqual({
            operator: LogicalOperatorEnum.ONE_OF,
            values: ['variant-a'],
        })
    })

    it('should not add abVariant filter when abVariant is not provided', () => {
        const result = getDefaultApiStatsFilters({
            startDate,
            endDate,
            campaignIds: [],
        })

        expect(result[APIOnlyFilterKey.AbVariant]).toBeUndefined()
    })

    it('should include all filters when all optional params are provided', () => {
        const result = getDefaultApiStatsFilters({
            startDate,
            endDate,
            campaignIds: ['campaign-1'],
            campaignsOperator: LogicalOperatorEnum.ONE_OF,
            shopName: 'my-shop.myshopify.com',
            abVariant: 'control',
        })

        expect(result[FilterKey.Period]).toEqual({
            start_datetime: startDate,
            end_datetime: endDate,
        })
        expect(result[FilterKey.Campaigns]).toEqual({
            operator: LogicalOperatorEnum.ONE_OF,
            values: ['campaign-1'],
        })
        expect(result[APIOnlyFilterKey.ShopName]).toEqual({
            operator: LogicalOperatorEnum.ONE_OF,
            values: ['my-shop.myshopify.com'],
        })
        expect(result[APIOnlyFilterKey.AbVariant]).toEqual({
            operator: LogicalOperatorEnum.ONE_OF,
            values: ['control'],
        })
    })
})

describe('Getting Cube queries for with notEquals', () => {
    const props = {
        // in UTC is already next day
        startDate: '2023-01-01T20:00:00-08:00',
        // in UTC is still prev day
        endDate: '2023-03-15T06:00:00-08:00',
        shopName: 'punched-tires-shop',
        campaignIds: ['1', '2'],
        campaignsOperator: LogicalOperatorEnum.NOT_ONE_OF,
        limit: 100,
        offset: 200,
        timezone: 'America/San_Francisco',
        groupDimension: SharedDimension.campaignId as GroupDimension,
    }

    it.each([
        [getCampaignEventsTotalsData],
        [getCampaignOrderTotalsData],
        [getStoreRevenueTotalData],
        [getCampaignEventsPerformanceData],
        [getCampaignOrderPerformanceData],
        [getCampaignEventsOrdersPerformanceData],
        [getRevenueShareGraphData],
        [getCampaignsPerformanceGraphData],
        [getRevenueGraphData],
    ])('%p should call load', (cubeFn) => {
        // act
        const query = cubeFn(props)

        // assert
        expect(query).toMatchSnapshot()
    })
})
