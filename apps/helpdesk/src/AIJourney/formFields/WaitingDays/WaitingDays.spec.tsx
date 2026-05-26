import { render } from '@repo/testing'
import { screen, waitFor } from '@testing-library/react'
import { FormProvider, useForm } from 'react-hook-form'

import { WaitingDays } from './WaitingDays'

const renderComponent = (
    type: 'cooldown' | 'inactive-days',
    defaultValues: Record<string, unknown> = {},
    isV3Architecture?: boolean,
) => {
    const Wrapper = () => {
        const methods = useForm({ defaultValues })
        return (
            <FormProvider {...methods}>
                <form onSubmit={methods.handleSubmit(() => {})}>
                    <WaitingDays
                        type={type}
                        isV3Architecture={isV3Architecture}
                    />
                    <button type="submit">Submit</button>
                </form>
            </FormProvider>
        )
    }
    render(<Wrapper />)
}

describe('<WaitingDays />', () => {
    it('should render the correct label and all day options for cooldown type', () => {
        renderComponent('cooldown', { cooldown_days: 30 })

        expect(
            screen.getByText('Shopper can re-enter after'),
        ).toBeInTheDocument()
        expect(screen.getByText('30 days')).toBeInTheDocument()
        expect(screen.getByText('60 days')).toBeInTheDocument()
        expect(screen.getByText('90 days')).toBeInTheDocument()
        expect(screen.queryByText('120 days')).not.toBeInTheDocument()
    })

    it('should render the correct label and all day options for inactive days type', () => {
        renderComponent('inactive-days', { inactive_days: 30 })

        expect(
            screen.getByText('Shopper inactive for at least'),
        ).toBeInTheDocument()
        expect(screen.getByText('30 days')).toBeInTheDocument()
        expect(screen.getByText('60 days')).toBeInTheDocument()
        expect(screen.getByText('90 days')).toBeInTheDocument()
        expect(screen.getByText('120 days')).toBeInTheDocument()
    })

    it('should render without crashing when field value is undefined', () => {
        renderComponent('cooldown', {})

        expect(
            screen.getByText('Shopper can re-enter after'),
        ).toBeInTheDocument()
        expect(screen.getByText('30 days')).toBeInTheDocument()
    })

    describe('v3 architecture', () => {
        it('should render a SelectField with "Shopper inactive" label for inactive-days type', () => {
            renderComponent('inactive-days', { inactive_days: 60 }, true)

            expect(
                screen.getByRole('button', { name: /shopper inactive/i }),
            ).toBeInTheDocument()
            expect(
                screen.queryByText('Shopper inactive for at least'),
            ).not.toBeInTheDocument()
        })

        it('should render a SelectField with "Re-entry after" label for cooldown type', () => {
            renderComponent('cooldown', { cooldown_days: 90 }, true)

            expect(
                screen.getByRole('button', { name: /re-entry after/i }),
            ).toBeInTheDocument()
            expect(
                screen.queryByText('Shopper can re-enter after'),
            ).not.toBeInTheDocument()
        })

        it('should default inactive_days to 60 when field value is undefined', async () => {
            renderComponent('inactive-days', {}, true)

            await waitFor(() => {
                expect(screen.getByText('60 days')).toBeInTheDocument()
            })
        })

        it('should default cooldown_days to 90 when field value is undefined', async () => {
            renderComponent('cooldown', {}, true)

            await waitFor(() => {
                expect(screen.getByText('90 days')).toBeInTheDocument()
            })
        })

        it('should display 120 days when inactive_days is set to 120', () => {
            renderComponent('inactive-days', { inactive_days: 120 }, true)

            expect(screen.getByText('120 days')).toBeInTheDocument()
        })

        it('should preserve a legacy inactive_days value that is not in the v3 options', () => {
            renderComponent('inactive-days', { inactive_days: 180 }, true)

            expect(screen.getByText('180 days')).toBeInTheDocument()
        })

        it('should preserve a legacy cooldown_days value that is not in the v3 options', () => {
            renderComponent('cooldown', { cooldown_days: 120 }, true)

            expect(screen.getByText('120 days')).toBeInTheDocument()
        })
    })
})
