import React, {ComponentProps, SyntheticEvent} from 'react'
import {shallow} from 'enzyme'
import {fromJS, Map} from 'immutable'
import {Provider} from 'react-redux'
import {fireEvent, render, screen, waitFor} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import {user} from 'fixtures/users'
import {logEvent, SegmentEvent} from 'common/segment'
import {DateFormattingSetting, TimeFormattingSetting} from 'models/agents/types'
import {YourProfileView} from 'pages/settings/yourProfile/components/YourProfileView'
import {Theme} from 'theme/types'
import {getLDClient} from 'utils/launchDarkly'

jest.mock('common/segment')
const logEventMock = logEvent as jest.MockedFunction<typeof logEvent>

const mockedStore = configureMockStore([thunk])
const minProps: ComponentProps<typeof YourProfileView> = {
    updateCurrentUser: jest.fn(),
    currentUser: fromJS(user),
    submitSetting: jest.fn(),
    preferences: fromJS({data: {}}),
    setTheme: jest.fn(),
    savedTheme: 'dark' as Theme,
}
jest.mock('moment-timezone', () => {
    return {
        tz: {names: () => []},
    }
})

jest.mock('utils/launchDarkly')
const variationMock = getLDClient().variation as jest.Mock
;(getLDClient().waitForInitialization as jest.Mock).mockResolvedValue({})

jest.mock('pages/common/components/UnsavedChangesPrompt', () => () => null)

const defaultState = {}

describe('YourProfileView', () => {
    const realDateNow = Date.now.bind(global.Date)

    beforeEach(() => {
        jest.resetAllMocks()
        global.Date.now = jest.fn(() => 1587000000000)
        variationMock.mockImplementation(() => true)
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
        it.each([true, false])(
            'should render current user profile form',
            (hasNewFeatureActive) => {
                variationMock.mockImplementation(() => hasNewFeatureActive)
                const component = shallow(<YourProfileView {...minProps} />)

                expect(component).toMatchSnapshot()
            }
        )

        it('should expand to show the phone number field when enabling call forwarding', async () => {
            const {findByText, getByLabelText} = render(
                <Provider store={mockedStore(defaultState)}>
                    <YourProfileView {...minProps} />
                </Provider>
            )

            fireEvent.click(getByLabelText(/Enable call forwarding/i))
            const countrySelector = await findByText('+1')
            expect(countrySelector).toMatchSnapshot()
        })
    })

    describe('_handleSubmit', () => {
        it('should submit user data', () => {
            const updateCurrentUserSpy = jest.fn(() => Promise.resolve(user))
            const submitSetting = jest
                .fn()
                .mockReturnValueOnce(Promise.resolve())
            const preferences: Map<any, any> = fromJS({data: {foo: 'bar'}})
            const newPreferences: Map<any, any> = fromJS({hello: 'world'})
            const expectedPreferences = preferences
                .update('data', (data: Map<any, any>) =>
                    data.mergeDeep(newPreferences)
                )
                .toJS()

            const component = shallow<YourProfileView>(
                <YourProfileView
                    {...minProps}
                    updateCurrentUser={updateCurrentUserSpy}
                    submitSetting={submitSetting}
                    preferences={fromJS({data: {foo: 'bar'}})}
                />
            ).instance()
            component.setState({preferences: newPreferences})

            void component._handleSubmit({
                preventDefault: jest.fn(),
            } as unknown as SyntheticEvent)
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

        it(
            'should submit user data and reset the password confirmation field ' +
                'because the email field was marked as changed',
            (done) => {
                const updateCurrentUserSpy = jest.fn(() =>
                    Promise.resolve(user)
                )
                const component = shallow<YourProfileView>(
                    <YourProfileView
                        {...minProps}
                        updateCurrentUser={updateCurrentUserSpy}
                    />
                ).instance()
                component.setState({
                    password_confirmation: 'a-password',
                    hasChangedEmail: true,
                })

                void component
                    ._handleSubmit({
                        preventDefault: jest.fn(),
                    } as unknown as SyntheticEvent)
                    .then(() => {
                        expect(
                            updateCurrentUserSpy.mock.calls
                        ).toMatchSnapshot()
                        expect(component.state.hasChangedEmail).toBe(false)
                        expect(component.state.password_confirmation).toBe('')
                        expect(logEventMock).toHaveBeenCalledTimes(0)
                        done()
                    })
            }
        )

        it(
            'should submit user data and update user preferences because ' +
                'date format and time format preferences were changed',
            () => {
                const updateCurrentUserSpy = jest.fn(() =>
                    Promise.resolve(user)
                )
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
            }
        )
    })

    describe('change theme from Settings', () => {
        it('should change the existing theme', async () => {
            jest.spyOn(localStorage, 'getItem').mockReturnValue('"dark"')
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
            const updateCurrentUserSpy = jest.fn(() => Promise.resolve(user))
            const component = shallow<YourProfileView>(
                <YourProfileView
                    {...minProps}
                    updateCurrentUser={updateCurrentUserSpy}
                />
            ).instance()

            component.setState({
                meta: {
                    profile_picture_url:
                        'https://config.gorgias.io/production/blabla',
                },
            })
            void component._saveProfilePicture()
            expect(updateCurrentUserSpy.mock.calls).toMatchSnapshot()
        })

        it('should remove profile picture', () => {
            const updateCurrentUserSpy = jest.fn(() => Promise.resolve(user))
            const component = shallow<YourProfileView>(
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
            ).instance()

            component.setState({
                meta: {
                    profile_picture_url: null,
                },
            })

            void component._saveProfilePicture()
            expect(updateCurrentUserSpy.mock.calls).toMatchSnapshot()
        })
    })

    describe('_getForm', () => {
        it('should return default values because `currentUser` is empty', () => {
            const props: ComponentProps<typeof YourProfileView> = {
                ...minProps,
                currentUser: fromJS({}),
            }
            const component = shallow<YourProfileView>(
                <YourProfileView {...props} />
            )
            const form = component.instance()._getForm(props)
            expect(form).toMatchSnapshot()
        })

        it('should return form values because `currentUser` is not empty', () => {
            const component = shallow<YourProfileView>(
                <YourProfileView {...minProps} />
            )
            const form = component.instance()._getForm(minProps)
            expect(form).toMatchSnapshot()
        })
    })
})
