import { QueryClientProvider } from '@tanstack/react-query'
import { act, fireEvent, render, waitFor, within } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { Provider } from 'react-redux'
import { MemoryRouter } from 'react-router'
import { Store } from 'redux'

import {
    mockGetCurrentUserHandler,
    mockUpdateCurrentUserHandler,
    mockUpdateCurrentUserSettingsHandler,
} from '@gorgias/helpdesk-mocks'

import { appQueryClient } from 'api/queryClient'
import { UserRole } from 'config/types/user'
import { useFlag } from 'core/flags'
import { ThemeProvider } from 'core/theme'
import {
    DateFormattingSetting,
    TimeFormattingSetting,
} from 'models/agents/types'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'
import { userEvent } from 'utils/testing/userEvent'

import { CurrentUser } from '../types'
import YourProfileContainer from '../YourProfileContainer'

const server = setupServer()

const profilePictureUrl = 'https://config.gorgias.io/production/blabla'

const preferences = {
    id: 1,
    type: 'preferences',
    data: {
        available: true,
        date_format: 'en_GB',
        time_format: '24-hour',
        prefill_best_macro: false,
        show_macros: false,
        show_macros_suggestions: true,
        'language-preferences': {
            primary: 'en',
            proficient: [],
        },
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
        settings: [preferences],
    } as CurrentUser['data']),
)

const localHandlers = [
    mockGetCurrentUser.handler,
    mockUpdateCurrentUserSettings.handler,
    mockUpdateCurrentUser.handler,
    mockUploadFile,
]

beforeAll(() => {
    server.listen({ onUnhandledRequest: 'error' })
})

beforeEach(() => {
    server.use(...localHandlers)
})

afterEach(() => {
    server.resetHandlers()
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

jest.mock('core/flags', () => ({
    useFlag: jest.fn(),
}))
const mockUseFlag = useFlag as jest.Mock

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

describe('Your profile page', () => {
    const realDateNow = Date.now.bind(global.Date)
    beforeEach(() => {
        global.Date.now = jest.fn(() => 1587000000000)
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
    })

    describe('Date and time settings section', () => {
        it('should render timezone select', async () => {
            const { getAllByLabelText, getAllByRole, getByText } =
                renderComponent()

            await waitFor(() => {
                expect(getByText('Your profile')).toBeInTheDocument()
            })

            const [timezone] = getAllByLabelText(/Timezone/)
            act(() => {
                userEvent.click(timezone)
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
            jest.spyOn(Storage.prototype, 'getItem').mockReturnValue('"light"')
            const setThemeSpy = jest.fn()

            jest.spyOn(require('core/theme'), 'useSetTheme').mockReturnValue(
                setThemeSpy,
            )

            const { getByLabelText, getByText } = renderComponent()

            await waitFor(() => {
                expect(getByText('Your profile')).toBeInTheDocument()
            })

            act(() => {
                userEvent.click(getByLabelText(/Dark/i))
            })

            await waitFor(() => {
                expect(setThemeSpy).toHaveBeenCalledWith('dark')
            })
        })

        it('should render macro display', async () => {
            const { handler } = mockGetCurrentUserHandler(async () =>
                HttpResponse.json({
                    ...mockGetCurrentUser.data,
                    settings: [preferences],
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

        it('should expand to show the phone number field when enabling call forwarding', async () => {
            const { getByLabelText, getByText } = renderComponent()

            await waitFor(() => {
                expect(getByText('Your profile')).toBeInTheDocument()
            })

            expect(getByLabelText(/forwarding_phone_number/)).toBeDisabled()
            act(() => {
                userEvent.click(getByLabelText(/Enable call forwarding/i))
            })
            expect(getByLabelText(/forwarding_phone_number/)).toBeEnabled()
        })
    })

    describe('Form submission section', () => {
        it('should submit user data', async () => {
            const { handler } = mockGetCurrentUserHandler(async () =>
                HttpResponse.json({
                    ...mockGetCurrentUser.data,
                    settings: [
                        {
                            ...preferences,
                            data: { ...preferences.data, time_format: 'AM/PM' },
                        },
                    ],
                } as CurrentUser['data']),
            )
            server.use(handler)

            const { getByRole, getByText } = renderComponent()

            await waitFor(() => {
                expect(getByText('Your profile')).toBeInTheDocument()
            })

            act(() => {
                userEvent.click(
                    getByRole('radio', {
                        name: '24-hour',
                    }),
                )

                userEvent.click(getByRole('button', { name: 'Save Changes' }))
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

        it('should submit user data and update user preferences because date format and time format preferences were changed', async () => {
            const { handler } = mockGetCurrentUserHandler(async () =>
                HttpResponse.json({
                    ...mockGetCurrentUser.data,
                    settings: [
                        {
                            ...preferences,
                            data: {
                                ...preferences.data,
                                date_format: 'en_US',
                                time_format: 'AM/PM',
                            },
                        },
                    ],
                } as CurrentUser['data']),
            )
            server.use(handler)
            const { getByLabelText, getByText } = renderComponent()

            await waitFor(() => {
                expect(getByText('Your profile')).toBeInTheDocument()
            })

            act(() => {
                userEvent.click(
                    getByLabelText(DateFormattingSetting.en_GB.label), // en_GB
                )
                userEvent.click(getByLabelText(TimeFormattingSetting[0])) // 24-hour

                userEvent.click(getByText('Save Changes'))
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
            const waitForUpdateCurrentUserRequest =
                mockUpdateCurrentUser.waitForRequest(server)

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
            const { handler } = mockGetCurrentUserHandler(async () =>
                HttpResponse.json({
                    ...mockGetCurrentUser.data,
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
                await act(() => {
                    userEvent.click(removePictureButton)
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

    describe('Conversation settings section', () => {
        it('should not display the conversation settings section when the feature flag is disabled', async () => {
            mockUseFlag.mockImplementation(() => false)

            const { getByText, queryByText } = renderComponent()

            await waitFor(() => {
                expect(getByText('Your profile')).toBeInTheDocument()
            })

            expect(queryByText('Conversation settings')).not.toBeInTheDocument()
        })
        it('should display the conversation settings without the user primary language when he has none', async () => {
            mockUseFlag.mockImplementation(() => true)
            const { handler } = mockGetCurrentUserHandler(async () =>
                HttpResponse.json({
                    ...mockGetCurrentUser.data,
                    settings: [
                        {
                            ...preferences,
                            data: {
                                ...preferences.data,
                                'language-preferences': {
                                    primary: undefined,
                                    proficient: [],
                                },
                            },
                        },
                    ],
                } as unknown as CurrentUser['data']),
            )
            server.use(handler)

            const { getByText, getByTestId, getAllByText } = renderComponent()

            await waitFor(() => {
                expect(getByText('Your profile')).toBeInTheDocument()
            })

            expect(
                getByTestId('default-translation-language'),
            ).toContainElement(getAllByText('English')[0])
        })
        it('should display the conversation settings with the user primary language when he has one', async () => {
            mockUseFlag.mockImplementation(() => true)

            const { getByText, getByTestId, getAllByText } = renderComponent()

            await waitFor(() => {
                expect(getByText('Your profile')).toBeInTheDocument()
            })

            expect(
                getByTestId('default-translation-language'),
            ).toContainElement(getAllByText('English')[0])
        })

        it('should display the conversation settings with the user proficient languages when he has some', async () => {
            mockUseFlag.mockImplementation(() => true)
            const { handler } = mockGetCurrentUserHandler(async () =>
                HttpResponse.json({
                    ...mockGetCurrentUser.data,
                    settings: [
                        {
                            ...preferences,
                            data: {
                                ...preferences.data,
                                'language-preferences': {
                                    primary: 'en',
                                    proficient: ['fr'],
                                },
                            },
                        },
                    ],
                } as unknown as CurrentUser['data']),
            )
            server.use(handler)

            const { getByText, getByTestId, getAllByText } = renderComponent()

            await waitFor(() => {
                expect(getByText('Your profile')).toBeInTheDocument()
            })

            expect(getByTestId('proficient-languages')).toContainElement(
                getAllByText('English')[1],
            )
            expect(getByTestId('proficient-languages')).toContainElement(
                getAllByText('French')[0],
            )
        })
        it('should allow the user to update the Conversation settings', async () => {
            mockUseFlag.mockImplementation(() => true)

            const waitForUpdateCurrentUserSettingsRequest =
                mockUpdateCurrentUserSettings.waitForRequest(server)

            const { getByText, getAllByText, getByLabelText } =
                renderComponent()

            await waitFor(() => {
                expect(getByText('Your profile')).toBeInTheDocument()
            })

            act(() => {
                userEvent.click(getByLabelText(/Languages you know/i))
                userEvent.click(getAllByText(/French/i)[0])
            })

            act(() => {
                userEvent.click(getByText('Save Changes'))
            })

            await waitForUpdateCurrentUserSettingsRequest(async (request) => {
                const body = await request.json()
                expect(body).toEqual({
                    type: 'preferences',
                    data: {
                        ...preferences.data,
                        'language-preferences': {
                            primary: 'en',
                            proficient: ['fr'],
                        },
                    },
                })
            })
        })
    })
})
