import { act, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Controller, useFormContext } from 'react-hook-form'
import { useHistory } from 'react-router-dom'

import { JourneyStatusEnum } from '@gorgias/convert-client'
import type { StoreConfigurationResponseSchema } from '@gorgias/convert-client'

import {
    JOURNEY_TYPES,
    STEPS_NAMES,
    UpdatableJourneyCampaignState,
} from 'AIJourney/constants'
import {
    useAiJourneyStoreConfiguration,
    useJourneyCreateHandler,
    useJourneyUpdateHandler,
} from 'AIJourney/hooks'
import type { SetupFormValues } from 'AIJourney/pages/Setup/Setup'
import { useJourneyContext } from 'AIJourney/providers'
import { useCollapsibleColumn } from 'pages/common/hooks/useCollapsibleColumn'
import { renderWithRouter } from 'utils/testing'

import { AiJourneyOnboarding } from './AiJourneyOnboarding'
import type { StepComponentProps } from './AiJourneyOnboarding'

jest.mock('@repo/feature-flags', () => ({
    FeatureFlagKey: {
        AiJourneyStoreSettingsEnabled: 'ai-journey-store-settings-enabled',
    },
    useFlag: jest.fn(),
}))

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
    useAiJourneyStoreConfiguration: jest.fn(),
}))

jest.mock('pages/common/hooks/useCollapsibleColumn', () => ({
    useCollapsibleColumn: jest.fn(),
}))

const mockPush = jest.fn()
const mockHandleCreate = jest.fn()
const mockHandleUpdate = jest.fn()
const mockSetIsCollapsibleColumnOpen = jest.fn()

const mockUseFlag = jest.requireMock('@repo/feature-flags').useFlag as jest.Mock
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
const mockUseAiJourneyStoreConfiguration =
    useAiJourneyStoreConfiguration as jest.MockedFunction<
        typeof useAiJourneyStoreConfiguration
    >

const buildStoreConfigMock = (
    overrides: Partial<ReturnType<typeof useAiJourneyStoreConfiguration>> = {},
): ReturnType<typeof useAiJourneyStoreConfiguration> =>
    ({
        storeConfiguration: {
            sms_sender_integration_id: 123,
        } as StoreConfigurationResponseSchema,
        isLoading: false,
        error: null,
        isFetched: true,
        saveConfiguration: jest.fn(),
        ...overrides,
    }) as ReturnType<typeof useAiJourneyStoreConfiguration>

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

    const result = renderWithRouter(
        <AiJourneyOnboarding {...defaultProps} {...props} />,
    )

    return { ...result, user }
}

describe('<AiJourneyOnboarding />', () => {
    beforeEach(() => {
        mockPush.mockReset()
        mockHandleCreate.mockReset()
        mockHandleUpdate.mockReset()
        mockSetIsCollapsibleColumnOpen.mockReset()
        mockUseFlag.mockReturnValue(false)

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
        mockUseAiJourneyStoreConfiguration.mockReturnValue(
            buildStoreConfigMock(),
        )
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

        it('shows "Activate campaign" on activate step for a campaign journey', () => {
            renderComponent({
                step: STEPS_NAMES.ACTIVATE,
                journeyType: JOURNEY_TYPES.CAMPAIGN,
            })

            expect(
                screen.getByRole('button', { name: 'Activate campaign' }),
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

        it('calls handleUpdate with campaignState draft for a campaign', async () => {
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
                            name: /activate campaign/i,
                        }),
                    ),
            )

            await waitFor(() => {
                expect(mockHandleUpdate).toHaveBeenCalledWith({
                    campaignState: UpdatableJourneyCampaignState.Draft,
                })
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

        it('navigates to campaigns page after activating a campaign', async () => {
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
                            name: /activate campaign/i,
                        }),
                    ),
            )

            await waitFor(() => {
                expect(mockPush).toHaveBeenCalledWith(
                    '/app/ai-journey/test-shop/campaigns',
                )
            })
        })
    })

    describe('form submission - with AiJourneyStoreSettingsEnabled flag ON', () => {
        beforeEach(() => {
            mockUseFlag.mockReturnValue(true)
        })

        it('does not pass phoneNumberIntegrationId to handleCreate when flag is ON', async () => {
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

            const callArgs = mockHandleCreate.mock.calls[0][0]
            expect(callArgs).not.toHaveProperty('phoneNumberIntegrationId')
            expect(callArgs).not.toHaveProperty('phoneNumber')
        })

        it('does not pass phoneNumberIntegrationId to handleUpdate when flag is ON', async () => {
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

            const callArgs = mockHandleUpdate.mock.calls[0][0]
            expect(callArgs).not.toHaveProperty('phoneNumberIntegrationId')
            expect(callArgs).not.toHaveProperty('phoneNumber')
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

    describe('missing SMS sender - AiJourneyStoreSettingsEnabled flag ON', () => {
        beforeEach(() => {
            mockUseFlag.mockReturnValue(true)
            mockUseAiJourneyStoreConfiguration.mockReturnValue(
                buildStoreConfigMock({
                    storeConfiguration: {
                        sms_sender_integration_id: null,
                        sms_sender_number: null,
                    } as StoreConfigurationResponseSchema,
                }),
            )
        })

        it('disables the continue button while store config is loading', () => {
            mockUseAiJourneyStoreConfiguration.mockReturnValue(
                buildStoreConfigMock({
                    storeConfiguration: undefined,
                    isLoading: true,
                }),
            )

            renderComponent({ step: STEPS_NAMES.SETUP })

            expect(
                screen.getByRole('button', { name: /continue/i }),
            ).toBeDisabled()
        })

        it('disables the continue button on setup step when sender is missing', () => {
            renderComponent({ step: STEPS_NAMES.SETUP })

            expect(
                screen.getByRole('button', { name: /continue/i }),
            ).toBeDisabled()
        })

        it('shows the SMS sender required banner on setup step when sender is missing', () => {
            renderComponent({ step: STEPS_NAMES.SETUP })

            expect(
                screen.getByText('Add sender phone number to activate'),
            ).toBeInTheDocument()
        })

        it('disables the continue button when store config fetch returned no data', () => {
            mockUseAiJourneyStoreConfiguration.mockReturnValue(
                buildStoreConfigMock({
                    storeConfiguration: undefined,
                    isLoading: false,
                }),
            )

            renderComponent({ step: STEPS_NAMES.SETUP })

            expect(
                screen.getByRole('button', { name: /continue/i }),
            ).toBeDisabled()
        })

        it('does not disable the continue button on preview step when sender is missing', () => {
            renderComponent({ step: STEPS_NAMES.PREVIEW })

            expect(
                screen.getByRole('button', { name: /continue/i }),
            ).not.toBeDisabled()
        })

        it('does not show the banner when sender is configured', () => {
            mockUseAiJourneyStoreConfiguration.mockReturnValue(
                buildStoreConfigMock({
                    storeConfiguration: {
                        sms_sender_integration_id: 456,
                    } as StoreConfigurationResponseSchema,
                }),
            )

            renderComponent({ step: STEPS_NAMES.SETUP })

            expect(
                screen.queryByText('Add sender phone number to activate'),
            ).not.toBeInTheDocument()
            expect(
                screen.getByRole('button', { name: /continue/i }),
            ).not.toBeDisabled()
        })
    })

    describe('store configuration with null integration', () => {
        it('calls useAiJourneyStoreConfiguration with undefined when currentIntegration is null', () => {
            mockUseJourneyContext.mockReturnValue({
                ...defaultContextValue,
                currentIntegration: null,
            } as any)

            renderComponent()

            expect(mockUseAiJourneyStoreConfiguration).toHaveBeenCalledWith(
                undefined,
            )
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
})
