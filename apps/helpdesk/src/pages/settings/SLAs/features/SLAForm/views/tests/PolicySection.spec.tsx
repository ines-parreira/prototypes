import { Form } from '@repo/forms'
import { render, screen } from '@testing-library/react'

import { PolicySection } from '../PolicySection'

jest.mock('../MetricsFieldArray', () => ({
    MetricsFieldArray: () => <div>MetricsFieldArray</div>,
}))

describe('<PolicySection />', () => {
    it('should not render when no channels are selected', () => {
        render(
            <Form
                defaultValues={{
                    target_channels: [],
                    metrics: [],
                    business_hours_only: false,
                    active: false,
                }}
                onValidSubmit={jest.fn()}
            >
                <PolicySection />
            </Form>,
        )

        expect(screen.queryByText('Policy')).not.toBeInTheDocument()
        expect(
            screen.queryByRole('switch', {
                name: /pause sla timer outside of business hours/i,
            }),
        ).not.toBeInTheDocument()
        expect(
            screen.queryByRole('switch', {
                name: /enable sla/i,
            }),
        ).not.toBeInTheDocument()
    })

    it.each([['phone'], ['email']])(
        'should render enable sla field',
        (channels) => {
            render(
                <Form
                    defaultValues={{
                        target_channels: channels,
                        metrics: [],
                        business_hours_only: false,
                        active: false,
                    }}
                    onValidSubmit={jest.fn()}
                >
                    <PolicySection />
                </Form>,
            )

            expect(
                screen.getByRole('switch', {
                    name: /enable sla/i,
                }),
            ).toBeInTheDocument()
        },
    )

    describe('when voice channel is selected', () => {
        it('should render with voice-specific fields and no MetricsFieldArray', () => {
            render(
                <Form
                    defaultValues={{
                        target_channels: ['phone'],
                        target: 0.9,
                        metrics: [
                            {
                                threshold: 60,
                                unit: 'second',
                            },
                        ],
                        business_hours_only: false,
                        active: false,
                    }}
                    onValidSubmit={jest.fn()}
                >
                    <PolicySection />
                </Form>,
            )

            expect(screen.getByText('Policy')).toBeInTheDocument()
            expect(
                screen.getByText(
                    'Set the percentage of calls that must be answered within the time threshold. The SLA calculation starts when the call enters the queue and excludes time spent in the IVR menu and the greeting message.',
                ),
            ).toBeInTheDocument()
            expect(
                screen.getByRole('textbox', { name: /target/i }),
            ).toBeInTheDocument()
            expect(
                screen.getByRole('textbox', { name: /threshold/i }),
            ).toBeInTheDocument()
            expect(
                screen.getAllByDisplayValue('Seconds')[0],
            ).toBeInTheDocument()

            expect(
                screen.queryByText('MetricsFieldArray'),
            ).not.toBeInTheDocument()

            expect(
                screen.queryByRole('switch', {
                    name: /pause sla timer outside of business hours/i,
                }),
            ).not.toBeInTheDocument()
        })
    })

    describe('when non-voice channels are selected', () => {
        const defaultValues = {
            target_channels: ['email'],
            metrics: [],
            business_hours_only: false,
            active: false,
        }
        it('should render with non-voice description and with MetricsFieldArray', () => {
            render(
                <Form defaultValues={defaultValues} onValidSubmit={jest.fn()}>
                    <PolicySection />
                </Form>,
            )

            expect(screen.getByText('Policy')).toBeInTheDocument()
            expect(
                screen.getByText(
                    'Define the first response time and / or resolution times to be set as goals by your team(s).',
                ),
            ).toBeInTheDocument()
            expect(screen.getByText('MetricsFieldArray')).toBeInTheDocument()
        })
    })
})
