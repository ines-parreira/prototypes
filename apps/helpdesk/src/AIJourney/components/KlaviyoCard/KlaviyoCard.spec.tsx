import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FormProvider, useForm } from 'react-hook-form'

import { KlaviyoCard } from './KlaviyoCard'

beforeAll(() => {
    HTMLElement.prototype.getAnimations = jest.fn().mockReturnValue([])
})

type FormValues = {
    klaviyo_api_key: string | null
}

const renderComponent = (
    defaultValues: Partial<FormValues> = {},
    isFormReady = true,
) => {
    const Wrapper = () => {
        const methods = useForm<FormValues>({
            defaultValues: {
                klaviyo_api_key: null,
                ...defaultValues,
            },
        })
        return (
            <FormProvider {...methods}>
                <KlaviyoCard isFormReady={isFormReady} />
            </FormProvider>
        )
    }
    return render(<Wrapper />)
}

describe('<KlaviyoCard />', () => {
    describe('loading state', () => {
        it('should render a skeleton when isFormReady is false', () => {
            renderComponent({}, false)

            expect(screen.getByLabelText('Loading')).toBeInTheDocument()
            expect(screen.queryByText('Klaviyo')).not.toBeInTheDocument()
        })
    })

    describe('disconnected state', () => {
        it('should render the API key input', () => {
            renderComponent({ klaviyo_api_key: null })

            expect(screen.getByLabelText('Klaviyo API key')).toBeInTheDocument()
        })

        it('should render a link to the Klaviyo API key guide', () => {
            renderComponent({ klaviyo_api_key: null })

            expect(
                screen.getByRole('link', {
                    name: /how to create klaviyo api key/i,
                }),
            ).toBeInTheDocument()
        })

        it('should not render action buttons', () => {
            renderComponent({ klaviyo_api_key: null })

            expect(
                screen.queryByRole('button', { name: 'Replace key' }),
            ).not.toBeInTheDocument()
            expect(
                screen.queryByRole('button', { name: 'Cancel' }),
            ).not.toBeInTheDocument()
        })
    })

    describe('connected state', () => {
        it('should show a "Connected" badge', async () => {
            renderComponent({ klaviyo_api_key: '••••a4f2' })

            await waitFor(() => {
                expect(
                    screen.getByRole('button', { name: 'Connected' }),
                ).toBeInTheDocument()
            })
        })

        it('should render the masked API key in the input', async () => {
            renderComponent({ klaviyo_api_key: '••••a4f2' })

            await waitFor(() => {
                expect(
                    screen.getByLabelText('Klaviyo API key'),
                ).toBeInTheDocument()
            })
        })

        it('should render the "Replace key" button', async () => {
            renderComponent({ klaviyo_api_key: '••••a4f2' })

            await waitFor(() => {
                expect(
                    screen.getByRole('button', { name: 'Replace key' }),
                ).toBeInTheDocument()
            })
        })
    })

    describe('replace key action', () => {
        it('should show an editable input and "Cancel" after clicking "Replace key"', async () => {
            const user = userEvent.setup()
            renderComponent({ klaviyo_api_key: '••••a4f2' })

            await waitFor(() => {
                expect(
                    screen.getByRole('button', { name: 'Replace key' }),
                ).toBeInTheDocument()
            })

            await user.click(
                screen.getByRole('button', { name: 'Replace key' }),
            )

            expect(screen.getByLabelText('Klaviyo API key')).toBeInTheDocument()
            expect(
                screen.getByRole('button', { name: 'Cancel' }),
            ).toBeInTheDocument()
            expect(
                screen.queryByRole('button', { name: 'Replace key' }),
            ).not.toBeInTheDocument()
        })

        it('should show an error when saving with an empty input in replacing state', async () => {
            const user = userEvent.setup()
            const Wrapper = () => {
                const methods = useForm<FormValues>({
                    defaultValues: { klaviyo_api_key: '••••a4f2' },
                })
                return (
                    <FormProvider {...methods}>
                        <KlaviyoCard isFormReady />
                        <button
                            type="button"
                            onClick={() =>
                                void methods.trigger('klaviyo_api_key')
                            }
                        >
                            Validate
                        </button>
                    </FormProvider>
                )
            }
            render(<Wrapper />)

            await waitFor(() => {
                expect(
                    screen.getByRole('button', { name: 'Replace key' }),
                ).toBeInTheDocument()
            })

            await user.click(
                screen.getByRole('button', { name: 'Replace key' }),
            )
            await user.click(screen.getByRole('button', { name: 'Validate' }))

            await waitFor(() => {
                expect(
                    screen.getByText(
                        'Please insert new API key and click Save.',
                    ),
                ).toBeInTheDocument()
            })
        })

        it('should return to connected state when "Cancel" is clicked', async () => {
            const user = userEvent.setup()
            renderComponent({ klaviyo_api_key: '••••a4f2' })

            await waitFor(() => {
                expect(
                    screen.getByRole('button', { name: 'Replace key' }),
                ).toBeInTheDocument()
            })

            await user.click(
                screen.getByRole('button', { name: 'Replace key' }),
            )
            await user.click(screen.getByRole('button', { name: 'Cancel' }))

            await waitFor(() => {
                expect(
                    screen.getByRole('button', { name: 'Replace key' }),
                ).toBeInTheDocument()
                expect(
                    screen.queryByRole('button', { name: 'Cancel' }),
                ).not.toBeInTheDocument()
            })
        })
    })
})
