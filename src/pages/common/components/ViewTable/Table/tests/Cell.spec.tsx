import React from 'react'
import {shallow} from 'enzyme'
import {fromJS, Map, List} from 'immutable'
import _omit from 'lodash/omit'
import _noop from 'lodash/noop'

import * as viewsConfig from '../../../../../../config/views'
import * as ticketFixtures from '../../../../../../fixtures/ticket'
import {CellContainer} from '../Cell'

describe('ViewTable::Table::Cell', () => {
    const viewConfig = viewsConfig.views.first() as Map<any, any>

    const minProps = {
        config: viewConfig,
        type: viewConfig.get('name'),
        item: fromJS(ticketFixtures.ticket),
        field: (viewConfig.get('fields') as List<any>).first(),
    }

    it('should use default props', () => {
        const props = {..._omit(minProps, ['item'])}
        const component = shallow(<CellContainer {...props} />)
        expect(component.props()).toMatchSnapshot()
    })

    it('default cell with no click handler passed (cant open items)', () => {
        const component = shallow(<CellContainer {...minProps} />)
        expect(component).toMatchSnapshot()
    })

    it('default cell with a url passed', () => {
        const component = shallow(
            <CellContainer {...minProps} itemUrl="/app/ticket/123" />
        )
        expect(component).toMatchSnapshot()
    })

    it('default cell with a click handler passed', () => {
        const component = shallow(
            <CellContainer {...minProps} onClick={_noop} />
        )
        expect(component).toMatchSnapshot()
    })
})
