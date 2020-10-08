import React from 'react'
import {fromJS} from 'immutable'
import {shallow} from 'enzyme'
import thunk from 'redux-thunk'
import configureMockStore from 'redux-mock-store'

import ViewSharingModal from '../ViewSharingModal'
import {ViewVisibility} from '../../../../../../constants/view.ts'

const middlewares = [thunk]
const mockStore = configureMockStore(middlewares)

describe('<ViewSharingModal/>', () => {
    const getState = () => ({
        agents: fromJS({
            all: [],
        }),
        teams: fromJS({
            all: {},
        }),
    })

    const store = mockStore(getState())
    let toggle
    let notify

    beforeEach(() => {
        toggle = jest.fn()
        notify = jest.fn()
    })

    describe('render()', () => {
        it('should render as public', () => {
            const view = fromJS({visibility: ViewVisibility.PUBLIC})

            const component = shallow(
                <ViewSharingModal
                    view={view}
                    isOpen
                    store={store}
                    toggle={toggle}
                    notify={notify}
                />
            )

            expect(component.dive()).toMatchSnapshot()
        })

        it('should render as shared', () => {
            const view = fromJS({visibility: ViewVisibility.SHARED})

            const component = shallow(
                <ViewSharingModal
                    view={view}
                    isOpen
                    store={store}
                    toggle={toggle}
                    notify={notify}
                />
            )

            expect(component.dive()).toMatchSnapshot()
        })

        it('should render as private', () => {
            const view = fromJS({visibility: ViewVisibility.PRIVATE})

            const component = shallow(
                <ViewSharingModal
                    view={view}
                    isOpen
                    store={store}
                    toggle={toggle}
                    notify={notify}
                />
            )

            expect(component.dive()).toMatchSnapshot()
        })
    })
})
