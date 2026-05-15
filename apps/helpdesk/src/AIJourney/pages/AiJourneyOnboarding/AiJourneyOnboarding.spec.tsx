import {
    CalendarDate,
    getLocalTimeZone,
    Time,
    toZoned,
} from '@internationalized/date'
import { render } from '@repo/testing'
import { act, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Controller, useFormContext } from 'react-hook-form'
import { useHistory } from 'react-router-dom'

import { JourneyStatusEnum } from '@gorgias/convert-client'

import {
    JOURNEY_TYPES,
    STEPS_NAMES,
    UpdatableJourneyCampaignState,
} from 'AIJourney/constants'
import {
    useJourneyCreateHandler,
    useJourneyUpdateHandler,
} from 'AIJourney/hooks'
import type { SetupFormValues } from 'AIJourney/pages/Setup/Setup'
import { useJourneyContext } from 'AIJourney/providers'
import { useCollapsibleColumn } from 'pages/common/hooks/useCollapsibleColumn'

import {
    AiJourneyOnboarding,
    buildScheduledDatetime,
} from './AiJourneyOnboarding'
import type { StepComponentProps } from './AiJourneyOnboarding'

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useHistory: jest.fn(),
}))

jest.mock('AIJourney/providers', () => ({
    useJourneyContext: jest.fn(),
}))

jest.mock('AIJourney/hooks', () => ({
    useJourneyCreateHandler: jest.fn(),
    useJourneyUpdateHandler: jest.fn(),
}))

jest.mock('pages/common/hooks/useCollapsibleColumn', () => ({
    useCollapsibleColumn: jest.fn(),
}))

let capturedOnStepClick: ((stepName: STEPS_NAMES) => void) | undefined

jest.mock('AIJourney/components', () => ({
    ...jest.requireActual('AIJourney/components'),
    OnboardingStepper: ({
        onStepClick,
    }: {
        step: string
        currentStepIndex: number
        onStepClick: (stepName: STEPS_NAMES) => void
    }) => {
        capturedOnStepClick = onStepClick
        return null
    },
}))

const mockPush = jest.fn()
const mockHandleCreate = jest.fn()
const mockHandleUpdate = jest.fn()
const mockSetIsCollapsibleColumnOpen = jest.fn()

const mockUseHistory = useHistory as jest.MockedFunction<typeof useHistory>
const mockUseJourneyContext = useJourneyContext as jest.MockedFunction<
    typeof useJourneyContext
>
const mockUseJourneyCreateHandler =
    useJourneyCreateHandler as jest.MockedFunction<
        typeof useJourneyCreateHandler
    >
const mockUseJourneyUpdateHandler =
    useJourneyUpdateHandler as jest.MockedFunction<
        typeof useJourneyUpdateHandler
    >
const mockUseCollapsibleColumn = useCollapsibleColumn as jest.MockedFunction<
    typeof useCollapsibleColumn
>

const MockStepComponent = ({ journeyType }: StepComponentProps) => {
    const { control } = useFormContext<SetupFormValues>()

    return (
        <Controller
            name="sms_sender_integration_id"
            control={control}
            defaultValue={{ id: 123, label: '+1234567890' }}
            render={() => <div>Step content for {journeyType}</div>}
        />
    )
}

const MockStepComponentWithoutPhone = ({ journeyType }: StepComponentProps) => (
    <div>Step content for {journeyType}</div>
)

const MockImmediateScheduleStep = ({ journeyType }: StepComponentProps) => {
    const { setValue } = useFormContext<SetupFormValues>()
    return (
        <div>
            <div>Step content for {journeyType}</div>
            <button
                type="button"
                onClick={() => setValue('scheduleType', 'immediate')}
            >
                Switch to immediate
            </button>
        </div>
    )
}

const MockLaterScheduleStep = ({ journeyType }: StepComponentProps) => {
    const { setValue } = useFormContext<SetupFormValues>()
    return (
        <div>
            <div>Step content for {journeyType}</div>
            <button
                type="button"
                onClick={() => {
                    setValue(
                        'scheduledDate',
                        toZoned(
                            new CalendarDate(2030, 1, 15),
                            getLocalTimeZone(),
                        ),
                    )
                    setValue('scheduledTime', new Time(10, 0, 0, 0))
                }}
            >
                Fill date and time
            </button>
        </div>
    )
}

const defaultContextValue = {
    currentIntegration: { id: 1, name: 'test-shop' },
    journeyData: undefined,
    shopName: 'test-shop',
    journeys: [],
    campaigns: [],
    currency: 'USD',
    isLoading: false,
    isLoadingJourneys: false,
    isLoadingJourneyData: false,
    isErrorJourneyData: false,
    isLoadingIntegrations: false,
    journeyType: JOURNEY_TYPES.CART_ABANDONMENT,
    storeConfiguration: undefined,
}

const renderComponent = (
    props: Partial<{
        journeyType: JOURNEY_TYPES
        step: string
        stepComponent: React.ComponentType<StepComponentProps>
    }> = {},
) => {
    const user = userEvent.setup()

    const defaultProps = {
        journeyType: JOURNEY_TYPES.CART_ABANDONMENT,
        step: STEPS_NAMES.SETUP,
        stepComponent: MockStepComponent,
    }

    const result = render(<AiJourneyOnboarding {...defaultProps} {...props} />)

    return { ...result, user }
}

describe('<AiJourneyOnboarding />', () => {
    beforeEach(() => {
        mockPush.mockReset()
        mockHandleCreate.mockReset()
        mockHandleUpdate.mockReset()
        mockSetIsCollapsibleColumnOpen.mockReset()

        mockUseHistory.mockReturnValue({ push: mockPush } as any)
        mockUseJourneyContext.mockReturnValue(defaultContextValue as any)
        mockUseJourneyCreateHandler.mockReturnValue({
            handleCreate: mockHandleCreate.mockResolvedValue({
                id: 'new-journey-id',
            }),
            isLoading: false,
            isSuccess: false,
        })
        mockUseJourneyUpdateHandler.mockReturnValue({
            handleUpdate: mockHandleUpdate.mockResolvedValue(undefined),
            isLoading: false,
            isSuccess: false,
        })
        mockUseCollapsibleColumn.mockReturnValue({
            setIsCollapsibleColumnOpen: mockSetIsCollapsibleColumnOpen,
        } as any)
    })

    afterEach(() => {
        jest.clearAllMocks()
    })

    describe('title mapping', () => {
        it.each([
            [JOURNEY_TYPES.WELCOME, 'Welcome flow'],
            [JOURNEY_TYPES.POST_PURCHASE, 'Post-purchase flow'],
            [JOURNEY_TYPES.CART_ABANDONMENT, 'SMS cart abandoned flow'],
            [JOURNEY_TYPES.SESSION_ABANDONMENT, 'SMS browse abandoned flow'],
            [JOURNEY_TYPES.WIN_BACK, 'Customer win-back flow'],
        ])(
            'renders correct title for %s journey type',
            (journeyType, expectedTitle) => {
                renderComponent({ journeyType })

                expect(screen.getByText(expectedTitle)).toBeInTheDocument()
            },
        )

        it('renders campaign title from journey data when available', () => {
            mockUseJourneyContext.mockReturnValue({
                ...defaultContextValue,
                journeyData: {
                    id: 'journey-123',
                    campaign: { title: 'Summer Sale' },
                },
            } as any)

            renderComponent({ journeyType: JOURNEY_TYPES.CAMPAIGN })

            expect(screen.getByText('Summer Sale')).toBeInTheDocument()
        })

        it('renders default campaign title when no journey data', () => {
            renderComponent({ journeyType: JOURNEY_TYPES.CAMPAIGN })

            expect(screen.getByText('Create new campaign')).toBeInTheDocument()
        })
    })

    describe('step component rendering', () => {
        it('renders the step component with the correct journey type', () => {
            renderComponent({ journeyType: JOURNEY_TYPES.WELCOME })

            expect(
                screen.getByText(`Step content for ${JOURNEY_TYPES.WELCOME}`),
            ).toBeInTheDocument()
        })
    })

    describe('cancel button', () => {
        it('navigates to flows page for non-campaign journey types', async () => {
            const { user } = renderComponent({
                journeyType: JOURNEY_TYPES.CART_ABANDONMENT,
            })
            await act(
                async () =>
                    await user.click(
                        screen.getByRole('button', { name: /cancel/i }),
                    ),
            )

            expect(mockPush).toHaveBeenCalledWith(
                '/app/ai-journey/test-shop/flows',
            )
        })

        it('navigates to campaigns page for campaign journey type', async () => {
            const { user } = renderComponent({
                journeyType: JOURNEY_TYPES.CAMPAIGN,
            })
            await act(
                async () =>
                    await user.click(
                        screen.getByRole('button', { name: /cancel/i }),
                    ),
            )
            expect(mockPush).toHaveBeenCalledWith(
                '/app/ai-journey/test-shop/campaigns',
            )
        })
    })

    describe('continue button disabled state', () => {
        it('disables the continue button when create is loading', () => {
            mockUseJourneyCreateHandler.mockReturnValue({
                handleCreate: mockHandleCreate,
                isLoading: true,
                isSuccess: false,
            })

            renderComponent()

            expect(
                screen.getByRole('button', { name: /continue/i }),
            ).toBeDisabled()
        })

        it('disables the continue button when update is loading', () => {
            mockUseJourneyUpdateHandler.mockReturnValue({
                handleUpdate: mockHandleUpdate,
                isLoading: true,
                isSuccess: false,
            })

            renderComponent()

            expect(
                screen.getByRole('button', { name: /continue/i }),
            ).toBeDisabled()
        })

        it('enables the continue button when neither create nor update is loading', () => {
            renderComponent()

            expect(
                screen.getByRole('button', { name: /continue/i }),
            ).not.toBeDisabled()
        })
    })

    describe('primary button label', () => {
        it('shows "Continue" on setup step', () => {
            renderComponent({ step: STEPS_NAMES.SETUP })

            expect(
                screen.getByRole('button', { name: 'Continue' }),
            ).toBeInTheDocument()
        })

        it('shows "Continue" on preview step', () => {
            renderComponent({ step: STEPS_NAMES.PREVIEW })

            expect(
                screen.getByRole('button', { name: 'Continue' }),
            ).toBeInTheDocument()
        })

        it('shows "Activate flow" on activate step for a non-campaign journey', () => {
            renderComponent({
                step: STEPS_NAMES.ACTIVATE,
                journeyType: JOURNEY_TYPES.CART_ABANDONMENT,
            })

            expect(
                screen.getByRole('button', { name: 'Activate flow' }),
            ).toBeInTheDocument()
        })

        it('shows "Continue" on activate step for a campaign journey', () => {
            renderComponent({
                step: STEPS_NAMES.ACTIVATE,
                journeyType: JOURNEY_TYPES.CAMPAIGN,
            })

            expect(
                screen.getByRole('button', { name: 'Continue' }),
            ).toBeInTheDocument()
        })
    })

    describe('secondary button label', () => {
        it('shows "Cancel" on setup step', () => {
            renderComponent({ step: STEPS_NAMES.SETUP })

            expect(
                screen.getByRole('button', { name: 'Cancel' }),
            ).toBeInTheDocument()
        })

        it('shows "Back" on preview step', () => {
            renderComponent({ step: STEPS_NAMES.PREVIEW })

            expect(
                screen.getByRole('button', { name: 'Back' }),
            ).toBeInTheDocument()
        })

        it('shows "Back" on activate step', () => {
            renderComponent({ step: STEPS_NAMES.ACTIVATE })

            expect(
                screen.getByRole('button', { name: 'Back' }),
            ).toBeInTheDocument()
        })
    })

    describe('default form values for win-back journey', () => {
        it('passes cooldown_days and inactive_days defaults when creating a win-back journey', async () => {
            mockHandleCreate.mockResolvedValue({ id: 'new-journey-id' })

            const { user } = renderComponent({
                journeyType: JOURNEY_TYPES.WIN_BACK,
            })

            await act(
                async () =>
                    await user.click(
                        screen.getByRole('button', { name: /continue/i }),
                    ),
            )

            await waitFor(() => {
                expect(mockHandleCreate).toHaveBeenCalledWith(
                    expect.objectContaining({
                        cooldownDays: 30,
                        inactiveDays: 30,
                    }),
                )
            })
        })

        it('sends inactiveDays from inactive_days field, not wait_time_minutes, on create', async () => {
            mockHandleCreate.mockResolvedValue({ id: 'new-journey-id' })

            const { user } = renderComponent({
                journeyType: JOURNEY_TYPES.WIN_BACK,
            })

            await act(
                async () =>
                    await user.click(
                        screen.getByRole('button', { name: /continue/i }),
                    ),
            )

            await waitFor(() => {
                expect(mockHandleCreate).toHaveBeenCalledWith(
                    expect.objectContaining({
                        inactiveDays: 30,
                        waitTimeMinutes: undefined,
                    }),
                )
            })
        })

        it('sends inactiveDays from inactive_days field, not wait_time_minutes, on update', async () => {
            mockUseJourneyContext.mockReturnValue({
                ...defaultContextValue,
                journeyData: { id: 'existing-journey-id', campaign: null },
            } as any)
            mockHandleUpdate.mockResolvedValue(undefined)

            const { user } = renderComponent({
                journeyType: JOURNEY_TYPES.WIN_BACK,
            })

            await act(
                async () =>
                    await user.click(
                        screen.getByRole('button', { name: /continue/i }),
                    ),
            )

            await waitFor(() => {
                expect(mockHandleUpdate).toHaveBeenCalledWith(
                    expect.objectContaining({
                        inactiveDays: 30,
                        waitTimeMinutes: undefined,
                    }),
                )
            })
        })

        it('does not pass cooldown_days and inactive_days defaults for non-win-back journeys', async () => {
            mockHandleCreate.mockResolvedValue({ id: 'new-journey-id' })

            const { user } = renderComponent({
                journeyType: JOURNEY_TYPES.CART_ABANDONMENT,
            })

            await act(
                async () =>
                    await user.click(
                        screen.getByRole('button', { name: /continue/i }),
                    ),
            )

            await waitFor(() => {
                expect(mockHandleCreate).toHaveBeenCalledWith(
                    expect.objectContaining({
                        cooldownDays: undefined,
                    }),
                )
            })
        })
    })

    describe('form submission - create path', () => {
        it('calls handleCreate when no journey id exists', async () => {
            mockHandleCreate.mockResolvedValue({ id: 'new-journey-id' })

            const { user } = renderComponent({
                journeyType: JOURNEY_TYPES.CART_ABANDONMENT,
            })

            await act(
                async () =>
                    await user.click(
                        screen.getByRole('button', { name: /continue/i }),
                    ),
            )

            await waitFor(() => {
                expect(mockHandleCreate).toHaveBeenCalled()
            })
        })

        it('navigates to preview step with new journey id after creation', async () => {
            mockHandleCreate.mockResolvedValue({ id: 'new-journey-id' })

            const { user } = renderComponent({
                journeyType: JOURNEY_TYPES.CART_ABANDONMENT,
            })

            await act(
                async () =>
                    await user.click(
                        screen.getByRole('button', { name: /continue/i }),
                    ),
            )

            await waitFor(() => {
                expect(mockPush).toHaveBeenCalledWith(
                    '/app/ai-journey/test-shop/cart-abandoned/preview/new-journey-id',
                )
            })
        })

        it('passes correct form data to handleCreate', async () => {
            mockHandleCreate.mockResolvedValue({ id: 'new-journey-id' })

            const { user } = renderComponent({
                journeyType: JOURNEY_TYPES.CART_ABANDONMENT,
            })

            await act(
                async () =>
                    await user.click(
                        screen.getByRole('button', { name: /continue/i }),
                    ),
            )

            await waitFor(() => {
                expect(mockHandleCreate).toHaveBeenCalledWith(
                    expect.objectContaining({
                        phoneNumberIntegrationId: 123,
                        phoneNumber: '+1234567890',
                        followUpValue: 0,
                        includeImage: false,
                    }),
                )
            })
        })
    })

    describe('form submission - update path', () => {
        it('calls handleUpdate when journey data with id exists', async () => {
            mockUseJourneyContext.mockReturnValue({
                ...defaultContextValue,
                journeyData: { id: 'existing-journey-id', campaign: null },
            } as any)
            mockHandleUpdate.mockResolvedValue(undefined)

            const { user } = renderComponent({
                journeyType: JOURNEY_TYPES.CART_ABANDONMENT,
            })

            await act(
                async () =>
                    await user.click(
                        screen.getByRole('button', { name: /continue/i }),
                    ),
            )

            await waitFor(() => {
                expect(mockHandleUpdate).toHaveBeenCalled()
            })
        })

        it('navigates to preview step with existing journey id after update', async () => {
            mockUseJourneyContext.mockReturnValue({
                ...defaultContextValue,
                journeyData: { id: 'existing-journey-id', campaign: null },
            } as any)
            mockHandleUpdate.mockResolvedValue(undefined)

            const { user } = renderComponent({
                journeyType: JOURNEY_TYPES.CART_ABANDONMENT,
            })

            await act(
                async () =>
                    await user.click(
                        screen.getByRole('button', { name: /continue/i }),
                    ),
            )

            await waitFor(() => {
                expect(mockPush).toHaveBeenCalledWith(
                    '/app/ai-journey/test-shop/cart-abandoned/preview/existing-journey-id',
                )
            })
        })

        it('passes correct form data to handleUpdate', async () => {
            mockUseJourneyContext.mockReturnValue({
                ...defaultContextValue,
                journeyData: { id: 'existing-journey-id', campaign: null },
            } as any)
            mockHandleUpdate.mockResolvedValue(undefined)

            const { user } = renderComponent({
                journeyType: JOURNEY_TYPES.CART_ABANDONMENT,
            })

            await act(
                async () =>
                    await user.click(
                        screen.getByRole('button', { name: /continue/i }),
                    ),
            )

            await waitFor(() => {
                expect(mockHandleUpdate).toHaveBeenCalledWith(
                    expect.objectContaining({
                        phoneNumberIntegrationId: 123,
                        phoneNumber: '+1234567890',
                        followUpValue: 0,
                        includeImage: false,
                    }),
                )
            })
        })

        it('does not call handleCreate when journey id exists', async () => {
            mockUseJourneyContext.mockReturnValue({
                ...defaultContextValue,
                journeyData: { id: 'existing-journey-id', campaign: null },
            } as any)
            mockHandleUpdate.mockResolvedValue(undefined)

            const { user } = renderComponent({
                journeyType: JOURNEY_TYPES.CART_ABANDONMENT,
            })

            await act(
                async () =>
                    await user.click(
                        screen.getByRole('button', { name: /continue/i }),
                    ),
            )

            await waitFor(() => {
                expect(mockHandleUpdate).toHaveBeenCalled()
            })
            expect(mockHandleCreate).not.toHaveBeenCalled()
        })
    })

    describe('form submission - preview step', () => {
        it('calls setIsCollapsibleColumnOpen(false) when submitting from preview step', async () => {
            mockUseJourneyContext.mockReturnValue({
                ...defaultContextValue,
                journeyData: { id: 'journey-123', campaign: null },
            } as any)

            const { user } = renderComponent({
                step: STEPS_NAMES.PREVIEW,
                journeyType: JOURNEY_TYPES.CART_ABANDONMENT,
            })

            await act(
                async () =>
                    await user.click(
                        screen.getByRole('button', { name: /continue/i }),
                    ),
            )

            await waitFor(() => {
                expect(mockSetIsCollapsibleColumnOpen).toHaveBeenCalledWith(
                    false,
                )
            })
        })

        it('calls handleUpdate with only journeyMessageInstructions on preview step', async () => {
            mockUseJourneyContext.mockReturnValue({
                ...defaultContextValue,
                journeyData: { id: 'journey-123', campaign: null },
            } as any)

            const { user } = renderComponent({
                step: STEPS_NAMES.PREVIEW,
                journeyType: JOURNEY_TYPES.CART_ABANDONMENT,
            })

            await act(
                async () =>
                    await user.click(
                        screen.getByRole('button', { name: /continue/i }),
                    ),
            )

            await waitFor(() => {
                expect(mockHandleUpdate).toHaveBeenCalledWith({
                    journeyMessageInstructions: '',
                    journeyVariants: [],
                })
            })
        })

        it('navigates to activate step after submitting from preview step', async () => {
            mockUseJourneyContext.mockReturnValue({
                ...defaultContextValue,
                journeyData: { id: 'journey-123', campaign: null },
            } as any)

            const { user } = renderComponent({
                step: STEPS_NAMES.PREVIEW,
                journeyType: JOURNEY_TYPES.CART_ABANDONMENT,
            })

            await act(
                async () =>
                    await user.click(
                        screen.getByRole('button', { name: /continue/i }),
                    ),
            )

            await waitFor(() => {
                expect(mockPush).toHaveBeenCalledWith(
                    '/app/ai-journey/test-shop/cart-abandoned/activate/journey-123',
                )
            })
        })

        it('does not call handleCreate on preview step', async () => {
            mockUseJourneyContext.mockReturnValue({
                ...defaultContextValue,
                journeyData: { id: 'journey-123', campaign: null },
            } as any)

            const { user } = renderComponent({
                step: STEPS_NAMES.PREVIEW,
                journeyType: JOURNEY_TYPES.CART_ABANDONMENT,
            })

            await act(
                async () =>
                    await user.click(
                        screen.getByRole('button', { name: /continue/i }),
                    ),
            )

            await waitFor(() => {
                expect(mockHandleUpdate).toHaveBeenCalled()
            })
            expect(mockHandleCreate).not.toHaveBeenCalled()
        })
    })

    describe('form submission - activate step', () => {
        it('calls handleUpdate with journeyState Active for a flow', async () => {
            mockUseJourneyContext.mockReturnValue({
                ...defaultContextValue,
                journeyData: { id: 'journey-123', campaign: null },
            } as any)

            const { user } = renderComponent({
                step: STEPS_NAMES.ACTIVATE,
                journeyType: JOURNEY_TYPES.CART_ABANDONMENT,
            })

            await act(
                async () =>
                    await user.click(
                        screen.getByRole('button', { name: /activate flow/i }),
                    ),
            )

            await waitFor(() => {
                expect(mockHandleUpdate).toHaveBeenCalledWith({
                    journeyState: JourneyStatusEnum.Active,
                })
            })
        })

        it('navigates to schedule step for a campaign', async () => {
            mockUseJourneyContext.mockReturnValue({
                ...defaultContextValue,
                journeyData: {
                    id: 'journey-123',
                    campaign: { title: 'Summer Sale' },
                },
            } as any)

            const { user } = renderComponent({
                step: STEPS_NAMES.ACTIVATE,
                journeyType: JOURNEY_TYPES.CAMPAIGN,
            })

            await act(
                async () =>
                    await user.click(
                        screen.getByRole('button', {
                            name: /continue/i,
                        }),
                    ),
            )

            await waitFor(() => {
                expect(mockPush).toHaveBeenCalledWith(
                    '/app/ai-journey/test-shop/campaign/schedule/journey-123',
                )
            })
        })

        it('navigates to flows page after activating a flow', async () => {
            mockUseJourneyContext.mockReturnValue({
                ...defaultContextValue,
                journeyData: { id: 'journey-123', campaign: null },
            } as any)

            const { user } = renderComponent({
                step: STEPS_NAMES.ACTIVATE,
                journeyType: JOURNEY_TYPES.CART_ABANDONMENT,
            })

            await act(
                async () =>
                    await user.click(
                        screen.getByRole('button', { name: /activate flow/i }),
                    ),
            )

            await waitFor(() => {
                expect(mockPush).toHaveBeenCalledWith(
                    '/app/ai-journey/test-shop/flows',
                )
            })
        })

        it('navigates to schedule step after activating a campaign', async () => {
            mockUseJourneyContext.mockReturnValue({
                ...defaultContextValue,
                journeyData: {
                    id: 'journey-123',
                    campaign: { title: 'Summer Sale' },
                },
            } as any)

            const { user } = renderComponent({
                step: STEPS_NAMES.ACTIVATE,
                journeyType: JOURNEY_TYPES.CAMPAIGN,
            })

            await act(
                async () =>
                    await user.click(
                        screen.getByRole('button', {
                            name: /continue/i,
                        }),
                    ),
            )

            await waitFor(() => {
                expect(mockPush).toHaveBeenCalledWith(
                    '/app/ai-journey/test-shop/campaign/schedule/journey-123',
                )
            })
        })
    })

    describe('return button navigation', () => {
        it('navigates to previous step when journeyId exists on preview step', async () => {
            mockUseJourneyContext.mockReturnValue({
                ...defaultContextValue,
                journeyData: { id: 'journey-123', campaign: null },
            } as any)

            const { user } = renderComponent({
                step: STEPS_NAMES.PREVIEW,
                journeyType: JOURNEY_TYPES.CART_ABANDONMENT,
            })

            await act(
                async () =>
                    await user.click(
                        screen.getByRole('button', { name: /back/i }),
                    ),
            )

            expect(mockPush).toHaveBeenCalledWith(
                '/app/ai-journey/test-shop/cart-abandoned/setup/journey-123',
            )
        })

        it('navigates to previous step when journeyId exists on activate step', async () => {
            mockUseJourneyContext.mockReturnValue({
                ...defaultContextValue,
                journeyData: { id: 'journey-123', campaign: null },
            } as any)

            const { user } = renderComponent({
                step: STEPS_NAMES.ACTIVATE,
                journeyType: JOURNEY_TYPES.CART_ABANDONMENT,
            })

            await act(
                async () =>
                    await user.click(
                        screen.getByRole('button', { name: /back/i }),
                    ),
            )

            expect(mockPush).toHaveBeenCalledWith(
                '/app/ai-journey/test-shop/cart-abandoned/preview/journey-123',
            )
        })

        it('calls setIsCollapsibleColumnOpen(false) when clicking return on preview step', async () => {
            mockUseJourneyContext.mockReturnValue({
                ...defaultContextValue,
                journeyData: { id: 'journey-123', campaign: null },
            } as any)

            const { user } = renderComponent({
                step: STEPS_NAMES.PREVIEW,
                journeyType: JOURNEY_TYPES.CART_ABANDONMENT,
            })

            await act(
                async () =>
                    await user.click(
                        screen.getByRole('button', { name: /back/i }),
                    ),
            )

            expect(mockSetIsCollapsibleColumnOpen).toHaveBeenCalledWith(false)
        })

        it('navigates to flows page when no journeyId on preview step', async () => {
            const { user } = renderComponent({
                step: STEPS_NAMES.PREVIEW,
                journeyType: JOURNEY_TYPES.CART_ABANDONMENT,
            })

            await act(
                async () =>
                    await user.click(
                        screen.getByRole('button', { name: /back/i }),
                    ),
            )

            expect(mockPush).toHaveBeenCalledWith(
                '/app/ai-journey/test-shop/flows',
            )
        })
    })

    describe('handleStepClick', () => {
        it('navigates to the clicked step when journeyData has an id', () => {
            mockUseJourneyContext.mockReturnValue({
                ...defaultContextValue,
                journeyData: { id: 'journey-123', campaign: null },
            } as any)

            renderComponent({
                step: STEPS_NAMES.PREVIEW,
                journeyType: JOURNEY_TYPES.CART_ABANDONMENT,
            })

            capturedOnStepClick!(STEPS_NAMES.SETUP)

            expect(mockPush).toHaveBeenCalledWith(
                '/app/ai-journey/test-shop/cart-abandoned/setup/journey-123',
            )
        })

        it('does not navigate when journeyData has no id', () => {
            renderComponent({
                step: STEPS_NAMES.PREVIEW,
                journeyType: JOURNEY_TYPES.CART_ABANDONMENT,
            })

            capturedOnStepClick!(STEPS_NAMES.SETUP)

            expect(mockPush).not.toHaveBeenCalled()
        })
    })

    describe('form submission - schedule step', () => {
        beforeEach(() => {
            mockUseJourneyContext.mockReturnValue({
                ...defaultContextValue,
                journeyData: {
                    id: 'journey-123',
                    campaign: { title: 'Test Campaign', state: 'draft' },
                    included_audience_list_ids: ['list-1'],
                    message_instructions: 'Some guidance',
                },
            } as any)
        })

        it('shows "Schedule" and "Save as draft" buttons on schedule step for a new campaign', () => {
            renderComponent({
                step: STEPS_NAMES.SCHEDULE,
                journeyType: JOURNEY_TYPES.CAMPAIGN,
            })

            expect(
                screen.getByRole('button', { name: 'Schedule' }),
            ).toBeInTheDocument()
            expect(
                screen.getByRole('button', { name: 'Save as draft' }),
            ).toBeInTheDocument()
        })

        it('shows "Save changes" and "Revert to draft" buttons on schedule step for a scheduled campaign', () => {
            mockUseJourneyContext.mockReturnValue({
                ...defaultContextValue,
                journeyData: {
                    id: 'journey-123',
                    campaign: {
                        title: 'Test Campaign',
                        state: 'scheduled',
                    },
                    included_audience_list_ids: ['list-1'],
                    message_instructions: 'Some guidance',
                },
            } as any)

            renderComponent({
                step: STEPS_NAMES.SCHEDULE,
                journeyType: JOURNEY_TYPES.CAMPAIGN,
            })

            expect(
                screen.getByRole('button', { name: 'Save changes' }),
            ).toBeInTheDocument()
            expect(
                screen.getByRole('button', { name: 'Revert to draft' }),
            ).toBeInTheDocument()
        })

        it('opens confirmation modal when submitting with immediate schedule type', async () => {
            const { user } = renderComponent({
                step: STEPS_NAMES.SCHEDULE,
                journeyType: JOURNEY_TYPES.CAMPAIGN,
                stepComponent: MockImmediateScheduleStep,
            })

            await act(
                async () =>
                    await user.click(
                        screen.getByRole('button', {
                            name: 'Switch to immediate',
                        }),
                    ),
            )

            await act(
                async () =>
                    await user.click(
                        screen.getByRole('button', { name: 'Send' }),
                    ),
            )

            await waitFor(() => {
                expect(
                    screen.getByText('Send campaign now?'),
                ).toBeInTheDocument()
            })
        })

        it('sends campaign immediately when confirming send now modal', async () => {
            const { user } = renderComponent({
                step: STEPS_NAMES.SCHEDULE,
                journeyType: JOURNEY_TYPES.CAMPAIGN,
                stepComponent: MockImmediateScheduleStep,
            })

            await act(
                async () =>
                    await user.click(
                        screen.getByRole('button', {
                            name: 'Switch to immediate',
                        }),
                    ),
            )

            await act(
                async () =>
                    await user.click(
                        screen.getByRole('button', { name: 'Send' }),
                    ),
            )

            await waitFor(() => {
                expect(
                    screen.getByText('Send campaign now?'),
                ).toBeInTheDocument()
            })

            await act(
                async () =>
                    await user.click(
                        screen.getByRole('button', { name: 'Send now' }),
                    ),
            )

            await waitFor(() => {
                expect(mockHandleUpdate).toHaveBeenCalledWith({
                    campaignState: UpdatableJourneyCampaignState.Scheduled,
                    scheduledDatetime: null,
                })
            })

            expect(mockPush).toHaveBeenCalledWith(
                '/app/ai-journey/test-shop/campaigns',
            )
        })

        it('closes modal when clicking Go back in send now confirmation', async () => {
            const { user } = renderComponent({
                step: STEPS_NAMES.SCHEDULE,
                journeyType: JOURNEY_TYPES.CAMPAIGN,
                stepComponent: MockImmediateScheduleStep,
            })

            await act(
                async () =>
                    await user.click(
                        screen.getByRole('button', {
                            name: 'Switch to immediate',
                        }),
                    ),
            )

            await act(
                async () =>
                    await user.click(
                        screen.getByRole('button', { name: 'Send' }),
                    ),
            )

            await waitFor(() => {
                expect(
                    screen.getByText('Send campaign now?'),
                ).toBeInTheDocument()
            })

            await act(
                async () =>
                    await user.click(
                        screen.getByRole('button', { name: 'Go back' }),
                    ),
            )

            await waitFor(() => {
                expect(
                    screen.queryByText('Send campaign now?'),
                ).not.toBeInTheDocument()
            })
        })

        it('saves as draft and navigates to campaigns list when clicking Save as draft', async () => {
            const { user } = renderComponent({
                step: STEPS_NAMES.SCHEDULE,
                journeyType: JOURNEY_TYPES.CAMPAIGN,
            })

            await act(
                async () =>
                    await user.click(
                        screen.getByRole('button', {
                            name: 'Save as draft',
                        }),
                    ),
            )

            await waitFor(() => {
                expect(mockHandleUpdate).toHaveBeenCalledWith({
                    scheduledDatetime: null,
                })
            })

            expect(mockPush).toHaveBeenCalledWith(
                '/app/ai-journey/test-shop/campaigns',
            )
        })

        it('moves scheduled campaign to draft when clicking Revert to draft', async () => {
            mockUseJourneyContext.mockReturnValue({
                ...defaultContextValue,
                journeyData: {
                    id: 'journey-123',
                    campaign: {
                        title: 'Test Campaign',
                        state: 'scheduled',
                    },
                    included_audience_list_ids: ['list-1'],
                    message_instructions: 'Some guidance',
                },
            } as any)

            const { user } = renderComponent({
                step: STEPS_NAMES.SCHEDULE,
                journeyType: JOURNEY_TYPES.CAMPAIGN,
            })

            await act(
                async () =>
                    await user.click(
                        screen.getByRole('button', {
                            name: 'Revert to draft',
                        }),
                    ),
            )

            await waitFor(() => {
                expect(mockHandleUpdate).toHaveBeenCalledWith({
                    campaignState: UpdatableJourneyCampaignState.Draft,
                })
            })

            expect(mockPush).toHaveBeenCalledWith(
                '/app/ai-journey/test-shop/campaigns',
            )
        })

        it('disables continue button when campaign is read-only (canceled)', () => {
            mockUseJourneyContext.mockReturnValue({
                ...defaultContextValue,
                journeyData: {
                    id: 'journey-123',
                    campaign: {
                        title: 'Test Campaign',
                        state: 'canceled',
                    },
                    included_audience_list_ids: ['list-1'],
                    message_instructions: 'Some guidance',
                },
            } as any)

            renderComponent({
                step: STEPS_NAMES.SCHEDULE,
                journeyType: JOURNEY_TYPES.CAMPAIGN,
            })

            expect(
                screen.getByRole('button', { name: 'Schedule' }),
            ).toBeDisabled()
        })

        it('disables continue button on schedule step when audience is missing', () => {
            mockUseJourneyContext.mockReturnValue({
                ...defaultContextValue,
                journeyData: {
                    id: 'journey-123',
                    campaign: {
                        title: 'Test Campaign',
                        state: 'draft',
                    },
                    included_audience_list_ids: [],
                    message_instructions: 'Some guidance',
                },
            } as any)

            renderComponent({
                step: STEPS_NAMES.SCHEDULE,
                journeyType: JOURNEY_TYPES.CAMPAIGN,
            })

            expect(
                screen.getByRole('button', { name: 'Schedule' }),
            ).toBeDisabled()
        })

        it('shows "Schedule" button label when scheduleType is later', () => {
            renderComponent({
                step: STEPS_NAMES.SCHEDULE,
                journeyType: JOURNEY_TYPES.CAMPAIGN,
            })

            expect(
                screen.getByRole('button', { name: 'Schedule' }),
            ).toBeInTheDocument()
        })

        it('enables Schedule button and submits with datetime when date and time are filled', async () => {
            const { user } = renderComponent({
                step: STEPS_NAMES.SCHEDULE,
                journeyType: JOURNEY_TYPES.CAMPAIGN,
                stepComponent: MockLaterScheduleStep,
            })

            await act(
                async () =>
                    await user.click(
                        screen.getByRole('button', {
                            name: 'Fill date and time',
                        }),
                    ),
            )

            const scheduleButton = screen.getByRole('button', {
                name: 'Schedule',
            })
            expect(scheduleButton).not.toBeDisabled()

            await act(async () => await user.click(scheduleButton))

            await waitFor(() => {
                expect(mockHandleUpdate).toHaveBeenCalledWith(
                    expect.objectContaining({
                        campaignState: UpdatableJourneyCampaignState.Scheduled,
                        scheduledDatetime: expect.stringContaining(
                            '2030-01-15T10:00:00',
                        ),
                    }),
                )
            })
        })

        it('preserves scheduled_datetime when moving scheduled campaign to draft after editing time', async () => {
            mockUseJourneyContext.mockReturnValue({
                ...defaultContextValue,
                journeyData: {
                    id: 'journey-123',
                    campaign: {
                        title: 'Test Campaign',
                        state: 'scheduled',
                    },
                    included_audience_list_ids: ['list-1'],
                    message_instructions: 'Some guidance',
                },
            } as any)

            const { user } = renderComponent({
                step: STEPS_NAMES.SCHEDULE,
                journeyType: JOURNEY_TYPES.CAMPAIGN,
                stepComponent: MockLaterScheduleStep,
            })

            await act(
                async () =>
                    await user.click(
                        screen.getByRole('button', {
                            name: 'Fill date and time',
                        }),
                    ),
            )

            await act(
                async () =>
                    await user.click(
                        screen.getByRole('button', {
                            name: 'Revert to draft',
                        }),
                    ),
            )

            await waitFor(() => {
                expect(mockHandleUpdate).toHaveBeenCalledWith(
                    expect.objectContaining({
                        campaignState: UpdatableJourneyCampaignState.Draft,
                        scheduledDatetime: expect.stringContaining(
                            '2030-01-15T10:00:00',
                        ),
                    }),
                )
            })
        })

        it('disables continue button on schedule step when message instructions are missing', () => {
            mockUseJourneyContext.mockReturnValue({
                ...defaultContextValue,
                journeyData: {
                    id: 'journey-123',
                    campaign: {
                        title: 'Test Campaign',
                        state: 'draft',
                    },
                    included_audience_list_ids: ['list-1'],
                    message_instructions: null,
                },
            } as any)

            renderComponent({
                step: STEPS_NAMES.SCHEDULE,
                journeyType: JOURNEY_TYPES.CAMPAIGN,
            })

            expect(
                screen.getByRole('button', { name: 'Schedule' }),
            ).toBeDisabled()
        })
    })

    describe('form submission - phone number fields optional', () => {
        it('submits with undefined phone params on create when sms_sender_integration_id is not set', async () => {
            const { user } = renderComponent({
                journeyType: JOURNEY_TYPES.CART_ABANDONMENT,
                stepComponent: MockStepComponentWithoutPhone,
            })

            await act(
                async () =>
                    await user.click(
                        screen.getByRole('button', { name: /continue/i }),
                    ),
            )

            await waitFor(() => {
                expect(mockHandleCreate).toHaveBeenCalledWith(
                    expect.objectContaining({
                        phoneNumberIntegrationId: undefined,
                        phoneNumber: undefined,
                    }),
                )
            })
        })

        it('submits with undefined phone params on update when sms_sender_integration_id is not set', async () => {
            mockUseJourneyContext.mockReturnValue({
                ...defaultContextValue,
                journeyData: { id: 'existing-journey-id', campaign: null },
            } as any)

            const { user } = renderComponent({
                journeyType: JOURNEY_TYPES.CART_ABANDONMENT,
                stepComponent: MockStepComponentWithoutPhone,
            })

            await act(
                async () =>
                    await user.click(
                        screen.getByRole('button', { name: /continue/i }),
                    ),
            )

            await waitFor(() => {
                expect(mockHandleUpdate).toHaveBeenCalledWith(
                    expect.objectContaining({
                        phoneNumberIntegrationId: undefined,
                        phoneNumber: undefined,
                    }),
                )
            })
        })
    })

    describe('execution mode override propagation', () => {
        const MockStepComponentWithExecutionMode = ({
            journeyType,
        }: StepComponentProps) => {
            const { control } = useFormContext<SetupFormValues>()
            return (
                <>
                    <Controller
                        name="sms_sender_integration_id"
                        control={control}
                        defaultValue={{ id: 123, label: '+1234567890' }}
                        render={() => <div>Step content for {journeyType}</div>}
                    />
                    <Controller
                        name="execution_mode_override"
                        control={control}
                        defaultValue={'convert-only'}
                        render={() => <></>}
                    />
                </>
            )
        }

        afterEach(() => {
            delete (window as any).USER_IMPERSONATED
        })

        it('forwards executionModeOverride to handleCreate when the user is impersonated', async () => {
            ;(window as any).USER_IMPERSONATED = true
            mockHandleCreate.mockResolvedValue({ id: 'new-journey-id' })

            const { user } = renderComponent({
                journeyType: JOURNEY_TYPES.CART_ABANDONMENT,
                stepComponent: MockStepComponentWithExecutionMode,
            })

            await act(
                async () =>
                    await user.click(
                        screen.getByRole('button', { name: /continue/i }),
                    ),
            )

            await waitFor(() => {
                expect(mockHandleCreate).toHaveBeenCalledWith(
                    expect.objectContaining({
                        executionModeOverride: 'convert-only',
                    }),
                )
            })
        })

        it('forwards executionModeOverride to handleUpdate when the user is impersonated', async () => {
            ;(window as any).USER_IMPERSONATED = true
            mockUseJourneyContext.mockReturnValue({
                ...defaultContextValue,
                journeyData: { id: 'existing-journey-id', campaign: null },
            } as any)
            mockHandleUpdate.mockResolvedValue(undefined)

            const { user } = renderComponent({
                journeyType: JOURNEY_TYPES.CART_ABANDONMENT,
                stepComponent: MockStepComponentWithExecutionMode,
            })

            await act(
                async () =>
                    await user.click(
                        screen.getByRole('button', { name: /continue/i }),
                    ),
            )

            await waitFor(() => {
                expect(mockHandleUpdate).toHaveBeenCalledWith(
                    expect.objectContaining({
                        executionModeOverride: 'convert-only',
                    }),
                )
            })
        })

        it('omits executionModeOverride from handleCreate when the user is not impersonated', async () => {
            mockHandleCreate.mockResolvedValue({ id: 'new-journey-id' })

            const { user } = renderComponent({
                journeyType: JOURNEY_TYPES.CART_ABANDONMENT,
                stepComponent: MockStepComponentWithExecutionMode,
            })

            await act(
                async () =>
                    await user.click(
                        screen.getByRole('button', { name: /continue/i }),
                    ),
            )

            await waitFor(() => {
                expect(mockHandleCreate).toHaveBeenCalled()
            })

            const [payload] = mockHandleCreate.mock.calls[0]
            expect(payload).not.toHaveProperty('executionModeOverride')
        })

        it('omits executionModeOverride from handleUpdate when the user is not impersonated', async () => {
            mockUseJourneyContext.mockReturnValue({
                ...defaultContextValue,
                journeyData: { id: 'existing-journey-id', campaign: null },
            } as any)
            mockHandleUpdate.mockResolvedValue(undefined)

            const { user } = renderComponent({
                journeyType: JOURNEY_TYPES.CART_ABANDONMENT,
                stepComponent: MockStepComponentWithExecutionMode,
            })

            await act(
                async () =>
                    await user.click(
                        screen.getByRole('button', { name: /continue/i }),
                    ),
            )

            await waitFor(() => {
                expect(mockHandleUpdate).toHaveBeenCalled()
            })

            const [payload] = mockHandleUpdate.mock.calls[0]
            expect(payload).not.toHaveProperty('executionModeOverride')
        })
    })
})

describe('buildScheduledDatetime', () => {
    it('returns an ISO datetime string when scheduleType is later with date and time', () => {
        const getValues = () =>
            ({
                scheduleType: 'later',
                scheduledDate: new CalendarDate(2026, 7, 15),
                scheduledTime: new Time(14, 30, 0, 0),
            }) as unknown as SetupFormValues

        const result = buildScheduledDatetime(getValues)

        expect(result).not.toBeNull()
        expect(result).toContain('2026-07-15')
        expect(result).toContain('14:30')
    })

    it('returns null when scheduleType is immediate', () => {
        const getValues = () =>
            ({
                scheduleType: 'immediate',
                scheduledDate: null,
                scheduledTime: null,
            }) as unknown as SetupFormValues

        const result = buildScheduledDatetime(getValues)

        expect(result).toBeNull()
    })

    it('returns null when scheduleType is later but date is missing', () => {
        const getValues = () =>
            ({
                scheduleType: 'later',
                scheduledDate: null,
                scheduledTime: new Time(14, 30),
            }) as unknown as SetupFormValues

        const result = buildScheduledDatetime(getValues)

        expect(result).toBeNull()
    })

    it('returns null when scheduleType is later but time is missing', () => {
        const getValues = () =>
            ({
                scheduleType: 'later',
                scheduledDate: new CalendarDate(2026, 7, 15),
                scheduledTime: null,
            }) as unknown as SetupFormValues

        const result = buildScheduledDatetime(getValues)

        expect(result).toBeNull()
    })

    it('strips timezone bracket from result', () => {
        const getValues = () =>
            ({
                scheduleType: 'later',
                scheduledDate: new CalendarDate(2026, 7, 15),
                scheduledTime: new Time(10, 0, 0, 0),
            }) as unknown as SetupFormValues

        const result = buildScheduledDatetime(getValues)

        expect(result).not.toBeNull()
        expect(result).not.toMatch(/\[.*\]/)
    })
})
