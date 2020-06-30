import React from 'react'
import {shallow} from 'enzyme'
import {fromJS} from 'immutable'
import thunk from 'redux-thunk'
import configureMockStore from 'redux-mock-store'

import ViewCount from '../ViewCount'
import {MAX_TICKET_COUNT_PER_VIEW} from '../../../../../config/views'

describe('<ViewCount/>', () => {
    const mockStore = configureMockStore([thunk])

    it('should render an error icon because view is deactivated', () => {
        const view = fromJS({
            id: 1,
            deactivated_datetime: '2020-06-15 22:56:32.708038',
        })
        const store = mockStore({})

        const component = shallow(<ViewCount store={store} view={view} />)

        expect(component.dive()).toMatchSnapshot()
    })

    it('should not render anything because view has no count', () => {
        const view = fromJS({id: 1, deactivated_datetime: null})
        const store = mockStore({
            views: fromJS({
                counts: {},
            }),
        })

        const component = shallow(<ViewCount store={store} view={view} />)

        expect(component.dive()).toMatchSnapshot()
    })

    it('should render uncompacted count', () => {
        const view = fromJS({id: 1, deactivated_datetime: null})
        const store = mockStore({
            views: fromJS({
                counts: {
                    '1': 111,
                },
            }),
        })

        const component = shallow(<ViewCount store={store} view={view} />)

        expect(component.dive()).toMatchSnapshot()
    })

    it('should render compacted count', () => {
        const view = fromJS({id: 1, deactivated_datetime: null})
        const store = mockStore({
            views: fromJS({
                counts: {
                    '1': 1111,
                },
            }),
        })

        const component = shallow(<ViewCount store={store} view={view} />)

        expect(component.dive()).toMatchSnapshot()
    })

    it('should render max count', () => {
        const view = fromJS({id: 1, deactivated_datetime: null})
        const store = mockStore({
            views: fromJS({
                counts: {
                    '1': MAX_TICKET_COUNT_PER_VIEW + 111,
                },
            }),
        })

        const component = shallow(<ViewCount store={store} view={view} />)

        expect(component.dive()).toMatchSnapshot()
    })
})
