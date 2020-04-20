import React from 'react'
import {shallow} from 'enzyme'
import {fromJS} from 'immutable'

import YourProfileView from '../components/YourProfileView'
import {currentUser} from '../../../../fixtures/users'

const mockUpdateCurrentUser = jest.fn()

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
            const component = shallow(
                <YourProfileView
                    updateCurrentUser={mockUpdateCurrentUser}
                    currentUser={fromJS(currentUser)}
                    submitSetting={jest.fn()}
                    preferences={fromJS({data: {}})}
                />
            )

            expect(component).toMatchSnapshot()
        })
    })

    describe('_handleSubmit', () => {
        it('should submit user data', () => {
            const updateCurrentUserSpy = jest.fn(() => Promise.resolve(currentUser))
            const component = shallow(
                <YourProfileView
                    updateCurrentUser={updateCurrentUserSpy}
                    currentUser={fromJS(currentUser)}
                    submitSetting={jest.fn()}
                    preferences={fromJS({data: {}})}
                />
            ).instance()

            component._handleSubmit({preventDefault: jest.fn()})
            expect(updateCurrentUserSpy.mock.calls).toMatchSnapshot()
        })

        it('should submit user data and reset the password confirmation field ' +
            'because the email field was marked as changed', (done) => {
            const updateCurrentUserSpy = jest.fn(() => Promise.resolve(currentUser))
            const component = shallow(
                <YourProfileView
                    updateCurrentUser={updateCurrentUserSpy}
                    currentUser={fromJS(currentUser)}
                    submitSetting={jest.fn()}
                    preferences={fromJS({data: {}})}
                />
            ).instance()
            component.setState({password_confirmation: 'a-password', hasChangedEmail: true})

            component._handleSubmit({preventDefault: jest.fn()}).then(() => {
                expect(updateCurrentUserSpy.mock.calls).toMatchSnapshot()
                expect(component.state.hasChangedEmail).toBe(false)
                expect(component.state.password_confirmation).toBe(null)
                done()
            })
        })
    })

    describe('_saveProfilePicture', () => {
        it('should save profile picture', () => {
            const updateCurrentUserSpy = jest.fn(() => Promise.resolve(currentUser))
            const component = shallow(
                <YourProfileView
                    updateCurrentUser={updateCurrentUserSpy}
                    currentUser={fromJS(currentUser)}
                    submitSetting={jest.fn()}
                    preferences={fromJS({data: {}})}
                />
            ).instance()

            component.setState({profilePictureUrl: 'https://config.gorgias.io/production/blabla'})
            component._saveProfilePicture()
            expect(updateCurrentUserSpy.mock.calls).toMatchSnapshot()
        })
    })

    describe('_savePreferences', () => {
        it('should save preferences', (done) => {
            const submitSetting = jest.fn().mockReturnValueOnce(Promise.resolve())
            const preferences = fromJS({data: {foo: 'bar'}})
            const newPreferences = fromJS({hello: 'world'})
            const expectedPreferences = preferences.update('data', (data) => data.mergeDeep(newPreferences)).toJS()

            const component = shallow(
                <YourProfileView
                    updateCurrentUser={mockUpdateCurrentUser}
                    currentUser={fromJS(currentUser)}
                    submitSetting={submitSetting}
                    preferences={fromJS({data: {foo: 'bar'}})}
                />
            ).instance()

            component.setState({preferences: newPreferences})
            component._savePreferences({preventDefault: jest.fn()}).then(() => {
                expect(submitSetting).toHaveBeenCalledWith(expectedPreferences, true)
                done()
            })
        })
    })

    describe('_getForm', () => {
        it('should return default values because `currentUser` is empty', () => {
            const props = {
                updateCurrentUser: mockUpdateCurrentUser,
                currentUser: fromJS({}),
                submitSetting: jest.fn(),
                preferences: fromJS({data: {}})
            }
            const component = shallow(
                <YourProfileView {...props}/>
            )
            const form = component.instance()._getForm(props)
            expect(form).toMatchSnapshot()
        })

        it('should return form values because `currentUser` is not empty', () => {
            const props = {
                updateCurrentUser: mockUpdateCurrentUser,
                currentUser: fromJS(currentUser),
                submitSetting: jest.fn(),
                preferences: fromJS({data: {}})
            }
            const component = shallow(
                <YourProfileView {...props}/>
            )
            const form = component.instance()._getForm(props)
            expect(form).toMatchSnapshot()
        })
    })
})
