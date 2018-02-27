import React from 'react'
import RequestSelectContainer, {RequestSelect} from '../RequestSelect'
import {shallow} from 'enzyme'
import {fromJS} from 'immutable'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import Select from '../Select'

const middlewares = [thunk]
const mockStore = configureMockStore(middlewares)

describe('ast', () => {
    describe('widgets', () => {
        describe('RequestSelect', () => {
            const requests = fromJS([{
                id: 1,
                name: 'shipping status',
                samples: 'where is my order?'
            }, {
                id: 2,
                name: 'missing items',
                samples: 'I did not receive'
            }])
            let store = null

            beforeEach(() => {
                store = mockStore({
                    requests: fromJS({
                        items: requests
                    })
                })
            })

            it('should render int as value', () => {
                const component = shallow(
                    <RequestSelectContainer
                        value={1}
                        store={store}
                        onChange={jest.fn()}
                    />
                )
                expect(component.dive()).toMatchSnapshot()
            })

            it('should handle change', () => {
                const onChangeSpy = jest.fn()
                const component = shallow(
                    <RequestSelect
                        requests={requests}
                        value={1}
                        onChange={onChangeSpy}
                    />
                )
                const select = component.find(Select)
                select.simulate('change', {target: {value: 2}})
                expect(component.dive()).toMatchSnapshot()
            })
        })
    })
})
