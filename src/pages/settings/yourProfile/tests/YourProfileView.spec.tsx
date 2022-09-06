import React, {ComponentProps, SyntheticEvent} from 'react'
import {shallow} from 'enzyme'
import {fromJS, Map} from 'immutable'
import {Provider} from 'react-redux'
import {render, fireEvent, waitFor} from '@testing-library/react'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import {FeatureFlagKey} from 'config/featureFlags'

import {user} from 'fixtures/users'

import {YourProfileView} from '../components/YourProfileView'

const mockedStore = configureMockStore([thunk])
const minProps: ComponentProps<typeof YourProfileView> = {
    updateCurrentUser: jest.fn(),
    currentUser: fromJS(user),
    submitSetting: jest.fn(),
    preferences: fromJS({data: {}}),
    flags: [],
}
const defaultState = {}

describe('YourProfileView', () => {
    const realDateNow = Date.now.bind(global.Date)

    beforeEach(() => {
        global.Date.now = jest.fn(() => 1587000000000)
        jest.clearAllMocks()
    })

    afterEach(() => {
        global.Date.now = realDateNow
    })

    describe('render', () => {
        it('should render current user profile form', () => {
            const component = shallow(<YourProfileView {...minProps} />)

            expect(component).toMatchSnapshot()
        })

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
                        done()
                    })
            }
        )
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
                profilePictureUrl:
                    'https://config.gorgias.io/production/blabla',
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
                profilePictureUrl: undefined,
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

    describe('Macro prefill settings', () => {
        it.each([true, false])(
            'Should display checkbox if feature flag is %s',
            async (prefillSetting) => {
                minProps.flags = {
                    [FeatureFlagKey.PrefillBestMacro]: prefillSetting,
                }

                const {queryByText} = render(
                    <YourProfileView {...minProps} />,
                    {
                        wrapper: ({children}) => (
                            <Provider store={mockedStore(defaultState)}>
                                {children}
                            </Provider>
                        ),
                    }
                )
                await waitFor(() => {
                    const queryResult = expect(
                        queryByText(/Auto-fill macros with high/i)
                    )
                    prefillSetting
                        ? queryResult.toBeTruthy()
                        : queryResult.toBeFalsy()
                })
            }
        )
    })
})
