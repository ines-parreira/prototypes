import React, {ComponentProps} from 'react'
import {fromJS, Map, List} from 'immutable'
import {createEvent, fireEvent, render} from '@testing-library/react'
import {Provider} from 'react-redux'
import thunk from 'redux-thunk'
import configureMockStore from 'redux-mock-store'

import * as viewsConfig from 'config/views'
import * as ticketFixtures from 'fixtures/ticket'
import shortcutManager from 'services/shortcutManager/shortcutManager'
import {RootState, StoreDispatch} from 'state/types'
import SearchRankScenarioContext from 'pages/common/components/SearchRankScenarioProvider/SearchRankScenarioContext'
import {mockSearchRank} from 'fixtures/searchRank'
import BlankState from 'pages/common/components/BlankState/index.js'
import Row from 'pages/common/components/ViewTable/Table/Row'
import {ViewNavDirection} from 'state/views/types'

import Table from '../Table'

const middlewares = [thunk]
const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>(
    middlewares
)

jest.mock(
    '../Table/Row',
    () =>
        ({
            isSelected,
            selectable,
            item,
            onItemClick,
        }: ComponentProps<typeof Row>) =>
            (
                <tr>
                    <td>
                        Row:
                        <div>selectable: {selectable?.toString()}</div>
                        <div>isSelected: {isSelected?.toString()}</div>
                        {item && (
                            <button
                                data-testid={`click-item-${
                                    item?.get('id') as string
                                }`}
                                onClick={() => onItemClick?.(item)}
                            />
                        )}
                    </td>
                </tr>
            )
)
jest.mock('../Table/HeaderCell', () => () => <td>HeaderCell</td>)
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
        navigation: fromJS({prev_items: null, next_items: null}),
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

    it('should register search rank item selection on item click', () => {
        const {getByTestId} = render(
            <SearchRankScenarioContext.Provider value={mockSearchRank}>
                <Provider store={mockStore(defaultState)}>
                    <Table {...minProps} />
                </Provider>
            </SearchRankScenarioContext.Provider>
        )

        fireEvent.click(
            getByTestId(
                `click-item-${minProps.items.getIn(['0', 'id']) as string}`
            )
        )

        expect(mockSearchRank.registerResultSelection).toHaveBeenLastCalledWith(
            {id: minProps.items.getIn(['0', 'id']), index: 0}
        )
    })

    it('should register search rank item selection on open item shortcut', () => {
        const {container} = render(
            <SearchRankScenarioContext.Provider value={mockSearchRank}>
                <Provider store={mockStore(defaultState)}>
                    <Table {...minProps} />
                </Provider>
            </SearchRankScenarioContext.Provider>
        )

        const boundShortcuts = (
            shortcutManager.bind as jest.MockedFunction<
                typeof shortcutManager.bind
            >
        ).mock.calls[0][1]
        boundShortcuts!['OPEN_ITEM'].action!(createEvent.keyDown(container))

        expect(mockSearchRank.registerResultSelection).toHaveBeenLastCalledWith(
            {id: minProps.items.getIn(['0', 'id']), index: 0}
        )
    })

    it.each([
        ['next page', ViewNavDirection.NextView, 'GO_NEXT_PAGE'],
        ['prev page', ViewNavDirection.PrevView, 'GO_PREV_PAGE'],
    ])(
        'should fetch items with the search rank from the context on the %s shortcut',
        (testName, direction, shortcut) => {
            const {container} = render(
                <SearchRankScenarioContext.Provider value={mockSearchRank}>
                    <Provider store={mockStore(defaultState)}>
                        <Table
                            {...minProps}
                            navigation={fromJS({
                                prev_items: true,
                                next_items: true,
                            })}
                        />
                    </Provider>
                </SearchRankScenarioContext.Provider>
            )

            const boundShortcuts = (
                shortcutManager.bind as jest.MockedFunction<
                    typeof shortcutManager.bind
                >
            ).mock.calls[0][1]
            boundShortcuts![shortcut].action!(createEvent.keyDown(container))

            expect(minProps.fetchViewItems).toHaveBeenLastCalledWith(
                direction,
                null,
                null,
                mockSearchRank
            )
        }
    )

    it.each([
        ['next page', ViewNavDirection.NextView, 'keyboard_arrow_right'],
        ['prev page', ViewNavDirection.PrevView, 'keyboard_arrow_left'],
    ])(
        'should fetch items with the search rank from the context on %s navigation button click',
        (testName, direction, buttonText) => {
            const {getByText} = render(
                <SearchRankScenarioContext.Provider value={mockSearchRank}>
                    <Provider store={mockStore(defaultState)}>
                        <Table
                            {...minProps}
                            navigation={fromJS({
                                prev_items: true,
                                next_items: true,
                            })}
                        />
                    </Provider>
                </SearchRankScenarioContext.Provider>
            )

            fireEvent.click(getByText(buttonText))

            expect(minProps.fetchViewItems).toHaveBeenLastCalledWith(
                direction,
                null,
                null,
                mockSearchRank
            )
        }
    )

    it('should render navigation buttons when prev_items and next_items are defined', () => {
        const store = mockStore(defaultState)
        const {container} = render(
            <Provider store={store}>
                <Table
                    {...minProps}
                    navigation={fromJS({
                        next_items: 'next_items',
                        prev_items: 'prev_items',
                    })}
                />
            </Provider>
        )

        expect(container.getElementsByClassName('navigation')).toHaveLength(1)
    })

    it('should render navigation buttons when prev_cursor and next_cursor are defined', () => {
        const store = mockStore(defaultState)
        const {container} = render(
            <Provider store={store}>
                <Table
                    {...minProps}
                    navigation={fromJS({
                        next_cursor: 'next_cursor',
                        prev_cursor: 'prev_cursor',
                    })}
                />
            </Provider>
        )

        expect(container.getElementsByClassName('navigation')).toHaveLength(1)
    })
})
