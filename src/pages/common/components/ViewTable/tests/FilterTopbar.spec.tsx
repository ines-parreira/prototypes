import React from 'react'
import {fromJS, Map} from 'immutable'
import {render, fireEvent} from '@testing-library/react'

import {FilterTopbarContainer} from '../FilterTopbar'
import * as viewsConfig from '../../../../../config/views'
import {view as viewFixture} from '../../../../../fixtures/views.js'
import * as utils from '../../../../../utils'

const ticketChannelEqualsEmailFilter = "eq('ticket.channel', 'email')"

const createViewWithFilters = (filters: string) =>
    fromJS({
        ...viewFixture,
        editMode: true,
        filters,
        filters_ast: utils.getAST(filters),
    }) as Map<any, any>

const defaultProps = {
    type: 'ticket',
    isSearch: false,
    isUpdate: true,
    activeView: createViewWithFilters(ticketChannelEqualsEmailFilter),
    pristineActiveView: fromJS({}),
    fetchViewItems: jest.fn(),
    schemas: fromJS({}),
    resetView: jest.fn(),
    addFieldFilter: jest.fn(),
    removeFieldFilter: jest.fn(),
    updateFieldFilter: jest.fn(),
    updateFieldFilterOperator: jest.fn(),
    submitView: jest.fn(),
    deleteView: jest.fn(),
    config: viewsConfig.getConfigByName('ticket'),
    agents: fromJS({}),
    teams: fromJS({}),
    areFiltersValid: true,
    currentUser: fromJS({first_name: 'Steve'}),
    isDirty: false,
}

jest.mock('../Filters/index.js', () => {
    return ({
        view,
        removeFieldFilter,
        updateFieldFilter,
        updateFieldFilterOperator,
    }: {
        view: Map<any, any>
        removeFieldFilter: (index: number) => void
        updateFieldFilter: (index: number, value: string) => void
        updateFieldFilterOperator: (index: number, operator: string) => void
    }) => (
        <div>
            <div>Filters: {view.get('filters')}</div>
            <button
                data-testid="remove-field"
                onClick={() => removeFieldFilter(0)}
                value="remove field"
            />
            <button
                data-testid="update-field"
                onClick={() => updateFieldFilter(0, 'foo')}
                value="update field"
            />
            <button
                data-testid="update-field-operator"
                onClick={() => updateFieldFilterOperator(0, 'foo')}
                value="update field operator"
            />
        </div>
    )
})

jest.mock('../../ViewSharing/index.js', () => () => null)

beforeEach(() => {
    jest.clearAllMocks()
    jest.spyOn(utils, 'getDefaultOperator').mockImplementation(() => 'foo')
    jest.spyOn(global.Date, 'now').mockImplementation(() => 0) // ConfirmButton generates ids based on the date
    defaultProps.fetchViewItems.mockResolvedValue(undefined)
    defaultProps.submitView.mockResolvedValue(undefined)
    defaultProps.deleteView.mockResolvedValue(undefined)
})

afterEach(() => {
    ;((utils.getDefaultOperator as unknown) as jest.SpyInstance).mockRestore()
    ;((global.Date.now as unknown) as jest.SpyInstance).mockRestore()
})

describe('<FilterTopbar/>', () => {
    describe('render', () => {
        it('should render active view filters', () => {
            const {container} = render(
                <FilterTopbarContainer {...defaultProps} />
            )
            expect(container.firstChild).toMatchSnapshot()
        })

        it('should not render delete button when creating new view', () => {
            const {container} = render(
                <FilterTopbarContainer {...defaultProps} isUpdate={false} />
            )
            expect(container.firstChild).toMatchSnapshot()
        })

        it('should not render footer when in search mode', () => {
            const {container} = render(
                <FilterTopbarContainer {...defaultProps} isSearch={true} />
            )
            expect(container.firstChild).toMatchSnapshot()
        })
    })

    describe('updating filters', () => {
        it('should update active view on remove field', () => {
            const {getByTestId} = render(
                <FilterTopbarContainer {...defaultProps} />
            )
            fireEvent.click(getByTestId('remove-field'))
            expect(defaultProps.removeFieldFilter).toHaveBeenLastCalledWith(0)
        })

        it('should update active view on update field', () => {
            const {getByTestId} = render(
                <FilterTopbarContainer {...defaultProps} />
            )
            fireEvent.click(getByTestId('update-field'))
            expect(defaultProps.updateFieldFilter).toHaveBeenLastCalledWith(
                0,
                'foo'
            )
        })

        it('should update active view on update field operator', () => {
            const {getByTestId} = render(
                <FilterTopbarContainer {...defaultProps} />
            )
            fireEvent.click(getByTestId('update-field-operator'))
            expect(
                defaultProps.updateFieldFilterOperator
            ).toHaveBeenLastCalledWith(0, 'foo')
        })

        it('should update active view on add field', () => {
            const {getByText} = render(
                <FilterTopbarContainer {...defaultProps} />
            )
            fireEvent.click(getByText('Channel'))
            expect(defaultProps.addFieldFilter).toHaveBeenLastCalledWith(
                expect.objectContaining({
                    name: 'channel',
                }),
                {
                    left: 'ticket.channel',
                    operator: 'foo',
                }
            )
        })
    })

    describe('on active view change', () => {
        it('should fetch view items', () => {
            const {rerender} = render(
                <FilterTopbarContainer {...defaultProps} />
            )
            rerender(
                <FilterTopbarContainer
                    {...defaultProps}
                    activeView={createViewWithFilters('')}
                />
            )
            expect(defaultProps.fetchViewItems).toHaveBeenLastCalledWith()
        })

        it('should not fetch view items when filters did not change', () => {
            const {rerender} = render(
                <FilterTopbarContainer {...defaultProps} />
            )
            rerender(
                <FilterTopbarContainer
                    {...defaultProps}
                    activeView={defaultProps.activeView.set(
                        'name',
                        viewFixture.name + ' foo'
                    )}
                />
            )
            expect(defaultProps.fetchViewItems).not.toHaveBeenCalled()
        })

        it('should not fetch view items when view id changed', () => {
            const {rerender} = render(
                <FilterTopbarContainer {...defaultProps} />
            )
            rerender(
                <FilterTopbarContainer
                    {...defaultProps}
                    activeView={defaultProps.activeView.set(
                        'id',
                        viewFixture.id + 1
                    )}
                />
            )
            expect(defaultProps.fetchViewItems).not.toHaveBeenCalled()
        })

        it('should not fetch view items when filters are not valid', () => {
            const {rerender} = render(
                <FilterTopbarContainer {...defaultProps} />
            )
            rerender(
                <FilterTopbarContainer
                    {...defaultProps}
                    activeView={createViewWithFilters('')}
                    areFiltersValid={false}
                />
            )
            expect(defaultProps.fetchViewItems).not.toHaveBeenCalled()
        })
    })
})
