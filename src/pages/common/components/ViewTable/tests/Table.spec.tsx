import React, {ComponentProps} from 'react'
import {fromJS, Map, List} from 'immutable'
import {createEvent, fireEvent, render} from '@testing-library/react'
import {Provider} from 'react-redux'
import thunk from 'redux-thunk'
import configureMockStore from 'redux-mock-store'

import * as viewsConfig from '../../../../../config/views'
import * as ticketFixtures from '../../../../../fixtures/ticket'
import BlankState from '../../BlankState/index.js'
import Table from '../Table'
import Row from '../Table/Row'
import shortcutManager from '../../../../../services/shortcutManager/shortcutManager'
import {RootState, StoreDispatch} from '../../../../../state/types'

const middlewares = [thunk]
const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>(
    middlewares
)

jest.mock(
    '../Table/Row',
    () =>
        ({isSelected, selectable}: ComponentProps<typeof Row>) =>
            (
                <div>
                    Row:
                    <div>selectable: {selectable?.toString()}</div>
                    <div>isSelected: {isSelected?.toString()}</div>
                </div>
            )
)
jest.mock('../Table/HeaderCell', () => () => <div>HeaderCell</div>)
jest.mock(
    '../../BlankState/index.js',
    () =>
        ({message}: ComponentProps<typeof BlankState>) =>
            (
                <div>
                    BlankState
                    <div>{message}</div>
                </div>
            )
)
jest.mock('../../../../../services/shortcutManager/shortcutManager')

describe('<Table />', () => {
    const viewConfig = viewsConfig.views.first() as Map<any, any>
    const defaultState: Partial<RootState> = {}
    const minProps: ComponentProps<typeof Table> = {
        view: fromJS({}),
        type: viewConfig.get('name'),
        fields: (viewConfig.get('fields') as List<any>).take(3) as List<any>,
        config: viewsConfig.getConfigByName('ticket'),
        items: fromJS([ticketFixtures.ticket]),
        isSearch: false,
        isLoading: () => false,
        navigation: fromJS({hasPrevItems: false, hasNextItems: false}),
        fetchViewItems: jest.fn(),
        getItemUrl: jest.fn(),
        onItemClick: () => undefined,
        ActionsComponent: null,
        selectedItemsIds: fromJS([]),
    }

    beforeEach(() => {
        jest.resetAllMocks()
    })

    it('should display a view with no fields', () => {
        const {container} = render(
            <Provider store={mockStore(defaultState)}>
                <Table {...minProps} fields={fromJS([])} />
            </Provider>
        )
        expect(container.firstChild).toMatchSnapshot()
    })

    it('should display a default view', () => {
        const {container} = render(
            <Provider store={mockStore(defaultState)}>
                <Table {...minProps} />
            </Provider>
        )
        expect(container.firstChild).toMatchSnapshot()
    })

    it('should display a default view with option selectable set to false', () => {
        const {container} = render(
            <Provider store={mockStore(defaultState)}>
                <Table {...minProps} selectable={false} />
            </Provider>
        )
        expect(container.firstChild).toMatchSnapshot()
    })

    it('should display a default view with no items', () => {
        const {container} = render(
            <Provider store={mockStore(defaultState)}>
                <Table {...minProps} items={fromJS([])} />
            </Provider>
        )
        expect(container.firstChild).toMatchSnapshot()
    })

    it('should display a modified view with no items, should reset the view and fetch first items ', () => {
        const store = mockStore(defaultState)
        const {getByText} = render(
            <Provider store={store}>
                <Table
                    {...minProps}
                    items={fromJS([])}
                    view={fromJS({dirty: true})}
                />
            </Provider>
        )

        fireEvent.click(getByText('Reset view'))

        expect(store.getActions()).toMatchSnapshot()
        expect(minProps.fetchViewItems).toHaveBeenLastCalledWith()
    })

    it(
        'should select all items on the current page of the active view when there is a click on the "select all"' +
            ' checkbox',
        () => {
            const store = mockStore(defaultState)
            const {getByRole} = render(
                <Provider store={store}>
                    <Table {...minProps} />
                </Provider>
            )

            fireEvent.click(getByRole('checkbox'))

            expect(store.getActions()).toMatchSnapshot()
        }
    )

    it('should display all checkboxes as checked when all items are selected', () => {
        const {getByRole} = render(
            <Provider store={mockStore(defaultState)}>
                <Table
                    {...minProps}
                    selectedItemsIds={fromJS([ticketFixtures.ticket.id])}
                />
            </Provider>
        )

        expect((getByRole('checkbox') as HTMLInputElement).checked).toBe(true)
    })

    it('should not getItemUrl on open item shortcut callback when no items', () => {
        const {container} = render(
            <Provider store={mockStore(defaultState)}>
                <Table
                    {...minProps}
                    items={fromJS([])}
                    onItemClick={undefined}
                />
            </Provider>
        )

        const boundShortcuts = (
            shortcutManager.bind as jest.MockedFunction<
                typeof shortcutManager.bind
            >
        ).mock.calls[0][1]
        boundShortcuts!['OPEN_ITEM'].action!(createEvent.keyDown(container))

        expect(minProps.getItemUrl).not.toBeCalled()
    })
})
