import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FormProvider, useForm } from 'react-hook-form'

import { QuietHoursCard } from './QuietHoursCard'

beforeAll(() => {
    HTMLElement.prototype.getAnimations = jest.fn().mockReturnValue([])
})

type FormValues = {
    quiet_hours_start: string | null
    quiet_hours_end: string | null
}

let formMethods: ReturnType<typeof useForm<FormValues>>

const renderComponent = (
    defaultValues: Partial<FormValues> = {},
    isFormReady = true,
) => {
    const Wrapper = () => {
        const methods = useForm<FormValues>({
            defaultValues: {
                quiet_hours_start: null,
                quiet_hours_end: null,
                ...defaultValues,
            },
        })
        formMethods = methods
        return (
            <FormProvider {...methods}>
                <QuietHoursCard isFormReady={isFormReady} />
            </FormProvider>
        )
    }
    return render(<Wrapper />)
}

describe('<QuietHoursCard />', () => {
    describe('loading state', () => {
        it('should render a skeleton when isFormReady is false', () => {
            renderComponent({}, false)

            expect(screen.getByLabelText('Loading')).toBeInTheDocument()
            expect(screen.queryByText('Quiet hours')).not.toBeInTheDocument()
        })
    })

    describe('rendering', () => {
        it('should render the "Quiet hours" heading', () => {
            renderComponent()

            expect(screen.getByText('Quiet hours')).toBeInTheDocument()
        })

        it('should render the card description', () => {
            renderComponent()

            expect(
                screen.getByText(
                    "AI Journey pauses SMS between the hours below, based on each recipient's phone number timezone.",
                ),
            ).toBeInTheDocument()
        })

        it('should render the "Stop sending" label', () => {
            renderComponent()

            expect(screen.getByText('Stop sending')).toBeInTheDocument()
        })

        it('should render the "Resume sending" label', () => {
            renderComponent()

            expect(screen.getByText('Resume sending')).toBeInTheDocument()
        })
    })

    describe('time collision validation', () => {
        it('should show an error on both fields when start and end times are the same', async () => {
            const user = userEvent.setup()
            renderComponent({
                quiet_hours_start: '21:00',
                quiet_hours_end: '08:00',
            })

            const resumeGroup = screen.getByRole('group', {
                name: 'Resume sending',
            })
            const hour = within(resumeGroup).getByRole('spinbutton', {
                name: /hour/i,
            })
            const minute = within(resumeGroup).getByRole('spinbutton', {
                name: /minute/i,
            })
            const ampm = within(resumeGroup).getByRole('spinbutton', {
                name: /AM\/PM/i,
            })

            await user.click(hour)
            await user.keyboard('09')
            await user.click(minute)
            await user.keyboard('00')
            await user.click(ampm)
            await user.keyboard('PM')

            await waitFor(() => {
                expect(
                    screen.getAllByText(
                        'Start and end times cannot be the same',
                    ),
                ).toHaveLength(2)
            })
        })

        it('should not show an error when start and end times are different', async () => {
            renderComponent({
                quiet_hours_start: '21:00',
                quiet_hours_end: '08:00',
            })

            expect(
                screen.queryByText('Start and end times cannot be the same'),
            ).not.toBeInTheDocument()
        })

        it('should not show an error when both times are null', () => {
            renderComponent()

            expect(
                screen.queryByText('Start and end times cannot be the same'),
            ).not.toBeInTheDocument()
            expect(
                screen.queryByText(
                    'Both times must be set or both must be empty',
                ),
            ).not.toBeInTheDocument()
        })
    })

    describe('both times required validation', () => {
        it('should show an error on the stop sending field when only end is set', () => {
            renderComponent({
                quiet_hours_start: null,
                quiet_hours_end: '08:00',
            })

            expect(
                screen.getByText(
                    'Both times must be set or both must be empty',
                ),
            ).toBeInTheDocument()
        })

        it('should show an error on the resume sending field when only start is set', () => {
            renderComponent({
                quiet_hours_start: '21:00',
                quiet_hours_end: null,
            })

            expect(
                screen.getByText(
                    'Both times must be set or both must be empty',
                ),
            ).toBeInTheDocument()
        })
    })

    describe('onChange handlers', () => {
        it('should update quiet_hours_start when Stop sending time changes', async () => {
            const user = userEvent.setup()
            renderComponent()

            const stopGroup = screen.getByRole('group', {
                name: 'Stop sending',
            })
            const hour = within(stopGroup).getByRole('spinbutton', {
                name: /hour/i,
            })
            const minute = within(stopGroup).getByRole('spinbutton', {
                name: /minute/i,
            })
            const ampm = within(stopGroup).getByRole('spinbutton', {
                name: /AM\/PM/i,
            })

            await user.click(hour)
            await user.keyboard('09')
            await user.click(minute)
            await user.keyboard('00')
            await user.click(ampm)
            await user.keyboard('PM')

            await waitFor(() => {
                expect(formMethods.getValues('quiet_hours_start')).toBe('21:00')
            })
        })

        it('should update quiet_hours_end when Resume sending time changes', async () => {
            const user = userEvent.setup()
            renderComponent()

            const resumeGroup = screen.getByRole('group', {
                name: 'Resume sending',
            })
            const hour = within(resumeGroup).getByRole('spinbutton', {
                name: /hour/i,
            })
            const minute = within(resumeGroup).getByRole('spinbutton', {
                name: /minute/i,
            })
            const ampm = within(resumeGroup).getByRole('spinbutton', {
                name: /AM\/PM/i,
            })

            await user.click(hour)
            await user.keyboard('08')
            await user.click(minute)
            await user.keyboard('00')
            await user.click(ampm)
            await user.keyboard('AM')

            await waitFor(() => {
                expect(formMethods.getValues('quiet_hours_end')).toBe('08:00')
            })
        })
    })
})
