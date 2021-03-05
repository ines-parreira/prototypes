import React from 'react'
import {shallow} from 'enzyme'
import {fromJS, Map, List} from 'immutable'
import _omit from 'lodash/omit'
import _noop from 'lodash/noop'
import {Store} from 'redux'

import {RootState} from '../../../../../../state/types'
import untypedConfigureStore from '../../../../../../store/configureStore.js'

import * as viewsConfig from '../../../../../../config/views'
import * as ticketFixtures from '../../../../../../fixtures/ticket'
import Cell from '../Cell'

// $TsFixMe: Remove on store/configureStore migration
const configureStore = (untypedConfigureStore as unknown) as (
    store: Partial<RootState>
) => Store<RootState>

describe('ViewTable::Table::Cell', () => {
    const viewConfig = viewsConfig.views.first() as Map<any, any>

    const minProps = {
        type: viewConfig.get('name'),
        item: fromJS(ticketFixtures.ticket),
        field: (viewConfig.get('fields') as List<any>).first(),
        store: configureStore({}),
    }

    it('should use default props', () => {
        const props = _omit(minProps, ['item'])
        const component = shallow(<Cell {...props} />)
        expect(component.find('Cell').props()).toMatchSnapshot()
    })

    it('default cell with no click handler passed (cant open items)', () => {
        const component = shallow(<Cell {...minProps} />).dive()
        expect(component).toMatchSnapshot()
    })

    it('default cell with a url passed', () => {
        const component = shallow(
            <Cell {...minProps} itemUrl="/app/ticket/123" />
        ).dive()
        expect(component).toMatchSnapshot()
    })

    it('default cell with a click handler passed', () => {
        const component = shallow(<Cell {...minProps} onClick={_noop} />).dive()
        expect(component).toMatchSnapshot()
    })
})
