import React from 'react'
import {Button} from 'reactstrap'
import {fromJS} from 'immutable'
import {shallow} from 'enzyme'
import thunk from 'redux-thunk'
import configureMockStore from 'redux-mock-store'

import ViewSharingModal from '../ViewSharingModal'
import {ViewVisibility} from '../../../../../../constants/view.ts'
import GorgiasApi from '../../../../../../services/gorgiasApi.ts'
import {view as viewFixture} from '../../../../../../fixtures/views.ts'
import {viewUpdated} from '../../../../../../state/entities/views/actions.ts'
import {
    advancedPlan,
    basicPlan,
    proPlan,
} from '../../../../../../fixtures/subscriptionPlan.ts'

jest.mock('../../../../../../services/gorgiasApi')
jest.mock('../../../../../../state/entities/views/actions.ts')

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
        billing: fromJS({
            plans: fromJS({
                [basicPlan.id]: basicPlan,
                [proPlan.id]: proPlan,
                [advancedPlan.id]: advancedPlan,
            }),
        }),
    })
    const store = mockStore(getState())
    let toggle
    let notify

    beforeEach(() => {
        jest.clearAllMocks()
        toggle = jest.fn()
        notify = jest.fn()
        GorgiasApi.mockImplementation(() => ({
            getViewSharing: jest.fn().mockRejectedValue(),
            setViewSharing: jest.fn().mockResolvedValue(viewFixture),
        }))
    })

    describe('render()', () => {
        it('should render the paywall modal information when view sharing feature is missing', () => {
            const view = fromJS({visibility: ViewVisibility.PUBLIC})
            const component = shallow(
                <ViewSharingModal
                    view={view}
                    isOpen
                    store={store}
                    toggle={toggle}
                    notify={notify}
                    showPaywall={true}
                />
            )

            expect(component.dive()).toMatchSnapshot()
        })

        it('should render as public', () => {
            const view = fromJS({visibility: ViewVisibility.PUBLIC})

            const component = shallow(
                <ViewSharingModal
                    view={view}
                    isOpen
                    store={store}
                    toggle={toggle}
                    notify={notify}
                    showPaywall={false}
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
                    showPaywall={false}
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
                    showPaywall={false}
                />
            )

            expect(component.dive()).toMatchSnapshot()
        })

        it('should update the view on save', (done) => {
            const view = fromJS({visibility: ViewVisibility.PRIVATE})
            const component = shallow(
                <ViewSharingModal
                    view={view}
                    isOpen
                    store={store}
                    toggle={toggle}
                    notify={notify}
                    viewUpdated={viewUpdated}
                    showPaywall={false}
                />
            )

            component.dive().find(Button).first().simulate('click')
            setImmediate(() => {
                expect(viewUpdated).toHaveBeenNthCalledWith(1, viewFixture)
                done()
            })
        })
    })
})
