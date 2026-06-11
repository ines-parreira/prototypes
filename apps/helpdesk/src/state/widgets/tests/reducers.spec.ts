import { fromJS } from 'immutable'

import type { GorgiasAction } from 'state/types'

import * as types from '../constants'
import { initialState, reducer } from '../reducers'
import type { Widget } from '../types'

describe('reducers', () => {
    describe('widgets', () => {
        it('initial state', () => {
            expect(reducer(undefined, {} as GorgiasAction)).toEqualImmutable(
                initialState,
            )
        })

        it('fetch list', () => {
            const items = [
                {
                    order: 0,
                    type: 'card',
                    title: 'Customer',
                    path: '',
                    widgets: [],
                } as unknown as Widget,
                {
                    order: 1,
                    type: 'card',
                    title: 'Orders',
                    path: 'orders',
                    widgets: [],
                } as unknown as Widget,
            ]

            const expected = initialState
                .merge({
                    items,
                })
                .setIn(['_internal', 'hasFetchedWidgets'], true)

            expect(
                reducer(initialState, {
                    type: types.FETCH_WIDGETS_SUCCESS,
                    items,
                }),
            ).toEqualImmutable(expected)
        })
    })

    describe('DROP update', () => {
        const makeWidget = (id: number) =>
            fromJS({ id, type: 'custom', order: id })

        // State with four widgets in editedItems and drag.group='root' so
        // isDraggingARootSource=true and the reducer operates on editedItems.
        const stateWithEditedItems = initialState
            .setIn(
                ['_internal', 'editedItems'],
                fromJS([
                    makeWidget(0),
                    makeWidget(1),
                    makeWidget(2),
                    makeWidget(3),
                ]),
            )
            .setIn(['_internal', 'drag', 'group'], 'root')

        const dropUpdateAction = (overrides: Record<string, unknown>) =>
            ({
                type: types.DROP,
                eventType: 'update',
                targetParentTemplatePath: '',
                source: fromJS({}),
                widgetType: types.CUSTOM_WIDGET_TYPE,
                integrationId: undefined,
                appId: undefined,
                key: '',
                toIndex: 0,
                fromIndex: 0,
                ...overrides,
            }) as unknown as GorgiasAction

        it('uses data-key as actualFromIndex to move the correct item when key differs from DOM index', () => {
            // Widget at editedIndex 3 (key='3') is dragged to position 0.
            // fromIndex=2 is the DOM position (wrong, because one item was filtered
            // from the DOM), but key='3' is the correct editedItems index.
            const result = reducer(
                stateWithEditedItems,
                dropUpdateAction({ key: '3', toIndex: 0, fromIndex: 2 }),
            )

            const editedItems = result.getIn(['_internal', 'editedItems'])
            expect(
                editedItems
                    .map((w: ReturnType<typeof makeWidget>) => w.get('id'))
                    .toJS(),
            ).toEqual([3, 0, 1, 2])
        })

        it('falls back to fromIndex when key is not a numeric string', () => {
            // key='' is not a valid integer, so actualFromIndex=fromIndex=2.
            const result = reducer(
                stateWithEditedItems,
                dropUpdateAction({ key: '', toIndex: 0, fromIndex: 2 }),
            )

            const editedItems = result.getIn(['_internal', 'editedItems'])
            expect(
                editedItems
                    .map((w: ReturnType<typeof makeWidget>) => w.get('id'))
                    .toJS(),
            ).toEqual([2, 0, 1, 3])
        })
    })

    describe('custom actions edition', () => {
        it('set the data correctly', () => {
            const data = [
                {
                    label: 'anything',
                },
                {
                    data: {
                        works: 'too',
                    },
                },
            ]
            const currentState = initialState.setIn(
                ['_internal', 'currentlyEditedWidgetPath'],
                '0.meta.custom.links',
            )

            const expectedState = currentState
                .setIn(
                    ['_internal', 'editedItems'].concat(
                        '0.meta.custom.links'.split('.'),
                    ),
                    fromJS(data),
                )
                .setIn(['_internal', 'isDirty'], true)

            expect(
                reducer(currentState, {
                    type: types.UPDATE_CUSTOM_ACTION,
                    data,
                }),
            ).toEqualImmutable(expectedState)
        })
    })
})
