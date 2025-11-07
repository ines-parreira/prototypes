import React from 'react'

import { render, screen } from '@testing-library/react'

import { JourneyCampaignStateEnum } from '@gorgias/convert-client'

import CampaignStateBadge from './CampaignStateBadge'

describe('CampaignStateBadge', () => {
    describe('Badge styling', () => {
        const testCases = [
            { state: JourneyCampaignStateEnum.Draft, expectedColor: 'yellow' },
            {
                state: JourneyCampaignStateEnum.Scheduled,
                expectedColor: 'yellow',
            },
            { state: JourneyCampaignStateEnum.Active, expectedColor: 'blue' },
            { state: JourneyCampaignStateEnum.Canceled, expectedColor: 'red' },
            { state: JourneyCampaignStateEnum.Sent, expectedColor: 'green' },
        ]

        testCases.forEach(({ state, expectedColor }) => {
            it(`should apply correct color class "${expectedColor}" for ${state} state`, () => {
                const { container } = render(
                    <CampaignStateBadge state={state} />,
                )
                const badge = container.querySelector('.badge')

                expect(badge).toHaveClass(expectedColor)
            })
        })
    })

    describe('Label mapping', () => {
        const labelMappings = [
            { state: JourneyCampaignStateEnum.Draft, expectedLabel: 'Draft' },
            {
                state: JourneyCampaignStateEnum.Scheduled,
                expectedLabel: 'Scheduled',
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
        ]

        labelMappings.forEach(({ state, expectedLabel }) => {
            it(`should display "${expectedLabel}" for ${state} state`, () => {
                render(<CampaignStateBadge state={state} />)
                expect(screen.getByText(expectedLabel)).toBeInTheDocument()
            })
        })
    })
})
