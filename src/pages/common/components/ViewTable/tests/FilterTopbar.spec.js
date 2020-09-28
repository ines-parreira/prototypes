import React from 'react'
import {shallow} from 'enzyme'
import {fromJS} from 'immutable'

import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import FilterTopbar, {FilterTopbarComponent} from '../FilterTopbar.tsx'
import * as viewsConfig from '../../../../../config/views'

const mockStore = configureMockStore([thunk])

describe('<FilterTopbar/>', () => {
    const minStore = {
        agents: fromJS({}),
        teams: fromJS({}),
        activeView: fromJS({}),
        areFiltersValid: true,
        currentUser: fromJS({first_name: 'Steve'}),
        isDirty: false,
        pristineActiveView: fromJS({}),
        schemas: fromJS({}),
    }

    const minProps = {
        isSearch: false,
        addFieldFilter: () => {},
        fetchViewItems: () => {},
        isUpdate: false,
        pristineActiveView: {},
        removeFieldFilter: () => {},
        updateFieldFilter: () => {},
        updateFieldFilterOperator: () => {},
        resetView: () => {},
        schemas: {},
        submitView: () => {},
        deleteView: () => {},
    }

    const connectedProps = Object.assign({}, minProps, {type: 'ticket'})
    const props = Object.assign({}, minProps, {
        activeView: fromJS({editMode: true}),
        config: viewsConfig.getConfigByName('ticket'),
    })

    describe('mapStateToProps()', () => {
        it('should map the state correctly', () => {
            const component = shallow(
                <FilterTopbar
                    {...connectedProps}
                    store={mockStore({
                        ...minStore,
                        views: fromJS({}),
                    })}
                />
            )
            expect(component).toMatchSnapshot()
        })
    })

    describe('render()', () => {
        it('should render correctly when creating a view (here no delete button)', () => {
            const component = shallow(
                <FilterTopbarComponent {...props} isUpdate={false} />
            )
            expect(component).toMatchSnapshot()
        })

        it('should render correctly when updating a view (here we have delete button)', () => {
            const component = shallow(
                <FilterTopbarComponent {...props} isUpdate={true} />
            )
            expect(component).toMatchSnapshot()
        })
    })
})
