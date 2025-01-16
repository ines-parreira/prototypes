import {SelectInput} from '@gorgias/merchant-ui-kit'
import {
    act,
    fireEvent,
    render,
    screen,
    waitFor,
    within,
} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {fromJS, Map} from 'immutable'
import React, {ComponentProps} from 'react'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import {logEvent, SegmentEvent} from 'common/segment'
import {THEME_NAME} from 'core/theme'
import type {ColorTokens} from 'core/theme'
import {user} from 'fixtures/users'
import {DateFormattingSetting, TimeFormattingSetting} from 'models/agents/types'
import PhoneNumberInput from 'pages/common/forms/PhoneNumberInput/PhoneNumberInput'
import {YourProfileView} from 'pages/settings/yourProfile/components/YourProfileView'

jest.mock('common/segment')
const logEventMock = logEvent as jest.MockedFunction<typeof logEvent>

const mockedStore = configureMockStore([thunk])
const minProps: ComponentProps<typeof YourProfileView> = {
    updateCurrentUser: jest.fn(),
    currentUser: fromJS(user),
    submitSetting: jest.fn(),
    preferences: fromJS({data: {date_format: 'en_GB', time_format: '24-hour'}}),
    setTheme: jest.fn(),
    theme: {
        name: THEME_NAME.Dark,
        resolvedName: THEME_NAME.Dark,
        tokens: {} as ColorTokens,
    },
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
        SelectInput: ({
            label,
            options,
            selectedOption,
            optionMapper,
        }: ComponentProps<typeof SelectInput>) => (
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
        ({value, disabled}: ComponentProps<typeof PhoneNumberInput>) => (
            <input
                type="text"
                value={value}
                data-testid="phone-input"
                disabled={disabled}
            />
        )
)

const defaultState = {}

describe('YourProfileView', () => {
    const realDateNow = Date.now.bind(global.Date)

    beforeEach(() => {
        jest.resetAllMocks()
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

    describe('render', () => {
        describe('personal information section', () => {
            it('should render name input', () => {
                const {getByLabelText} = render(
                    <Provider store={mockedStore(defaultState)}>
                        <YourProfileView {...minProps} />
                    </Provider>
                )
                const yourName = getByLabelText(/Your name/)

                expect(yourName).toHaveAttribute('placeholder', 'John Doe')
                expect(yourName).toHaveAttribute('name', 'name')
                expect(yourName).toHaveAttribute('type', 'text')
                expect(yourName).toHaveValue(user.name)
                expect(yourName).toBeRequired()
            })

            it('should render email input', () => {
                const {getByLabelText} = render(
                    <Provider store={mockedStore(defaultState)}>
                        <YourProfileView {...minProps} />
                    </Provider>
                )
                const yourEmail = getByLabelText(/Your email/)

                expect(yourEmail).toHaveAttribute(
                    'placeholder',
                    'john.doe@acme.com'
                )
                expect(yourEmail).toHaveAttribute('name', 'email')
                expect(yourEmail).toHaveAttribute('type', 'email')
                expect(yourEmail).toHaveValue(user.email)
                expect(yourEmail).toBeRequired()
            })

            it('should render bio input', () => {
                const {getByLabelText} = render(
                    <Provider store={mockedStore(defaultState)}>
                        <YourProfileView {...minProps} />
                    </Provider>
                )
                const yourBio = getByLabelText(/Your bio/)

                expect(yourBio).toHaveAttribute('name', 'bio')
                expect(yourBio).toHaveAttribute('type', 'text')
                expect(yourBio).toHaveValue(user.bio)
                expect(yourBio).not.toBeRequired()
            })
        })

        describe('date and time settings', () => {
            it('should render timezone select', () => {
                const {getByLabelText} = render(
                    <Provider store={mockedStore(defaultState)}>
                        <YourProfileView {...minProps} />
                    </Provider>
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
                const {getByText} = render(
                    <Provider store={mockedStore(defaultState)}>
                        <YourProfileView {...minProps} />
                    </Provider>
                )
                const legend = getByText('Date format')
                const fieldset = legend.closest('fieldset')!
                const radios = within(fieldset).getAllByRole('radio')
                expect(radios).toHaveLength(2)

                expect(
                    within(fieldset).getByLabelText('Day/Month/Year')
                ).toHaveAttribute('checked')
                expect(
                    within(fieldset).getByLabelText('Month/Day/Year')
                ).not.toHaveAttribute('checked')
            })

            it('should render time format', () => {
                const {getByText} = render(
                    <Provider store={mockedStore(defaultState)}>
                        <YourProfileView {...minProps} />
                    </Provider>
                )
                const legend = getByText('Time format')
                const fieldset = legend.closest('fieldset')!
                const radios = within(fieldset).getAllByRole('radio')
                expect(radios).toHaveLength(2)

                expect(
                    within(fieldset).getByLabelText('24-hour')
                ).toHaveAttribute('checked')
                expect(
                    within(fieldset).getByLabelText('AM/PM')
                ).not.toHaveAttribute('checked')
            })
        })

        describe('account preferences', () => {
            it('should render theme select', () => {
                const {getByLabelText} = render(
                    <Provider store={mockedStore(defaultState)}>
                        <YourProfileView {...minProps} />
                    </Provider>
                )

                expect(getByLabelText(/System/)).not.toHaveAttribute('checked')
                expect(getByLabelText(/Dark/)).toHaveAttribute('checked')
                expect(getByLabelText(/Light/)).not.toHaveAttribute('checked')
                expect(getByLabelText(/Classic/)).not.toHaveAttribute('checked')
            })

            it('should render macro display', () => {
                const {getByLabelText} = render(
                    <Provider store={mockedStore(defaultState)}>
                        <YourProfileView {...minProps} />
                    </Provider>
                )

                expect(getByLabelText(/Macro prediction/)).not.toHaveAttribute(
                    'checked'
                )
                expect(getByLabelText(/Macro suggestions/)).toHaveAttribute(
                    'checked'
                )
                expect(
                    getByLabelText(/Display macro search view by default/)
                ).not.toHaveAttribute('checked')
            })

            it('should expand to show the phone number field when enabling call forwarding', () => {
                const {getByLabelText, getByTestId} = render(
                    <Provider store={mockedStore(defaultState)}>
                        <YourProfileView {...minProps} />
                    </Provider>
                )

                fireEvent.click(getByLabelText(/Enable call forwarding/i))
                expect(getByTestId('phone-input')).toBeEnabled()
            })
        })

        describe('profile picture', () => {
            it('should render avatar upload input', () => {
                const {getByText} = render(
                    <Provider store={mockedStore(defaultState)}>
                        <YourProfileView {...minProps} />
                    </Provider>
                )

                expect(getByText('Select a file')).toBeInTheDocument()
            })
        })
    })

    describe('_handleSubmit', () => {
        it('should submit user data', async () => {
            const updateCurrentUserSpy = jest.fn(() => Promise.resolve(user))
            const submitSetting = jest
                .fn()
                .mockReturnValueOnce(Promise.resolve())
            const preferences: Map<any, any> = fromJS({
                data: {time_format: 'bar'},
            })
            const settingLabel = '24-hour'
            const newPreferences: Map<any, any> = fromJS({
                time_format: settingLabel,
            })
            const expectedPreferences = preferences
                .update('data', (data: Map<any, any>) =>
                    data.mergeDeep(newPreferences)
                )
                .toJS()

            render(
                <Provider store={mockedStore(defaultState)}>
                    <YourProfileView
                        {...minProps}
                        updateCurrentUser={updateCurrentUserSpy}
                        submitSetting={submitSetting}
                        preferences={fromJS({data: {time_format: 'bar'}})}
                    />
                </Provider>
            )

            act(() => {
                userEvent.click(
                    screen.getByRole('radio', {
                        name: settingLabel,
                    })
                )
            })
            act(() => {
                userEvent.click(
                    screen.getByRole('button', {name: 'Save Changes'})
                )
            })

            await waitFor(() => {
                expect(updateCurrentUserSpy.mock.calls).toMatchSnapshot()
                expect(submitSetting).toHaveBeenCalledWith(
                    expectedPreferences,
                    false
                )
                expect(logEventMock).toHaveBeenLastCalledWith(
                    SegmentEvent.UserSettingsUpdated,
                    {
                        newSettings: newPreferences.toJS(),
                        oldSettings: (
                            preferences.get('data') as Map<any, any>
                        ).toJS(),
                    }
                )
            })
        })

        it(
            'should submit user data and reset the password confirmation field ' +
                'because the email field was marked as changed',
            () => {
                const updateCurrentUserSpy = jest.fn(() => {
                    return Promise.resolve(user)
                })
                render(
                    <Provider store={mockedStore(defaultState)}>
                        <YourProfileView
                            {...minProps}
                            updateCurrentUser={updateCurrentUserSpy}
                        />
                    </Provider>
                )
                act(() => {
                    void userEvent.type(
                        screen.getByRole('textbox', {
                            name: 'Your email required',
                        }),
                        'q'
                    )
                })
                act(() => {
                    void userEvent.type(
                        screen.getByPlaceholderText('Your password'),
                        'a-password'
                    )
                })

                act(() => {
                    userEvent.click(
                        screen.getByRole('button', {name: 'Save Changes'})
                    )
                })

                expect(updateCurrentUserSpy.mock.calls).toMatchSnapshot()
                expect(updateCurrentUserSpy).toHaveBeenCalled()
                expect(logEventMock).toHaveBeenCalledTimes(0)
            }
        )

        it('should submit user data and update user preferences because date format and time format preferences were changed', async () => {
            const updateCurrentUserSpy = jest.fn(() => Promise.resolve(user))
            const submitSettingSpy = jest
                .fn()
                .mockReturnValueOnce(Promise.resolve())

            const preferences: Map<any, any> = fromJS({
                data: {
                    date_format: Object.keys(DateFormattingSetting)[1], // en_US
                    time_format: TimeFormattingSetting[1], // AM/PM
                    foo: 'bar',
                },
            })
            const expectedPreferences: Map<any, any> = fromJS({
                data: {
                    date_format: Object.keys(DateFormattingSetting)[0], // en_GB
                    time_format: TimeFormattingSetting[0], // 24-hour
                    foo: 'bar',
                },
            })

            const {getByLabelText} = render(
                <Provider store={mockedStore(defaultState)}>
                    <YourProfileView
                        {...minProps}
                        updateCurrentUser={updateCurrentUserSpy}
                        submitSetting={submitSettingSpy}
                        preferences={fromJS(preferences)}
                    />
                </Provider>
            )

            fireEvent.click(
                getByLabelText(DateFormattingSetting.en_GB.label) // en_GB
            )
            fireEvent.click(getByLabelText(TimeFormattingSetting[0])) // 24-hour

            fireEvent.click(screen.getByText('Save Changes'))

            await waitFor(() => {
                expect(submitSettingSpy).toHaveBeenCalledWith(
                    expectedPreferences.toJS(),
                    false
                )
                expect(logEventMock).toHaveBeenLastCalledWith(
                    SegmentEvent.UserSettingsUpdated,
                    {
                        newSettings: (
                            expectedPreferences.get('data') as Map<any, any>
                        ).toJS(),
                        oldSettings: (
                            preferences.get('data') as Map<any, any>
                        ).toJS(),
                    }
                )
            })
        })
    })

    describe('change theme from Settings', () => {
        it('should change the existing theme', async () => {
            jest.spyOn(Storage.prototype, 'getItem').mockReturnValue('"dark"')
            const setThemeSpy = jest.fn()

            render(
                <Provider store={mockedStore(defaultState)}>
                    <YourProfileView {...minProps} setTheme={setThemeSpy} />
                </Provider>
            )

            // Dark theme is selected by default
            await waitFor(() =>
                expect(screen.getAllByRole('radio')[5]).toBeChecked()
            )
            // Select light theme
            userEvent.click(screen.getAllByRole('radio')[6])
            expect(setThemeSpy).toHaveBeenCalledWith('light')
        })
    })

    describe('_saveProfilePicture', () => {
        it('should save profile picture', () => {
            const fileUrl = 'https://config.gorgias.io/production/blabla'
            const updateCurrentUserSpy = jest.fn(() => Promise.resolve(user))
            render(
                <Provider store={mockedStore(defaultState)}>
                    <YourProfileView
                        {...minProps}
                        currentUser={fromJS({
                            ...user,
                            meta: {...user.meta, profile_picture_url: fileUrl},
                        })}
                        updateCurrentUser={updateCurrentUserSpy}
                    />
                </Provider>
            )

            userEvent.click(screen.getByText('Save Changes'))

            expect(updateCurrentUserSpy.mock.calls).toMatchSnapshot()
        })

        it('should remove profile picture', () => {
            const updateCurrentUserSpy = jest.fn(() => Promise.resolve(user))
            render(
                <Provider store={mockedStore(defaultState)}>
                    <YourProfileView
                        {...minProps}
                        updateCurrentUser={updateCurrentUserSpy}
                        currentUser={fromJS({
                            ...user,
                            meta: {
                                profile_picture_url:
                                    'https://config.gorgias.io/staging/pic.jpg',
                            },
                        })}
                    />
                </Provider>
            )

            const removePictureButton = screen.getByText('Remove Picture')
            fireEvent.click(removePictureButton)

            expect(updateCurrentUserSpy.mock.calls).toMatchSnapshot()
        })
    })

    describe('_getForm', () => {
        it('should return default values because `currentUser` is empty', () => {
            const props: ComponentProps<typeof YourProfileView> = {
                ...minProps,
                currentUser: fromJS({}),
            }
            render(
                <Provider store={mockedStore(defaultState)}>
                    <YourProfileView {...props} />
                </Provider>
            )
            const userName = screen.getByPlaceholderText('John Doe')

            expect(userName).toBeInTheDocument()
        })

        it('should return form values because `currentUser` is not empty', () => {
            render(
                <Provider store={mockedStore(defaultState)}>
                    <YourProfileView {...minProps} />
                </Provider>
            )

            const userName = screen.getByDisplayValue(user.name)

            expect(userName).toBeInTheDocument()
        })
    })
})
