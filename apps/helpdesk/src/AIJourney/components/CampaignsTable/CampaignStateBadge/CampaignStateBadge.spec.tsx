import React from 'react'

import { render } from '@repo/testing'
import { screen } from '@testing-library/react'

import { JourneyCampaignStateEnum } from '@gorgias/convert-client'

import CampaignStateBadge from './CampaignStateBadge'

jest.mock('@gorgias/axiom', () => ({
    ...jest.requireActual('@gorgias/axiom'),
    Tooltip: ({
        trigger,
        children,
    }: {
        trigger: React.ReactNode
        children: React.ReactNode
    }) => (
        <>
            {trigger}
            {children}
        </>
    ),
    TooltipContent: ({ title }: { title?: React.ReactNode }) => (
        <div role="tooltip">{title}</div>
    ),
}))

describe('CampaignStateBadge', () => {
    describe('Badge styling', () => {
        const testCases = [
            { state: JourneyCampaignStateEnum.Draft, expectedColor: 'grey' },
            {
                state: JourneyCampaignStateEnum.Scheduled,
                expectedColor: 'yellow',
            },
            {
                state: JourneyCampaignStateEnum.Paused,
                expectedColor: 'yellow',
            },
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
                state: JourneyCampaignStateEnum.Canceled,
                expectedLabel: 'Canceled',
            },
            {
                state: JourneyCampaignStateEnum.Sent,
                expectedLabel: 'Delivered',
            },
            {
                state: JourneyCampaignStateEnum.Paused,
                expectedLabel: 'Paused',
            },
            {
                state: 'something-else' as JourneyCampaignStateEnum,
                expectedLabel: 'Unknown',
            },
        ]

        labelMappings.forEach(({ state, expectedLabel }) => {
            it(`should display "${expectedLabel}" for ${state} state`, () => {
                render(<CampaignStateBadge state={state} />)
                expect(screen.getByText(expectedLabel)).toBeInTheDocument()
            })
        })
    })

    describe('Scheduled tooltip', () => {
        it.each([
            ['2026-06-15T11:30:00', 'Jun 15, 2026 at 11:30 AM'],
            ['2026-12-25T08:05:00', 'Dec 25, 2026 at 8:05 AM'],
            ['2026-01-01T00:00:00', 'Jan 1, 2026 at 12:00 AM'],
            ['2026-07-04T23:59:00', 'Jul 4, 2026 at 11:59 PM'],
        ])(
            'formats scheduled_datetime "%s" as "%s" in the tooltip',
            (scheduledDatetime, expected) => {
                render(
                    <CampaignStateBadge
                        state={JourneyCampaignStateEnum.Scheduled}
                        scheduledDatetime={scheduledDatetime}
                    />,
                )

                expect(screen.getByRole('tooltip')).toHaveTextContent(expected)
            },
        )

        it('renders the badge label inside the tooltip trigger', () => {
            render(
                <CampaignStateBadge
                    state={JourneyCampaignStateEnum.Scheduled}
                    scheduledDatetime="2026-06-15T11:30:00"
                />,
            )

            expect(screen.getByText('Scheduled')).toBeInTheDocument()
            expect(screen.getByRole('tooltip')).toBeInTheDocument()
        })

        it('does not render a tooltip when scheduledDatetime is undefined', () => {
            render(
                <CampaignStateBadge
                    state={JourneyCampaignStateEnum.Scheduled}
                />,
            )

            expect(screen.queryByRole('tooltip')).not.toBeInTheDocument()
        })

        it('does not render a tooltip when scheduledDatetime is null', () => {
            render(
                <CampaignStateBadge
                    state={JourneyCampaignStateEnum.Scheduled}
                    scheduledDatetime={null}
                />,
            )

            expect(screen.queryByRole('tooltip')).not.toBeInTheDocument()
        })

        it('does not render a tooltip when scheduledDatetime is an empty string', () => {
            render(
                <CampaignStateBadge
                    state={JourneyCampaignStateEnum.Scheduled}
                    scheduledDatetime=""
                />,
            )

            expect(screen.queryByRole('tooltip')).not.toBeInTheDocument()
        })

        it.each([
            JourneyCampaignStateEnum.Draft,
            JourneyCampaignStateEnum.Active,
            JourneyCampaignStateEnum.Sent,
            JourneyCampaignStateEnum.Canceled,
            JourneyCampaignStateEnum.Paused,
        ])(
            'does not render a tooltip for state "%s" even when scheduledDatetime is set',
            (state) => {
                render(
                    <CampaignStateBadge
                        state={state}
                        scheduledDatetime="2026-06-15T11:30:00"
                    />,
                )

                expect(screen.queryByRole('tooltip')).not.toBeInTheDocument()
            },
        )
    })
})
