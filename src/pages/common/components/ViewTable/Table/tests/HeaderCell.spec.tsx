import React from 'react'
import {Provider} from 'react-redux'
import {fireEvent, render} from '@testing-library/react'
import configureMockStore from 'redux-mock-store'
import {Map, List} from 'immutable'

import {views} from 'config/views'
import {OrderDirection} from 'models/api/types'
import {ViewField} from 'models/view/types'
import {RootState, StoreDispatch} from 'state/types'
import {fetchViewItems, setOrderDirection} from 'state/views/actions'
import {assumeMock} from 'utils/testing'

import HeaderCell from '../HeaderCell'

jest.mock('state/views/actions')
const fetchViewItemsMock = assumeMock(fetchViewItems)
const setOrderDirectionMock = assumeMock(setOrderDirection)

const mockedDispatch = jest.fn()
jest.mock('hooks/useAppDispatch', () => () => mockedDispatch)

jest.mock(
    'pages/common/components/ViewTable/ShowMoreFieldsDropdown',
    () => () => <div>ShowMoreFieldsDropdown</div>
)

describe('ViewTable::Table::HeaderCell', () => {
    const viewConfig = views.first() as Map<any, any>

    class ActionsComponent extends React.Component {
        render() {
            return <div>ACTIONS</div>
        }
    }

    const viewConfigFields = viewConfig.get('fields') as List<any>

    const minProps = {
        ActionsComponent,
        field: viewConfigFields.first(),
        fields: viewConfigFields.take(3) as List<any>,
        isLast: false,
        isSearch: false,
        type: viewConfig.get('name'),
    }

    const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>()

    it('diplays the default cell', () => {
        const {container} = render(
            <Provider store={mockStore({})}>
                <HeaderCell {...minProps} />
            </Provider>
        )
        expect(container.firstChild).toMatchSnapshot()
    })

    it('does not display ActionsComponent for non-main field cell', () => {
        const {container} = render(
            <Provider store={mockStore()}>
                <HeaderCell {...minProps} field={viewConfigFields.get(1)} />
            </Provider>
        )
        expect(container.firstChild).toMatchSnapshot()
    })

    it('displays sortable field cell', () => {
        const {container} = render(
            <Provider store={mockStore()}>
                <HeaderCell
                    {...minProps}
                    field={viewConfigFields.find(
                        (field: Map<any, any>) =>
                            field.get('name') === ViewField.Created
                    )}
                />
            </Provider>
        )
        expect(container.firstChild).toMatchSnapshot()
    })

    it('displays More fields dropdown after the last cell', () => {
        const {container} = render(
            <Provider store={mockStore()}>
                <HeaderCell {...minProps} isLast />
            </Provider>
        )
        expect(container.firstChild).toMatchSnapshot()
    })

    it('sorts by the field value on click', () => {
        const field = viewConfigFields.find(
            (field: Map<any, any>) => field.get('name') === ViewField.Created
        ) as Map<any, any>

        const {getByText} = render(
            <Provider store={mockStore()}>
                <HeaderCell {...minProps} field={field} />
            </Provider>
        )

        fireEvent.click(getByText(field.get('title')))

        expect(fetchViewItemsMock).toHaveBeenCalledWith(
            undefined,
            undefined,
            undefined,
            undefined,
            {orderBy: `${field.get('path') as string}:${OrderDirection.Desc}`}
        )
        expect(setOrderDirectionMock).toHaveBeenCalledWith(
            field.get('path'),
            OrderDirection.Desc
        )
    })
})
