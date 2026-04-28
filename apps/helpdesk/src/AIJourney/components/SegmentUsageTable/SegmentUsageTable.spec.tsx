import React from 'react'

import { render } from '@repo/testing'
import { screen } from '@testing-library/react'

import {
    JourneyCampaignStateEnum,
    JourneyStatusEnum,
} from '@gorgias/convert-client'

import { JOURNEY_TYPES } from 'AIJourney/constants'
import type { EnrichedUsageRow } from 'AIJourney/hooks/useSegmentsUsage/useSegmentsUsage'

import { SegmentUsageTable } from './SegmentUsageTable'

jest.mock(
    'AIJourney/components/JourneysTable/JourneyStateBadge/JourneyStateBadge',
    () => ({
        JourneyStateBadge: ({
            state,
            isCampaign,
        }: {
            state: string
            isCampaign: boolean
        }) => (
            <span>{`journey-state-badge-${state}-${isCampaign ? 'campaign' : 'flow'}`}</span>
        ),
    }),
)

const campaignRow: EnrichedUsageRow = {
    id: 'journey-1',
    name: 'Black Friday Campaign',
    type: JOURNEY_TYPES.CAMPAIGN,
    state: JourneyCampaignStateEnum.Active,
    isCampaign: true,
}

const flowRow: EnrichedUsageRow = {
    id: 'journey-2',
    name: 'Cart Abandonment Flow',
    type: JOURNEY_TYPES.CART_ABANDONMENT,
    state: JourneyStatusEnum.Active,
    isCampaign: false,
}

const rowWithNoState: EnrichedUsageRow = {
    id: 'journey-3',
    name: 'Welcome Flow',
    type: JOURNEY_TYPES.WELCOME,
    state: undefined,
    isCampaign: false,
}

describe('<SegmentUsageTable />', () => {
    describe('when isLoading is true', () => {
        it('should not render the table', () => {
            render(<SegmentUsageTable segmentUsage={[]} isLoading={true} />)

            expect(screen.queryByText('Name')).not.toBeInTheDocument()
            expect(screen.queryByText('Type')).not.toBeInTheDocument()
            expect(screen.queryByText('Status')).not.toBeInTheDocument()
        })
    })

    describe('when isLoading is false', () => {
        it('should render the table column headers', () => {
            render(<SegmentUsageTable segmentUsage={[]} isLoading={false} />)

            expect(screen.getByText('Name')).toBeInTheDocument()
            expect(screen.getByText('Type')).toBeInTheDocument()
            expect(screen.getByText('Status')).toBeInTheDocument()
        })

        describe('when segmentUsage is empty', () => {
            it('should render "This segment is not in use"', () => {
                render(
                    <SegmentUsageTable segmentUsage={[]} isLoading={false} />,
                )

                expect(
                    screen.getByText('This segment is not in use'),
                ).toBeInTheDocument()
            })
        })

        describe('when segmentUsage has rows', () => {
            it('should not render "This segment is not in use"', () => {
                render(
                    <SegmentUsageTable
                        segmentUsage={[flowRow]}
                        isLoading={false}
                    />,
                )

                expect(
                    screen.queryByText('This segment is not in use'),
                ).not.toBeInTheDocument()
            })

            it('should render the name of each row', () => {
                render(
                    <SegmentUsageTable
                        segmentUsage={[campaignRow, flowRow]}
                        isLoading={false}
                    />,
                )

                expect(
                    screen.getByText('Black Friday Campaign'),
                ).toBeInTheDocument()
                expect(
                    screen.getByText('Cart Abandonment Flow'),
                ).toBeInTheDocument()
            })

            it('should render "Campaign" for rows with campaign type', () => {
                render(
                    <SegmentUsageTable
                        segmentUsage={[campaignRow]}
                        isLoading={false}
                    />,
                )

                expect(screen.getByText('Campaign')).toBeInTheDocument()
            })

            it('should render "Flow" for rows with non-campaign type', () => {
                render(
                    <SegmentUsageTable
                        segmentUsage={[flowRow]}
                        isLoading={false}
                    />,
                )

                expect(screen.getByText('Flow')).toBeInTheDocument()
            })

            it('should render JourneyStateBadge when state is defined', () => {
                render(
                    <SegmentUsageTable
                        segmentUsage={[campaignRow]}
                        isLoading={false}
                    />,
                )

                expect(
                    screen.getByText(
                        `journey-state-badge-${JourneyCampaignStateEnum.Active}-campaign`,
                    ),
                ).toBeInTheDocument()
            })

            it('should pass isCampaign to JourneyStateBadge', () => {
                render(
                    <SegmentUsageTable
                        segmentUsage={[flowRow]}
                        isLoading={false}
                    />,
                )

                expect(
                    screen.getByText(
                        `journey-state-badge-${JourneyStatusEnum.Active}-flow`,
                    ),
                ).toBeInTheDocument()
            })

            it('should render "—" when state is undefined', () => {
                render(
                    <SegmentUsageTable
                        segmentUsage={[rowWithNoState]}
                        isLoading={false}
                    />,
                )

                expect(screen.getByText('—')).toBeInTheDocument()
            })
        })
    })
})
