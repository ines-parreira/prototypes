import React from 'react'

import { render } from '@repo/testing'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FormProvider, useForm } from 'react-hook-form'
import { MemoryRouter } from 'react-router-dom'

import { useJourneyContext } from 'AIJourney/providers'

import type { SetupFormValues } from '../Setup/Setup'
import { ScheduleOrSend } from './ScheduleOrSend'

const mockHistoryPush = jest.fn()

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useHistory: () => ({ push: mockHistoryPush }),
}))

jest.mock('@gorgias/axiom', () => {
    const actual = jest.requireActual('@gorgias/axiom')
    return {
        ...actual,
        RadioCard: jest.fn(
            ({
                title,
                value,
            }: {
                title: string
                value: string
                description?: string
            }) => <div data-value={value}>{title}</div>,
        ),
        RadioGroup: jest.fn(
            ({
                children,
                onChange,
                value,
            }: {
                children: React.ReactNode
                onChange?: (val: string) => void
                value?: string
            }) => (
                <div
                    role="radiogroup"
                    data-value={value}
                    onClick={(e) => {
                        const target = e.target as HTMLElement
                        const val = target.getAttribute('data-value')
                        if (val && onChange) onChange(val)
                    }}
                >
                    {children}
                </div>
            ),
        ),
        CardHeader: jest.fn(({ title }: { title: string }) => (
            <div>{title}</div>
        )),
        DateField: jest.fn(
            ({
                label,
                onChange,
            }: {
                label: string
                onChange?: (val: unknown) => void
            }) => (
                <div>
                    <span>{label}</span>
                    {onChange && (
                        <button
                            onClick={() =>
                                onChange({
                                    year: 2026,
                                    month: 5,
                                    day: 15,
                                    hour: 10,
                                    minute: 0,
                                    timeZone: 'UTC',
                                })
                            }
                        >
                            Pick date
                        </button>
                    )}
                </div>
            ),
        ),
        TimeField: jest.fn(
            ({
                label,
                onChange,
            }: {
                label: string
                onChange?: (val: unknown) => void
            }) => (
                <div>
                    <span>{label}</span>
                    {onChange && (
                        <button
                            onClick={() =>
                                onChange({ hour: 14, minute: 30, second: 0 })
                            }
                        >
                            Pick time
                        </button>
                    )}
                </div>
            ),
        ),
        Banner: jest.fn(
            ({
                title,
                description,
            }: {
                title: string
                description: React.ReactNode
                intent?: string
                icon?: string
                isClosable?: boolean
                size?: string
            }) => (
                <div>
                    <div>{title}</div>
                    <div>{description}</div>
                </div>
            ),
        ),
    }
})

jest.mock('AIJourney/providers', () => ({
    useJourneyContext: jest.fn(),
}))

const mockUseJourneyContext = useJourneyContext as jest.MockedFunction<
    typeof useJourneyContext
>

const defaultContextValue = {
    journeyData: {
        id: 'journey-123',
        campaign: { title: 'Test Campaign', scheduled_datetime: null },
        included_audience_list_ids: ['list-1'],
        message_instructions: 'Some guidance',
    },
    isLoading: false,
    isLoadingJourneyData: false,
    currentIntegration: { id: 1, name: 'test-shop' },
    shopName: 'test-shop',
    journeys: [],
    campaigns: [],
    currency: 'USD',
    isLoadingJourneys: false,
    isLoadingIntegrations: false,
}

function Wrapper({ children }: { children: React.ReactNode }) {
    const methods = useForm<SetupFormValues>({
        defaultValues: {
            scheduleType: 'immediate',
            scheduledDate: null,
            scheduledTime: null,
        },
    })

    return <FormProvider {...methods}>{children}</FormProvider>
}

function renderComponent({
    isV3Architecture,
}: { isV3Architecture?: boolean } = {}) {
    const user = userEvent.setup()
    const result = render(
        <MemoryRouter>
            <Wrapper>
                <ScheduleOrSend isV3Architecture={isV3Architecture} />
            </Wrapper>
        </MemoryRouter>,
    )
    return { ...result, user }
}

describe('<ScheduleOrSend />', () => {
    beforeEach(() => {
        mockUseJourneyContext.mockReturnValue(defaultContextValue as any)
        mockHistoryPush.mockReset()
    })

    it('renders skeleton while loading', () => {
        mockUseJourneyContext.mockReturnValue({
            ...defaultContextValue,
            isLoading: true,
        } as any)

        renderComponent()

        expect(
            screen.queryByText('Choose when to send'),
        ).not.toBeInTheDocument()
    })

    it('renders the schedule card with radio options', async () => {
        renderComponent()

        await waitFor(() => {
            expect(screen.getByText('Choose when to send')).toBeInTheDocument()
        })

        expect(screen.getByText('Schedule')).toBeInTheDocument()
        expect(screen.getByText('Send now')).toBeInTheDocument()
    })

    it('renders helper text about timezone and quiet hours', async () => {
        renderComponent()

        await waitFor(() => {
            expect(
                screen.getByText(
                    /The scheduled time is based on your timezone/,
                ),
            ).toBeInTheDocument()
        })

        expect(
            screen.getByText(/You can adjust quiet hours in/i),
        ).toBeInTheDocument()
        expect(
            screen.getByRole('link', { name: 'Settings' }),
        ).toBeInTheDocument()
    })

    it('navigates to the AI Journey settings page when the Settings link is clicked', async () => {
        const { user } = renderComponent()

        await waitFor(() => {
            expect(
                screen.getByRole('link', { name: 'Settings' }),
            ).toBeInTheDocument()
        })

        await user.click(screen.getByRole('link', { name: 'Settings' }))

        expect(mockHistoryPush).toHaveBeenCalledWith(
            '/app/ai-journey/test-shop/settings#compliance',
        )
    })

    it('does not show date/time fields when "Send now" is selected by default', async () => {
        renderComponent()

        await waitFor(() => {
            expect(screen.getByText('Choose when to send')).toBeInTheDocument()
        })

        expect(screen.queryByLabelText('Date')).not.toBeInTheDocument()
        expect(screen.queryByLabelText('Time')).not.toBeInTheDocument()
    })

    it('shows date and time fields when "Schedule" is selected', async () => {
        const { user } = renderComponent()

        await waitFor(() => {
            expect(screen.getByText('Schedule')).toBeInTheDocument()
        })

        await user.click(screen.getByText('Schedule'))

        await waitFor(() => {
            expect(screen.getByText('Date')).toBeInTheDocument()
            expect(screen.getByText('Time')).toBeInTheDocument()
        })
    })

    it('shows warning banner when audience is missing', async () => {
        mockUseJourneyContext.mockReturnValue({
            ...defaultContextValue,
            journeyData: {
                ...defaultContextValue.journeyData,
                included_audience_list_ids: [],
            },
        } as any)

        renderComponent()

        await waitFor(() => {
            expect(
                screen.getByText('Campaign is not ready to send'),
            ).toBeInTheDocument()
            expect(
                screen.getByText('Add an audience in the Setup step'),
            ).toBeInTheDocument()
        })
    })

    it('shows warning banner when message guidance is missing', async () => {
        mockUseJourneyContext.mockReturnValue({
            ...defaultContextValue,
            journeyData: {
                ...defaultContextValue.journeyData,
                message_instructions: null,
            },
        } as any)

        renderComponent()

        await waitFor(() => {
            expect(
                screen.getByText('Campaign is not ready to send'),
            ).toBeInTheDocument()
            expect(
                screen.getByText('Add message guidance in the Preview step'),
            ).toBeInTheDocument()
        })
    })

    it('shows both missing items when audience and guidance are missing', async () => {
        mockUseJourneyContext.mockReturnValue({
            ...defaultContextValue,
            journeyData: {
                ...defaultContextValue.journeyData,
                included_audience_list_ids: [],
                message_instructions: null,
            },
        } as any)

        renderComponent()

        await waitFor(() => {
            expect(
                screen.getByText('Add an audience in the Setup step'),
            ).toBeInTheDocument()
            expect(
                screen.getByText('Add message guidance in the Preview step'),
            ).toBeInTheDocument()
        })
    })

    it('does not show warning banner when all requirements are met', async () => {
        renderComponent()

        await waitFor(() => {
            expect(screen.getByText('Choose when to send')).toBeInTheDocument()
        })

        expect(
            screen.queryByText('Campaign is not ready to send'),
        ).not.toBeInTheDocument()
    })

    it('calls handleDateChange when a date is picked', async () => {
        const { user } = renderComponent()

        await waitFor(() => {
            expect(screen.getByText('Schedule')).toBeInTheDocument()
        })

        await user.click(screen.getByText('Schedule'))

        await waitFor(() => {
            expect(screen.getByText('Date')).toBeInTheDocument()
        })

        await user.click(screen.getByText('Pick date'))

        await waitFor(() => {
            expect(screen.getByText('Time')).toBeInTheDocument()
        })
    })

    it('calls handleTimeChange when a time is picked', async () => {
        const { user } = renderComponent()

        await waitFor(() => {
            expect(screen.getByText('Schedule')).toBeInTheDocument()
        })

        await user.click(screen.getByText('Schedule'))

        await waitFor(() => {
            expect(screen.getByText('Time')).toBeInTheDocument()
        })

        await user.click(screen.getByText('Pick time'))

        expect(screen.getByText('Time')).toBeInTheDocument()
    })

    it('validates date range via isDateUnavailable prop', async () => {
        const axiom = jest.requireMock('@gorgias/axiom')
        const DateFieldMock = axiom.DateField as jest.Mock

        const { user } = renderComponent()

        await waitFor(() => {
            expect(screen.getByText('Schedule')).toBeInTheDocument()
        })

        await user.click(screen.getByText('Schedule'))

        await waitFor(() => {
            expect(screen.getByText('Date')).toBeInTheDocument()
        })

        const lastCall =
            DateFieldMock.mock.calls[DateFieldMock.mock.calls.length - 1][0]
        const isDateUnavailable = lastCall.isDateUnavailable

        expect(isDateUnavailable).toBeDefined()

        const { today, getLocalTimeZone } = jest.requireActual(
            '@internationalized/date',
        )
        const todayDate = today(getLocalTimeZone())
        expect(isDateUnavailable(todayDate)).toBe(false)
        expect(isDateUnavailable(todayDate.subtract({ days: 1 }))).toBe(true)
        expect(isDateUnavailable(todayDate.add({ days: 31 }))).toBe(true)
        expect(isDateUnavailable(todayDate.add({ days: 15 }))).toBe(false)
    })

    it('does not show banner when included_audience_list_ids is null', async () => {
        mockUseJourneyContext.mockReturnValue({
            ...defaultContextValue,
            journeyData: {
                ...defaultContextValue.journeyData,
                included_audience_list_ids: null,
            },
        } as any)

        renderComponent()

        await waitFor(() => {
            expect(
                screen.getByText('Campaign is not ready to send'),
            ).toBeInTheDocument()
        })
    })

    it('pre-fills "Schedule" when journey has a scheduled_datetime', async () => {
        mockUseJourneyContext.mockReturnValue({
            ...defaultContextValue,
            journeyData: {
                ...defaultContextValue.journeyData,
                campaign: {
                    title: 'Test Campaign',
                    scheduled_datetime: '2026-06-15T14:30:00',
                },
            },
        } as any)

        renderComponent()

        await waitFor(() => {
            expect(screen.getByText('Date')).toBeInTheDocument()
            expect(screen.getByText('Time')).toBeInTheDocument()
        })
    })

    describe('when isV3Architecture is true', () => {
        it('does not render the legacy Card header but still shows the radio options', async () => {
            renderComponent({ isV3Architecture: true })

            await waitFor(() => {
                expect(screen.getByText('Schedule')).toBeInTheDocument()
            })

            expect(
                screen.queryByText('Choose when to send'),
            ).not.toBeInTheDocument()
            expect(screen.getByText('Send now')).toBeInTheDocument()
        })

        it('still renders the Settings link', async () => {
            renderComponent({ isV3Architecture: true })

            await waitFor(() => {
                expect(
                    screen.getByRole('link', { name: 'Settings' }),
                ).toBeInTheDocument()
            })
        })

        it('shows the warning banner with the V2 copy when fields are missing', async () => {
            mockUseJourneyContext.mockReturnValue({
                ...defaultContextValue,
                journeyData: {
                    ...defaultContextValue.journeyData,
                    included_audience_list_ids: [],
                    message_instructions: null,
                },
            } as any)

            renderComponent({ isV3Architecture: true })

            await waitFor(() => {
                expect(
                    screen.getByText('Add an audience in the Setup step'),
                ).toBeInTheDocument()
                expect(
                    screen.getByText(
                        'Add message guidance in the Preview step',
                    ),
                ).toBeInTheDocument()
            })
        })
    })
})
