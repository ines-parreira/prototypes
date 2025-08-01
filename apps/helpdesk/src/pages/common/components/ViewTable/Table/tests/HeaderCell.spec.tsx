import { assumeMock } from '@repo/testing'
import { fireEvent, render, screen } from '@testing-library/react'
import { fromJS, List, Map } from 'immutable'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'

import { views } from 'config/views'
import { OrderDirection } from 'models/api/types'
import { ViewField } from 'models/view/types'
import { RootState, StoreDispatch } from 'state/types'
import { fetchViewItems, setOrderDirection } from 'state/views/actions'

import HeaderCell from '../HeaderCell'

jest.mock('state/views/actions')
const fetchViewItemsMock = assumeMock(fetchViewItems)
const setOrderDirectionMock = assumeMock(setOrderDirection)

const mockedDispatch = jest.fn()
jest.mock('hooks/useAppDispatch', () => () => mockedDispatch)

const mockActionsComponent = 'ACTIONS'
const ActionsComponent = () => <div>{mockActionsComponent}</div>

describe('ViewTable::Table::HeaderCell', () => {
    const viewConfig = views.first() as Map<any, any>

    const viewConfigFields = viewConfig.get('fields') as List<any>

    const minProps = {
        ActionsComponent,
        field: viewConfigFields.first(),
        fields: viewConfigFields.take(3) as List<any>,
        shouldRenderShowMoreDropdown: false,
        isSearch: false,
        isEditMode: false,
        type: viewConfig.get('name'),
    }

    const createdViewField = viewConfigFields.find(
        (field: Map<any, any>) => field.get('name') === ViewField.Created,
    ) as Map<any, any>

    const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>()

    it('displays the default cell', () => {
        render(
            <Provider store={mockStore({})}>
                <HeaderCell {...minProps} />
            </Provider>,
        )

        expect(screen.getByText(mockActionsComponent)).toBeInTheDocument()
    })

    it('does not display ActionsComponent for non-main field cell', () => {
        render(
            <Provider store={mockStore()}>
                <HeaderCell {...minProps} field={viewConfigFields.get(1)} />
            </Provider>,
        )

        expect(screen.queryByText(mockActionsComponent)).not.toBeInTheDocument()
    })

    it.each([
        ['when not in search mode', false],
        ['when in search mode', true],
    ])('displays sortable field cell when %s', (_, isSearch) => {
        const { container } = render(
            <Provider store={mockStore()}>
                <HeaderCell
                    {...minProps}
                    field={createdViewField}
                    isSearch={isSearch}
                />
            </Provider>,
        )

        expect(container.getElementsByClassName('clickable')).toHaveLength(1)
    })

    it('should display sortable field cell when in search mode', () => {
        const { container } = render(
            <Provider store={mockStore()}>
                <HeaderCell {...minProps} field={createdViewField} isSearch />
            </Provider>,
        )

        expect(container.getElementsByClassName('clickable')).toHaveLength(1)
    })

    it.each([
        ['when not in search mode and not in edit mode', false, false],
        ['when in search mode and not in edit mode', true, false],
        ['when not in search mode and in edit mode', false, true],
    ])('sorts by the field value on click %s', (_, isSearch, isEditMode) => {
        render(
            <Provider store={mockStore()}>
                <HeaderCell
                    {...minProps}
                    field={createdViewField}
                    isSearch={isSearch}
                    isEditMode={isEditMode}
                />
            </Provider>,
        )

        fireEvent.click(screen.getByText(createdViewField.get('title')))

        expect(fetchViewItemsMock).toHaveBeenCalledWith(
            undefined,
            undefined,
            undefined,
            undefined,
            {
                orderBy: `${createdViewField.get('path') as string}:${
                    OrderDirection.Desc
                }`,
            },
        )
        expect(setOrderDirectionMock).toHaveBeenCalledWith({
            direction: OrderDirection.Desc,
            isEditable: isSearch || isEditMode,
            fieldPath: createdViewField.get('path'),
        })
    })

    it('should sort by field value on click when in search mode', () => {
        const { getByText } = render(
            <Provider store={mockStore()}>
                <HeaderCell {...minProps} field={createdViewField} isSearch />
            </Provider>,
        )

        fireEvent.click(getByText(createdViewField.get('title')))

        expect(fetchViewItemsMock).toHaveBeenCalled()
        expect(setOrderDirectionMock).toHaveBeenCalled()
    })

    it('should not enable sort by field value on click when not in search mode and isClickable is false', () => {
        const { getByText } = render(
            <Provider store={mockStore()}>
                <HeaderCell
                    {...minProps}
                    field={createdViewField}
                    isClickable={false}
                />
            </Provider>,
        )

        const field = getByText(createdViewField.get('title'))
        fireEvent.click(field)

        expect(field.parentNode).not.toHaveClass('clickable')
        expect(fetchViewItemsMock).not.toHaveBeenCalled()
        expect(setOrderDirectionMock).not.toHaveBeenCalled()
    })

    it('should not execute onClick when field has no filter', () => {
        const fieldWithoutFilter = viewConfigFields.find(
            (field: Map<any, any>) => field.get('name') === ViewField.TicketId,
        ) as Map<any, any>

        render(
            <Provider store={mockStore()}>
                <HeaderCell {...minProps} field={fieldWithoutFilter} />
            </Provider>,
        )

        fireEvent.click(screen.getByText(fieldWithoutFilter.get('title')))

        expect(fetchViewItemsMock).not.toHaveBeenCalled()
        expect(setOrderDirectionMock).not.toHaveBeenCalled()
    })

    it('should not execute onClick when field has filter but no sort', () => {
        const fieldWithFilterNoSort = viewConfigFields.find(
            (field: Map<any, any>) => field.get('name') === ViewField.Status,
        ) as Map<any, any>

        render(
            <Provider store={mockStore()}>
                <HeaderCell {...minProps} field={fieldWithFilterNoSort} />
            </Provider>,
        )

        fireEvent.click(screen.getByText(fieldWithFilterNoSort.get('title')))

        expect(fetchViewItemsMock).not.toHaveBeenCalled()
        expect(setOrderDirectionMock).not.toHaveBeenCalled()
    })

    it.each([
        [
            'when field is not the active sorted field',
            {
                order_by: (
                    viewConfigFields.find(
                        (field: Map<any, any>) =>
                            field.get('name') === ViewField.Updated,
                    ) as Map<any, any>
                ).get('name'),
                order_dir: OrderDirection.Desc,
            },
            OrderDirection.Desc,
            {
                orderBy: `${createdViewField.get('path') as string}:${OrderDirection.Desc}`,
            },
        ],
        [
            'when field is the active sorted field',
            {
                order_by: createdViewField.get('path'),
                order_dir: OrderDirection.Desc,
            },
            OrderDirection.Asc,
            {
                orderBy: `${createdViewField.get('path') as string}:${OrderDirection.Asc}`,
            },
        ],
        [
            'when field is the active sorted field',
            {
                order_by: createdViewField.get('path'),
                order_dir: OrderDirection.Asc,
            },
            undefined,
            undefined,
        ],
    ])(
        'sorts by the field value on click %s and %s %s',
        (_, active, direction, params) => {
            render(
                <Provider
                    store={mockStore({
                        views: fromJS({
                            active,
                        }),
                    })}
                >
                    <HeaderCell {...minProps} field={createdViewField} />
                </Provider>,
            )

            fireEvent.click(screen.getByText(createdViewField.get('title')))

            expect(fetchViewItemsMock).toHaveBeenCalledWith(
                undefined,
                undefined,
                undefined,
                undefined,
                params,
            )
            expect(setOrderDirectionMock).toHaveBeenCalledWith({
                direction,
                fieldPath: createdViewField.get('path'),
                isEditable: false,
            })
        },
    )

    it('should clear sort when field is currently sorted in ascending order', () => {
        render(
            <Provider
                store={mockStore({
                    views: fromJS({
                        active: {
                            order_by: createdViewField.get('path'),
                            order_dir: OrderDirection.Asc,
                        },
                    }),
                })}
            >
                <HeaderCell {...minProps} field={createdViewField} />
            </Provider>,
        )

        fireEvent.click(screen.getByText(createdViewField.get('title')))

        expect(fetchViewItemsMock).toHaveBeenCalledWith(
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
        )
        expect(setOrderDirectionMock).toHaveBeenCalledWith({
            direction: undefined,
            fieldPath: createdViewField.get('path'),
            isEditable: false,
        })
    })
})
