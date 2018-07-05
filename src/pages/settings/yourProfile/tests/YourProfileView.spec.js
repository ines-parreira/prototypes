import React from 'react'
import YourProfileView from '../components/YourProfileView'
import {shallow} from 'enzyme'
import {currentUser} from '../../../../fixtures/users'
import {fromJS} from 'immutable'

const mockUpdateCurrentUser = jest.fn()

describe('YourProfileView', () => {
    beforeEach(() => {
        jest.clearAllMocks()
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
            const component = shallow(
                <YourProfileView
                    updateCurrentUser={mockUpdateCurrentUser}
                    currentUser={fromJS(currentUser)}
                    submitSetting={jest.fn()}
                    preferences={fromJS({data: {}})}
                />
            ).instance()

            component._handleSubmit({preventDefault: jest.fn()})
            expect(mockUpdateCurrentUser.mock.calls).toMatchSnapshot()
        })
    })

    describe('_savePreferences', () => {
        it('should save preferences', (done) => {
            const submitSetting = jest.fn().mockReturnValueOnce(Promise.resolve())
            const preferences = fromJS({data: {foo: 'bar'}})
            const newPreferences = fromJS({hello: 'world'})
            const expectedPreferences = preferences.update('data', data => data.mergeDeep(newPreferences)).toJS()

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
