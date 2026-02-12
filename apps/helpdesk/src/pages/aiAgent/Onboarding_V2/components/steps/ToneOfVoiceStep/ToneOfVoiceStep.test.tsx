import type { ComponentProps } from 'react'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, screen, waitFor } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import type { InternalAxiosRequestConfig } from 'axios'
import { createMemoryHistory } from 'history'
import { fromJS } from 'immutable'
import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'

import { account } from 'fixtures/account'
import { billingState } from 'fixtures/billing'
import { integrationsState, shopifyIntegration } from 'fixtures/integrations'
import { user } from 'fixtures/users'
import type { OnboardingData } from 'models/aiAgent/types'
import { ToneOfVoice } from 'pages/aiAgent/constants'
import { DiscountStrategy } from 'pages/aiAgent/Onboarding_V2/components/steps/PersonalityStep/DiscountStrategy'
import { PersuasionLevel } from 'pages/aiAgent/Onboarding_V2/components/steps/PersonalityStep/PersuasionLevel'
import type { StepProps } from 'pages/aiAgent/Onboarding_V2/components/steps/types'
import {
    AiAgentScopes,
    WizardStepEnum,
} from 'pages/aiAgent/Onboarding_V2/types'
import type { RootState, StoreDispatch } from 'state/types'
import { renderWithRouter } from 'utils/testing'

import { ToneOfVoiceStep } from './ToneOfVoiceStep'

// Mock the auth interceptor to prevent auth requests
jest.mock('utils/gorgiasAppsAuth', () => ({
    __esModule: true,
    default: (config: InternalAxiosRequestConfig) => {
        config.headers = {
            ...config.headers,
            Authorization: 'Bearer test-token',
        } as InternalAxiosRequestConfig['headers']
        return config
    },
    GorgiasAppAuthService: jest.fn().mockImplementation(() => ({
        getAccessToken: jest.fn().mockResolvedValue('Bearer test-token'),
        getAccessTokenHeaders: jest.fn().mockResolvedValue({
            Authorization: 'Bearer test-token',
        }),
    })),
    buildGorgiasAppsAuthInterceptor: jest.fn(
        () => (config: InternalAxiosRequestConfig) => {
            config.headers = {
                ...config.headers,
                Authorization: 'Bearer test-token',
            } as InternalAxiosRequestConfig['headers']
            return config
        },
    ),
}))

jest.mock('pages/aiAgent/Onboarding_V2/hooks/useSteps', () => ({
    useSteps: () => ({
        validSteps: [
            { step: WizardStepEnum.SHOPIFY_INTEGRATION, condition: true },
            { step: WizardStepEnum.TONE_OF_VOICE, condition: true },
            { step: WizardStepEnum.SALES_PERSONALITY, condition: true },
        ],
        totalSteps: 3,
    }),
}))

jest.mock('pages/aiAgent/Onboarding_V2/hooks/useCheckStoreIntegration', () => ({
    __esModule: true,
    default: () => null,
}))

jest.mock(
    'pages/aiAgent/Onboarding_V2/hooks/useCheckOnboardingCompleted',
    () => ({
        __esModule: true,
        default: () => null,
    }),
)

jest.mock(
    'pages/aiAgent/Onboarding_V2/hooks/useCheckStoreAlreadyConfigured',
    () => ({
        useCheckStoreAlreadyConfigured: () => null,
    }),
)

jest.mock('pages/aiAgent/hooks/useCustomToneOfVoicePreview', () => ({
    __esModule: true,
    default: () => ({
        latestCustomToneOfVoicePreview: null,
        onGenerateCustomToneOfVoicePreview: jest.fn(),
        isLoading: false,
        isError: false,
    }),
}))

jest.mock(
    'pages/aiAgent/Onboarding_V2/hooks/useAiAgentScopesForAutomationPlan',
    () => ({
        useAiAgentScopesForAutomationPlan: () => [
            AiAgentScopes.SUPPORT,
            AiAgentScopes.SALES,
        ],
    }),
)

const baseURL = 'http://localhost:9402/api'

const mockOnboardingDataComplete: OnboardingData = {
    id: '123',
    shopName: 'test-shop',
    toneOfVoice: ToneOfVoice.Friendly,
    customToneOfVoiceGuidance: undefined,
    currentStepName: WizardStepEnum.TONE_OF_VOICE,
    salesPersuasionLevel: PersuasionLevel.Moderate,
    salesDiscountStrategyLevel: DiscountStrategy.Balanced,
    salesDiscountMax: 0.08,
    scopes: [AiAgentScopes.SUPPORT, AiAgentScopes.SALES],
}

const mockOnboardingDataWithoutId: Omit<OnboardingData, 'id'> = {
    shopName: 'test-shop',
    toneOfVoice: ToneOfVoice.Friendly,
    customToneOfVoiceGuidance: undefined,
    currentStepName: WizardStepEnum.TONE_OF_VOICE,
    salesPersuasionLevel: PersuasionLevel.Moderate,
    salesDiscountStrategyLevel: DiscountStrategy.Balanced,
    salesDiscountMax: 0.08,
    scopes: [AiAgentScopes.SUPPORT, AiAgentScopes.SALES],
}

const server = setupServer()

beforeAll(() => {
    server.listen({ onUnhandledRequest: 'error' })
})

beforeEach(() => {
    testQueryClient.clear()
})

afterEach(() => {
    server.resetHandlers()
})

afterAll(() => {
    server.close()
})

const history = createMemoryHistory({
    initialEntries: [
        `/app/ai-agent/shopify/test-shop/onboarding/${WizardStepEnum.TONE_OF_VOICE}`,
    ],
})

const mockStore = configureMockStore<RootState, StoreDispatch>()

const defaultState = {
    currentAccount: fromJS(account),
    billing: fromJS(billingState),
    integrations: fromJS(integrationsState).mergeDeep({
        integrations: [
            {
                ...shopifyIntegration,
                meta: {
                    ...shopifyIntegration.meta,
                    shop_domain: 'test-shop.myshopify.com',
                },
            },
        ],
    }),
    currentUser: fromJS(user),
} as RootState

const goToStep = jest.fn()
const defaultProps: StepProps = {
    currentStep: 2,
    totalSteps: 3,
    goToStep,
}

const testQueryClient = new QueryClient({
    defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
    },
})

const waitForQueriesSettled = async () => {
    await waitFor(() => {
        expect(testQueryClient.isFetching()).toBe(0)
    })
}

const renderComponent = (
    props: ComponentProps<typeof ToneOfVoiceStep> = defaultProps,
) => {
    const queryClient = testQueryClient

    return renderWithRouter(
        <QueryClientProvider client={queryClient}>
            <Provider store={mockStore(defaultState)}>
                <ToneOfVoiceStep {...props} />
            </Provider>
        </QueryClientProvider>,
        {
            history,
            path: '/app/ai-agent/:shopType/:shopName/onboarding/:step',
            route: `/app/ai-agent/shopify/test-shop/onboarding/${WizardStepEnum.TONE_OF_VOICE}`,
        },
    )
}

describe('ToneOfVoiceStep', () => {
    beforeEach(() => {
        goToStep.mockClear()
    })

    describe('Loading state', () => {
        it('should eventually display data after loading', async () => {
            server.use(
                http.get(`${baseURL}/onboardings`, async () => {
                    await new Promise((resolve) => setTimeout(resolve, 50))
                    return HttpResponse.json([mockOnboardingDataComplete])
                }),
            )

            renderComponent()

            expect(await screen.findByText('Friendly')).toBeInTheDocument()
        })
    })

    describe('Rendering', () => {
        it('should render with correct title', async () => {
            server.use(
                http.get(`${baseURL}/onboardings`, () => {
                    return HttpResponse.json([mockOnboardingDataComplete])
                }),
            )

            renderComponent()

            expect(
                await screen.findByText(
                    'Choose a tone that matches your brand',
                ),
            ).toBeInTheDocument()
        })

        it('should render description text', async () => {
            server.use(
                http.get(`${baseURL}/onboardings`, () => {
                    return HttpResponse.json([mockOnboardingDataComplete])
                }),
            )

            renderComponent()

            expect(
                await screen.findByText(
                    /set the personality of your ai agent/i,
                ),
            ).toBeInTheDocument()
        })

        it('should display Friendly tone by default', async () => {
            server.use(
                http.get(`${baseURL}/onboardings`, () => {
                    return HttpResponse.json([mockOnboardingDataComplete])
                }),
            )

            renderComponent()

            expect(await screen.findByText('Friendly')).toBeInTheDocument()
        })
    })

    describe('Navigation', () => {
        it('should navigate to previous step when Back button is clicked', async () => {
            const user = userEvent.setup()

            server.use(
                http.get(`${baseURL}/onboardings`, () => {
                    return HttpResponse.json([mockOnboardingDataComplete])
                }),
            )

            renderComponent()

            await screen.findByText('Friendly')

            const backButton = screen.getByRole('button', { name: /back/i })
            await act(() => user.click(backButton))
            await waitForQueriesSettled()

            expect(goToStep).toHaveBeenCalledWith(
                WizardStepEnum.SHOPIFY_INTEGRATION,
            )
        })

        it('should skip mutation and go to next step if form unchanged', async () => {
            const user = userEvent.setup()

            server.use(
                http.get(`${baseURL}/onboardings`, () => {
                    return HttpResponse.json([mockOnboardingDataComplete])
                }),
            )

            renderComponent()

            await screen.findByText('Friendly')

            const nextButton = screen.getByRole('button', { name: /next/i })
            await act(() => user.click(nextButton))
            await waitForQueriesSettled()

            await waitFor(() => {
                expect(goToStep).toHaveBeenCalledWith(
                    WizardStepEnum.SALES_PERSONALITY,
                )
            })
        })
    })

    describe('Tone of Voice Selection', () => {
        it('should allow selecting different tones', async () => {
            const user = userEvent.setup()

            server.use(
                http.get(`${baseURL}/onboardings`, () => {
                    return HttpResponse.json([mockOnboardingDataComplete])
                }),
            )

            renderComponent()

            await screen.findByText('Friendly')

            const professionalOption = screen.getByText('Professional')
            await act(() => user.click(professionalOption))
            await waitForQueriesSettled()

            expect(screen.getByText('Professional')).toBeInTheDocument()
        })

        it('should show custom tone textarea when Custom is selected', async () => {
            const user = userEvent.setup()

            server.use(
                http.get(`${baseURL}/onboardings`, () => {
                    return HttpResponse.json([mockOnboardingDataComplete])
                }),
            )

            renderComponent()

            await screen.findByText('Custom')

            const customOption = screen.getByText('Custom')
            await act(() => user.click(customOption))
            await waitForQueriesSettled()

            expect(
                await screen.findByLabelText(/custom tone of voice/i),
            ).toBeInTheDocument()
        })

        it('should display placeholder text for custom tone', async () => {
            const user = userEvent.setup()

            server.use(
                http.get(`${baseURL}/onboardings`, () => {
                    return HttpResponse.json([mockOnboardingDataComplete])
                }),
            )

            renderComponent()

            await screen.findByText('Custom')

            const customOption = screen.getByText('Custom')
            await act(() => user.click(customOption))
            await waitForQueriesSettled()

            expect(
                await screen.findByPlaceholderText(
                    /use a friendly and conversational tone/i,
                ),
            ).toBeInTheDocument()
        })
    })

    describe('Form Submission', () => {
        it('should update onboarding when tone is changed', async () => {
            const user = userEvent.setup()

            let capturedRequestBody: Partial<OnboardingData> | null = null
            server.use(
                http.get(`${baseURL}/onboardings`, () => {
                    return HttpResponse.json([mockOnboardingDataComplete])
                }),
                http.put(`${baseURL}/onboardings/:id`, async ({ request }) => {
                    capturedRequestBody =
                        (await request.json()) as Partial<OnboardingData>
                    return HttpResponse.json({
                        ...mockOnboardingDataComplete,
                        ...capturedRequestBody,
                    })
                }),
            )

            renderComponent()

            await screen.findByText('Friendly')

            const professionalOption = screen.getByText('Professional')
            await act(() => user.click(professionalOption))
            await waitForQueriesSettled()

            const nextButton = screen.getByRole('button', { name: /next/i })
            await act(() => user.click(nextButton))
            await waitForQueriesSettled()

            await waitFor(() => {
                expect(capturedRequestBody).toMatchObject({
                    toneOfVoice: ToneOfVoice.Professional,
                })
                expect(goToStep).toHaveBeenCalledWith(
                    WizardStepEnum.SALES_PERSONALITY,
                )
            })
        })

        it('should submit custom tone guidance when Custom is selected', async () => {
            const user = userEvent.setup()

            let capturedRequestBody: Partial<OnboardingData> | null = null
            server.use(
                http.get(`${baseURL}/onboardings`, () => {
                    return HttpResponse.json([mockOnboardingDataComplete])
                }),
                http.put(`${baseURL}/onboardings/:id`, async ({ request }) => {
                    capturedRequestBody =
                        (await request.json()) as Partial<OnboardingData>
                    return HttpResponse.json({
                        ...mockOnboardingDataComplete,
                        ...capturedRequestBody,
                    })
                }),
            )

            renderComponent()

            await screen.findByText('Custom')

            const customOption = screen.getByText('Custom')
            await act(() => user.click(customOption))
            await waitForQueriesSettled()

            const textarea =
                await screen.findByLabelText(/custom tone of voice/i)
            await act(async () => {
                await user.clear(textarea)
                await user.type(textarea, 'Be concise and friendly')
            })
            await waitForQueriesSettled()

            const nextButton = screen.getByRole('button', { name: /next/i })
            await act(() => user.click(nextButton))
            await waitForQueriesSettled()

            await waitFor(() => {
                expect(capturedRequestBody).toMatchObject({
                    toneOfVoice: ToneOfVoice.Custom,
                    customToneOfVoiceGuidance: 'Be concise and friendly',
                })
                expect(goToStep).toHaveBeenCalledWith(
                    WizardStepEnum.SALES_PERSONALITY,
                )
            })
        })
    })

    describe('Create vs Update Logic', () => {
        it('should create onboarding when data has no id', async () => {
            const user = userEvent.setup()

            server.use(
                http.get(`${baseURL}/onboardings`, () => {
                    return HttpResponse.json([mockOnboardingDataWithoutId])
                }),
            )

            let capturedRequestBody: Partial<OnboardingData> | null = null
            server.use(
                http.post(`${baseURL}/onboardings`, async ({ request }) => {
                    capturedRequestBody =
                        (await request.json()) as Partial<OnboardingData>
                    return HttpResponse.json({
                        ...capturedRequestBody,
                        id: 'new-id-456',
                    })
                }),
            )

            renderComponent()

            await screen.findByText('Friendly')

            const professionalOption = screen.getByText('Professional')
            await act(() => user.click(professionalOption))
            await waitForQueriesSettled()

            const nextButton = screen.getByRole('button', { name: /next/i })
            await act(() => user.click(nextButton))
            await waitForQueriesSettled()

            await waitFor(() => {
                expect(capturedRequestBody).toMatchObject({
                    toneOfVoice: ToneOfVoice.Professional,
                })
                expect(goToStep).toHaveBeenCalledWith(
                    WizardStepEnum.SALES_PERSONALITY,
                )
            })
        })

        it('should create onboarding even when form unchanged but no id exists', async () => {
            const user = userEvent.setup()

            server.use(
                http.get(`${baseURL}/onboardings`, () => {
                    return HttpResponse.json([mockOnboardingDataWithoutId])
                }),
            )

            let wasCreateCalled = false
            server.use(
                http.post(`${baseURL}/onboardings`, async ({ request }) => {
                    wasCreateCalled = true
                    const body =
                        (await request.json()) as Partial<OnboardingData>
                    return HttpResponse.json({
                        ...body,
                        id: 'new-id-456',
                    })
                }),
            )

            renderComponent()

            await screen.findByText('Friendly')

            const nextButton = screen.getByRole('button', { name: /next/i })
            await act(() => user.click(nextButton))
            await waitForQueriesSettled()

            await waitFor(() => {
                expect(wasCreateCalled).toBe(true)
                expect(goToStep).toHaveBeenCalledWith(
                    WizardStepEnum.SALES_PERSONALITY,
                )
            })
        })
    })

    describe('Error Handling', () => {
        it('should handle update error gracefully', async () => {
            const user = userEvent.setup()

            server.use(
                http.get(`${baseURL}/onboardings`, () => {
                    return HttpResponse.json([mockOnboardingDataComplete])
                }),
                http.put(`${baseURL}/onboardings/:id`, () => {
                    return HttpResponse.json(
                        { error: { msg: 'Update failed' } },
                        { status: 500 },
                    )
                }),
            )

            renderComponent()

            await screen.findByText('Friendly')

            const professionalOption = screen.getByText('Professional')
            await act(() => user.click(professionalOption))
            await waitForQueriesSettled()

            const nextButton = screen.getByRole('button', { name: /next/i })
            await act(() => user.click(nextButton))
            await waitForQueriesSettled()

            await waitFor(() => {
                expect(goToStep).not.toHaveBeenCalled()
            })
        })

        it('should handle create error gracefully', async () => {
            const user = userEvent.setup()

            server.use(
                http.get(`${baseURL}/onboardings`, () => {
                    return HttpResponse.json([mockOnboardingDataWithoutId])
                }),
                http.post(`${baseURL}/onboardings`, () => {
                    return HttpResponse.json(
                        { error: { msg: 'Creation failed' } },
                        { status: 500 },
                    )
                }),
            )

            renderComponent()

            await screen.findByText('Friendly')

            const professionalOption = screen.getByText('Professional')
            await act(() => user.click(professionalOption))
            await waitForQueriesSettled()

            const nextButton = screen.getByRole('button', { name: /next/i })
            await act(() => user.click(nextButton))
            await waitForQueriesSettled()

            await waitFor(() => {
                expect(goToStep).not.toHaveBeenCalled()
            })
        })

        it('should render default data when fetch fails', async () => {
            server.use(
                http.get(`${baseURL}/onboardings`, () => {
                    return HttpResponse.json(
                        { error: { msg: 'Fetch failed' } },
                        { status: 500 },
                    )
                }),
            )

            renderComponent()

            expect(
                await screen.findByText(
                    'Choose a tone that matches your brand',
                ),
            ).toBeInTheDocument()
        })
    })

    describe('Loading State Management', () => {
        it('should disable next button while mutation is in progress', async () => {
            const user = userEvent.setup()

            let resolveUpdate: (value: unknown) => void
            const updatePromise = new Promise((resolve) => {
                resolveUpdate = resolve
            })

            server.use(
                http.get(`${baseURL}/onboardings`, () => {
                    return HttpResponse.json([mockOnboardingDataComplete])
                }),
                http.put(`${baseURL}/onboardings/:id`, async () => {
                    await updatePromise
                    return HttpResponse.json(mockOnboardingDataComplete)
                }),
            )

            renderComponent()

            await screen.findByText('Friendly')
            await waitForQueriesSettled()

            const professionalOption = screen.getByText('Professional')
            await act(() => user.click(professionalOption))
            await waitForQueriesSettled()

            const nextButton = screen.getByRole('button', { name: /next/i })
            await act(() => user.click(nextButton))
            await waitForQueriesSettled()

            await waitFor(() => {
                expect(nextButton).toBeDisabled()
            })

            resolveUpdate!(null)

            await waitFor(() => {
                expect(goToStep).toHaveBeenCalled()
            })
        })

        it('should disable next button while create mutation is in progress', async () => {
            const user = userEvent.setup()

            let resolveCreate: (value: unknown) => void
            const createPromise = new Promise((resolve) => {
                resolveCreate = resolve
            })

            server.use(
                http.get(`${baseURL}/onboardings`, () => {
                    return HttpResponse.json([mockOnboardingDataWithoutId])
                }),
                http.post(`${baseURL}/onboardings`, async () => {
                    await createPromise
                    return HttpResponse.json({
                        ...mockOnboardingDataWithoutId,
                        id: 'new-id',
                    })
                }),
            )

            renderComponent()

            await screen.findByText('Friendly')

            const professionalOption = screen.getByText('Professional')
            await act(() => user.click(professionalOption))
            await waitForQueriesSettled()

            // Wait for the form state to update after clicking
            await waitFor(() => {
                const professionalCheckbox = screen.getByRole('checkbox', {
                    name: /Professional/i,
                })
                expect(professionalCheckbox).toBeChecked()
            })

            const nextButton = screen.getByRole('button', { name: /next/i })
            await act(() => user.click(nextButton))
            await waitForQueriesSettled()

            await waitFor(() => {
                expect(nextButton).toBeDisabled()
            })

            resolveCreate!(null)

            await waitFor(() => {
                expect(goToStep).toHaveBeenCalled()
            })
        })
    })

    describe('Form Validation', () => {
        it('should require custom tone guidance when Custom is selected', async () => {
            const user = userEvent.setup()

            server.use(
                http.get(`${baseURL}/onboardings`, () => {
                    return HttpResponse.json([mockOnboardingDataComplete])
                }),
            )

            renderComponent()

            await screen.findByText('Custom')

            const customOption = screen.getByText('Custom')
            await act(() => user.click(customOption))
            await waitForQueriesSettled()

            const textarea =
                await screen.findByLabelText(/custom tone of voice/i)
            await act(() => user.clear(textarea))
            await waitForQueriesSettled()

            const nextButton = screen.getByRole('button', { name: /next/i })
            await act(() => user.click(nextButton))
            await waitForQueriesSettled()

            expect(
                await screen.findByText(
                    /custom tone of voice guidance is required/i,
                ),
            ).toBeInTheDocument()
        })

        it('should allow submission when custom tone has text', async () => {
            const user = userEvent.setup()

            let capturedRequestBody: Partial<OnboardingData> | null = null
            server.use(
                http.get(`${baseURL}/onboardings`, () => {
                    return HttpResponse.json([mockOnboardingDataComplete])
                }),
                http.put(`${baseURL}/onboardings/:id`, async ({ request }) => {
                    capturedRequestBody =
                        (await request.json()) as Partial<OnboardingData>
                    return HttpResponse.json({
                        ...mockOnboardingDataComplete,
                        ...capturedRequestBody,
                    })
                }),
            )

            renderComponent()

            await screen.findByText('Custom')

            const customOption = screen.getByText('Custom')
            await act(() => user.click(customOption))
            await waitForQueriesSettled()

            const textarea =
                await screen.findByLabelText(/custom tone of voice/i)
            await act(async () => {
                await user.clear(textarea)
                await user.type(textarea, 'Professional')
            })
            await waitForQueriesSettled()

            const nextButton = screen.getByRole('button', { name: /next/i })
            await act(() => user.click(nextButton))
            await waitForQueriesSettled()

            await waitFor(
                () => {
                    expect(capturedRequestBody).toMatchObject({
                        customToneOfVoiceGuidance: 'Professional',
                    })
                    expect(goToStep).toHaveBeenCalledWith(
                        WizardStepEnum.SALES_PERSONALITY,
                    )
                },
                { timeout: 3000 },
            )
        })
    })
})
