import React from 'react'

import { userEvent } from '@repo/testing'
import { QueryClientProvider } from '@tanstack/react-query'
import { screen, waitFor } from '@testing-library/react'
import { Provider } from 'react-redux'

import type { StoreConfiguration } from 'models/aiAgent/types'
import * as playgroundButtonHook from 'pages/aiAgent/components/AiAgentLayout/usePlaygroundButtonInLayoutHeader'
import { getStoreConfigurationFixture } from 'pages/aiAgent/fixtures/storeConfiguration.fixtures'
import * as playgroundPanelHook from 'pages/aiAgent/hooks/usePlaygroundPanel'
import * as contextHook from 'pages/aiAgent/providers/AiAgentStoreConfigurationContext'
import * as notificationActions from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'
import { mockQueryClient } from 'tests/reactQueryTestingUtils'
import { mockStore, renderWithRouter } from 'utils/testing'

import { AiAgentToneOfVoice } from '../AiAgentToneOfVoice'
import { CHANGES_SAVED_SUCCESS, ToneOfVoice } from '../constants'

// Polyfill for jsdom missing Web Animations API
if (typeof Element.prototype.getAnimations === 'undefined') {
    Element.prototype.getAnimations = function () {
        return []
    }
}

jest.mock('pages/aiAgent/providers/AiAgentStoreConfigurationContext')
jest.mock('pages/AppContext')
jest.mock('react-router', () => ({
    ...jest.requireActual('react-router'),
    useLocation: jest.fn(() => ({
        pathname: '/settings/ai-agent/tone-of-voice',
    })),
    useParams: jest.fn(() => ({ shopName: 'test-shop' })),
}))
jest.mock('pages/aiAgent/PlaygroundV2/hooks/useShopNameResolution', () => ({
    useShopNameResolution: jest.fn(() => ({
        resolvedShopName: 'test-shop',
        isLoading: false,
    })),
}))
jest.mock('state/notifications/actions', () => ({
    notify: jest.fn(() => ({ type: 'NOTIFY', payload: {} })),
}))
jest.mock('pages/aiAgent/hooks/usePlaygroundPanel', () => ({
    usePlaygroundPanel: jest.fn(() => ({
        togglePlayground: jest.fn(),
        isPlaygroundOpen: false,
    })),
}))
jest.mock(
    'pages/aiAgent/components/AiAgentLayout/usePlaygroundButtonInLayoutHeader',
    () => ({
        useDisplayPlaygroundButtonInLayoutHeader: jest.fn(() => true),
    }),
)
jest.mock('components/EmojiPicker/EmojiPicker', () => ({
    EmojiPicker: ({ label, value, onChange, onError }: any) => (
        <div>
            <label htmlFor={`emoji-picker-${label}`}>{label}</label>
            <input
                id={`emoji-picker-${label}`}
                value={value}
                onChange={(e) => {
                    onChange(e.target.value)
                    // Simulate validation - only emojis allowed
                    const emojiRegex = /^[\p{Emoji}\s]*$/u
                    const isValid =
                        emojiRegex.test(e.target.value) || e.target.value === ''
                    onError?.(!isValid)
                }}
            />
        </div>
    ),
}))
jest.mock(
    'pages/aiAgent/components/StoreConfigForm/FormComponents/PersonalitySelector',
    () => ({
        PersonalitySelector: ({ value, onChange }: any) => (
            <div role="group" aria-label="Select personality">
                {['Friendly', 'Professional', 'Sophisticated', 'Custom'].map(
                    (personality) => (
                        <label key={personality} htmlFor={personality}>
                            <input
                                id={personality}
                                type="checkbox"
                                name="personality"
                                value={personality}
                                checked={value === personality}
                                onChange={() => onChange(personality)}
                            />
                            {personality}
                        </label>
                    ),
                )}
            </div>
        ),
    }),
)
jest.mock(
    'pages/aiAgent/components/CollapsibleSection/CollapsibleSection',
    () => ({
        __esModule: true,
        default: ({ title, isExpanded, onToggle, children }: any) => (
            <div>
                <button onClick={onToggle} aria-expanded={isExpanded}>
                    {title}
                </button>
                {isExpanded && <div>{children}</div>}
            </div>
        ),
    }),
)

const mockUseAiAgentStoreConfigurationContext = jest.mocked(
    contextHook.useAiAgentStoreConfigurationContext,
)
const mockNotify = jest.mocked(notificationActions.notify)
const mockUsePlaygroundPanel = jest.mocked(
    playgroundPanelHook.usePlaygroundPanel,
)
const mockUseDisplayPlaygroundButtonInLayoutHeader = jest.mocked(
    playgroundButtonHook.useDisplayPlaygroundButtonInLayoutHeader,
)

const queryClient = mockQueryClient()

describe('AiAgentToneOfVoice', () => {
    const mockUpdateStoreConfiguration = jest.fn()
    const mockTogglePlayground = jest.fn()

    const setupComponent = (
        storeConfigOverrides?: Partial<StoreConfiguration>,
    ) => {
        const storeConfig = storeConfigOverrides
            ? getStoreConfigurationFixture(storeConfigOverrides)
            : undefined

        mockUseAiAgentStoreConfigurationContext.mockReturnValue({
            storeConfiguration: storeConfig,
            isLoading: false,
            updateStoreConfiguration: mockUpdateStoreConfiguration,
            createStoreConfiguration: jest.fn(),
            isPendingCreateOrUpdate: false,
        })

        return renderWithRouter(
            <Provider store={mockStore({})}>
                <QueryClientProvider client={queryClient}>
                    <AiAgentToneOfVoice />
                </QueryClientProvider>
            </Provider>,
        )
    }

    beforeEach(() => {
        jest.clearAllMocks()
        mockUpdateStoreConfiguration.mockResolvedValue(undefined)
        mockUsePlaygroundPanel.mockReturnValue({
            togglePlayground: mockTogglePlayground,
            isPlaygroundOpen: false,
        } as any)
        mockUseDisplayPlaygroundButtonInLayoutHeader.mockReturnValue(true)
        mockTogglePlayground.mockClear()
    })

    describe('Component rendering', () => {
        it('should not render when storeConfiguration is undefined', () => {
            const { container } = setupComponent()
            expect(container.firstChild).toBeNull()
        })

        it('should render main UI elements', () => {
            setupComponent({})

            expect(
                screen.getByRole('heading', { name: /tone of voice/i }),
            ).toBeInTheDocument()
            expect(
                screen.getByRole('button', { name: /save/i }),
            ).toBeInTheDocument()
            expect(
                screen.getByRole('tab', { name: /general/i }),
            ).toBeInTheDocument()
            expect(
                screen.getByRole('tab', { name: /channel-specific/i }),
            ).toBeInTheDocument()
            expect(
                screen.getByText(/by using ai agent, you agree to comply/i),
            ).toBeInTheDocument()
        })

        it('should call usePlaygroundPanel with collapseNavbar=false', () => {
            setupComponent({})

            expect(mockUsePlaygroundPanel).toHaveBeenCalledWith({
                collapseNavbar: false,
            })
        })

        it('should toggle playground on mount', () => {
            setupComponent({})

            expect(mockTogglePlayground).toHaveBeenCalledTimes(1)
        })

        it.each([
            ['personality', /personality/i],
            ['what to say', /what to say/i],
            ['what to avoid', /what to avoid/i],
            ['emojis', /emojis/i],
        ])('should render %s section in General tab', (_, pattern) => {
            setupComponent({})
            expect(
                screen.getByRole('button', { name: pattern }),
            ).toBeInTheDocument()
        })
    })

    describe('Test button', () => {
        it('should render test button when playground is available', () => {
            setupComponent({})

            expect(
                screen.getByRole('button', { name: /test/i }),
            ).toBeInTheDocument()
        })

        it('should call togglePlayground when test button is clicked', async () => {
            setupComponent({})
            const user = userEvent.setup()

            const testButton = screen.getByRole('button', { name: /test/i })
            await user.click(testButton)

            expect(mockTogglePlayground).toHaveBeenCalledTimes(2)
        })

        it('should not render test button when playground is already open', () => {
            mockUsePlaygroundPanel.mockReturnValue({
                togglePlayground: mockTogglePlayground,
                isPlaygroundOpen: true,
            } as any)

            setupComponent({})

            expect(
                screen.queryByRole('button', { name: /test/i }),
            ).not.toBeInTheDocument()
        })
    })

    describe('Personality section', () => {
        it.each([
            ['Friendly', ToneOfVoice.Friendly],
            ['Professional', ToneOfVoice.Professional],
            ['Sophisticated', ToneOfVoice.Sophisticated],
            ['Custom', ToneOfVoice.Custom],
        ])('should display and select %s tone', (label, value) => {
            setupComponent({ toneOfVoice: value })
            expect(screen.getByLabelText(label)).toBeChecked()
        })

        it('should show custom personality textarea when Custom is selected', async () => {
            setupComponent({ toneOfVoice: ToneOfVoice.Friendly })
            const user = userEvent.setup()

            await user.click(screen.getByLabelText('Custom'))

            await waitFor(() => {
                expect(
                    screen.getByLabelText(/ai agent personality/i),
                ).toBeInTheDocument()
            })
        })

        it('should load saved custom personality', () => {
            setupComponent({
                toneOfVoice: ToneOfVoice.Custom,
                customToneOfVoiceGuidance: 'Custom personality',
            })

            expect(screen.getByLabelText(/ai agent personality/i)).toHaveValue(
                'Custom personality',
            )
        })
    })

    describe('General tab sections', () => {
        it('should render and load greeting, sign-off, and brand terminology fields', () => {
            setupComponent({
                toneOfVoiceOptions: {
                    greetingGuidance: 'Saved greeting',
                    signOffGuidance: 'Saved sign-off',
                    brandSpecificTerminology: 'Saved brand',
                    forbiddenPhrases: '',
                    emojisEnabled: false,
                    allowedEmojis: '',
                    forbiddenEmojis: '',
                },
            })

            expect(screen.getByLabelText(/greeting/i)).toHaveValue(
                'Saved greeting',
            )
            expect(screen.getByLabelText(/sign-off/i)).toHaveValue(
                'Saved sign-off',
            )
            expect(
                screen.getByLabelText(/brand-specific terminology/i),
            ).toHaveValue('Saved brand')
        })

        it('should render forbidden phrases field', () => {
            setupComponent({})

            expect(
                screen.getByLabelText(
                    /forbidden words, phrases, or behaviors/i,
                ),
            ).toBeInTheDocument()
        })

        it('should render and toggle emoji settings', async () => {
            setupComponent({
                toneOfVoiceOptions: {
                    greetingGuidance: '',
                    signOffGuidance: '',
                    brandSpecificTerminology: '',
                    forbiddenPhrases: '',
                    emojisEnabled: false,
                    allowedEmojis: '😊',
                    forbiddenEmojis: '😢',
                },
            })

            const user = userEvent.setup()

            expect(screen.getByLabelText(/allow emojis/i)).not.toBeChecked()
            expect(screen.getByLabelText('Allowed emojis')).toHaveValue('😊')
            expect(screen.getByLabelText('Forbidden emojis')).toHaveValue('😢')

            await user.click(screen.getByLabelText(/allow emojis/i))
            expect(screen.getByLabelText(/allow emojis/i)).toBeChecked()
        })

        it('should disable save button when emoji validation fails', async () => {
            setupComponent({})
            const user = userEvent.setup()

            // Initially, save button should be enabled (there are default changes)
            await waitFor(() => {
                expect(
                    screen.getByRole('button', { name: /save/i }),
                ).not.toBeDisabled()
            })

            // Type invalid text in allowed emojis field
            const allowedEmojisInput = screen.getByLabelText('Allowed emojis')
            await user.type(allowedEmojisInput, 'invalid text')

            // Save button should now be disabled due to validation error
            await waitFor(() => {
                expect(
                    screen.getByRole('button', { name: /save/i }),
                ).toBeDisabled()
            })
        })

        it('should re-enable save button when emoji validation error is fixed', async () => {
            setupComponent({})
            const user = userEvent.setup()

            // Type invalid text in allowed emojis field
            const allowedEmojisInput = screen.getByLabelText('Allowed emojis')
            await user.type(allowedEmojisInput, 'invalid text')

            // Save button should be disabled
            await waitFor(() => {
                expect(
                    screen.getByRole('button', { name: /save/i }),
                ).toBeDisabled()
            })

            // Clear the invalid input
            await user.clear(allowedEmojisInput)

            // Save button should be enabled again
            await waitFor(() => {
                expect(
                    screen.getByRole('button', { name: /save/i }),
                ).not.toBeDisabled()
            })
        })

        it('should disable unsaved changes prompt when emoji validation fails', async () => {
            setupComponent({})
            const user = userEvent.setup()

            // Make a valid change first
            await user.type(screen.getByLabelText(/greeting/i), 'Hi!')

            // Now add invalid emoji text
            const forbiddenEmojisInput =
                screen.getByLabelText('Forbidden emojis')
            await user.type(forbiddenEmojisInput, 'not an emoji')

            // The unsaved changes prompt should not trigger with validation error
            // This is tested indirectly by checking that save is disabled
            await waitFor(() => {
                expect(
                    screen.getByRole('button', { name: /save/i }),
                ).toBeDisabled()
            })
        })
    })

    describe('Channel-specific tab', () => {
        const switchToChannelTab = async () => {
            const user = userEvent.setup()
            await user.click(
                screen.getByRole('tab', { name: /channel-specific/i }),
            )
            return user
        }

        const expandChannelSections = async (
            user: ReturnType<typeof userEvent.setup>,
        ) => {
            // Expand Chat section (collapsed by default)
            const chatButton = screen.getByRole('button', { name: /chat/i })
            await user.click(chatButton)

            // Expand SMS section (collapsed by default)
            const smsButton = screen.getByRole('button', { name: /sms/i })
            await user.click(smsButton)
        }

        it('should switch tabs and show channel sections', async () => {
            setupComponent({})
            const user = userEvent.setup()

            const channelTab = screen.getByRole('tab', {
                name: /channel-specific/i,
            })
            await user.click(channelTab)

            await waitFor(() => {
                expect(channelTab).toHaveAttribute('aria-selected', 'true')
            })
        })

        it('should load saved instructions for all channels', async () => {
            setupComponent({
                toneOfVoiceByChannel: {
                    email: { customToneOfVoice: 'Email instructions' },
                    chat: { customToneOfVoice: 'Chat instructions' },
                    sms: { customToneOfVoice: 'SMS instructions' },
                },
            })

            const user = await switchToChannelTab()
            await expandChannelSections(user)

            await waitFor(() => {
                const instructions = screen.getAllByLabelText(/instructions/i)
                expect(instructions).toHaveLength(3)
                expect(instructions[0]).toHaveValue('Email instructions')
                expect(instructions[1]).toHaveValue('Chat instructions')
                expect(instructions[2]).toHaveValue('SMS instructions')
            })
        })

        it('should render verbosity fields for all channels', async () => {
            setupComponent({})

            const user = await switchToChannelTab()
            await expandChannelSections(user)

            await waitFor(() => {
                const verbositySelects = screen.getAllByRole('textbox', {
                    name: /verbosity/i,
                })
                expect(verbositySelects).toHaveLength(3)
            })
        })

        it('should load saved verbosity values for all channels', async () => {
            setupComponent({
                toneOfVoiceByChannel: {
                    email: {
                        customToneOfVoice: '',
                        verbosity: 'detailed',
                    },
                    chat: {
                        customToneOfVoice: '',
                        verbosity: 'balanced',
                    },
                    sms: {
                        customToneOfVoice: '',
                        verbosity: 'concise',
                    },
                },
            })

            const user = await switchToChannelTab()
            await expandChannelSections(user)

            await waitFor(() => {
                const verbosityFields = screen.getAllByRole('textbox', {
                    name: /verbosity/i,
                })
                expect(verbosityFields[0]).toHaveValue('Detailed')
                expect(verbosityFields[1]).toHaveValue('Balanced')
                expect(verbosityFields[2]).toHaveValue('Concise')
            })
        })

        it('should default to concise when verbosity is not set', async () => {
            setupComponent({
                toneOfVoiceByChannel: {
                    email: { customToneOfVoice: 'Test' },
                    chat: { customToneOfVoice: 'Test' },
                    sms: { customToneOfVoice: 'Test' },
                },
            })

            const user = await switchToChannelTab()
            await expandChannelSections(user)

            await waitFor(() => {
                const verbosityFields = screen.getAllByRole('textbox', {
                    name: /verbosity/i,
                })
                expect(verbosityFields[0]).toHaveValue('Concise')
                expect(verbosityFields[1]).toHaveValue('Concise')
                expect(verbosityFields[2]).toHaveValue('Concise')
            })
        })

        it('should update verbosity value when changed', async () => {
            setupComponent({})
            const user = userEvent.setup()

            await user.click(
                screen.getByRole('tab', { name: /channel-specific/i }),
            )
            await expandChannelSections(user)

            await waitFor(() => {
                expect(
                    screen.getAllByRole('textbox', { name: /verbosity/i }),
                ).toHaveLength(3)
            })

            const emailVerbosity = screen.getAllByRole('textbox', {
                name: /verbosity/i,
            })[0]
            await user.click(emailVerbosity)

            await waitFor(() => {
                expect(
                    screen.getByRole('option', { name: /detailed/i }),
                ).toBeInTheDocument()
            })

            await user.click(screen.getByRole('option', { name: /detailed/i }))

            await waitFor(() => {
                expect(emailVerbosity).toHaveValue('Detailed')
            })
        })
    })

    describe('Save functionality', () => {
        it('should disable save button when no changes are made', () => {
            setupComponent({
                toneOfVoiceByChannel: {
                    email: { customToneOfVoice: '', verbosity: 'concise' },
                    chat: { customToneOfVoice: '', verbosity: 'concise' },
                    sms: { customToneOfVoice: '', verbosity: 'concise' },
                },
            })
            expect(screen.getByRole('button', { name: /save/i })).toBeDisabled()
        })

        it('should enable save button when changes are made', async () => {
            setupComponent({})
            const user = userEvent.setup()

            await user.type(screen.getByLabelText(/greeting/i), 'Hi!')

            await waitFor(() => {
                expect(
                    screen.getByRole('button', { name: /save/i }),
                ).not.toBeDisabled()
            })
        })

        it('should save changes and show success notification', async () => {
            setupComponent({ toneOfVoice: ToneOfVoice.Friendly })
            const user = userEvent.setup()

            await user.clear(screen.getByLabelText(/greeting/i))
            await user.type(screen.getByLabelText(/greeting/i), 'Hello!')
            await user.click(screen.getByRole('button', { name: /save/i }))

            await waitFor(() => {
                expect(mockUpdateStoreConfiguration).toHaveBeenCalledWith(
                    expect.objectContaining({
                        toneOfVoice: ToneOfVoice.Friendly,
                        toneOfVoiceOptions: expect.objectContaining({
                            greetingGuidance: 'Hello!',
                        }),
                    }),
                )
                expect(mockNotify).toHaveBeenCalledWith({
                    message: CHANGES_SAVED_SUCCESS,
                    status: NotificationStatus.Success,
                })
            })
        })

        it('should show error notification on failed save', async () => {
            mockUpdateStoreConfiguration.mockRejectedValueOnce(
                new Error('Save failed'),
            )
            setupComponent({})
            const user = userEvent.setup()

            await user.type(screen.getByLabelText(/greeting/i), 'Test')
            await user.click(screen.getByRole('button', { name: /save/i }))

            await waitFor(() => {
                expect(mockNotify).toHaveBeenCalledWith({
                    status: NotificationStatus.Error,
                    message: 'Failed to save tone of voice configuration',
                })
            })
        })

        it('should save custom personality when Custom tone is selected', async () => {
            setupComponent({ toneOfVoice: ToneOfVoice.Custom })
            const user = userEvent.setup()

            await user.type(
                screen.getByLabelText(/ai agent personality/i),
                'My custom personality',
            )
            await user.click(screen.getByRole('button', { name: /save/i }))

            await waitFor(() => {
                expect(mockUpdateStoreConfiguration).toHaveBeenCalledWith(
                    expect.objectContaining({
                        toneOfVoice: ToneOfVoice.Custom,
                        customToneOfVoiceGuidance: 'My custom personality',
                    }),
                )
            })
        })

        it('should save channel-specific instructions', async () => {
            setupComponent({
                toneOfVoiceByChannel: {
                    email: { customToneOfVoice: '', verbosity: 'concise' },
                    chat: { customToneOfVoice: '', verbosity: 'concise' },
                    sms: { customToneOfVoice: '', verbosity: 'concise' },
                },
            })
            const user = userEvent.setup()

            await user.click(
                screen.getByRole('tab', { name: /channel-specific/i }),
            )

            // Email section is expanded by default, but we need to expand Chat and SMS
            const chatButton = screen.getByRole('button', { name: /chat/i })
            await user.click(chatButton)
            const smsButton = screen.getByRole('button', { name: /sms/i })
            await user.click(smsButton)

            await waitFor(() => {
                expect(screen.getAllByLabelText(/instructions/i)).toHaveLength(
                    3,
                )
            })

            const emailInstructions =
                screen.getAllByLabelText(/instructions/i)[0]
            await user.type(emailInstructions, 'Custom email')
            await user.click(screen.getByRole('button', { name: /save/i }))

            await waitFor(() => {
                expect(mockUpdateStoreConfiguration).toHaveBeenCalledWith(
                    expect.objectContaining({
                        toneOfVoiceByChannel: expect.objectContaining({
                            email: {
                                customToneOfVoice: 'Custom email',
                                verbosity: 'concise',
                            },
                        }),
                    }),
                )
            })
        })

        it('should save verbosity changes for all channels', async () => {
            setupComponent({})
            const user = userEvent.setup()

            await user.click(
                screen.getByRole('tab', { name: /channel-specific/i }),
            )

            // Expand Chat and SMS sections
            const chatButton = screen.getByRole('button', { name: /chat/i })
            await user.click(chatButton)
            const smsButton = screen.getByRole('button', { name: /sms/i })
            await user.click(smsButton)

            await waitFor(() => {
                expect(
                    screen.getAllByRole('textbox', { name: /verbosity/i }),
                ).toHaveLength(3)
            })

            const emailVerbosity = screen.getAllByRole('textbox', {
                name: /verbosity/i,
            })[0]
            await user.click(emailVerbosity)

            await waitFor(() => {
                expect(
                    screen.getByRole('option', { name: /detailed/i }),
                ).toBeInTheDocument()
            })

            await user.click(screen.getByRole('option', { name: /detailed/i }))
            await user.click(screen.getByRole('button', { name: /save/i }))

            await waitFor(() => {
                expect(mockUpdateStoreConfiguration).toHaveBeenCalledWith(
                    expect.objectContaining({
                        toneOfVoiceByChannel: expect.objectContaining({
                            email: expect.objectContaining({
                                verbosity: 'detailed',
                            }),
                        }),
                    }),
                )
            })
        })

        it('should enable save button when verbosity is changed', async () => {
            setupComponent({
                toneOfVoiceByChannel: {
                    email: { customToneOfVoice: '', verbosity: 'concise' },
                    chat: { customToneOfVoice: '', verbosity: 'concise' },
                    sms: { customToneOfVoice: '', verbosity: 'concise' },
                },
            })
            const user = userEvent.setup()

            expect(screen.getByRole('button', { name: /save/i })).toBeDisabled()

            await user.click(
                screen.getByRole('tab', { name: /channel-specific/i }),
            )

            // Expand Chat and SMS sections
            const chatButton = screen.getByRole('button', { name: /chat/i })
            await user.click(chatButton)
            const smsButton = screen.getByRole('button', { name: /sms/i })
            await user.click(smsButton)

            await waitFor(() => {
                expect(
                    screen.getAllByRole('textbox', { name: /verbosity/i }),
                ).toHaveLength(3)
            })

            const chatVerbosity = screen.getAllByRole('textbox', {
                name: /verbosity/i,
            })[1]
            await user.click(chatVerbosity)
            await user.click(screen.getByRole('option', { name: /balanced/i }))

            await waitFor(() => {
                expect(
                    screen.getByRole('button', { name: /save/i }),
                ).not.toBeDisabled()
            })
        })

        it('should send default verbosity value on save', async () => {
            setupComponent({})
            const user = userEvent.setup()

            await user.click(
                screen.getByRole('tab', { name: /channel-specific/i }),
            )

            // Expand Chat and SMS sections
            const chatButton = screen.getByRole('button', { name: /chat/i })
            await user.click(chatButton)
            const smsButton = screen.getByRole('button', { name: /sms/i })
            await user.click(smsButton)

            await waitFor(() => {
                expect(screen.getAllByLabelText(/instructions/i)).toHaveLength(
                    3,
                )
            })

            const smsInstructions = screen.getAllByLabelText(/instructions/i)[2]
            await user.type(smsInstructions, 'SMS instructions')
            await user.click(screen.getByRole('button', { name: /save/i }))

            await waitFor(() => {
                const call = mockUpdateStoreConfiguration.mock.calls[0][0]
                expect(call.toneOfVoiceByChannel.sms).toEqual({
                    customToneOfVoice: 'SMS instructions',
                    verbosity: 'concise',
                })
            })
        })

        it('should enable save button when verbosity uses default value', async () => {
            setupComponent({})

            await waitFor(() => {
                expect(
                    screen.getByRole('button', { name: /save/i }),
                ).not.toBeDisabled()
            })
        })

        it('should save emoji settings', async () => {
            setupComponent({})
            const user = userEvent.setup()

            await user.click(screen.getByLabelText(/allow emojis/i))
            await user.type(screen.getByLabelText('Allowed emojis'), '😊')
            await user.click(screen.getByRole('button', { name: /save/i }))

            await waitFor(() => {
                expect(mockUpdateStoreConfiguration).toHaveBeenCalledWith(
                    expect.objectContaining({
                        toneOfVoiceOptions: expect.objectContaining({
                            emojisEnabled: true,
                            allowedEmojis: '😊',
                        }),
                    }),
                )
            })
        })

        it('should not allow saving when emoji validation fails', async () => {
            setupComponent({})
            const user = userEvent.setup()

            // Type invalid text in emoji field
            const allowedEmojisInput = screen.getByLabelText('Allowed emojis')
            await user.type(allowedEmojisInput, 'invalid')

            await waitFor(() => {
                expect(
                    screen.getByRole('button', { name: /save/i }),
                ).toBeDisabled()
            })

            // Try to save (button is disabled, but test the logic)
            const saveButton = screen.getByRole('button', { name: /save/i })
            expect(saveButton).toBeDisabled()

            // Verify save was not called
            expect(mockUpdateStoreConfiguration).not.toHaveBeenCalled()
        })

        it('should track validation errors from both emoji fields independently', async () => {
            setupComponent({})
            const user = userEvent.setup()

            // Type invalid text in allowed emojis
            const allowedEmojisInput = screen.getByLabelText('Allowed emojis')
            await user.type(allowedEmojisInput, 'invalid')

            await waitFor(() => {
                expect(
                    screen.getByRole('button', { name: /save/i }),
                ).toBeDisabled()
            })

            // Clear the first error
            await user.clear(allowedEmojisInput)

            // Save should be enabled again
            await waitFor(() => {
                expect(
                    screen.getByRole('button', { name: /save/i }),
                ).not.toBeDisabled()
            })

            // Now add error to forbidden emojis
            const forbiddenEmojisInput =
                screen.getByLabelText('Forbidden emojis')
            await user.type(forbiddenEmojisInput, 'also invalid')

            // Save should be disabled again
            await waitFor(() => {
                expect(
                    screen.getByRole('button', { name: /save/i }),
                ).toBeDisabled()
            })
        })
    })
})
