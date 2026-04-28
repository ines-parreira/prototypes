import { renderHook } from '@repo/testing'

import { AudienceListSource, JourneyTypeEnum } from '@gorgias/convert-client'

import { useJourneyContext } from 'AIJourney/providers'
import { useAudiencesUsage } from 'AIJourney/queries'

import { useSegmentsUsage } from './useSegmentsUsage'

jest.mock('AIJourney/providers')
jest.mock('AIJourney/queries')

const mockUseJourneyContext = useJourneyContext as jest.Mock
const mockUseAudiencesUsage = useAudiencesUsage as jest.Mock

const defaultContext = {
    currentIntegration: { id: 123 },
    journeys: [],
    campaigns: [],
}

const makeAudienceUsage = (
    overrides: Record<string, unknown> = {},
    usageItems: Array<{ id: string; type: string }> = [],
) => ({
    data: {
        data: [
            {
                identifier: 'segment-1',
                source: AudienceListSource.Gorgias,
                usage: usageItems,
                ...overrides,
            },
        ],
    },
    isLoading: false,
})

describe('useSegmentsUsage', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('should return empty array and isLoading=true when audienceUsage is undefined', () => {
        mockUseJourneyContext.mockReturnValue(defaultContext)
        mockUseAudiencesUsage.mockReturnValue({
            data: undefined,
            isLoading: true,
        })

        const { result } = renderHook(() => useSegmentsUsage('segment-1'))

        expect(result.current.segmentUsage).toEqual([])
        expect(result.current.isLoading).toBe(true)
    })

    it('should return empty array when no audience entry matches the segmentId', () => {
        mockUseJourneyContext.mockReturnValue(defaultContext)
        mockUseAudiencesUsage.mockReturnValue(
            makeAudienceUsage({ identifier: 'other-segment' }),
        )

        const { result } = renderHook(() => useSegmentsUsage('segment-1'))

        expect(result.current.segmentUsage).toEqual([])
    })

    it('should return empty array when entry source is not Gorgias', () => {
        mockUseJourneyContext.mockReturnValue(defaultContext)
        mockUseAudiencesUsage.mockReturnValue(
            makeAudienceUsage({ source: 'shopify' }),
        )

        const { result } = renderHook(() => useSegmentsUsage('segment-1'))

        expect(result.current.segmentUsage).toEqual([])
    })

    it('should return empty array when usage list is empty', () => {
        mockUseJourneyContext.mockReturnValue(defaultContext)
        mockUseAudiencesUsage.mockReturnValue(makeAudienceUsage({}, []))

        const { result } = renderHook(() => useSegmentsUsage('segment-1'))

        expect(result.current.segmentUsage).toEqual([])
    })

    it('should enrich usage rows for non-campaign journeys using JOURNEY_TYPE_MAP_TO_STRING', () => {
        mockUseJourneyContext.mockReturnValue({
            ...defaultContext,
            journeys: [
                {
                    id: 'journey-1',
                    type: JourneyTypeEnum.CartAbandoned,
                    state: 'active',
                },
            ],
        })
        mockUseAudiencesUsage.mockReturnValue(
            makeAudienceUsage({}, [
                { id: 'journey-1', type: JourneyTypeEnum.CartAbandoned },
            ]),
        )

        const { result } = renderHook(() => useSegmentsUsage('segment-1'))

        expect(result.current.segmentUsage).toEqual([
            {
                id: 'journey-1',
                name: 'Cart Abandoned',
                type: JourneyTypeEnum.CartAbandoned,
                state: 'active',
                isCampaign: false,
            },
        ])
    })

    it('should enrich usage rows for campaign journeys using campaign title and state', () => {
        mockUseJourneyContext.mockReturnValue({
            ...defaultContext,
            campaigns: [
                {
                    id: 'campaign-1',
                    type: JourneyTypeEnum.Campaign,
                    campaign: { title: 'My Campaign', state: 'scheduled' },
                },
            ],
        })
        mockUseAudiencesUsage.mockReturnValue(
            makeAudienceUsage({}, [
                { id: 'campaign-1', type: JourneyTypeEnum.Campaign },
            ]),
        )

        const { result } = renderHook(() => useSegmentsUsage('segment-1'))

        expect(result.current.segmentUsage).toEqual([
            {
                id: 'campaign-1',
                name: 'My Campaign',
                type: JourneyTypeEnum.Campaign,
                state: 'scheduled',
                isCampaign: true,
            },
        ])
    })

    it('should fall back to "—" when campaign title is undefined', () => {
        mockUseJourneyContext.mockReturnValue({
            ...defaultContext,
            campaigns: [
                {
                    id: 'campaign-1',
                    type: JourneyTypeEnum.Campaign,
                    campaign: { title: undefined, state: 'draft' },
                },
            ],
        })
        mockUseAudiencesUsage.mockReturnValue(
            makeAudienceUsage({}, [
                { id: 'campaign-1', type: JourneyTypeEnum.Campaign },
            ]),
        )

        const { result } = renderHook(() => useSegmentsUsage('segment-1'))

        expect(result.current.segmentUsage[0].name).toBe('—')
    })

    it('should fall back to "—" when journey type is not in JOURNEY_TYPE_MAP_TO_STRING', () => {
        mockUseJourneyContext.mockReturnValue({
            ...defaultContext,
            journeys: [
                {
                    id: 'journey-1',
                    type: undefined,
                    state: 'active',
                },
            ],
        })
        mockUseAudiencesUsage.mockReturnValue(
            makeAudienceUsage({}, [{ id: 'journey-1', type: 'unknown' }]),
        )

        const { result } = renderHook(() => useSegmentsUsage('segment-1'))

        expect(result.current.segmentUsage[0].name).toBe('—')
    })

    it('should use usageItem.type and "—" name when journey is not found in journeys or campaigns', () => {
        mockUseJourneyContext.mockReturnValue(defaultContext)
        mockUseAudiencesUsage.mockReturnValue(
            makeAudienceUsage({}, [
                { id: 'missing-journey', type: JourneyTypeEnum.WinBack },
            ]),
        )

        const { result } = renderHook(() => useSegmentsUsage('segment-1'))

        expect(result.current.segmentUsage).toEqual([
            {
                id: 'missing-journey',
                name: '—',
                type: JourneyTypeEnum.WinBack,
                state: undefined,
                isCampaign: false,
            },
        ])
    })

    it('should handle undefined journeys and campaigns by treating them as empty arrays', () => {
        mockUseJourneyContext.mockReturnValue({
            currentIntegration: { id: 123 },
            journeys: undefined,
            campaigns: undefined,
        })
        mockUseAudiencesUsage.mockReturnValue(
            makeAudienceUsage({}, [
                { id: 'journey-1', type: JourneyTypeEnum.CartAbandoned },
            ]),
        )

        const { result } = renderHook(() => useSegmentsUsage('segment-1'))

        expect(result.current.segmentUsage).toEqual([
            {
                id: 'journey-1',
                name: '—',
                type: JourneyTypeEnum.CartAbandoned,
                state: undefined,
                isCampaign: false,
            },
        ])
    })

    it('should pass currentIntegration id to useAudiencesUsage', () => {
        mockUseJourneyContext.mockReturnValue({
            ...defaultContext,
            currentIntegration: { id: 789 },
        })
        mockUseAudiencesUsage.mockReturnValue({
            data: undefined,
            isLoading: false,
        })

        renderHook(() => useSegmentsUsage('segment-1'))

        expect(mockUseAudiencesUsage).toHaveBeenCalledWith(789)
    })

    it('should pass undefined to useAudiencesUsage when currentIntegration is undefined', () => {
        mockUseJourneyContext.mockReturnValue({
            ...defaultContext,
            currentIntegration: undefined,
        })
        mockUseAudiencesUsage.mockReturnValue({
            data: undefined,
            isLoading: false,
        })

        renderHook(() => useSegmentsUsage())

        expect(mockUseAudiencesUsage).toHaveBeenCalledWith(undefined)
    })

    it('should search both journeys and campaigns when resolving usage items', () => {
        mockUseJourneyContext.mockReturnValue({
            ...defaultContext,
            journeys: [
                {
                    id: 'journey-1',
                    type: JourneyTypeEnum.Welcome,
                    state: 'active',
                },
            ],
            campaigns: [
                {
                    id: 'campaign-1',
                    type: JourneyTypeEnum.Campaign,
                    campaign: { title: 'Summer Sale', state: 'active' },
                },
            ],
        })
        mockUseAudiencesUsage.mockReturnValue(
            makeAudienceUsage({}, [
                { id: 'journey-1', type: JourneyTypeEnum.Welcome },
                { id: 'campaign-1', type: JourneyTypeEnum.Campaign },
            ]),
        )

        const { result } = renderHook(() => useSegmentsUsage('segment-1'))

        expect(result.current.segmentUsage).toHaveLength(2)
        expect(result.current.segmentUsage[0]).toMatchObject({
            id: 'journey-1',
            isCampaign: false,
            name: 'Welcome',
        })
        expect(result.current.segmentUsage[1]).toMatchObject({
            id: 'campaign-1',
            isCampaign: true,
            name: 'Summer Sale',
        })
    })
})
