import { render, screen } from '@testing-library/react'
import { FormProvider, useForm } from 'react-hook-form'

import { WaitingDays } from './WaitingDays'

const renderComponent = (
    type: 'cooldown' | 'inactive-days',
    defaultValues: Record<string, unknown> = {},
    onSubmit: jest.Mock = jest.fn(),
) => {
    const Wrapper = () => {
        const methods = useForm({ defaultValues })
        return (
            <FormProvider {...methods}>
                <form onSubmit={methods.handleSubmit(onSubmit)}>
                    <WaitingDays type={type} />
                    <button type="submit">Submit</button>
                </form>
            </FormProvider>
        )
    }
    render(<Wrapper />)
    return { onSubmit }
}

describe('<WaitingDays />', () => {
    it('should render the correct label and all day options for cooldown type', () => {
        renderComponent('cooldown', { cooldown_days: 30 })

        expect(
            screen.getByText('Shopper inactive for at least'),
        ).toBeInTheDocument()
        expect(screen.getByText('30 days')).toBeInTheDocument()
        expect(screen.getByText('60 days')).toBeInTheDocument()
        expect(screen.getByText('90 days')).toBeInTheDocument()
    })

    it('should render the correct label and all day options for inactive days type', () => {
        renderComponent('inactive-days', { inactive_days: 30 })

        expect(
            screen.getByText('Shopper can re-enter after'),
        ).toBeInTheDocument()
        expect(screen.getByText('30 days')).toBeInTheDocument()
        expect(screen.getByText('60 days')).toBeInTheDocument()
        expect(screen.getByText('90 days')).toBeInTheDocument()
    })

    it('should render without crashing when field value is undefined', () => {
        renderComponent('cooldown', {})

        expect(
            screen.getByText('Shopper inactive for at least'),
        ).toBeInTheDocument()
        expect(screen.getByText('30 days')).toBeInTheDocument()
    })
})
