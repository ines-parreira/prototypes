import { FeatureFlagKey } from '@repo/feature-flags'
import { featureFlagsClientMock } from '@repo/feature-flags/testing'
import { render } from '@repo/testing'
import { act, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { useAiJourneyStoreConfiguration } from 'AIJourney/hooks/useAiJourneyStoreConfiguration/useAiJourneyStoreConfiguration'
import { useJourneyContext } from 'AIJourney/providers'

import { Settings } from './Settings'

jest.mock('AIJourney/providers', () => ({
    useJourneyContext: jest.fn(),
}))

jest.mock(
    'AIJourney/hooks/useAiJourneyStoreConfiguration/useAiJourneyStoreConfiguration',
    () => ({
        useAiJourneyStoreConfiguration: jest.fn(),
    }),
)

jest.mock(
    'AIJourney/hooks/useAiJourneyPhoneList/useAiJourneyPhoneList',
    () => ({
        useAiJourneyPhoneList: jest.fn(() => ({
            marketingCapabilityPhoneNumbers: [],
        })),
    }),
)

jest.mock('pages/common/components/FormUnsavedChangesPrompt', () => ({
    __esModule: true,
    FormUnsavedChangesPrompt: () => null,
}))

if (typeof Element.prototype.getAnimations === 'undefined') {
    Element.prototype.getAnimations = function () {
        return []
    }
}

const mockUseJourneyContext = useJourneyContext as jest.Mock
const mockUseAiJourneyStoreConfiguration =
    useAiJourneyStoreConfiguration as jest.Mock

const mockSaveConfiguration = jest.fn()

const enableToneOfVoiceFlag = () => {
    featureFlagsClientMock.allFlags.mockReturnValue({
        [FeatureFlagKey.AiJourneyToneOfVoice]: true,
    })
}

const renderComponent = (initialTab = 'sender-identity') =>
    render(<Settings />, {
        path: '/settings',
        initialEntries: [`/settings/${initialTab}`],
    })

describe('<Settings />', () => {
    beforeEach(() => {
        jest.clearAllMocks()

        mockUseJourneyContext.mockReturnValue({
            currentIntegration: { id: 42 },
            shopName: 'test-shop',
            storeConfiguration: {
                monitoredSmsIntegrations: [],
            },
        })

        mockUseAiJourneyStoreConfiguration.mockReturnValue({
            storeConfiguration: undefined,
            isLoading: false,
            error: null,
            isFetched: false,
            saveConfiguration: mockSaveConfiguration,
        })
    })

    it('should render the Settings heading', () => {
        renderComponent()

        expect(
            screen.getByRole('heading', { name: 'Settings' }),
        ).toBeInTheDocument()
    })

    describe('tabs', () => {
        it('should render 3 tabs', () => {
            renderComponent()

            expect(
                screen.getByRole('tab', { name: 'Sender Identity' }),
            ).toBeInTheDocument()
            expect(
                screen.getByRole('tab', { name: 'Compliance' }),
            ).toBeInTheDocument()
            expect(
                screen.getByRole('tab', { name: 'Integrations' }),
            ).toBeInTheDocument()
        })

        it('should select Sender Identity tab by default', () => {
            renderComponent()

            expect(
                screen.getByRole('tab', { name: 'Sender Identity' }),
            ).toHaveAttribute('aria-selected', 'true')
            expect(
                screen.getByRole('tab', { name: 'Compliance' }),
            ).toHaveAttribute('aria-selected', 'false')
            expect(
                screen.getByRole('tab', { name: 'Integrations' }),
            ).toHaveAttribute('aria-selected', 'false')
        })

        it('should select Compliance tab when URL points to compliance', () => {
            renderComponent('compliance')

            expect(
                screen.getByRole('tab', { name: 'Compliance' }),
            ).toHaveAttribute('aria-selected', 'true')
            expect(
                screen.getByRole('tab', { name: 'Sender Identity' }),
            ).toHaveAttribute('aria-selected', 'false')
        })

        it('should select Integrations tab when URL points to integrations', () => {
            renderComponent('integrations')

            expect(
                screen.getByRole('tab', { name: 'Integrations' }),
            ).toHaveAttribute('aria-selected', 'true')
            expect(
                screen.getByRole('tab', { name: 'Sender Identity' }),
            ).toHaveAttribute('aria-selected', 'false')
        })

        it('should redirect to sender-identity when URL contains an unknown tab', () => {
            renderComponent('unknown-tab')

            expect(
                screen.getByRole('tab', { name: 'Sender Identity' }),
            ).toHaveAttribute('aria-selected', 'true')
        })

        it('should select Compliance tab when clicked', async () => {
            const user = userEvent.setup()
            renderComponent()

            await act(async () => {
                await user.click(
                    screen.getByRole('tab', { name: 'Compliance' }),
                )
            })

            expect(
                screen.getByRole('tab', { name: 'Compliance' }),
            ).toHaveAttribute('aria-selected', 'true')
            expect(
                screen.getByRole('tab', { name: 'Sender Identity' }),
            ).toHaveAttribute('aria-selected', 'false')
        })

        it('should select Integrations tab when clicked', async () => {
            const user = userEvent.setup()
            renderComponent()

            await act(async () => {
                await user.click(
                    screen.getByRole('tab', { name: 'Integrations' }),
                )
            })

            expect(
                screen.getByRole('tab', { name: 'Integrations' }),
            ).toHaveAttribute('aria-selected', 'true')
        })
    })

    describe('Sender Identity tab content', () => {
        it('should render the Identity settings card heading', () => {
            renderComponent()

            expect(screen.getByText('Identity settings')).toBeInTheDocument()
        })

        it('should render the Brand name field', () => {
            renderComponent()

            expect(screen.getByLabelText('Brand name')).toBeInTheDocument()
        })

        it('should render the Send SMS from selector', () => {
            renderComponent()

            expect(screen.getByText('Send SMS from')).toBeInTheDocument()
        })
    })

    describe('Compliance tab content', () => {
        it('should render the Frequency caps card heading when Compliance tab is selected', async () => {
            const user = userEvent.setup()
            renderComponent()

            await act(async () => {
                await user.click(
                    screen.getByRole('tab', { name: 'Compliance' }),
                )
            })

            expect(screen.getByText('Frequency caps')).toBeInTheDocument()
        })

        it('should render the Texas exclusion toggle when Compliance tab is selected', async () => {
            const user = userEvent.setup()
            renderComponent()

            await act(async () => {
                await user.click(
                    screen.getByRole('tab', { name: 'Compliance' }),
                )
            })

            expect(
                screen.getByText('Automatically exclude Texas recipients'),
            ).toBeInTheDocument()
        })
    })

    describe('Save button', () => {
        it('should be disabled when the form is not dirty', () => {
            renderComponent()

            expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled()
        })

        it('should be enabled after modifying the brand name', async () => {
            const user = userEvent.setup()
            renderComponent()

            await user.type(screen.getByLabelText('Brand name'), 'My Store')

            expect(screen.getByRole('button', { name: 'Save' })).toBeEnabled()
        })
    })

    describe('form pre-population', () => {
        it('should pre-populate brand_name from storeConfiguration', async () => {
            mockUseAiJourneyStoreConfiguration.mockReturnValue({
                storeConfiguration: {
                    brand_name: 'Acme Corp',
                    sms_sender_integration_id: null,
                    sms_sender_number: null,
                    texas_exclusion_enabled: false,
                },
                isLoading: false,
                error: null,
                isFetched: true,
                saveConfiguration: mockSaveConfiguration,
            })

            renderComponent()

            await waitFor(() => {
                expect(
                    screen.getByDisplayValue('Acme Corp'),
                ).toBeInTheDocument()
            })
        })

        it('should pre-populate klaviyo_api_key from storeConfiguration', async () => {
            mockUseAiJourneyStoreConfiguration.mockReturnValue({
                storeConfiguration: {
                    brand_name: '',
                    sms_sender_integration_id: null,
                    sms_sender_number: null,
                    texas_exclusion_enabled: false,
                    klaviyo_api_key: 'pk_realkey1234',
                },
                isLoading: false,
                error: null,
                isFetched: true,
                saveConfiguration: mockSaveConfiguration,
            })

            const user = userEvent.setup()
            renderComponent()

            await user.click(screen.getByRole('tab', { name: 'Integrations' }))

            await waitFor(() => {
                expect(
                    screen.getByDisplayValue('**********1234'),
                ).toBeInTheDocument()
            })
        })

        it('should pre-populate quiet_hours_start and quiet_hours_end from storeConfiguration', async () => {
            mockSaveConfiguration.mockResolvedValue(undefined)
            mockUseAiJourneyStoreConfiguration.mockReturnValue({
                storeConfiguration: {
                    brand_name: '',
                    sms_sender_integration_id: null,
                    sms_sender_number: null,
                    texas_exclusion_enabled: false,
                    quiet_hours_start: '21:00',
                    quiet_hours_end: '08:00',
                },
                isLoading: false,
                error: null,
                isFetched: true,
                saveConfiguration: mockSaveConfiguration,
            })

            const user = userEvent.setup()
            renderComponent()

            await user.type(screen.getByLabelText('Brand name'), 'A')

            await act(async () => {
                await user.click(screen.getByRole('button', { name: 'Save' }))
            })

            await waitFor(() => {
                expect(mockSaveConfiguration).toHaveBeenCalledWith(
                    expect.objectContaining({
                        quiet_hours_start: '21:00',
                        quiet_hours_end: '08:00',
                    }),
                )
            })
        })

        it('should pre-check the Texas exclusion toggle when enabled in storeConfiguration', async () => {
            mockUseAiJourneyStoreConfiguration.mockReturnValue({
                storeConfiguration: {
                    brand_name: '',
                    sms_sender_integration_id: null,
                    sms_sender_number: null,
                    texas_exclusion_enabled: true,
                },
                isLoading: false,
                error: null,
                isFetched: true,
                saveConfiguration: mockSaveConfiguration,
            })

            const user = userEvent.setup()
            renderComponent()

            await user.click(screen.getByRole('tab', { name: 'Compliance' }))

            await waitFor(() => {
                expect(
                    screen.getByRole('switch', {
                        name: /automatically exclude texas recipients/i,
                    }),
                ).toBeChecked()
            })
        })
    })

    describe('save action', () => {
        it('should call saveConfiguration with the current form values on save', async () => {
            mockSaveConfiguration.mockResolvedValue(undefined)
            const user = userEvent.setup()
            renderComponent()

            await user.type(screen.getByLabelText('Brand name'), 'My Store')

            await act(async () => {
                await user.click(screen.getByRole('button', { name: 'Save' }))
            })

            await waitFor(() => {
                expect(mockSaveConfiguration).toHaveBeenCalledWith({
                    sms_sender_integration_id: null,
                    sms_sender_number: null,
                    brand_name: 'My Store',
                    texas_exclusion_enabled: false,
                    quiet_hours_start: null,
                    quiet_hours_end: null,
                })
            })
        })

        it('should omit klaviyo_api_key from the payload when the field is untouched', async () => {
            mockSaveConfiguration.mockResolvedValue(undefined)
            mockUseAiJourneyStoreConfiguration.mockReturnValue({
                storeConfiguration: {
                    brand_name: '',
                    sms_sender_integration_id: null,
                    sms_sender_number: null,
                    texas_exclusion_enabled: false,
                    klaviyo_api_key: 'pk_realkey1234',
                },
                isLoading: false,
                error: null,
                isFetched: true,
                saveConfiguration: mockSaveConfiguration,
            })

            const user = userEvent.setup()
            renderComponent()

            await user.type(screen.getByLabelText('Brand name'), 'My Store')

            await act(async () => {
                await user.click(screen.getByRole('button', { name: 'Save' }))
            })

            await waitFor(() => {
                expect(mockSaveConfiguration).toHaveBeenCalled()
            })
            const payload = mockSaveConfiguration.mock.calls[0][0]
            expect(payload).not.toHaveProperty('klaviyo_api_key')
        })

        it('should send klaviyo_api_key in the payload when the field is edited', async () => {
            mockSaveConfiguration.mockResolvedValue(undefined)
            const user = userEvent.setup()
            renderComponent()

            await user.click(screen.getByRole('tab', { name: 'Integrations' }))
            await user.type(
                screen.getByLabelText('Klaviyo API key'),
                'pk_newkey5678',
            )

            await act(async () => {
                await user.click(screen.getByRole('button', { name: 'Save' }))
            })

            await waitFor(() => {
                expect(mockSaveConfiguration).toHaveBeenCalledWith(
                    expect.objectContaining({
                        klaviyo_api_key: 'pk_newkey5678',
                    }),
                )
            })
        })

        it('should reset the dirty state after a successful save', async () => {
            mockSaveConfiguration.mockResolvedValue(undefined)
            const user = userEvent.setup()
            renderComponent()

            await user.type(screen.getByLabelText('Brand name'), 'My Store')
            expect(screen.getByRole('button', { name: 'Save' })).toBeEnabled()

            await act(async () => {
                await user.click(screen.getByRole('button', { name: 'Save' }))
            })

            await waitFor(() => {
                expect(
                    screen.getByRole('button', { name: 'Save' }),
                ).toBeDisabled()
            })
        })

        it('should show a success toast when save succeeds', async () => {
            mockSaveConfiguration.mockResolvedValue(undefined)
            const user = userEvent.setup()
            renderComponent()

            await user.type(screen.getByLabelText('Brand name'), 'My Store')

            await act(async () => {
                await user.click(screen.getByRole('button', { name: 'Save' }))
            })

            const toastEl = await screen.findByRole('status', {
                name: 'Settings saved successfully.',
            })
            expect(toastEl).toHaveAttribute('data-intent', 'success')
        })

        it('should show an error toast when save fails', async () => {
            mockSaveConfiguration.mockRejectedValue(new Error('Network error'))
            const user = userEvent.setup()
            renderComponent()

            await user.type(screen.getByLabelText('Brand name'), 'My Store')

            await act(async () => {
                await user.click(screen.getByRole('button', { name: 'Save' }))
            })

            const toastEl = await screen.findByRole('status', {
                name: 'Error saving settings. Please try again.',
            })
            expect(toastEl).toHaveAttribute('data-intent', 'destructive')
        })

        it('should set a klaviyo_api_key field error when save returns a 400 with detail', async () => {
            mockSaveConfiguration.mockRejectedValue({
                response: {
                    data: {
                        detail: [
                            { klaviyo_api_key: 'This API key is not valid.' },
                        ],
                    },
                },
            })
            const user = userEvent.setup()
            renderComponent()

            await user.click(screen.getByRole('tab', { name: 'Integrations' }))
            await user.type(screen.getByLabelText('Klaviyo API key'), 'pk_test')

            await act(async () => {
                await user.click(screen.getByRole('button', { name: 'Save' }))
            })

            await waitFor(() => {
                expect(
                    screen.getByText('This API key is not valid.'),
                ).toBeInTheDocument()
            })

            const toastEl = await screen.findByRole('status', {
                name: 'Error saving settings. Please try again.',
            })
            expect(toastEl).toHaveAttribute('data-intent', 'destructive')
        })

        it('should set a klaviyo_api_key field error when save fails with a 422 status', async () => {
            mockSaveConfiguration.mockRejectedValue({
                response: { status: 422 },
            })
            const user = userEvent.setup()
            renderComponent()

            await user.click(screen.getByRole('tab', { name: 'Integrations' }))
            await user.type(screen.getByLabelText('Klaviyo API key'), 'pk_test')

            await act(async () => {
                await user.click(screen.getByRole('button', { name: 'Save' }))
            })

            await waitFor(() => {
                expect(
                    screen.getByText(
                        'Invalid Klaviyo API key. Please check your key and try again.',
                    ),
                ).toBeInTheDocument()
            })

            const toastEl = await screen.findByRole('status', {
                name: 'Error saving settings. Please try again.',
            })
            expect(toastEl).toHaveAttribute('data-intent', 'destructive')
        })
    })

    describe('when currentIntegration is not set', () => {
        it('should still render without crashing when currentIntegration is null', () => {
            mockUseJourneyContext.mockReturnValue({
                currentIntegration: null,
            })

            renderComponent()

            expect(
                screen.getByRole('heading', { name: 'Settings' }),
            ).toBeInTheDocument()
        })
    })

    describe('loading state', () => {
        it('should render the page structure but not the card content when isLoading is true', () => {
            mockUseAiJourneyStoreConfiguration.mockReturnValue({
                storeConfiguration: undefined,
                isLoading: true,
                error: null,
                isFetched: false,
                saveConfiguration: mockSaveConfiguration,
            })

            renderComponent()

            expect(
                screen.getByRole('heading', { name: 'Settings' }),
            ).toBeInTheDocument()
            expect(
                screen.getByRole('tab', { name: 'Sender Identity' }),
            ).toBeInTheDocument()
            expect(screen.getByLabelText('Loading')).toBeInTheDocument()
            expect(
                screen.queryByText('Identity settings'),
            ).not.toBeInTheDocument()
        })
    })

    describe('tone of voice feature flag', () => {
        it('should not render the Tone of voice card when ai-journey-tov flag is off', () => {
            renderComponent()

            expect(screen.queryByText('Tone of voice')).not.toBeInTheDocument()
        })

        it('should omit tone_of_voice_guidance from the save payload when the flag is off', async () => {
            mockSaveConfiguration.mockResolvedValue(undefined)
            const user = userEvent.setup()
            renderComponent()

            await user.type(screen.getByLabelText('Brand name'), 'My Store')

            await act(async () => {
                await user.click(screen.getByRole('button', { name: 'Save' }))
            })

            await waitFor(() => {
                expect(mockSaveConfiguration).toHaveBeenCalled()
            })
            const payload = mockSaveConfiguration.mock.calls[0][0]
            expect(payload).not.toHaveProperty('tone_of_voice_guidance')
        })

        it('should render the Tone of voice card when ai-journey-tov flag is on', () => {
            enableToneOfVoiceFlag()
            mockUseAiJourneyStoreConfiguration.mockReturnValue({
                storeConfiguration: {
                    brand_name: '',
                    sms_sender_integration_id: null,
                    sms_sender_number: null,
                    texas_exclusion_enabled: false,
                    tone_of_voice_guidance: null,
                },
                isLoading: false,
                error: null,
                isFetched: true,
                saveConfiguration: mockSaveConfiguration,
            })

            renderComponent()

            expect(screen.getByText('Tone of voice')).toBeInTheDocument()
        })

        it('should save tone_of_voice_guidance when the user provides custom guidance', async () => {
            enableToneOfVoiceFlag()
            mockSaveConfiguration.mockResolvedValue(undefined)
            mockUseAiJourneyStoreConfiguration.mockReturnValue({
                storeConfiguration: {
                    brand_name: '',
                    sms_sender_integration_id: null,
                    sms_sender_number: null,
                    texas_exclusion_enabled: false,
                    tone_of_voice_guidance: null,
                },
                isLoading: false,
                error: null,
                isFetched: true,
                saveConfiguration: mockSaveConfiguration,
            })

            const user = userEvent.setup()
            renderComponent()

            await user.click(
                await screen.findByLabelText('Use custom tone of voice'),
            )
            await user.type(
                screen.getByLabelText(/Tone of voice guidance/),
                'Be friendly',
            )

            await act(async () => {
                await user.click(screen.getByRole('button', { name: 'Save' }))
            })

            await waitFor(() => {
                expect(mockSaveConfiguration).toHaveBeenCalledWith(
                    expect.objectContaining({
                        tone_of_voice_guidance: 'Be friendly',
                    }),
                )
            })
        })
    })

    describe('error state', () => {
        it('should render only the heading when there is an error after data is fetched', () => {
            mockUseAiJourneyStoreConfiguration.mockReturnValue({
                storeConfiguration: undefined,
                isLoading: false,
                error: new Error('Failed to load'),
                isFetched: true,
                saveConfiguration: mockSaveConfiguration,
            })

            renderComponent()

            expect(
                screen.getByRole('heading', { name: 'Settings' }),
            ).toBeInTheDocument()
            expect(screen.queryByRole('tab')).not.toBeInTheDocument()
        })
    })

    describe('Internal tab RCS test send link', () => {
        let originalImpersonated: typeof window.USER_IMPERSONATED

        beforeEach(() => {
            originalImpersonated = window.USER_IMPERSONATED
        })

        afterEach(() => {
            window.USER_IMPERSONATED = originalImpersonated
        })

        const enableRcsFlag = () => {
            featureFlagsClientMock.allFlags.mockReturnValue({
                [FeatureFlagKey.AiJourneyRcsEnable]: true,
            })
        }

        const setupConfigured = () => {
            mockUseAiJourneyStoreConfiguration.mockReturnValue({
                storeConfiguration: {},
                isLoading: false,
                error: null,
                isFetched: true,
                saveConfiguration: mockSaveConfiguration,
            })
        }

        it('renders the link card when impersonated and the RCS flag is on', () => {
            window.USER_IMPERSONATED = true
            enableRcsFlag()
            setupConfigured()

            renderComponent('internal')

            const link = screen.getByRole('link', {
                name: /Open RCS test send/i,
            })
            expect(link).toHaveAttribute(
                'href',
                expect.stringContaining('/rcs-test-send'),
            )
        })

        it('does not render the link card when the RCS flag is off', () => {
            window.USER_IMPERSONATED = true
            featureFlagsClientMock.allFlags.mockReturnValue({})
            setupConfigured()

            renderComponent('internal')

            expect(
                screen.queryByRole('link', { name: /Open RCS test send/i }),
            ).not.toBeInTheDocument()
        })
    })
})
