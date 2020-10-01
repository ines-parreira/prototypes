import React, {ComponentProps, ComponentType} from 'react'
import {shallow} from 'enzyme'
import {fromJS} from 'immutable'

import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import FilterTopbar, {FilterTopbarComponent} from '../FilterTopbar'
import * as viewsConfig from '../../../../../config/views'
import {
    addFieldFilter,
    removeFieldFilter,
    resetView,
    updateFieldFilter,
    updateFieldFilterOperator,
    updateView,
} from '../../../../../state/views/actions'

const mockStore = configureMockStore([thunk])

const FilterTopbarMock = (FilterTopbar as unknown) as ComponentType<
    ComponentProps<typeof FilterTopbar> & {store?: any}
>

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
        updateView,
        addFieldFilter,
        removeFieldFilter,
        updateFieldFilter,
        type: 'ticket',
        isSearch: false,
        fetchViewItems: jest.fn(),
        isUpdate: false,
        pristineActiveView: fromJS({}),
        updateFieldFilterOperator: updateFieldFilterOperator,
        resetView: resetView,
        schemas: fromJS({}),
        submitView: jest.fn(),
        deleteView: jest.fn(),
        activeView: fromJS({editMode: true}),
        config: viewsConfig.getConfigByName('ticket'),
    }

    beforeEach(() => {
        jest.clearAllMocks()
        minProps.fetchViewItems.mockResolvedValue(undefined)
        minProps.submitView.mockResolvedValue(undefined)
        minProps.deleteView.mockResolvedValue(undefined)
    })

    describe('mapStateToProps()', () => {
        it('should map the state correctly', () => {
            const component = shallow(
                <FilterTopbarMock
                    {...minProps}
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
                <FilterTopbarComponent
                    {...minStore}
                    {...minProps}
                    isUpdate={false}
                />
            )
            expect(component).toMatchSnapshot()
        })

        it('should render correctly when updating a view (here we have delete button)', () => {
            const component = shallow(
                <FilterTopbarComponent
                    {...minStore}
                    {...minProps}
                    isUpdate={true}
                />
            )
            expect(component).toMatchSnapshot()
        })
    })
})
