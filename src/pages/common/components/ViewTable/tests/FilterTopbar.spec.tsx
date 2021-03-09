import React, {ComponentProps} from 'react'
import {fromJS, Map} from 'immutable'
import {render, fireEvent} from '@testing-library/react'

import {FilterTopbarContainer} from '../FilterTopbar'
import {view as viewFixture} from '../../../../../fixtures/views'
import ConfirmButton from '../../ConfirmButton'
import * as viewsConfig from '../../../../../config/views'
import * as utils from '../../../../../utils'

const ticketChannelEqualsEmailFilter = "eq('ticket.channel', 'email')"

const createViewWithFilters = (filters: string) =>
    fromJS({
        ...viewFixture,
        editMode: true,
        filters,
        filters_ast: utils.getAST(filters),
    }) as Map<any, any>

const minProps = ({
    agents: fromJS({}),
    teams: fromJS({}),
    activeView: createViewWithFilters(ticketChannelEqualsEmailFilter),
    areFiltersValid: true,
    currentUser: fromJS({first_name: 'Steve', id: 2}),
    isDirty: false,
    pristineActiveView: fromJS({}),
    schemas: fromJS({}),
    updateView: jest.fn(),
    addFieldFilter: jest.fn(),
    removeFieldFilter: jest.fn(),
    updateFieldFilter: jest.fn(),
    type: 'ticket',
    isSearch: false,
    fetchViewItems: jest.fn(),
    isUpdate: true,
    updateFieldFilterOperator: jest.fn(),
    resetView: jest.fn(),
    submitView: jest.fn(),
    deleteView: jest.fn(),
    activeViewIdSet: jest.fn(),
    viewCreated: jest.fn(),
    viewDeleted: jest.fn(),
    viewUpdated: jest.fn(),
    config: viewsConfig.getConfigByName('ticket'),
} as unknown) as ComponentProps<typeof FilterTopbarContainer>

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

jest.mock('../../ViewSharing/ViewSharingButton', () => () => null)

jest.mock(
    '../../ConfirmButton',
    () => ({confirm}: ComponentProps<typeof ConfirmButton>) => (
        <div onClick={confirm} />
    )
)

beforeEach(() => {
    jest.clearAllMocks()
    jest.spyOn(utils, 'getDefaultOperator').mockImplementation(() => 'foo')
    jest.spyOn(global.Date, 'now').mockImplementation(() => 0) // ConfirmButton generates ids based on the date
    ;(minProps.fetchViewItems as jest.MockedFunction<
        typeof minProps.fetchViewItems
    >).mockResolvedValue(undefined)
    ;(minProps.submitView as jest.MockedFunction<
        typeof minProps.submitView
    >).mockResolvedValue(viewFixture)
    ;(minProps.deleteView as jest.MockedFunction<
        typeof minProps.deleteView
    >).mockResolvedValue(fromJS({...viewFixture, id: 8}))
})

afterEach(() => {
    ;((utils.getDefaultOperator as unknown) as jest.SpyInstance).mockRestore()
    ;((global.Date.now as unknown) as jest.SpyInstance).mockRestore()
})

describe('<FilterTopbar/>', () => {
    describe('render', () => {
        it('should render active view filters', () => {
            const {container} = render(<FilterTopbarContainer {...minProps} />)
            expect(container.firstChild).toMatchSnapshot()
        })

        it('should not render delete button when creating new view', () => {
            const {container} = render(
                <FilterTopbarContainer {...minProps} isUpdate={false} />
            )
            expect(container.firstChild).toMatchSnapshot()
        })

        it('should not render footer when in search mode', () => {
            const {container} = render(
                <FilterTopbarContainer {...minProps} isSearch={true} />
            )
            expect(container.firstChild).toMatchSnapshot()
        })
    })

    describe('updating filters', () => {
        it('should update active view on remove field', () => {
            const {getByTestId} = render(
                <FilterTopbarContainer {...minProps} />
            )
            fireEvent.click(getByTestId('remove-field'))
            expect(minProps.removeFieldFilter).toHaveBeenLastCalledWith(0)
        })

        it('should update active view on update field', () => {
            const {getByTestId} = render(
                <FilterTopbarContainer {...minProps} />
            )
            fireEvent.click(getByTestId('update-field'))
            expect(minProps.updateFieldFilter).toHaveBeenLastCalledWith(
                0,
                'foo'
            )
        })

        it('should update active view on update field operator', () => {
            const {getByTestId} = render(
                <FilterTopbarContainer {...minProps} />
            )
            fireEvent.click(getByTestId('update-field-operator'))
            expect(minProps.updateFieldFilterOperator).toHaveBeenLastCalledWith(
                0,
                'foo'
            )
        })

        it('should update active view on add field', () => {
            const {getByText} = render(<FilterTopbarContainer {...minProps} />)
            fireEvent.click(getByText('Channel'))
            expect(minProps.addFieldFilter).toHaveBeenLastCalledWith(
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
            const {rerender} = render(<FilterTopbarContainer {...minProps} />)
            rerender(
                <FilterTopbarContainer
                    {...minProps}
                    activeView={createViewWithFilters('')}
                />
            )
            expect(minProps.fetchViewItems).toHaveBeenLastCalledWith()
        })

        it('should not fetch view items when filters did not change', () => {
            const {rerender} = render(<FilterTopbarContainer {...minProps} />)
            rerender(
                <FilterTopbarContainer
                    {...minProps}
                    activeView={minProps.activeView.set(
                        'name',
                        viewFixture.name + ' foo'
                    )}
                />
            )
            expect(minProps.fetchViewItems).not.toHaveBeenCalled()
        })

        it('should not fetch view items when view id changed', () => {
            const {rerender} = render(<FilterTopbarContainer {...minProps} />)
            rerender(
                <FilterTopbarContainer
                    {...minProps}
                    activeView={minProps.activeView.set(
                        'id',
                        viewFixture.id + 1
                    )}
                />
            )
            expect(minProps.fetchViewItems).not.toHaveBeenCalled()
        })

        it('should not fetch view items when filters are not valid', () => {
            const {rerender} = render(<FilterTopbarContainer {...minProps} />)
            rerender(
                <FilterTopbarContainer
                    {...minProps}
                    activeView={createViewWithFilters('')}
                    areFiltersValid={false}
                />
            )
            expect(minProps.fetchViewItems).not.toHaveBeenCalled()
        })
    })
})
