import { render } from '@repo/testing'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FormProvider, useForm } from 'react-hook-form'

import { FrequencyCapsCard } from './FrequencyCapsCard'

beforeAll(() => {
    HTMLElement.prototype.getAnimations = jest.fn().mockReturnValue([])
})

type FormValues = {
    texas_exclusion_enabled: boolean
}

const renderComponent = (defaultValues: Partial<FormValues> = {}) => {
    const Wrapper = () => {
        const methods = useForm<FormValues>({
            defaultValues: {
                texas_exclusion_enabled: false,
                ...defaultValues,
            },
        })
        return (
            <FormProvider {...methods}>
                <FrequencyCapsCard isFormReady />
            </FormProvider>
        )
    }
    return render(<Wrapper />)
}

describe('<FrequencyCapsCard />', () => {
    describe('loading state', () => {
        it('should render a skeleton when isFormReady is false', () => {
            const Wrapper = () => {
                const methods = useForm<FormValues>({
                    defaultValues: { texas_exclusion_enabled: false },
                })
                return (
                    <FormProvider {...methods}>
                        <FrequencyCapsCard isFormReady={false} />
                    </FormProvider>
                )
            }
            render(<Wrapper />)

            expect(screen.getByLabelText('Loading')).toBeInTheDocument()
            expect(screen.queryByText('Frequency caps')).not.toBeInTheDocument()
        })
    })

    describe('rendering', () => {
        it('should render the "Frequency caps" heading', () => {
            renderComponent()

            expect(screen.getByText('Frequency caps')).toBeInTheDocument()
        })

        it('should render the Texas exclusion toggle label', () => {
            renderComponent()

            expect(
                screen.getByText('Automatically exclude Texas recipients'),
            ).toBeInTheDocument()
        })

        it('should render the toggle caption', () => {
            renderComponent()

            expect(
                screen.getByText(
                    "Texas law prohibits certain SMS marketing. Shoppers with Texas numbers won't receive your messages.",
                ),
            ).toBeInTheDocument()
        })
    })

    describe('toggle state', () => {
        it('should render the toggle as unchecked by default', () => {
            renderComponent()

            expect(
                screen.getByRole('switch', {
                    name: /automatically exclude texas recipients/i,
                }),
            ).not.toBeChecked()
        })

        it('should render the toggle as checked when texas_exclusion_enabled is true', () => {
            renderComponent({ texas_exclusion_enabled: true })

            expect(
                screen.getByRole('switch', {
                    name: /automatically exclude texas recipients/i,
                }),
            ).toBeChecked()
        })
    })

    describe('user interaction', () => {
        it('should toggle the switch when clicked', async () => {
            const user = userEvent.setup()
            renderComponent()

            const toggle = screen.getByRole('switch', {
                name: /automatically exclude texas recipients/i,
            })
            expect(toggle).not.toBeChecked()

            await user.click(toggle)

            expect(toggle).toBeChecked()
        })

        it('should toggle the switch off when already checked', async () => {
            const user = userEvent.setup()
            renderComponent({ texas_exclusion_enabled: true })

            const toggle = screen.getByRole('switch', {
                name: /automatically exclude texas recipients/i,
            })
            expect(toggle).toBeChecked()

            await user.click(toggle)

            expect(toggle).not.toBeChecked()
        })
    })
})
