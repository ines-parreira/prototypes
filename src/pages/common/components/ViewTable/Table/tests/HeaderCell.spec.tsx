import React from 'react'
import {shallow} from 'enzyme'
import {Store} from 'redux'
import {Map, List} from 'immutable'

import untypedConfigureStore from '../../../../../../store/configureStore.js'
import * as viewsConfig from '../../../../../../config/views'
import HeaderCell from '../HeaderCell'
import {RootState} from '../../../../../../state/types'

// $TsFixMe: Remove on store/configureStore migration
const configureStore = (untypedConfigureStore as unknown) as (
    store: Partial<RootState>
) => Store<RootState>

describe('ViewTable::Table::HeaderCell', () => {
    const viewConfig = viewsConfig.views.first() as Map<any, any>

    class ActionsComponent extends React.Component {
        render() {
            return <div>ACTIONS</div>
        }
    }

    const viewConfigFields = viewConfig.get('fields') as List<any>

    const minProps = {
        type: viewConfig.get('name'),
        field: viewConfigFields.first(),
        fields: viewConfigFields.take(3) as List<any>,
        isLast: false,
        isSearch: false,
        ActionsComponent,
        store: configureStore({}),
    }

    it('default cell', () => {
        const component = shallow(<HeaderCell {...minProps} />).dive()
        expect(component).toMatchSnapshot()
        expect(component.find(ActionsComponent)).toBeDefined()
    })

    it('not main field cell', () => {
        const component = shallow(
            <HeaderCell {...minProps} field={viewConfigFields.get(1)} />
        ).dive()
        expect(component).toMatchSnapshot()
    })

    it('sortable field cell', () => {
        const component = shallow(
            <HeaderCell
                {...minProps}
                field={viewConfigFields.find(
                    (field: Map<any, any>) => field.get('name') === 'created'
                )}
            />
        ).dive()
        expect(component).toMatchSnapshot()
    })

    it('last cell', () => {
        const component = shallow(<HeaderCell {...minProps} isLast />).dive()
        expect(component).toMatchSnapshot()
    })
})
