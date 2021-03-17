import React from 'react'
import {Button} from 'reactstrap'
import {fromJS} from 'immutable'
import {shallow} from 'enzyme'

import {
    advancedPlan,
    basicPlan,
    proPlan,
} from '../../../../../../fixtures/subscriptionPlan'
import {user as currentUserFixture} from '../../../../../../fixtures/users'
import {view as mockViewFixture} from '../../../../../../fixtures/views'
import {ViewVisibility} from '../../../../../../models/view/types'
import {viewUpdated} from '../../../../../../state/entities/views/actions'
import {ViewSharingModalContainer} from '../ViewSharingModal'

jest.mock('../../../../../../services/gorgiasApi.ts', () => () => {
    return {
        getViewSharing: jest.fn().mockRejectedValue(new Error()),
        setViewSharing: jest.fn().mockResolvedValue(mockViewFixture),
    }
})

jest.mock('../../../../../../state/entities/views/actions.ts')

describe('<ViewSharingModal/>', () => {
    const minProps = {
        currentUser: fromJS(currentUserFixture),
        isOpen: true,
        plans: {
            [basicPlan.id]: basicPlan,
            [proPlan.id]: proPlan,
            [advancedPlan.id]: advancedPlan,
        },
        showPaywall: false,
        viewUpdated,
        toggle: jest.fn(),
        notify: jest.fn(),
    }

    beforeEach(() => {
        jest.clearAllMocks()
    })

    describe('render()', () => {
        it('should render the paywall modal information when view sharing feature is missing', () => {
            const view = fromJS({visibility: ViewVisibility.Public})
            const component = shallow(
                <ViewSharingModalContainer
                    {...minProps}
                    view={view}
                    showPaywall={true}
                />
            )

            expect(component).toMatchSnapshot()
        })

        it('should render as public', () => {
            const view = fromJS({visibility: ViewVisibility.Public})

            const component = shallow(
                <ViewSharingModalContainer {...minProps} view={view} />
            )

            expect(component).toMatchSnapshot()
        })

        it('should render as shared', () => {
            const view = fromJS({visibility: ViewVisibility.Shared})

            const component = shallow(
                <ViewSharingModalContainer {...minProps} view={view} />
            )

            expect(component).toMatchSnapshot()
        })

        it('should render as private', () => {
            const view = fromJS({visibility: ViewVisibility.Private})

            const component = shallow(
                <ViewSharingModalContainer {...minProps} view={view} />
            )

            expect(component).toMatchSnapshot()
        })

        it('should update the view on save', (done) => {
            const view = fromJS({visibility: ViewVisibility.Private})
            const component = shallow(
                <ViewSharingModalContainer {...minProps} view={view} />
            )

            component.find(Button).first().simulate('click')
            setImmediate(() => {
                expect(viewUpdated).toHaveBeenNthCalledWith(1, mockViewFixture)
                done()
            })
        })
    })
})
