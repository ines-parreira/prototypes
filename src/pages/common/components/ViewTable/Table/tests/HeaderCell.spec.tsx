import React from 'react'
import {shallow} from 'enzyme'
import {fromJS, Map, List} from 'immutable'

import * as viewsConfig from '../../../../../../config/views'

import {HeaderCellContainer} from '../HeaderCell'

describe('ViewTable::Table::HeaderCell', () => {
    const viewConfig = viewsConfig.views.first() as Map<any, any>

    class ActionsComponent extends React.Component {
        render() {
            return <div>ACTIONS</div>
        }
    }

    const viewConfigFields = viewConfig.get('fields') as List<any>

    const minProps = {
        config: viewConfig,
        type: viewConfig.get('name'),
        field: viewConfigFields.first(),
        fields: viewConfigFields.take(3) as List<any>,
        isLast: false,
        isSearch: false,
        ActionsComponent,
        activeView: fromJS({}),
        fetchViewItems: jest.fn(),
        orderBy: '',
        orderDirection: '',
        selectedItemsIds: fromJS([]),
        setOrderDirection: jest.fn(),
    }

    it('default cell', () => {
        const component = shallow(<HeaderCellContainer {...minProps} />)
        expect(component).toMatchSnapshot()
        expect(component.find(ActionsComponent)).toBeDefined()
    })

    it('not main field cell', () => {
        const component = shallow(
            <HeaderCellContainer
                {...minProps}
                field={viewConfigFields.get(1)}
            />
        )
        expect(component).toMatchSnapshot()
    })

    it('sortable field cell', () => {
        const component = shallow(
            <HeaderCellContainer
                {...minProps}
                field={viewConfigFields.find(
                    (field: Map<any, any>) => field.get('name') === 'created'
                )}
            />
        )
        expect(component).toMatchSnapshot()
    })

    it('last cell', () => {
        const component = shallow(<HeaderCellContainer {...minProps} isLast />)
        expect(component).toMatchSnapshot()
    })
})
