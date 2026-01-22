import { Form } from '@repo/forms'
import { act, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { SLAPolicyMetricUnit } from '@gorgias/helpdesk-types'

import { VoicePolicyFields } from '../VoicePolicyFields'

describe('<VoicePolicyFields />', () => {
    it('should render all fields', () => {
        render(
            <Form
                defaultValues={{
                    target: 0.8,
                    metrics: [
                        {
                            threshold: 60,
                            unit: SLAPolicyMetricUnit.Second,
                        },
                    ],
                }}
                onValidSubmit={jest.fn()}
            >
                <VoicePolicyFields />
            </Form>,
        )

        expect(
            screen.getByRole('textbox', { name: /target/i }),
        ).toBeInTheDocument()
        expect(
            screen.getByRole('textbox', { name: /threshold/i }),
        ).toBeInTheDocument()
        expect(screen.getAllByDisplayValue('Seconds')[0]).toBeInTheDocument()
    })

    describe('Target field', () => {
        it('should display percentage value correctly (inputTransform)', () => {
            render(
                <Form
                    defaultValues={{
                        target: 0.85,
                        metrics: [
                            {
                                threshold: 60,
                                unit: SLAPolicyMetricUnit.Second,
                            },
                        ],
                    }}
                    onValidSubmit={jest.fn()}
                >
                    <VoicePolicyFields />
                </Form>,
            )

            const targetInput = screen.getByRole('textbox', { name: /target/i })
            expect(targetInput).toHaveValue('85')
        })

        it('should submit decimal value correctly (outputTransform)', async () => {
            const user = userEvent.setup()
            const handleSubmit = jest.fn()

            render(
                <Form
                    defaultValues={{
                        target: 0,
                        metrics: [
                            {
                                threshold: 60,
                                unit: SLAPolicyMetricUnit.Second,
                            },
                        ],
                    }}
                    onValidSubmit={handleSubmit}
                >
                    <VoicePolicyFields />
                    <button type="submit">Submit</button>
                </Form>,
            )

            const targetInput = screen.getByRole('textbox', { name: /target/i })
            await act(() => user.clear(targetInput))
            await act(() => user.type(targetInput, '95'))

            const submitButton = screen.getByRole('button', { name: /submit/i })
            await act(() => user.click(submitButton))

            expect(handleSubmit).toHaveBeenCalledWith(
                expect.objectContaining({
                    target: 0.95,
                }),
                expect.anything(),
            )
        })
    })

    describe('Time unit field', () => {
        it('should render with default value', () => {
            render(
                <Form
                    defaultValues={{
                        target: 0.8,
                        metrics: [
                            {
                                threshold: 60,
                                unit: SLAPolicyMetricUnit.Hour,
                            },
                        ],
                    }}
                    onValidSubmit={jest.fn()}
                >
                    <VoicePolicyFields />
                </Form>,
            )

            expect(screen.getAllByDisplayValue('Hours')[0]).toBeInTheDocument()
        })

        it('should allow changing time unit', async () => {
            const user = userEvent.setup()
            const handleSubmit = jest.fn()

            render(
                <Form
                    defaultValues={{
                        target: 0.8,
                        metrics: [
                            {
                                threshold: 60,
                                unit: SLAPolicyMetricUnit.Hour,
                            },
                        ],
                    }}
                    onValidSubmit={handleSubmit}
                >
                    <VoicePolicyFields />
                    <button type="submit">Submit</button>
                </Form>,
            )

            const timeUnitField = screen.getAllByDisplayValue('Hours')[0]
            await act(() => user.click(timeUnitField))
            await act(() =>
                user.click(screen.getByRole('option', { name: 'Days' })),
            )

            const submitButton = screen.getByRole('button', { name: /submit/i })
            await act(() => user.click(submitButton))

            await waitFor(() => {
                expect(handleSubmit).toHaveBeenCalledWith(
                    expect.objectContaining({
                        metrics: [
                            expect.objectContaining({
                                unit: SLAPolicyMetricUnit.Day,
                            }),
                        ],
                    }),
                    expect.anything(),
                )
            })
        })
    })

    it('should submit form with all valid values', async () => {
        const user = userEvent.setup()
        const handleSubmit = jest.fn()

        render(
            <Form
                defaultValues={{
                    target: 0.8,
                    metrics: [
                        {
                            threshold: 60,
                            unit: SLAPolicyMetricUnit.Second,
                        },
                    ],
                }}
                onValidSubmit={handleSubmit}
            >
                <VoicePolicyFields />
                <button type="submit">Submit</button>
            </Form>,
        )

        const targetInput = screen.getByRole('textbox', { name: /target/i })
        const thresholdInput = screen.getByRole('textbox', {
            name: /threshold/i,
        })

        await act(() => user.clear(targetInput))
        await act(() => user.type(targetInput, '90'))
        await act(() => user.clear(thresholdInput))
        await act(() => user.type(thresholdInput, '120'))

        const submitButton = screen.getByRole('button', { name: /submit/i })
        await act(() => user.click(submitButton))

        expect(handleSubmit).toHaveBeenCalledWith(
            expect.objectContaining({
                target: 0.9,
                metrics: [
                    expect.objectContaining({
                        threshold: 120,
                        unit: SLAPolicyMetricUnit.Second,
                    }),
                ],
            }),
            expect.anything(),
        )
    })
})
