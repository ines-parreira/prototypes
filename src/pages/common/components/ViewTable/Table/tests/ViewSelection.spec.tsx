import {fromJS, Map} from 'immutable'
import React from 'react'
import {shallow} from 'enzyme'
import {Store} from 'redux'
import _noop from 'lodash/noop'

import * as viewsConfig from '../../../../../../config/views'
import ViewSelection from '../ViewSelection'
import * as viewsFixtures from '../../../../../../fixtures/views'
import untypedConfigureStore from '../../../../../../store/configureStore.js'

import {RootState} from '../../../../../../state/types'

// $TsFixMe: Remove on store/configureStore migration
const configureStore = (untypedConfigureStore as unknown) as (
    store: Partial<RootState>
) => Store<RootState>

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
    const viewConfig = viewsConfig.views.first() as Map<any, any>
    const minProps = {
        colSize: 5,
        selectedCount: 30,
        viewSelected: false,
        onSelectViewClick: _noop,
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
