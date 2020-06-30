import React from 'react'
import {shallow} from 'enzyme'

import configureStore from '../../../../../../store/configureStore'
import * as viewsConfig from '../../../../../../config/views'
import HeaderCell from '../HeaderCell'

describe('ViewTable::Table::HeaderCell', () => {
    const viewConfig = viewsConfig.views.first()

    class ActionsComponent extends React.Component {
        render() {
            return <div>ACTIONS</div>
        }
    }

    const minProps = {
        type: viewConfig.get('name'),
        field: viewConfig.get('fields').first(),
        fields: viewConfig.get('fields').take(3),
        isLast: false,
        isSearch: false,
        ActionsComponent,
        store: configureStore(),
    }

    it('default cell', () => {
        const component = shallow(<HeaderCell {...minProps} />).dive()
        expect(component).toMatchSnapshot()
        expect(component.find(ActionsComponent)).toBeDefined()
    })

    it('not main field cell', () => {
        const component = shallow(
            <HeaderCell {...minProps} field={viewConfig.get('fields').get(1)} />
        ).dive()
        expect(component).toMatchSnapshot()
    })

    it('sortable field cell', () => {
        const component = shallow(
            <HeaderCell
                {...minProps}
                field={viewConfig
                    .get('fields')
                    .find((field) => field.get('name') === 'created')}
            />
        ).dive()
        expect(component).toMatchSnapshot()
    })

    it('last cell', () => {
        const component = shallow(<HeaderCell {...minProps} isLast />).dive()
        expect(component).toMatchSnapshot()
    })
})
