import { render, screen } from '@testing-library/react'

import {
    AudienceListSource,
    JourneyCampaignStateEnum,
    JourneyStatusEnum,
    JourneyTypeEnum,
} from '@gorgias/convert-client'

import { useJourneyContext } from 'AIJourney/providers'
import { useAudiencesUsage } from 'AIJourney/queries/UseAudiencesUsage/UseAudiencesUsage'

import { SegmentUsageTable } from './SegmentUsageTable'

jest.mock('AIJourney/providers')
jest.mock('AIJourney/queries/UseAudiencesUsage/UseAudiencesUsage')

const mockUseJourneyContext = useJourneyContext as jest.Mock
const mockUseAudiencesUsage = useAudiencesUsage as jest.Mock

const mockIntegration = { id: 42 }

const mockFlowJourney = {
    id: 'flow-1',
    type: JourneyTypeEnum.CartAbandoned,
    state: JourneyStatusEnum.Active,
    campaign: null,
}

const mockCampaignJourney = {
    id: 'campaign-1',
    type: JourneyTypeEnum.Campaign,
    state: JourneyStatusEnum.Active,
    campaign: {
        title: 'Summer Sale',
        state: JourneyCampaignStateEnum.Sent,
    },
}

const buildAudienceUsage = (usageItems: { id: string; type: string }[]) => ({
    data: [
        {
            id: 'audience-1',
            identifier: 'segment-abc',
            source: AudienceListSource.Gorgias,
            count_campaigns: 1,
            count_journeys: 1,
            usage: usageItems,
        },
    ],
})

const renderComponent = (segmentId = 'segment-abc') =>
    render(<SegmentUsageTable segmentId={segmentId} />)

describe('<SegmentUsageTable />', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        mockUseJourneyContext.mockReturnValue({
            currentIntegration: mockIntegration,
            journeys: [mockFlowJourney],
            campaigns: [mockCampaignJourney],
        })
        mockUseAudiencesUsage.mockReturnValue({
            data: undefined,
            isLoading: false,
        })
    })

    describe('column headers', () => {
        it('should render Name, Type and Status column headers', () => {
            renderComponent()

            expect(
                screen.getByRole('columnheader', { name: 'Name' }),
            ).toBeInTheDocument()
            expect(
                screen.getByRole('columnheader', { name: 'Type' }),
            ).toBeInTheDocument()
            expect(
                screen.getByRole('columnheader', { name: 'Status' }),
            ).toBeInTheDocument()
        })
    })

    describe('loading state', () => {
        it('should show loading state when fetching audience usage', () => {
            mockUseAudiencesUsage.mockReturnValue({
                data: undefined,
                isLoading: true,
            })

            renderComponent()

            const skeletons = document.querySelectorAll('[class*="skeleton"]')
            expect(skeletons.length).toBeGreaterThan(0)
        })
    })

    describe('empty state', () => {
        it('should show empty message when audience usage has no data', () => {
            mockUseAudiencesUsage.mockReturnValue({
                data: undefined,
                isLoading: false,
            })

            renderComponent()

            expect(
                screen.getByText('This segment is not in use'),
            ).toBeInTheDocument()
        })

        it('should show empty message when segment has no matching audience entry', () => {
            mockUseAudiencesUsage.mockReturnValue({
                data: buildAudienceUsage([
                    { id: 'flow-1', type: JourneyTypeEnum.CartAbandoned },
                ]),
                isLoading: false,
            })

            renderComponent('segment-not-found')

            expect(
                screen.getByText('This segment is not in use'),
            ).toBeInTheDocument()
        })

        it('should show empty message when matching audience entry has no usage', () => {
            mockUseAudiencesUsage.mockReturnValue({
                data: buildAudienceUsage([]),
                isLoading: false,
            })

            renderComponent()

            expect(
                screen.getByText('This segment is not in use'),
            ).toBeInTheDocument()
        })
    })

    describe('flow journey row', () => {
        beforeEach(() => {
            mockUseAudiencesUsage.mockReturnValue({
                data: buildAudienceUsage([
                    { id: 'flow-1', type: JourneyTypeEnum.CartAbandoned },
                ]),
                isLoading: false,
            })
        })

        it('should show the flow type label in the Name column', () => {
            renderComponent()

            expect(screen.getByText('Cart Abandoned')).toBeInTheDocument()
        })

        it('should show "Flow" in the Type column', () => {
            renderComponent()

            expect(screen.getByText('Flow')).toBeInTheDocument()
        })

        it('should show the flow status badge', () => {
            renderComponent()

            expect(screen.getByText('Active')).toBeInTheDocument()
        })
    })

    describe('campaign journey row', () => {
        beforeEach(() => {
            mockUseAudiencesUsage.mockReturnValue({
                data: buildAudienceUsage([
                    { id: 'campaign-1', type: JourneyTypeEnum.Campaign },
                ]),
                isLoading: false,
            })
        })

        it('should show the campaign title in the Name column', () => {
            renderComponent()

            expect(screen.getByText('Summer Sale')).toBeInTheDocument()
        })

        it('should show "Campaign" in the Type column', () => {
            renderComponent()

            expect(screen.getByText('Campaign')).toBeInTheDocument()
        })

        it('should show the campaign status badge', () => {
            renderComponent()

            expect(screen.getByText('Delivered')).toBeInTheDocument()
        })
    })

    describe('multiple rows', () => {
        it('should render a row for each usage item', () => {
            mockUseAudiencesUsage.mockReturnValue({
                data: buildAudienceUsage([
                    { id: 'flow-1', type: JourneyTypeEnum.CartAbandoned },
                    { id: 'campaign-1', type: JourneyTypeEnum.Campaign },
                ]),
                isLoading: false,
            })

            renderComponent()

            expect(screen.getByText('Cart Abandoned')).toBeInTheDocument()
            expect(screen.getByText('Summer Sale')).toBeInTheDocument()
        })
    })

    describe('when journey is not found in context', () => {
        it('should show "—" in the Name column when journey id is not in context', () => {
            mockUseAudiencesUsage.mockReturnValue({
                data: buildAudienceUsage([
                    {
                        id: 'unknown-journey',
                        type: JourneyTypeEnum.CartAbandoned,
                    },
                ]),
                isLoading: false,
            })

            renderComponent()

            // Name and Status both fall back to "—" when the journey is not found
            expect(screen.getAllByText('—')).toHaveLength(2)
        })

        it('should show "—" in the Status column when journey has no state', () => {
            mockUseJourneyContext.mockReturnValue({
                currentIntegration: mockIntegration,
                journeys: [{ ...mockFlowJourney, state: undefined }],
                campaigns: [],
            })
            mockUseAudiencesUsage.mockReturnValue({
                data: buildAudienceUsage([
                    { id: 'flow-1', type: JourneyTypeEnum.CartAbandoned },
                ]),
                isLoading: false,
            })

            renderComponent()

            expect(screen.getByText('—')).toBeInTheDocument()
        })
    })

    describe('audience source filtering', () => {
        it('should not match an audience entry with a non-Gorgias source', () => {
            mockUseAudiencesUsage.mockReturnValue({
                data: {
                    data: [
                        {
                            id: 'audience-2',
                            identifier: 'segment-abc',
                            source: AudienceListSource.Klaviyo,
                            count_campaigns: 1,
                            count_journeys: 1,
                            usage: [
                                {
                                    id: 'flow-1',
                                    type: JourneyTypeEnum.CartAbandoned,
                                },
                            ],
                        },
                    ],
                },
                isLoading: false,
            })

            renderComponent()

            expect(
                screen.getByText('This segment is not in use'),
            ).toBeInTheDocument()
        })
    })

    describe('query hook integration', () => {
        it('should call useAudiencesUsage with the integration id from context', () => {
            renderComponent()

            expect(mockUseAudiencesUsage).toHaveBeenCalledWith(
                mockIntegration.id,
            )
        })

        it('should call useAudiencesUsage with undefined when there is no integration', () => {
            mockUseJourneyContext.mockReturnValue({
                currentIntegration: undefined,
                journeys: [],
                campaigns: [],
            })

            renderComponent()

            expect(mockUseAudiencesUsage).toHaveBeenCalledWith(undefined)
        })
    })
})
