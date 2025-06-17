import { ComponentProps } from 'react'

import {
    fireEvent,
    render,
    screen,
    waitFor,
    within,
} from '@testing-library/react'
import { fromJS, Map } from 'immutable'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { SelectField } from '@gorgias/merchant-ui-kit'

import { ThemeProvider } from 'core/theme'
import { user, userProfile } from 'fixtures/users'
import {
    DateFormattingSetting,
    TimeFormattingSetting,
} from 'models/agents/types'
import PhoneNumberInput from 'pages/common/forms/PhoneNumberInput/PhoneNumberInput'
import { YourProfileView } from 'pages/settings/yourProfile/components/YourProfileView'
import { userEvent } from 'utils/testing/userEvent'

// Write mocks for the submitSetting and updateCurrentUser actions
jest.mock('state/currentUser/actions', () => ({
    submitSetting: (data: any, isPublic: boolean) => (dispatch: any) => {
        dispatch({ type: 'SUBMIT_SETTING', payload: { data, isPublic } })
        return Promise.resolve()
    },
    updateCurrentUser: (data: any) => (dispatch: any) => {
        dispatch({ type: 'UPDATE_CURRENT_USER', payload: data })
        return Promise.resolve({})
    },
}))

const mockedStore = configureMockStore([thunk])
const minProps: ComponentProps<typeof YourProfileView> = {
    currentUser: fromJS(user),
    preferences: fromJS({
        data: {
            date_format: 'en_GB',
            time_format: '24-hour',
            show_macros: false,
            show_macros_suggestions: true,
        },
    }),
    isGorgiasAgent: false,
}

const TIMEZONES = ['UTC', 'EST']
jest.mock('moment-timezone', () => {
    const tz = (timezone: string) => ({
        utcOffset: () => (timezone === TIMEZONES[0] ? '+0' : '+1'),
        format: () => (timezone === TIMEZONES[0] ? '+0' : '+1'),
    })
    tz.names = () => TIMEZONES
    return {
        tz,
    }
})

jest.mock('@gorgias/merchant-ui-kit', () => {
    return {
        ...jest.requireActual('@gorgias/merchant-ui-kit'),
        SelectField: ({
            label,
            options,
            selectedOption,
            optionMapper,
        }: ComponentProps<typeof SelectField>) => (
            <label>
                {label}
                <select defaultValue={selectedOption as string}>
                    {(options as string[]).map((option) => (
                        <option key={option} value={option}>
                            {optionMapper!(option).value}
                        </option>
                    ))}
                </select>
            </label>
        ),
    } as Record<string, unknown>
})

jest.mock('pages/common/components/UnsavedChangesPrompt', () => () => null)
jest.mock(
    'pages/common/forms/PhoneNumberInput/PhoneNumberInput',
    () =>
        ({ value, disabled }: ComponentProps<typeof PhoneNumberInput>) => (
            <input
                type="text"
                value={value}
                data-testid="phone-input"
                disabled={disabled}
            />
        ),
)

jest.mock('pages/common/forms/FileField', () => {
    return ({ onChange }: { onChange: (url: string) => void }) => (
        <input
            type="file"
            data-testid="file-field"
            onChange={() =>
                onChange('https://config.gorgias.io/production/blabla')
            }
        />
    )
})

const defaultState = {}

describe('YourProfileView', () => {
    const realDateNow = Date.now.bind(global.Date)

    beforeEach(() => {
        jest.resetAllMocks()
        jest.clearAllMocks()
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
        jest.resetAllMocks()
        global.Date.now = realDateNow
    })

    describe('render', () => {
        describe('personal information section', () => {
            it('should render name input', () => {
                const { getByLabelText } = render(
                    <ThemeProvider>
                        <Provider store={mockedStore(defaultState)}>
                            <YourProfileView {...minProps} />
                        </Provider>
                    </ThemeProvider>,
                )
                const yourName = getByLabelText(/Your name/)

                expect(yourName).toHaveAttribute('placeholder', 'John Doe')
                expect(yourName).toHaveAttribute('name', 'name')
                expect(yourName).toHaveAttribute('type', 'text')
                expect(yourName).toHaveValue(user.name)
                expect(yourName).toBeRequired()
            })

            it('should render email input', () => {
                const { getByLabelText } = render(
                    <ThemeProvider>
                        <Provider store={mockedStore(defaultState)}>
                            <YourProfileView {...minProps} />
                        </Provider>
                    </ThemeProvider>,
                )
                const yourEmail = getByLabelText(/Your email/)

                expect(yourEmail).toHaveAttribute(
                    'placeholder',
                    'john.doe@acme.com',
                )
                expect(yourEmail).toHaveAttribute('name', 'email')
                expect(yourEmail).toHaveAttribute('type', 'email')
                expect(yourEmail).toHaveValue(user.email)
                expect(yourEmail).toBeRequired()
            })

            it('should render bio input', () => {
                const { getByLabelText } = render(
                    <ThemeProvider>
                        <Provider store={mockedStore(defaultState)}>
                            <YourProfileView {...minProps} />
                        </Provider>
                    </ThemeProvider>,
                )
                const yourBio = getByLabelText(/Your bio/)

                expect(yourBio).toHaveAttribute('name', 'bio')
                expect(yourBio).toHaveAttribute('type', 'text')
                expect(yourBio).toHaveValue(user.bio)
                expect(yourBio).not.toBeRequired()
                expect(yourBio).not.toBeDisabled()
            })

            it('should render bio input disabled for the Gorgias Support Agent', () => {
                const props: ComponentProps<typeof YourProfileView> = {
                    ...minProps,
                    isGorgiasAgent: true,
                }
                const { getByLabelText } = render(
                    <ThemeProvider>
                        <Provider store={mockedStore(defaultState)}>
                            <YourProfileView {...props} />
                        </Provider>
                    </ThemeProvider>,
                )
                const yourBio = getByLabelText(/Your bio/)

                expect(yourBio).toHaveAttribute('name', 'bio')
                expect(yourBio).toHaveAttribute('type', 'text')
                expect(yourBio).toHaveValue(user.bio)
                expect(yourBio).not.toBeRequired()
                expect(yourBio).toBeDisabled()
            })
        })

        describe('date and time settings', () => {
            it('should render timezone select', () => {
                const { getByLabelText } = render(
                    <ThemeProvider>
                        <Provider store={mockedStore(defaultState)}>
                            <YourProfileView {...minProps} />
                        </Provider>
                    </ThemeProvider>,
                )
                const timezone = getByLabelText(/Timezone/)
                const options = within(timezone).getAllByRole('option')
                expect(options).toHaveLength(2)

                const [utcOption, estOption] = options as HTMLOptionElement[]
                expect(utcOption).toHaveTextContent('(UTC+0) UTC')
                expect(utcOption.selected).toBe(false)
                expect(estOption).toHaveTextContent('(UTC+1) EST')
                expect(estOption.selected).toBe(true)
            })

            it('should render timezone select for the Gorgias Support Agent', () => {
                const props: ComponentProps<typeof YourProfileView> = {
                    ...minProps,
                    isGorgiasAgent: true,
                }
                const { getByLabelText } = render(
                    <ThemeProvider>
                        <Provider store={mockedStore(defaultState)}>
                            <YourProfileView {...props} />
                        </Provider>
                    </ThemeProvider>,
                )
                const timezone = getByLabelText(/Timezone/)
                const options = within(timezone).getAllByRole('option')
                expect(options).toHaveLength(2)

                const [utcOption, estOption] = options as HTMLOptionElement[]
                expect(utcOption).toHaveTextContent('(UTC+0) UTC')
                expect(utcOption.selected).toBe(false)
                expect(estOption).toHaveTextContent('(UTC+1) EST')
                expect(estOption.selected).toBe(true)
            })

            it('should render date format', () => {
                const { getByText } = render(
                    <ThemeProvider>
                        <Provider store={mockedStore(defaultState)}>
                            <YourProfileView {...minProps} />
                        </Provider>
                    </ThemeProvider>,
                )
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

            it('should render time format', () => {
                const { getByText } = render(
                    <ThemeProvider>
                        <Provider store={mockedStore(defaultState)}>
                            <YourProfileView {...minProps} />
                        </Provider>
                    </ThemeProvider>,
                )
                const legend = getByText('Time format')
                const fieldset = legend.closest('fieldset')!
                const radios = within(fieldset).getAllByRole('radio')
                expect(radios).toHaveLength(2)

                expect(
                    within(fieldset).getByLabelText('24-hour'),
                ).toHaveAttribute('checked')
                expect(
                    within(fieldset).getByLabelText('AM/PM'),
                ).not.toHaveAttribute('checked')
            })
        })

        describe('account preferences', () => {
            it('should render theme select', () => {
                const { getByLabelText } = render(
                    <ThemeProvider>
                        <Provider store={mockedStore(defaultState)}>
                            <YourProfileView {...minProps} />
                        </Provider>
                    </ThemeProvider>,
                )

                expect(getByLabelText(/System/)).not.toHaveAttribute('checked')
                expect(getByLabelText(/Dark/)).not.toHaveAttribute('checked')
                expect(getByLabelText(/Light/)).toHaveAttribute('checked')
                expect(getByLabelText(/Classic/)).not.toHaveAttribute('checked')
            })

            it('should render macro display', () => {
                const { getByLabelText } = render(
                    <ThemeProvider>
                        <Provider store={mockedStore(defaultState)}>
                            <YourProfileView {...minProps} />
                        </Provider>
                    </ThemeProvider>,
                )

                expect(getByLabelText(/Macro prediction/)).not.toHaveAttribute(
                    'checked',
                )
                expect(getByLabelText(/Macro suggestions/)).toHaveAttribute(
                    'checked',
                )
                expect(
                    getByLabelText(/Display macro search view by default/),
                ).not.toHaveAttribute('checked')
            })

            it('should expand to show the phone number field when enabling call forwarding', () => {
                const { getByLabelText, getByTestId } = render(
                    <ThemeProvider>
                        <Provider store={mockedStore(defaultState)}>
                            <YourProfileView {...minProps} />
                        </Provider>
                    </ThemeProvider>,
                )

                fireEvent.click(getByLabelText(/Enable call forwarding/i))
                expect(getByTestId('phone-input')).toBeEnabled()
            })
        })
    })

    describe('Form submission', () => {
        it('should submit user data', async () => {
            const store = mockedStore({
                currentUser: fromJS({
                    user: user,
                    settings: [
                        {
                            id: 3,
                            type: 'preferences',
                            data: { time_format: 'bar' },
                        },
                    ],
                }),
            })

            render(
                <ThemeProvider>
                    <Provider store={store}>
                        <YourProfileView
                            {...minProps}
                            preferences={fromJS({
                                data: { time_format: 'bar' },
                            })}
                        />
                    </Provider>
                </ThemeProvider>,
            )

            await userEvent.click(
                screen.getByRole('radio', {
                    name: '24-hour',
                }),
            )

            await userEvent.click(
                screen.getByRole('button', { name: 'Save Changes' }),
            )

            await waitFor(() => {
                const [currentUserAction, settingAction] = store.getActions()
                expect(currentUserAction).toEqual({
                    type: 'UPDATE_CURRENT_USER',
                    payload: userProfile,
                })

                expect(settingAction).toEqual({
                    type: 'SUBMIT_SETTING',
                    payload: {
                        data: {
                            id: 3,
                            type: 'preferences',
                            data: {
                                time_format: '24-hour',
                                date_format: 'en_GB',
                                show_macros: false,
                                show_macros_suggestions: true,
                            },
                        },
                        isPublic: false,
                    },
                })
            })
        })

        it('should submit user data and reset the password confirmation field because the email field was marked as changed', async () => {
            const store = mockedStore({
                currentUser: fromJS({
                    user: user,
                    settings: [],
                }),
            })

            const { getByRole, findByLabelText } = render(
                <ThemeProvider>
                    <Provider store={store}>
                        <YourProfileView {...minProps} />
                    </Provider>
                </ThemeProvider>,
            )

            await userEvent.type(
                getByRole('textbox', {
                    name: 'Your email required',
                }),
                'alex@gorgias.com',
            )

            const passwordField = await findByLabelText(
                /Password confirmation/i,
            )

            await userEvent.type(passwordField, 'a-password')
            await userEvent.click(getByRole('button', { name: 'Save Changes' }))

            await waitFor(() => {
                const [currentUserAction] = store.getActions()
                expect(currentUserAction).toEqual({
                    type: 'UPDATE_CURRENT_USER',
                    payload: {
                        ...userProfile,
                        email: 'alex@gorgias.com',
                        password_confirmation: 'a-password',
                    },
                })
            })
        })

        it('should submit user data and update user preferences because date format and time format preferences were changed', async () => {
            const store = mockedStore(defaultState)

            const preferences: Map<any, any> = fromJS({
                data: {
                    date_format: Object.keys(DateFormattingSetting)[1], // en_US
                    time_format: TimeFormattingSetting[1], // AM/PM
                },
            })

            const { getByLabelText } = render(
                <ThemeProvider>
                    <Provider store={store}>
                        <YourProfileView
                            {...minProps}
                            preferences={preferences}
                        />
                    </Provider>
                </ThemeProvider>,
            )

            await userEvent.click(
                getByLabelText(DateFormattingSetting.en_GB.label), // en_GB
            )
            await userEvent.click(getByLabelText(TimeFormattingSetting[0])) // 24-hour

            await userEvent.click(screen.getByText('Save Changes'))

            await waitFor(() => {
                const [__, settingAction] = store.getActions()
                expect(settingAction).toEqual({
                    type: 'SUBMIT_SETTING',
                    payload: {
                        data: {
                            id: 3,
                            type: 'preferences',
                            data: {
                                show_macros: false,
                                show_macros_suggestions: true,
                                time_format: '24-hour',
                                date_format: 'en_GB',
                            },
                        },
                        isPublic: false,
                    },
                })
            })
        })
    })

    describe('change theme from Settings', () => {
        it('should change the existing theme', async () => {
            jest.spyOn(Storage.prototype, 'getItem').mockReturnValue('"light"')
            const setThemeSpy = jest.fn()

            jest.spyOn(require('core/theme'), 'useSetTheme').mockReturnValue(
                setThemeSpy,
            )

            const { getByLabelText } = render(
                <ThemeProvider>
                    <Provider store={mockedStore(defaultState)}>
                        <YourProfileView {...minProps} />
                    </Provider>
                </ThemeProvider>,
            )

            const darkThemeButton = getByLabelText(/Dark/i)
            await userEvent.click(darkThemeButton)

            await waitFor(() => {
                expect(setThemeSpy).toHaveBeenCalledWith('dark')
            })
        })
    })

    describe('Profile picture saving', () => {
        it('should save profile picture', async () => {
            const fileUrl = 'https://config.gorgias.io/production/blabla'
            const store = mockedStore(defaultState)
            render(
                <ThemeProvider>
                    <Provider store={store}>
                        <YourProfileView
                            {...minProps}
                            currentUser={fromJS({
                                ...user,
                                meta: {
                                    ...user.meta,
                                    profile_picture_url: fileUrl,
                                },
                            })}
                        />
                    </Provider>
                </ThemeProvider>,
            )

            const fileInput = screen.getByTestId('file-field')
            fireEvent.change(fileInput)

            await waitFor(() => {
                const [currentUserAction] = store.getActions()
                expect(currentUserAction).toEqual({
                    type: 'UPDATE_CURRENT_USER',
                    payload: {
                        meta: {
                            profile_picture_url: fileUrl,
                        },
                    },
                })
            })
        })

        it('should remove profile picture', async () => {
            const store = mockedStore(defaultState)
            render(
                <ThemeProvider>
                    <Provider store={store}>
                        <YourProfileView
                            {...minProps}
                            currentUser={fromJS({
                                ...user,
                                meta: {
                                    profile_picture_url:
                                        'https://config.gorgias.io/staging/pic.jpg',
                                },
                            })}
                        />
                    </Provider>
                </ThemeProvider>,
            )

            const removePictureButton = screen.getByText('Remove Picture')
            await userEvent.click(removePictureButton)

            await waitFor(() => {
                const [currentUserAction] = store.getActions()
                expect(currentUserAction).toEqual({
                    type: 'UPDATE_CURRENT_USER',
                    payload: {
                        meta: {
                            profile_picture_url: null,
                        },
                    },
                })
            })
        })
    })

    describe('Initial values', () => {
        it('should return default values because `currentUser` is empty', () => {
            const props: ComponentProps<typeof YourProfileView> = {
                ...minProps,
                currentUser: fromJS({}),
            }
            render(
                <ThemeProvider>
                    <Provider store={mockedStore(defaultState)}>
                        <YourProfileView {...props} />
                    </Provider>
                </ThemeProvider>,
            )
            const userName = screen.getByPlaceholderText('John Doe')

            expect(userName).toBeInTheDocument()
        })

        it('should return form values because `currentUser` is not empty', () => {
            render(
                <ThemeProvider>
                    <Provider store={mockedStore(defaultState)}>
                        <YourProfileView {...minProps} />
                    </Provider>
                </ThemeProvider>,
            )

            const userName = screen.getByDisplayValue(user.name)

            expect(userName).toBeInTheDocument()
        })
    })
})
