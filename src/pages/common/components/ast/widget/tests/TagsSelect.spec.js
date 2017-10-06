import React from 'react'
import TagsSelect from '../TagsSelect'
import {shallow} from 'enzyme'
import {fromJS} from 'immutable'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

const middlewares = [thunk]
const mockStore = configureMockStore(middlewares)

describe('ast', () => {
    describe('widgets', () => {
        describe('TagsSelect', () => {
            it('should render a MultiSelectField', () => {
                const tags = fromJS([{
                    name: 'billing',
                }, {
                    name: 'refund',
                }, {
                    name: 'question',
                }])
                const store = mockStore({
                    tags: fromJS({
                        items: tags
                    })
                })
                const component = shallow(
                    <TagsSelect
                        values={['billing', 'bugs']}
                        store={store}
                        onChange={jest.fn()}
                    />
                )
                expect(component.dive()).toMatchSnapshot()
            })
        })
    })
})
