import React from 'react'

import { render } from '@repo/testing'
import { screen } from '@testing-library/react'

import { JourneyStatusEnum } from '@gorgias/convert-client'

import { JourneyStateBadge } from 'AIJourney/components/JourneysTable/JourneyStateBadge/JourneyStateBadge'

describe('JourneyStateBadge', () => {
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
                expectedColor: 'green',
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
                render(<JourneyStateBadge state={state} isCampaign={false} />)
                expect(screen.getByText(expectedLabel)).toBeInTheDocument()
            })
        })
    })
})
