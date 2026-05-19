import { render } from '@repo/testing'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FormProvider, useForm } from 'react-hook-form'

import { ExecutionModeCard } from './ExecutionModeCard'

const renderComponent = ({
    isFormReady = true,
    showDefaultOption = true,
    title,
    description,
    collapsible = false,
    isV3Architecture = false,
    defaultValues = {},
}: {
    isFormReady?: boolean
    showDefaultOption?: boolean
    title?: string
    description?: string
    collapsible?: boolean
    isV3Architecture?: boolean
    defaultValues?: Record<string, unknown>
} = {}) => {
    const Wrapper = () => {
        const methods = useForm({ defaultValues })
        return (
            <FormProvider {...methods}>
                <ExecutionModeCard
                    isFormReady={isFormReady}
                    showDefaultOption={showDefaultOption}
                    title={title}
                    description={description}
                    collapsible={collapsible}
                    isV3Architecture={isV3Architecture}
                />
            </FormProvider>
        )
    }

    return render(<Wrapper />)
}

describe('<ExecutionModeCard />', () => {
    describe('when isFormReady is false', () => {
        it('does not render the card content', () => {
            renderComponent({ isFormReady: false })

            expect(screen.queryByText('Execution mode')).not.toBeInTheDocument()
            expect(screen.queryByText('Dry run')).not.toBeInTheDocument()
        })

        it('renders a skeleton without the fixed 680px width when isV3Architecture is true', () => {
            renderComponent({ isFormReady: false, isV3Architecture: true })

            expect(screen.queryByText('Execution mode')).not.toBeInTheDocument()
            expect(screen.queryByText('Dry run')).not.toBeInTheDocument()
        })
    })

    describe('when isFormReady is true', () => {
        it('renders the default title and the three execution mode options', () => {
            renderComponent()

            expect(screen.getByText('Execution mode')).toBeInTheDocument()
            expect(screen.getByText('Dry run')).toBeInTheDocument()
            expect(screen.getByText('Trial')).toBeInTheDocument()
            expect(screen.getByText('Regular')).toBeInTheDocument()
        })

        it('renders the "Use store default" option when showDefaultOption is true', () => {
            renderComponent({ showDefaultOption: true })

            expect(screen.getByText('Use store default')).toBeInTheDocument()
        })

        it('omits the "Use store default" option when showDefaultOption is false', () => {
            renderComponent({ showDefaultOption: false })

            expect(
                screen.queryByText('Use store default'),
            ).not.toBeInTheDocument()
        })

        it('renders the loading hint while storeFallbackMode is undefined', () => {
            renderComponent({ showDefaultOption: true })

            expect(
                screen.getByText(/Loading store-level value/i),
            ).toBeInTheDocument()
        })

        it('renders the dry-run fallback hint when no store override is set', () => {
            const Wrapper = () => {
                const methods = useForm({ defaultValues: {} })
                return (
                    <FormProvider {...methods}>
                        <ExecutionModeCard
                            isFormReady={true}
                            showDefaultOption={true}
                            storeFallbackMode={null}
                        />
                    </FormProvider>
                )
            }
            render(<Wrapper />)

            expect(
                screen.getByText(/No store-level override set/i),
            ).toBeInTheDocument()
            expect(screen.getByText(/Dry run \(default\)/i)).toBeInTheDocument()
        })

        it('renders the resolved store fallback when an override is set', () => {
            const Wrapper = () => {
                const methods = useForm({ defaultValues: {} })
                return (
                    <FormProvider {...methods}>
                        <ExecutionModeCard
                            isFormReady={true}
                            showDefaultOption={true}
                            storeFallbackMode="trial"
                        />
                    </FormProvider>
                )
            }
            render(<Wrapper />)

            expect(
                screen.getByText(/Falls back to: Trial \(store default\)/i),
            ).toBeInTheDocument()
        })

        it('honors a custom title and description', () => {
            renderComponent({
                title: 'Store-level execution mode',
                description: 'Falls back to dry-run if unset.',
            })

            expect(
                screen.getByText('Store-level execution mode'),
            ).toBeInTheDocument()
            expect(
                screen.getByText('Falls back to dry-run if unset.'),
            ).toBeInTheDocument()
        })

        describe('when collapsible is true', () => {
            it('hides the radio options until the disclosure is expanded', async () => {
                const user = userEvent.setup()
                renderComponent({ collapsible: true })

                const trigger = screen.getByRole('button', {
                    name: /Execution mode/i,
                })
                expect(trigger).toHaveAttribute('aria-expanded', 'false')
                expect(screen.queryAllByRole('radio')).toHaveLength(0)

                await user.click(trigger)

                expect(trigger).toHaveAttribute('aria-expanded', 'true')
                expect(screen.queryAllByRole('radio')).toHaveLength(5)
                expect(screen.getByLabelText(/Dry run/i)).toBeInTheDocument()
            })
        })
    })

    describe('when isV3Architecture is true', () => {
        it('renders the title, description, and execution mode options inline', () => {
            renderComponent({
                title: 'Override',
                description: 'Custom description',
                isV3Architecture: true,
            })

            expect(screen.getByText('Override')).toBeInTheDocument()
            expect(screen.getByText('Custom description')).toBeInTheDocument()
            expect(screen.getByText('Dry run')).toBeInTheDocument()
        })

        it('renders as a Disclosure when collapsible is true', async () => {
            const user = userEvent.setup()
            renderComponent({ collapsible: true, isV3Architecture: true })

            const trigger = screen.getByRole('button', {
                name: /Execution mode/i,
            })
            expect(trigger).toHaveAttribute('aria-expanded', 'false')
            expect(screen.queryAllByRole('radio')).toHaveLength(0)

            await user.click(trigger)

            expect(trigger).toHaveAttribute('aria-expanded', 'true')
            expect(screen.queryAllByRole('radio')).toHaveLength(5)
        })
    })
})
