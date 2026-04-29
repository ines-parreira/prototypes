import { render } from '@repo/testing'
import { act, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { useAiJourneyStoreConfiguration } from 'AIJourney/hooks/useAiJourneyStoreConfiguration/useAiJourneyStoreConfiguration'
import { useJourneyContext } from 'AIJourney/providers'
import useAppDispatch from 'hooks/useAppDispatch'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'

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

jest.mock('hooks/useAppDispatch', () => ({
    __esModule: true,
    default: jest.fn(),
}))

jest.mock('state/notifications/actions', () => ({
    notify: jest.fn(),
}))

jest.mock('pages/common/components/FormUnsavedChangesPrompt', () => ({
    __esModule: true,
    default: () => null,
}))

const mockNotify = notify as jest.Mock

if (typeof Element.prototype.getAnimations === 'undefined') {
    Element.prototype.getAnimations = function () {
        return []
    }
}

const mockUseJourneyContext = useJourneyContext as jest.Mock
const mockUseAiJourneyStoreConfiguration =
    useAiJourneyStoreConfiguration as jest.Mock
const mockUseAppDispatch = useAppDispatch as jest.Mock

const mockSaveConfiguration = jest.fn()
const mockDispatch = jest.fn()

const renderComponent = () => render(<Settings />)

describe('<Settings />', () => {
    beforeEach(() => {
        jest.clearAllMocks()

        mockUseJourneyContext.mockReturnValue({
            currentIntegration: { id: 42 },
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

        mockUseAppDispatch.mockReturnValue(mockDispatch)
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
                    klaviyo_api_key: null,
                    quiet_hours_start: null,
                    quiet_hours_end: null,
                })
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

        it('should dispatch a success notification when save succeeds', async () => {
            mockSaveConfiguration.mockResolvedValue(undefined)
            const user = userEvent.setup()
            renderComponent()

            await user.type(screen.getByLabelText('Brand name'), 'My Store')

            await act(async () => {
                await user.click(screen.getByRole('button', { name: 'Save' }))
            })

            await waitFor(() => {
                expect(mockNotify).toHaveBeenCalledWith({
                    message: 'Settings saved successfully.',
                    status: NotificationStatus.Success,
                })
            })
        })

        it('should dispatch an error notification when save fails', async () => {
            mockSaveConfiguration.mockRejectedValue(new Error('Network error'))
            const user = userEvent.setup()
            renderComponent()

            await user.type(screen.getByLabelText('Brand name'), 'My Store')

            await act(async () => {
                await user.click(screen.getByRole('button', { name: 'Save' }))
            })

            await waitFor(() => {
                expect(mockNotify).toHaveBeenCalledWith({
                    message: 'Error saving settings. Please try again.',
                    status: NotificationStatus.Error,
                })
            })
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
})
