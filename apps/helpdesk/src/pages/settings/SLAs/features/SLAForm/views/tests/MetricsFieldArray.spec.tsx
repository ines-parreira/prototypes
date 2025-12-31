import { Form } from '@repo/forms'
import { act, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { SLAPolicyMetricUnit } from '@gorgias/helpdesk-types'

import { MetricsFieldArray } from '../MetricsFieldArray'

describe('<MetricsFieldArray />', () => {
    it('should render a field for each metric', () => {
        render(
            <Form
                defaultValues={{
                    metrics: [
                        { id: '1', name: 'FRT' },
                        { id: '2', name: 'RT' },
                    ],
                }}
                onValidSubmit={jest.fn()}
            >
                <MetricsFieldArray />
            </Form>,
        )

        expect(screen.getByText('First response time')).toBeInTheDocument()
        expect(screen.getByText('Resolution time')).toBeInTheDocument()
    })

    describe('handleToggle', () => {
        it('should clear threshold value when toggling off a metric', async () => {
            const user = userEvent.setup()
            const handleSubmit = jest.fn()
            render(
                <Form
                    defaultValues={{
                        metrics: [
                            {
                                id: '1',
                                name: 'FRT',
                                threshold: 10,
                                unit: SLAPolicyMetricUnit.Hour,
                            },
                        ],
                    }}
                    onValidSubmit={handleSubmit}
                    onInvalidSubmit={handleSubmit}
                >
                    <MetricsFieldArray />
                    <button type="submit">Submit</button>
                </Form>,
            )

            const toggle = screen.getByRole('switch', {
                name: /first response time/i,
            })

            await act(() => user.click(toggle))

            const submitButton = screen.getByRole('button', { name: /submit/i })
            await act(() => user.click(submitButton))

            await waitFor(() => {
                expect(handleSubmit).toHaveBeenCalledWith(
                    {
                        metrics: [
                            expect.objectContaining({
                                threshold: expect.objectContaining({
                                    message: 'This field is required',
                                }),
                            }),
                        ],
                    },
                    expect.anything(),
                )
            })
        })

        it('should restore previous threshold value when toggling back on', async () => {
            const user = userEvent.setup()
            const handleSubmit = jest.fn()
            render(
                <Form
                    defaultValues={{
                        metrics: [
                            {
                                id: '1',
                                name: 'FRT',
                                threshold: 10,
                                unit: SLAPolicyMetricUnit.Hour,
                            },
                        ],
                    }}
                    onValidSubmit={handleSubmit}
                >
                    <MetricsFieldArray />
                    <button type="submit">Submit</button>
                </Form>,
            )

            const toggle = screen.getByRole('switch', {
                name: /first response time/i,
            })

            await act(() => user.click(toggle))
            await act(() => user.click(toggle))

            const submitButton = screen.getByRole('button', { name: /submit/i })
            await act(() => user.click(submitButton))

            expect(handleSubmit).toHaveBeenCalledWith(
                expect.objectContaining({
                    metrics: [
                        expect.objectContaining({
                            threshold: 10,
                        }),
                    ],
                }),
                expect.anything(),
            )
        })

        it('should show previous threshold value as placeholder when toggled off', async () => {
            const user = userEvent.setup()
            render(
                <Form
                    defaultValues={{
                        metrics: [
                            {
                                id: '1',
                                name: 'FRT',
                                threshold: 10,
                                unit: SLAPolicyMetricUnit.Hour,
                            },
                        ],
                    }}
                    onValidSubmit={jest.fn()}
                >
                    <MetricsFieldArray />
                </Form>,
            )

            const toggle = screen.getByRole('switch', {
                name: /first response time/i,
            })

            await act(() => user.click(toggle))

            const thresholdInput = screen.getByRole('spinbutton')
            expect(thresholdInput).toHaveAttribute('placeholder', '10')
        })
    })
})
