import { render } from '@repo/testing'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FormProvider, useForm } from 'react-hook-form'

import { useJourneyContext } from 'AIJourney/providers'

import { ToneOfVoiceCard } from './ToneOfVoiceCard'

jest.mock('AIJourney/providers', () => ({
    useJourneyContext: jest.fn(),
}))

beforeAll(() => {
    HTMLElement.prototype.getAnimations = jest.fn().mockReturnValue([])
})

const mockUseJourneyContext = useJourneyContext as jest.Mock

type FormValues = {
    tone_of_voice_guidance: string | null
}

const renderComponent = (
    defaultValues: Partial<FormValues> = {},
    isFormReady = true,
) => {
    let formMethods: ReturnType<typeof useForm<FormValues>> | undefined
    const Wrapper = () => {
        const methods = useForm<FormValues>({
            defaultValues: {
                tone_of_voice_guidance: null,
                ...defaultValues,
            },
        })
        formMethods = methods
        return (
            <FormProvider {...methods}>
                <ToneOfVoiceCard isFormReady={isFormReady} />
            </FormProvider>
        )
    }
    const rendered = render(<Wrapper />)
    return {
        ...rendered,
        getFormMethods: () => formMethods!,
    }
}

describe('<ToneOfVoiceCard />', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        mockUseJourneyContext.mockReturnValue({
            shopName: 'test-shop',
        })
    })

    describe('loading state', () => {
        it('renders a skeleton when isFormReady is false', () => {
            renderComponent({}, false)

            expect(screen.getByLabelText('Loading')).toBeInTheDocument()
            expect(screen.queryByText('Tone of voice')).not.toBeInTheDocument()
        })
    })

    describe('rendering', () => {
        it('renders the heading and inheritance description', () => {
            renderComponent()

            expect(screen.getByText('Tone of voice')).toBeInTheDocument()
            expect(
                screen.getByRole('link', { name: 'AI Agent tone of voice' }),
            ).toHaveAttribute(
                'href',
                '/app/ai-agent/shopify/test-shop/tone-of-voice',
            )
        })

        it('does not render the textarea when toggle is off', () => {
            renderComponent()

            expect(
                screen.queryByLabelText(/Tone of voice guidance/),
            ).not.toBeInTheDocument()
        })

        it('renders the textarea pre-filled when a saved value exists', () => {
            renderComponent({ tone_of_voice_guidance: 'Be friendly' })

            expect(screen.getByDisplayValue('Be friendly')).toBeInTheDocument()
        })
    })

    describe('toggle behavior', () => {
        it('shows the textarea when the toggle is turned on', async () => {
            const user = userEvent.setup()
            renderComponent()

            await user.click(screen.getByLabelText('Use custom tone of voice'))

            expect(
                screen.getByLabelText(/Tone of voice guidance/),
            ).toBeInTheDocument()
        })

        it('hides the textarea when the toggle is turned off', async () => {
            const user = userEvent.setup()
            renderComponent({ tone_of_voice_guidance: 'Be friendly' })

            await user.click(screen.getByLabelText('Use custom tone of voice'))

            expect(
                screen.queryByLabelText(/Tone of voice guidance/),
            ).not.toBeInTheDocument()
        })

        it('restores the previously typed value when toggling off then on', async () => {
            const user = userEvent.setup()
            renderComponent({ tone_of_voice_guidance: 'Be punchy and bold' })

            const toggle = screen.getByLabelText('Use custom tone of voice')
            await user.click(toggle)
            await user.click(toggle)

            expect(
                screen.getByDisplayValue('Be punchy and bold'),
            ).toBeInTheDocument()
        })
    })

    describe('validation', () => {
        it('reports a required error when the toggle is on and the textarea is empty', async () => {
            const { getFormMethods } = renderComponent({
                tone_of_voice_guidance: '',
            })

            const onValid = jest.fn()
            const onInvalid = jest.fn()
            await getFormMethods().handleSubmit(onValid, onInvalid)()

            expect(onValid).not.toHaveBeenCalled()
            expect(onInvalid).toHaveBeenCalledWith(
                expect.objectContaining({
                    tone_of_voice_guidance: expect.objectContaining({
                        message: 'Tone of voice guidance is required.',
                    }),
                }),
                undefined,
            )
        })

        it('does not block submission when the toggle is off', async () => {
            const { getFormMethods } = renderComponent({
                tone_of_voice_guidance: null,
            })

            const onValid = jest.fn()
            const onInvalid = jest.fn()
            await getFormMethods().handleSubmit(onValid, onInvalid)()

            expect(onValid).toHaveBeenCalledWith(
                expect.objectContaining({ tone_of_voice_guidance: null }),
                undefined,
            )
            expect(onInvalid).not.toHaveBeenCalled()
        })

        it('passes validation when the toggle is on and the textarea has content', async () => {
            const { getFormMethods } = renderComponent({
                tone_of_voice_guidance: 'Be friendly',
            })

            const onValid = jest.fn()
            const onInvalid = jest.fn()
            await getFormMethods().handleSubmit(onValid, onInvalid)()

            expect(onValid).toHaveBeenCalledWith(
                expect.objectContaining({
                    tone_of_voice_guidance: 'Be friendly',
                }),
                undefined,
            )
            expect(onInvalid).not.toHaveBeenCalled()
        })
    })

    describe('character counter', () => {
        it('updates as the user types', async () => {
            const user = userEvent.setup()
            renderComponent({ tone_of_voice_guidance: '' })

            const textarea = screen.getByLabelText(/Tone of voice guidance/)
            await user.type(textarea, 'Hello')

            expect(screen.getByText('5/2000')).toBeInTheDocument()
        })

        it('enforces the maxLength attribute', () => {
            renderComponent({ tone_of_voice_guidance: '' })

            expect(
                screen.getByLabelText(/Tone of voice guidance/),
            ).toHaveAttribute('maxLength', '2000')
        })
    })

    describe('starter prompt modal', () => {
        it('opens when the starter prompt link is clicked', async () => {
            const user = userEvent.setup()
            renderComponent({ tone_of_voice_guidance: '' })

            await user.click(
                screen.getByRole('link', { name: 'starter prompt' }),
            )

            await waitFor(() => {
                expect(
                    screen.getByRole('heading', { name: 'Starter prompt' }),
                ).toBeInTheDocument()
            })
        })
    })
})
