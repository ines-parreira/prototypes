import React from 'react'

import { render, screen } from '@testing-library/react'

import {
    JourneyCampaignStateEnum,
    JourneyStatusEnum,
} from '@gorgias/convert-client'

import { JourneyStateBadge } from 'AIJourney/components/JourneysTable/JourneyStateBadge/JourneyStateBadge'

describe('JourneyStateBadge', () => {
    describe('when isCampaign is true', () => {
        describe('Badge styling', () => {
            const testCases = [
                {
                    state: JourneyCampaignStateEnum.Draft,
                    expectedColor: 'yellow',
                },
                {
                    state: JourneyCampaignStateEnum.Scheduled,
                    expectedColor: 'yellow',
                },
                {
                    state: JourneyCampaignStateEnum.Paused,
                    expectedColor: 'yellow',
                },
                {
                    state: JourneyCampaignStateEnum.Active,
                    expectedColor: 'blue',
                },
                {
                    state: JourneyCampaignStateEnum.Canceled,
                    expectedColor: 'red',
                },
                {
                    state: JourneyCampaignStateEnum.Sent,
                    expectedColor: 'green',
                },
            ]

            testCases.forEach(({ state, expectedColor }) => {
                it(`should apply correct color class "${expectedColor}" for ${state} state`, () => {
                    const { container } = render(
                        <JourneyStateBadge state={state} isCampaign={true} />,
                    )
                    const badge = container.querySelector('.badge')

                    expect(badge).toHaveClass(expectedColor)
                })
            })
        })

        describe('Label mapping', () => {
            const labelMappings = [
                {
                    state: JourneyCampaignStateEnum.Draft,
                    expectedLabel: 'Draft',
                },
                {
                    state: JourneyCampaignStateEnum.Scheduled,
                    expectedLabel: 'Scheduled',
                },
                {
                    state: JourneyCampaignStateEnum.Paused,
                    expectedLabel: 'Paused',
                },
                {
                    state: JourneyCampaignStateEnum.Active,
                    expectedLabel: 'Sending',
                },
                {
                    state: JourneyCampaignStateEnum.Canceled,
                    expectedLabel: 'Canceled',
                },
                {
                    state: JourneyCampaignStateEnum.Sent,
                    expectedLabel: 'Delivered',
                },
                {
                    state: 'something-else' as JourneyCampaignStateEnum,
                    expectedLabel: 'Unknown',
                },
            ]

            labelMappings.forEach(({ state, expectedLabel }) => {
                it(`should display "${expectedLabel}" for ${state} state`, () => {
                    render(
                        <JourneyStateBadge state={state} isCampaign={true} />,
                    )
                    expect(screen.getByText(expectedLabel)).toBeInTheDocument()
                })
            })
        })
    })

    describe('when isCampaign is false', () => {
        describe('Badge styling', () => {
            const testCases = [
                {
                    state: JourneyStatusEnum.Draft,
                    expectedColor: 'grey',
                },
                {
                    state: JourneyStatusEnum.Paused,
                    expectedColor: 'yellow',
                },
                {
                    state: JourneyStatusEnum.Active,
                    expectedColor: 'blue',
                },
            ]

            testCases.forEach(({ state, expectedColor }) => {
                it(`should apply correct color class "${expectedColor}" for ${state} state`, () => {
                    const { container } = render(
                        <JourneyStateBadge state={state} isCampaign={false} />,
                    )
                    const badge = container.querySelector('.badge')

                    expect(badge).toHaveClass(expectedColor)
                })
            })
        })

        describe('Label mapping', () => {
            const labelMappings = [
                {
                    state: JourneyStatusEnum.Draft,
                    expectedLabel: 'Draft',
                },
                {
                    state: JourneyStatusEnum.Paused,
                    expectedLabel: 'Paused',
                },
                {
                    state: JourneyStatusEnum.Active,
                    expectedLabel: 'Active',
                },
                {
                    state: 'something-else' as JourneyStatusEnum,
                    expectedLabel: 'Unknown',
                },
            ]

            labelMappings.forEach(({ state, expectedLabel }) => {
                it(`should display "${expectedLabel}" for ${state} state`, () => {
                    render(
                        <JourneyStateBadge state={state} isCampaign={false} />,
                    )
                    expect(screen.getByText(expectedLabel)).toBeInTheDocument()
                })
            })
        })
    })
})
