import type { ComponentProps } from 'react'

import { appQueryClient } from '@repo/api-resources'
import { useFlag } from '@repo/feature-flags'
import { render, userEvent } from '@repo/testing'
import { QueryClientProvider } from '@tanstack/react-query'
import { act, fireEvent, screen, waitFor, within } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { Provider } from 'react-redux'
import { MemoryRouter } from 'react-router-dom'
import type { Store } from 'redux'

import {
    mockGetCurrentUserHandler,
    mockUpdateCurrentUserHandler,
    mockUpdateCurrentUserSettingsHandler,
} from '@gorgias/helpdesk-mocks'

import { UserRole } from 'config/types/user'
import { LANGUAGE } from 'constants/languages'
import { ThemeProvider } from 'core/theme'
import { createMockStandaloneAiAccess } from 'fixtures/standaloneAiAccess'
import { useStandaloneAiContext } from 'providers/standalone-ai/StandaloneAiContext'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'

import { YourProfileView } from '../components/YourProfileView'
import * as useYourProfileFormModule from '../hooks/useYourProfileForm'
import * as useYourProfileMutationsModule from '../hooks/useYourProfileMutations'
import type { CurrentUser } from '../types'
import YourProfileContainer from '../YourProfileContainer'

const server = setupServer()

const profilePictureUrl = 'https://config.gorgias.io/production/blabla'

const settingsPreferences = {
    id: 1,
    type: 'preferences',
    data: {
        available: true,
        date_format: 'en_GB',
        time_format: '24-hour',
        prefill_best_macro: false,
        show_macros: false,
        show_macros_suggestions: true,
    },
}

const languagePreferences = {
    id: 1,
    type: 'language-preferences',
    data: {
        primary: 'en',
        proficient: [],
        enabled: true,
    },
}

const mockUploadFile = http.post('http://localhost/api/upload/', () =>
    HttpResponse.json([
        {
            content_type: 'image/png',
            name: 'profile-picture.png',
            size: 194283,
            url: profilePictureUrl,
        },
    ]),
)
const mockUpdateCurrentUserSettings = mockUpdateCurrentUserSettingsHandler()
const mockUpdateCurrentUser = mockUpdateCurrentUserHandler()
const mockGetCurrentUser = mockGetCurrentUserHandler(async ({ data }) =>
    HttpResponse.json({
        ...data,
        settings: [settingsPreferences, languagePreferences],
    } as CurrentUser['data']),
)

const localHandlers = [
    mockGetCurrentUser.handler,
    mockUpdateCurrentUserSettings.handler,
    mockUpdateCurrentUser.handler,
    mockUploadFile,
]

beforeAll(() => {
    server.listen({ onUnhandledRequest: 'warn' })
})

beforeEach(() => {
    server.use(...localHandlers)
})

afterEach(() => {
    server.resetHandlers()
    appQueryClient.clear()
})

afterAll(() => {
    server.close()
})
jest.mock('moment-timezone', () => {
    const Timezones = {
        UTC: 'UTC',
        EST: 'EST',
    }
    const tz = (timezone: string) => ({
        utcOffset: () => (timezone === Timezones.UTC ? '+0' : '+1'),
        format: () => (timezone === Timezones.UTC ? '+0' : '+1'),
    })
    tz.names = () => Object.values(Timezones)
    return {
        tz,
    }
})

jest.mock('@repo/feature-flags', () => ({
    ...jest.requireActual('@repo/feature-flags'),
    useFlag: jest.fn(),
    useHelpdeskV2WayfindingMS1Flag: jest.fn().mockReturnValue(false),
}))
const mockUseFlag = useFlag as jest.Mock

jest.mock('providers/standalone-ai/StandaloneAiContext', () => ({
    useStandaloneAiContext: jest.fn(),
}))
const mockUseStandaloneAiContext = jest.mocked(useStandaloneAiContext)

jest.mock('state/notifications/actions')

const mockNotify = notify as jest.MockedFunction<typeof notify>

const mocksStore = {
    getState: () => ({}),
    dispatch: jest.fn(),
    subscribe: jest.fn(),
    replaceReducer: jest.fn(),
} as unknown as Store

const renderComponent = () => {
    return render(
        <MemoryRouter>
            <Provider store={mocksStore}>
                <QueryClientProvider client={appQueryClient}>
                    <ThemeProvider>
                        <YourProfileContainer />
                    </ThemeProvider>
                </QueryClientProvider>
            </Provider>
        </MemoryRouter>,
    )
}

const renderViewComponent = (
    props: Partial<ComponentProps<typeof YourProfileView>> = {},
) => {
    return render(
        <MemoryRouter>
            <Provider store={mocksStore}>
                <QueryClientProvider client={appQueryClient}>
                    <ThemeProvider>
                        <YourProfileView
                            currentUser={mockGetCurrentUser.data}
                            settingsPreferences={settingsPreferences as any}
                            languagePreferences={languagePreferences as any}
                            isGorgiasAgent={false}
                            {...props}
                        />
                    </ThemeProvider>
                </QueryClientProvider>
            </Provider>
        </MemoryRouter>,
    )
}

type MockProfileFormState = ReturnType<
    typeof useYourProfileFormModule.useYourProfileForm
>
type MockProfileFormValues = MockProfileFormState['formValues']
type MockProfileBaseFormValues = Omit<MockProfileFormValues, 'preferences'>
type MockProfilePreferences = MockProfileFormValues['preferences']

const createBaseProfileFormValues = (): MockProfileBaseFormValues => ({
    id: mockGetCurrentUser.data.id,
    name: mockGetCurrentUser.data.name ?? '',
    email: mockGetCurrentUser.data.email ?? '',
    bio: mockGetCurrentUser.data.bio ?? '',
    timezone: (mockGetCurrentUser.data.timezone ??
        'UTC') as MockProfileFormValues['timezone'],
    language: (mockGetCurrentUser.data.language ??
        LANGUAGE.EN_US) as MockProfileFormValues['language'],
    meta: {
        profile_picture_url: null,
    },
    password_confirmation: '',
})

const createBaseProfilePreferences = (): MockProfilePreferences => ({
    available: settingsPreferences.data.available,
    date_format: settingsPreferences.data
        .date_format as MockProfilePreferences['date_format'],
    time_format: settingsPreferences.data
        .time_format as MockProfilePreferences['time_format'],
    prefill_best_macro: settingsPreferences.data.prefill_best_macro,
    show_macros: settingsPreferences.data.show_macros,
    show_macros_suggestions: settingsPreferences.data.show_macros_suggestions,
    primary: 'en',
    proficient: [],
    enabled: false,
    forward_calls: false,
    forwarding_phone_number: '',
    forward_when_offline: false,
    hide_tips: false,
    macros_default_to_search_popover: false,
})

const createMockProfileFormState = (
    overrides: Partial<MockProfileFormState> = {},
): MockProfileFormState => ({
    isFormDirty: false,
    setIsFormDirty: jest.fn(),
    isLoading: false,
    setIsLoading: jest.fn(),
    formValues: {
        ...createBaseProfileFormValues(),
        preferences: createBaseProfilePreferences(),
    },
    setFormValues: jest.fn(),
    defaultFormValues: {
        ...createBaseProfileFormValues(),
        preferences: createBaseProfilePreferences(),
    },
    handleInputChange: jest.fn(),
    handlePreferenceChange: jest.fn(),
    handlePrimaryLanguageChange: jest.fn(),
    handleProficientLanguagesChange: jest.fn(),
    handleProficientLanguagesInputChange: jest.fn(),
    proficientLanguagesOptions: [],
    ...overrides,
})

describe('Your profile page', () => {
    const realDateNow = Date.now.bind(global.Date)
    beforeEach(() => {
        jest.clearAllMocks()

        global.Date.now = jest.fn(() => 1587000000000)
        mockUseFlag.mockReturnValue(false)
        mockUseStandaloneAiContext.mockReturnValue(
            createMockStandaloneAiAccess(),
        )
        Object.defineProperty(window, 'matchMedia', {
            value: jest.fn(() => {
                return {
                    matches: false,
                }
            }),
            writable: true,
        })
    })

    afterEach(() => {
        global.Date.now = realDateNow
        jest.restoreAllMocks()
    })

    describe('Personal informations section', () => {
        it('should render the profile page with correct values', async () => {
            const { getByText, getByRole } = renderComponent()

            await waitFor(() => {
                expect(getByText('Your profile')).toBeInTheDocument()
            })

            expect(getByRole('textbox', { name: /Your name/ })).toHaveValue(
                mockGetCurrentUser.data.name,
            )
            expect(getByRole('textbox', { name: /Your email/ })).toHaveValue(
                mockGetCurrentUser.data.email,
            )
            expect(getByRole('textbox', { name: /Your bio/ })).toHaveValue(
                mockGetCurrentUser.data.bio,
            )
        })

        it('should correctly disable inputs for a Gorgias agent', async () => {
            const { handler } = mockGetCurrentUserHandler(async () =>
                HttpResponse.json({
                    ...mockGetCurrentUser.data,
                    role: {
                        name: UserRole.GorgiasAgent,
                    },
                }),
            )
            server.use(handler)

            const { getByRole, getByText } = renderComponent()

            await waitFor(() => {
                expect(getByText('Your profile')).toBeInTheDocument()
                expect(
                    getByRole('textbox', { name: /Your name/ }),
                ).toBeDisabled()
                expect(
                    getByRole('textbox', { name: /Your email/ }),
                ).toBeDisabled()
                expect(
                    getByRole('textbox', { name: /Your bio/ }),
                ).toBeDisabled()
            })
        })

        it('should allow the user to update their name and bio', async () => {
            const user = userEvent.setup()
            const localMockUpdateCurrentUser = mockUpdateCurrentUserHandler()
            server.use(localMockUpdateCurrentUser.handler)
            const waitForUpdateCurrentUserRequest =
                localMockUpdateCurrentUser.waitForRequest(server)

            const { getByRole, getByText } = renderComponent()

            await waitFor(() => {
                expect(getByText('Your profile')).toBeInTheDocument()
            })

            await act(async () => {
                // Update the name field
                const nameField = getByRole('textbox', { name: /Your name/ })
                fireEvent.change(nameField, { target: { value: 'Jane Smith' } })

                // Update the bio field
                const bioField = getByRole('textbox', { name: /Your bio/ })
                fireEvent.change(bioField, {
                    target: {
                        value: 'Senior Customer Success Manager with 5 years of experience',
                    },
                })
            })

            await act(async () => {
                await user.click(getByRole('button', { name: 'Save Changes' }))
            })

            await waitForUpdateCurrentUserRequest(async (request) => {
                const body = await request.json()
                expect(body).toEqual({
                    name: 'Jane Smith',
                    bio: 'Senior Customer Success Manager with 5 years of experience',
                    email: localMockUpdateCurrentUser.data.email,
                    timezone: localMockUpdateCurrentUser.data.timezone,
                    password_confirmation: '',
                })
            })
        })
    })

    describe('Date and time settings section', () => {
        it('should render timezone select', async () => {
            const user = userEvent.setup()
            const { getAllByLabelText, getAllByRole, getByText } =
                renderComponent()

            await waitFor(() => {
                expect(getByText('Your profile')).toBeInTheDocument()
            })

            const [timezone] = getAllByLabelText(/Timezone/)
            await act(async () => {
                await user.click(timezone)
            })
            const options = getAllByRole('option')
            expect(options).toHaveLength(2)

            const [utcOption, estOption] = options as HTMLOptionElement[]

            expect(utcOption).toHaveTextContent('(UTC+0) UTC')
            expect(utcOption).toHaveAttribute('aria-selected', 'true')
            expect(estOption).toHaveTextContent('(UTC+1) EST')
            expect(estOption).toHaveAttribute('aria-selected', 'false')
        })

        it('should render date format', async () => {
            const { getByText } = renderComponent()

            await waitFor(() => {
                expect(getByText('Your profile')).toBeInTheDocument()
            })

            const legend = getByText('Date format')
            const fieldset = legend.closest('fieldset')!
            const radios = within(fieldset).getAllByRole('radio')
            expect(radios).toHaveLength(2)

            expect(
                within(fieldset).getByLabelText('Day/Month/Year'),
            ).toHaveAttribute('checked')
            expect(
                within(fieldset).getByLabelText('Month/Day/Year'),
            ).not.toHaveAttribute('checked')
        })

        it('should render time format', async () => {
            const { getByText } = renderComponent()
            await waitFor(() => {
                expect(getByText('Your profile')).toBeInTheDocument()
            })

            const legend = getByText('Time format')
            const fieldset = legend.closest('fieldset')!
            const radios = within(fieldset).getAllByRole('radio')
            expect(radios).toHaveLength(2)

            expect(within(fieldset).getByLabelText('24-hour')).toHaveAttribute(
                'checked',
            )
            expect(
                within(fieldset).getByLabelText('AM/PM'),
            ).not.toHaveAttribute('checked')
        })
    })

    describe('Account preferences section', () => {
        it('should render macro display', async () => {
            const { handler } = mockGetCurrentUserHandler(async ({ data }) =>
                HttpResponse.json({
                    ...data,
                    settings: [settingsPreferences],
                } as CurrentUser['data']),
            )
            server.use(handler)

            const { getByLabelText, getByText } = renderComponent()

            await waitFor(() => {
                expect(getByText('Your profile')).toBeInTheDocument()
                expect(getByLabelText(/Macro prediction/)).not.toBeChecked()
                expect(getByLabelText(/Macro suggestions/)).toBeChecked()
                expect(
                    getByLabelText(/Display macro search view by default/),
                ).not.toBeChecked()
            })
        })

        it('should default macro toggles to unchecked when preferences are missing', async () => {
            const useYourProfileFormSpy = jest
                .spyOn(useYourProfileFormModule, 'useYourProfileForm')
                .mockReturnValue(
                    createMockProfileFormState({
                        formValues: {
                            ...createBaseProfileFormValues(),
                            preferences: undefined as any,
                        },
                        defaultFormValues: {
                            ...createBaseProfileFormValues(),
                            preferences: undefined as any,
                        },
                    }) as ReturnType<
                        typeof useYourProfileFormModule.useYourProfileForm
                    >,
                )
            const useYourProfileMutationsSpy = jest
                .spyOn(useYourProfileMutationsModule, 'useYourProfileMutations')
                .mockReturnValue({
                    handleLanguagePreferenceSubmit: jest.fn(),
                    handleSettingsPreferenceSubmit: jest.fn(),
                    handleUserInfoSubmit: jest.fn(),
                })

            renderViewComponent({
                settingsPreferences: undefined,
                languagePreferences: undefined,
            })

            expect(
                await screen.findByLabelText(/Macro prediction/),
            ).not.toBeChecked()
            expect(screen.getByLabelText(/Macro suggestions/)).not.toBeChecked()
            expect(
                screen.getByLabelText(/Display macro search view by default/),
            ).not.toBeChecked()

            useYourProfileFormSpy.mockRestore()
            useYourProfileMutationsSpy.mockRestore()
        })

        it('should call handlePreferenceChange for each macro toggle', async () => {
            const user = userEvent.setup()
            const handlePreferenceChange = jest.fn()
            jest.spyOn(
                useYourProfileFormModule,
                'useYourProfileForm',
            ).mockReturnValue(
                createMockProfileFormState({
                    handlePreferenceChange,
                }) as ReturnType<
                    typeof useYourProfileFormModule.useYourProfileForm
                >,
            )
            jest.spyOn(
                useYourProfileMutationsModule,
                'useYourProfileMutations',
            ).mockReturnValue({
                handleLanguagePreferenceSubmit: jest.fn(),
                handleSettingsPreferenceSubmit: jest.fn(),
                handleUserInfoSubmit: jest.fn(),
            })

            renderViewComponent()

            await user.click(await screen.findByText('Macro prediction'))
            await user.click(screen.getByText('Macro suggestions'))
            await user.click(
                screen.getByText('Display macro search view by default'),
            )

            expect(handlePreferenceChange).toHaveBeenCalledWith(
                'prefill_best_macro',
                true,
            )
            expect(handlePreferenceChange).toHaveBeenCalledWith(
                'show_macros_suggestions',
                false,
            )
            expect(handlePreferenceChange).toHaveBeenCalledWith(
                'show_macros',
                true,
            )
        })

        it('should update macro display preferences', async () => {
            const user = userEvent.setup()
            const { handler } = mockGetCurrentUserHandler(async ({ data }) =>
                HttpResponse.json({
                    ...data,
                    settings: [settingsPreferences],
                } as CurrentUser['data']),
            )
            const localMockUpdateCurrentUserSettings =
                mockUpdateCurrentUserSettingsHandler()

            server.use(handler, localMockUpdateCurrentUserSettings.handler)

            const waitForUpdateCurrentUserSettingsRequest =
                localMockUpdateCurrentUserSettings.waitForRequest(server)

            const { getByLabelText, getByRole, getByText } = renderComponent()

            await waitFor(() => {
                expect(getByText('Your profile')).toBeInTheDocument()
            })

            const macroPredictionToggle = getByLabelText(/Macro prediction/)
            const macroSuggestionsToggle = getByLabelText(/Macro suggestions/)
            const showMacrosToggle = getByLabelText(
                /Display macro search view by default/,
            )

            expect(macroPredictionToggle).not.toBeChecked()
            expect(macroSuggestionsToggle).toBeChecked()
            expect(showMacrosToggle).not.toBeChecked()

            await user.click(getByText('Macro prediction'))
            await user.click(getByText('Macro suggestions'))
            await user.click(getByText('Display macro search view by default'))

            expect(macroPredictionToggle).toBeChecked()
            expect(macroSuggestionsToggle).not.toBeChecked()
            expect(showMacrosToggle).toBeChecked()

            await user.click(getByRole('button', { name: 'Save Changes' }))

            await waitForUpdateCurrentUserSettingsRequest(async (request) => {
                const body = await request.json()

                expect(body).toEqual({
                    type: settingsPreferences.type,
                    data: expect.objectContaining({
                        available: settingsPreferences.data.available,
                        date_format: settingsPreferences.data.date_format,
                        time_format: settingsPreferences.data.time_format,
                        prefill_best_macro: true,
                        show_macros: true,
                        show_macros_suggestions: false,
                    }),
                })
            })
        })

        it('should expand to show the phone number field when enabling call forwarding', async () => {
            const { getByLabelText, getByText } = renderComponent()

            await waitFor(() => {
                expect(getByText('Your profile')).toBeInTheDocument()
            })

            expect(getByLabelText(/forwarding_phone_number/)).toBeDisabled()
            act(() => {
                userEvent.click(getByLabelText(/Enable call forwarding/i))
            })
            await waitFor(() => {
                expect(getByLabelText(/forwarding_phone_number/)).toBeEnabled()
            })
        })

        it('should hide macro display and call forwarding preferences for standalone AI agents', async () => {
            mockUseStandaloneAiContext.mockReturnValue(
                createMockStandaloneAiAccess({
                    isStandaloneAiAgent: true,
                }),
            )

            const { getByText, queryByLabelText, queryByText } =
                renderComponent()

            await waitFor(() => {
                expect(getByText('Your profile')).toBeInTheDocument()
            })

            expect(getByText('Account preferences')).toBeInTheDocument()
            expect(queryByText('Macro display')).not.toBeInTheDocument()
            expect(
                queryByLabelText(/Display macro search view by default/),
            ).not.toBeInTheDocument()
            expect(queryByLabelText(/Macro prediction/)).not.toBeInTheDocument()
            expect(
                queryByLabelText(/Macro suggestions/),
            ).not.toBeInTheDocument()
            expect(
                queryByText('Forward calls to an external number'),
            ).not.toBeInTheDocument()
            expect(
                queryByText('Enable call forwarding'),
            ).not.toBeInTheDocument()
        })
    })

    describe('Form submission section', () => {
        it('should submit user data', async () => {
            const user = userEvent.setup()
            const { handler } = mockGetCurrentUserHandler(async ({ data }) =>
                HttpResponse.json({
                    ...data,
                    settings: [
                        {
                            ...settingsPreferences,
                            data: {
                                ...settingsPreferences.data,
                                time_format: 'AM/PM',
                            },
                        },
                    ],
                } as CurrentUser['data']),
            )
            server.use(handler)

            const { getByRole, getByText } = renderComponent()

            await waitFor(() => {
                expect(getByText('Your profile')).toBeInTheDocument()
            })

            await act(async () => {
                await user.click(
                    getByRole('radio', {
                        name: '24-hour',
                    }),
                )

                await user.click(getByRole('button', { name: 'Save Changes' }))
            })

            await waitFor(() => {
                expect(mockNotify).toHaveBeenCalledWith({
                    status: NotificationStatus.Success,
                    message: 'User successfully updated',
                })
            })
        })

        it('should submit user data and reset the password confirmation field because the email field was marked as changed', async () => {
            const { getByRole, findByLabelText, getByText } = renderComponent()

            await waitFor(() => {
                expect(getByText('Your profile')).toBeInTheDocument()
            })

            act(() => {
                userEvent.type(
                    getByRole('textbox', {
                        name: 'Your email required',
                    }),
                    'alex@gorgias.com',
                )
            })

            const passwordField = await findByLabelText(
                /Password confirmation/i,
            )

            act(() => {
                userEvent.type(passwordField, 'a-password')
                userEvent.click(getByRole('button', { name: 'Save Changes' }))
            })

            await waitFor(() => {
                expect(mockNotify).toHaveBeenCalledWith({
                    status: NotificationStatus.Success,
                    message: 'User successfully updated',
                })
            })
        })
    })

    describe('Profile picture saving', () => {
        it('should save profile picture', async () => {
            const { getByLabelText, getByText } = renderComponent()
            const localMockUpdateCurrentUser = mockUpdateCurrentUserHandler()
            server.use(localMockUpdateCurrentUser.handler)
            const waitForUpdateCurrentUserRequest =
                localMockUpdateCurrentUser.waitForRequest(server)

            await waitFor(() => {
                expect(getByText('Your profile')).toBeInTheDocument()
            })

            const fileInput = getByLabelText('profile-picture-input')

            fireEvent.change(fileInput)

            await waitForUpdateCurrentUserRequest(async (request) => {
                const body = await request.json()
                expect(body).toEqual({
                    meta: {
                        profile_picture_url: profilePictureUrl,
                    },
                })
            })
        })

        it('should remove profile picture', async () => {
            const user = userEvent.setup()
            const { handler } = mockGetCurrentUserHandler(async ({ data }) =>
                HttpResponse.json({
                    ...data,
                    meta: {
                        profile_picture_url: profilePictureUrl,
                    },
                } as CurrentUser['data']),
            )

            server.use(handler)
            const waitForUpdateCurrentUserRequest =
                mockUpdateCurrentUser.waitForRequest(server)
            const { getByText } = renderComponent()

            await waitFor(() => {
                expect(getByText('Your profile')).toBeInTheDocument()
            })

            await waitFor(async () => {
                const removePictureButton = getByText('Remove Picture')
                await act(async () => {
                    await user.click(removePictureButton)
                })
            })

            await waitForUpdateCurrentUserRequest(async (request) => {
                const body = await request.json()
                expect(body).toEqual({
                    meta: {
                        profile_picture_url: null,
                    },
                })
            })
        })
    })

    describe('Translation settings section', () => {
        it('should not display the translation settings section when the feature flag is disabled', async () => {
            mockUseFlag.mockImplementation(() => false)

            const { getByText, queryByText } = renderComponent()

            await waitFor(() => {
                expect(getByText('Your profile')).toBeInTheDocument()
            })

            expect(
                queryByText('Ticket translation settings'),
            ).not.toBeInTheDocument()
        })
        it('should display the translation settings without the user primary language when he has none', async () => {
            mockUseFlag.mockImplementation(() => true)
            const { handler } = mockGetCurrentUserHandler(async ({ data }) =>
                HttpResponse.json({
                    ...data,
                    settings: [settingsPreferences],
                } as unknown as CurrentUser['data']),
            )
            server.use(handler)

            const { getByText } = renderComponent()

            await waitFor(() => {
                expect(getByText('Your profile')).toBeInTheDocument()
            })

            expect(
                getByText('Default translation language'),
            ).toBeInTheDocument()
        })
        it('should display the translation settings with the user primary language when he has one', async () => {
            mockUseFlag.mockImplementation(() => true)

            const { getByText } = renderComponent()

            await waitFor(() => {
                expect(getByText('Your profile')).toBeInTheDocument()
            })

            expect(
                getByText('Default translation language'),
            ).toBeInTheDocument()
        })

        it('should display the translation settings with the user proficient languages when he has some', async () => {
            mockUseFlag.mockImplementation(() => true)
            const { handler } = mockGetCurrentUserHandler(async ({ data }) =>
                HttpResponse.json({
                    ...data,
                    settings: [
                        settingsPreferences,
                        {
                            ...languagePreferences,
                            data: {
                                primary: 'en',
                                proficient: ['fr'],
                                enabled: true,
                            },
                        },
                    ],
                } as unknown as CurrentUser['data']),
            )
            server.use(handler)

            const { getByText, getByLabelText, getAllByText } =
                renderComponent()

            await waitFor(() => {
                expect(getByText('Your profile')).toBeInTheDocument()
            })

            expect(getByLabelText(/Languages you know/i)).toBeInTheDocument()

            const englishElements = getAllByText('English')
            const frenchElements = getAllByText('French')

            expect(englishElements.length).toBeGreaterThan(0)
            expect(frenchElements.length).toBeGreaterThan(0)
        })
        it('should allow the user to update the Translation settings', async () => {
            const user = userEvent.setup()
            mockUseFlag.mockImplementation(() => true)
            const { handler } = mockGetCurrentUserHandler(async ({ data }) =>
                HttpResponse.json({
                    ...data,
                    settings: [
                        settingsPreferences,
                        {
                            ...languagePreferences,
                            data: {
                                primary: 'en',
                                proficient: ['fr'],
                                enabled: true,
                            },
                        },
                    ],
                } as unknown as CurrentUser['data']),
            )
            server.use(handler)

            const { getByText, getAllByText, getByLabelText } =
                renderComponent()

            await waitFor(() => {
                expect(getByText('Your profile')).toBeInTheDocument()
            })

            await act(async () => {
                await user.click(getByLabelText(/Languages you know/i))
                await user.click(getAllByText(/French/i)[0])
            })

            await act(async () => {
                await user.click(getByText('Save Changes'))
            })

            await waitFor(() => {
                expect(mockNotify).toHaveBeenCalledWith({
                    status: NotificationStatus.Success,
                    message: 'User successfully updated',
                })
            })
        })

        it('should allow the user to change their primary language', async () => {
            const user = userEvent.setup()
            mockUseFlag.mockImplementation(() => true)
            const { handler } = mockGetCurrentUserHandler(async ({ data }) =>
                HttpResponse.json({
                    ...data,
                    settings: [
                        settingsPreferences,
                        {
                            ...languagePreferences,
                            data: {
                                primary: 'en',
                                proficient: ['fr'],
                                enabled: true,
                            },
                        },
                    ],
                } as unknown as CurrentUser['data']),
            )
            server.use(handler)

            const { getByText, getByTestId, getAllByRole } = renderComponent()

            await waitFor(() => {
                expect(getByText('Your profile')).toBeInTheDocument()
            })

            const primaryLanguageContainer = getByTestId(
                'default-translation-language',
            )
            const dropdownTrigger =
                primaryLanguageContainer.querySelector('[role="combobox"]')
            expect(dropdownTrigger).toBeInTheDocument()

            await act(async () => {
                await user.click(dropdownTrigger!)
            })

            const options = getAllByRole('option')
            const frenchOption = options.find((option) =>
                option.textContent?.includes('French'),
            )
            expect(frenchOption).toBeInTheDocument()

            await act(async () => {
                await user.click(frenchOption!)
            })

            await act(async () => {
                await user.click(getByText('Save Changes'))
            })

            await waitFor(() => {
                expect(mockNotify).toHaveBeenCalledWith({
                    status: NotificationStatus.Success,
                    message: 'User successfully updated',
                })
            })
        })

        it('should allow the user to add multiple proficient languages', async () => {
            const user = userEvent.setup()
            mockUseFlag.mockImplementation(() => true)
            const { handler } = mockGetCurrentUserHandler(async ({ data }) =>
                HttpResponse.json({
                    ...data,
                    settings: [
                        settingsPreferences,
                        {
                            ...languagePreferences,
                            data: {
                                primary: 'en',
                                proficient: ['fr'],
                                enabled: true,
                            },
                        },
                    ],
                } as unknown as CurrentUser['data']),
            )
            server.use(handler)

            const { getByText, getByLabelText, getAllByText } =
                renderComponent()

            await waitFor(() => {
                expect(getByText('Your profile')).toBeInTheDocument()
            })

            await act(async () => {
                await user.click(getByLabelText(/Languages you know/i))
            })

            await act(async () => {
                await user.click(getAllByText(/Spanish/i)[0])
            })

            await act(async () => {
                await user.click(getByText('Save Changes'))
            })
        })

        describe('Translation toggle and field states', () => {
            it('should render toggle unchecked and disable fields when translations are disabled', async () => {
                mockUseFlag.mockImplementation(() => true)
                server.resetHandlers()
                server.use(
                    http.get('http://localhost/api/users/:id', () =>
                        HttpResponse.json({
                            ...mockGetCurrentUser.data,
                            settings: [
                                settingsPreferences,
                                {
                                    id: 1,
                                    type: 'language-preferences',
                                    data: {
                                        primary: 'en',
                                        proficient: ['fr'],
                                        enabled: false,
                                    },
                                },
                            ],
                        } as unknown as CurrentUser['data']),
                    ),
                    mockUpdateCurrentUserSettings.handler,
                    mockUpdateCurrentUser.handler,
                    mockUploadFile,
                )

                const { getByText, getByLabelText } = renderComponent()

                await waitFor(() => {
                    expect(getByText('Your profile')).toBeInTheDocument()
                })

                const toggle = getByLabelText(/Enable ticket translations/i)
                expect(toggle).toBeInTheDocument()
                expect(toggle).not.toBeChecked()

                const proficientLanguagesInput =
                    getByLabelText(/Languages you know/i)
                expect(proficientLanguagesInput).toBeDisabled()
            })

            it('should render toggle checked and enable fields when translations are enabled', async () => {
                mockUseFlag.mockImplementation(() => true)
                server.resetHandlers()
                server.use(
                    http.get('http://localhost/api/users/:id', () =>
                        HttpResponse.json({
                            ...mockGetCurrentUser.data,
                            settings: [
                                settingsPreferences,
                                {
                                    id: 1,
                                    type: 'language-preferences',
                                    data: {
                                        primary: 'en',
                                        proficient: [],
                                        enabled: true,
                                    },
                                },
                            ],
                        } as unknown as CurrentUser['data']),
                    ),
                    mockUpdateCurrentUserSettings.handler,
                    mockUpdateCurrentUser.handler,
                    mockUploadFile,
                )

                const { getByText, getByLabelText } = renderComponent()

                await waitFor(() => {
                    expect(getByText('Your profile')).toBeInTheDocument()
                })

                const toggle = getByLabelText(/Enable ticket translations/i)
                expect(toggle).toBeInTheDocument()
                expect(toggle).toBeChecked()

                const proficientLanguagesInput =
                    getByLabelText(/Languages you know/i)
                expect(proficientLanguagesInput).not.toBeDisabled()
            })
        })

        it('should filter proficient languages options based on search input', async () => {
            const user = userEvent.setup()
            mockUseFlag.mockImplementation(() => true)
            const { handler } = mockGetCurrentUserHandler(async ({ data }) =>
                HttpResponse.json({
                    ...data,
                    settings: [
                        settingsPreferences,
                        {
                            ...languagePreferences,
                            data: {
                                primary: 'en',
                                proficient: [],
                                enabled: true,
                            },
                        },
                    ],
                } as unknown as CurrentUser['data']),
            )
            server.use(handler)

            const { getByText, getByLabelText, getByPlaceholderText } =
                renderComponent()

            await waitFor(() => {
                expect(getByText('Your profile')).toBeInTheDocument()
            })

            await act(async () => {
                await user.click(getByLabelText(/Languages you know/i))
            })

            const searchInput = getByPlaceholderText(/Add Languages/i)

            await act(async () => {
                await user.type(searchInput, 'span')
            })

            expect(searchInput).toHaveValue('span')

            await act(async () => {
                await user.clear(searchInput)
                await user.type(searchInput, 'fren')
            })

            expect(searchInput).toHaveValue('fren')
        })

        it('should clear search input after selecting a proficient language', async () => {
            const user = userEvent.setup()
            mockUseFlag.mockImplementation(() => true)
            const { handler } = mockGetCurrentUserHandler(async ({ data }) =>
                HttpResponse.json({
                    ...data,
                    settings: [
                        settingsPreferences,
                        {
                            ...languagePreferences,
                            data: {
                                primary: 'en',
                                proficient: [],
                                enabled: true,
                            },
                        },
                    ],
                } as unknown as CurrentUser['data']),
            )
            server.use(handler)

            const { getByText, getByLabelText, getByPlaceholderText } =
                renderComponent()

            await waitFor(() => {
                expect(getByText('Your profile')).toBeInTheDocument()
            })

            await act(async () => {
                await user.click(getByLabelText(/Languages you know/i))
            })

            const searchInput = getByPlaceholderText(/Add Languages/i)
            await act(async () => {
                await user.type(searchInput, 'span')
            })

            await act(async () => {
                await user.click(getByText('Spanish'))
            })

            expect(searchInput).toHaveValue('')

            await act(async () => {
                await user.click(getByLabelText(/Languages you know/i))
            })

            await waitFor(() => {
                expect(getByText('French')).toBeInTheDocument()
                expect(getByText('Spanish')).toBeInTheDocument()
            })
        })
    })

    describe('Email change with password confirmation', () => {
        it('should show password confirmation field when email is changed', async () => {
            const user = userEvent.setup()
            const { getByRole, queryByLabelText, getByText } = renderComponent()

            await waitFor(() => {
                expect(getByText('Your profile')).toBeInTheDocument()
            })

            expect(
                queryByLabelText(/Password confirmation/i),
            ).not.toBeInTheDocument()

            const emailField = getByRole('textbox', { name: /Your email/ })
            await act(async () => {
                await user.clear(emailField)
                await user.type(emailField, 'newemail@example.com')
            })

            await waitFor(() => {
                expect(
                    queryByLabelText(/Password confirmation/i),
                ).toBeInTheDocument()
            })
        })

        it('should hide password confirmation field when email is reverted to original', async () => {
            const user = userEvent.setup()
            const { getByRole, queryByLabelText, getByText } = renderComponent()

            await waitFor(() => {
                expect(getByText('Your profile')).toBeInTheDocument()
            })

            const originalEmail = mockGetCurrentUser.data.email
            const emailField = getByRole('textbox', { name: /Your email/ })

            await act(async () => {
                await user.clear(emailField)
                await user.type(emailField, 'newemail@example.com')
            })

            await waitFor(() => {
                expect(
                    queryByLabelText(/Password confirmation/i),
                ).toBeInTheDocument()
            })

            await act(async () => {
                await user.clear(emailField)
                await user.type(emailField, originalEmail!)
            })

            await waitFor(() => {
                expect(
                    queryByLabelText(/Password confirmation/i),
                ).not.toBeInTheDocument()
            })
        })
    })

    describe('Theme selection', () => {
        it('should render theme select', async () => {
            const { getByLabelText, getByText } = renderComponent()

            await waitFor(() => {
                expect(getByText('Your profile')).toBeInTheDocument()
            })

            expect(getByLabelText(/System/)).not.toHaveAttribute('checked')
            expect(getByLabelText(/Dark/)).not.toHaveAttribute('checked')
            expect(getByLabelText(/Light/)).toHaveAttribute('checked')
            expect(getByLabelText(/Classic/)).not.toHaveAttribute('checked')
        })

        it('should change the existing theme', async () => {
            const user = userEvent.setup()
            jest.spyOn(Storage.prototype, 'getItem').mockReturnValue('"light"')
            const setThemeSpy = jest.fn()

            jest.spyOn(require('core/theme'), 'useSetTheme').mockReturnValue(
                setThemeSpy,
            )

            const { getByLabelText, getByText } = renderComponent()

            await waitFor(() => {
                expect(getByText('Your profile')).toBeInTheDocument()
            })

            await act(async () => {
                await user.click(getByLabelText(/Dark/i))
            })

            await waitFor(() => {
                expect(setThemeSpy).toHaveBeenCalledWith('dark')
            })
        })
        it('should display theme section based on feature flag', async () => {
            mockUseFlag.mockImplementation(
                (flag) => flag === 'messages-translations',
            )

            const { getByText, queryAllByText } = renderComponent()

            await waitFor(() => {
                expect(getByText('Your profile')).toBeInTheDocument()
            })

            const themeSections = queryAllByText('Theme')
            expect(themeSections).toHaveLength(1)
        })

        it('should display theme section when messages translations is disabled', async () => {
            mockUseFlag.mockImplementation(() => false)

            const { getByText, queryAllByText } = renderComponent()

            await waitFor(() => {
                expect(getByText('Your profile')).toBeInTheDocument()
            })

            const themeSections = queryAllByText('Theme')
            expect(themeSections).toHaveLength(1)
        })
    })
})
