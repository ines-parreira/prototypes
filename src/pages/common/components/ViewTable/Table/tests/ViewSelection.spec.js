import {fromJS} from 'immutable'
import React from 'react'
import {shallow} from 'enzyme'

import * as viewsConfig from '../../../../../../config/views'
import ViewSelection from '../ViewSelection'
import * as viewsFixtures from '../../../../../../fixtures/views'
import configureStore from '../../../../../../store/configureStore'

describe('<ViewSelection/>', () => {
    const minStore = {
        views: fromJS({
            active: viewsFixtures.view,
            getViewCount: () => {
                return 100
            },
            dirtyView: true,
        }),
    }
    const viewConfig = viewsConfig.views.first()

    const minProps = {
        colSize: 5,
        selectedCount: 30,
        viewSelected: false,
        onSelectViewClick: () => {},
        type: viewConfig.get('name'),
        activeView: {},
        store: configureStore(minStore),
    }
    describe('render()', () => {
        it('should render the component when only elements on the active view are selected', () => {
            const component = shallow(<ViewSelection {...minProps} />).dive()
            expect(component).toMatchSnapshot()
        })

        it('should render the component for an entire view selection', () => {
            const component = shallow(
                <ViewSelection {...minProps} viewSelected={true} />
            ).dive()
            expect(component).toMatchSnapshot()
        })
    })
})
