import {fromJS, Map, List} from 'immutable'
import _isObject from 'lodash/isObject'
import _last from 'lodash/last'
import _initial from 'lodash/initial'

import {
    isRootSource,
    stripLastListsFromPath,
    jsonToWidget,
    makeWrapper,
} from 'pages/common/components/infobar/utils'
import {GorgiasAction} from '../types'

import {
    itemsWithContext,
    itemsWithUpdatedWidgets,
    reorderWidgets,
} from './utils'

import * as types from './constants'
import {WidgetsState, WidgetContextType} from './types'

export const initialState: WidgetsState = fromJS({
    items: [],
    currentContext: 'ticket',
    _internal: {
        currentlyEditedWidgetPath: '',
        drag: {
            group: '',
            isDragging: false,
        },
        editedItems: [],
        hasFetchedWidgets: false,
        hasGeneratedWidgets: false,
        isEditing: false,
        isDirty: false,
        loading: {},
    },
})

export default function reducer(
    state: WidgetsState = initialState,
    action: GorgiasAction
): WidgetsState {
    switch (action.type) {
        case types.FETCH_WIDGETS_SUCCESS: {
            const receivedItems = fromJS(action.items)

            return state
                .set('items', receivedItems)
                .setIn(['_internal', 'hasFetchedWidgets'], true)
                .setIn(['_internal', 'hasGeneratedWidgets'], false)
        }

        case types.RESET_WIDGETS: {
            return state.setIn(['_internal', 'hasGeneratedWidgets'], false)
        }

        case types.START_EDITION_MODE: {
            // put current template as edited template
            const items = state.get('items', fromJS([]))
            const ticketWidgets = itemsWithContext(
                items,
                action.context as WidgetContextType
            )

            return state
                .set('currentContext', action.context)
                .setIn(['_internal', 'isEditing'], true)
                .setIn(['_internal', 'editedItems'], ticketWidgets)
                .setIn(['_internal', 'isDirty'], false)
        }

        case types.STOP_EDITION_MODE: {
            return state
                .setIn(['_internal', 'isEditing'], false)
                .setIn(['_internal', 'editedItems'], fromJS([]))
        }

        case types.START_WIDGET_EDITION: {
            return state.setIn(
                ['_internal', 'currentlyEditedWidgetPath'],
                action.path
            )
        }

        case types.STOP_WIDGET_EDITION: {
            return state.setIn(['_internal', 'currentlyEditedWidgetPath'], '')
        }

        case types.GENERATE_AND_SET_WIDGETS: {
            const items = state.get('items', fromJS([]))

            return state
                .set(
                    'items',
                    itemsWithUpdatedWidgets(
                        items,
                        action.context as WidgetContextType,
                        fromJS(action.items)
                    )
                )
                .setIn(['_internal', 'hasGeneratedWidgets'], true)
                .setIn(['_internal', 'isDirty'], true)
        }

        case types.SET_EDITED_WIDGETS: {
            return state.setIn(
                ['_internal', 'editedItems'],
                fromJS(action.items)
            )
        }

        case types.SET_EDITION_AS_DIRTY: {
            return state.setIn(['_internal', 'isDirty'], true)
        }

        case types.SELECT_CONTEXT: {
            return state.set('currentContext', action.context)
        }

        case types.DRAG: {
            return state
                .setIn(['_internal', 'drag', 'isDragging'], true)
                .setIn(['_internal', 'drag', 'group'], action.group)
        }

        case types.CANCEL_DRAG: {
            return state
                .setIn(['_internal', 'drag', 'isDragging'], false)
                .setIn(['_internal', 'drag', 'group'], '')
        }

        case types.DROP: {
            const {
                eventType,
                key,
                toIndex,
                fromIndex,
                targetParentTemplatePath,
                source,
                widgetType,
                integrationId,
                appId,
            } = action

            const currentGroup: string =
                state.getIn(['_internal', 'drag', 'group']) || ''

            const isDraggingARootSource = isRootSource(currentGroup)

            // build absolute path of dragged property
            let sourceFlattenAbsolutePath = currentGroup
            if (isDraggingARootSource) {
                sourceFlattenAbsolutePath = key as string
            } else if (key) {
                sourceFlattenAbsolutePath += `.${key}`
            }

            // get data from source path to generate a widget for it
            const relativeSourcePath = sourceFlattenAbsolutePath.replace(
                /\[]/g,
                '0'
            )
            const sourceData = (source as Map<any, any>).getIn(
                relativeSourcePath.split('.')
            )

            // drag is off
            let newState = state
                .setIn(['_internal', 'drag', 'isDragging'], false)
                .setIn(['_internal', 'drag', 'group'], '')

            // key (so the path) is calculated from the difference between the source and the target paths
            const strippedKey = stripLastListsFromPath(key)

            // prepare data to be transformed into widget
            const isSimpleField = !_isObject(sourceData)
            const preparedData = {
                [strippedKey]: isSimpleField
                    ? sourceData
                    : (sourceData as Map<any, any>).toJS(),
            }

            // generate the widget we are going to put with the others
            let widget = fromJS(
                widgetType === types.STANDALONE_WIDGET_TYPE
                    ? {
                          meta: {
                              displayCard: true,
                          },
                          path: '',
                          type: 'card',
                          order: 999,
                          title: 'Standalone widget',
                          widgets: [],
                      }
                    : jsonToWidget(
                          isDraggingARootSource
                              ? preparedData[key as string]
                              : preparedData
                      )
            ) as Map<any, any>

            // path where to put generated widgets
            // if dragging a root source, dragged items are real widgets items (coming from server)
            // otherwise they are templates widget (with the template syntax)
            const widgetsItems = isDraggingARootSource
                ? ['_internal', 'editedItems']
                : ['_internal', 'editedItems']
                      .concat((targetParentTemplatePath as string).split('.'))
                      .concat(['widgets'])

            // if is a dragging source, wrap it in a wrapper
            if (isDraggingARootSource) {
                const context = state.get('currentContext', '')
                const strippedSourceFlattenAbsolutePath =
                    stripLastListsFromPath(sourceFlattenAbsolutePath)
                widget = makeWrapper({
                    order: widgetsItems.length,
                    context,
                    child: widget,
                    sourcePath: strippedSourceFlattenAbsolutePath.split('.'),
                    widgetType,
                } as any)

                if (integrationId) {
                    widget = widget.set('integration_id', integrationId)
                }

                if (appId) {
                    widget = widget.set('app_id', appId)
                }
            }

            // get first child widget, may be useful later
            const childWidget = (
                widget.get('widgets', fromJS([])) as List<any>
            ).first()

            // current list at the path to put generated widgets
            const currentList = newState.getIn(
                widgetsItems,
                fromJS([])
            ) as List<any>

            if (eventType === 'add') {
                // on add, insert the element at previously calculated path
                const element: Map<any, any> = isDraggingARootSource
                    ? widget
                    : childWidget
                let shouldAddWidget = true

                if (isDraggingARootSource) {
                    ;(
                        newState.getIn(widgetsItems, []) as Map<any, any>[]
                    ).forEach((widget: Map<any, any>) => {
                        const type = element.get('type')
                        const integrationId = element.get('integration_id')
                        const typeIsAlreadyPresent =
                            // not includes
                            ![
                                types.HTTP_WIDGET_TYPE,
                                types.CUSTOMER_EXTERNAL_DATA_WIDGET_TYPE,
                                types.STANDALONE_WIDGET_TYPE,
                            ].includes(type) && widget.get('type') === type
                        const integrationIdIsAlreadyPresent =
                            type === types.HTTP_WIDGET_TYPE &&
                            widget.get('type') === type &&
                            widget.get('integration_id') === integrationId

                        const appIdIsAlreadyPresent =
                            type === types.CUSTOMER_EXTERNAL_DATA_WIDGET_TYPE &&
                            widget.get('type') === type &&
                            widget.get('app_id') === appId

                        if (
                            typeIsAlreadyPresent ||
                            integrationIdIsAlreadyPresent ||
                            appIdIsAlreadyPresent
                        ) {
                            shouldAddWidget = false
                        }
                    })
                }

                if (shouldAddWidget) {
                    newState = newState
                        .setIn(
                            widgetsItems,
                            reorderWidgets(
                                currentList.insert(toIndex as number, element)
                            )
                        )
                        .setIn(['_internal', 'isDirty'], true)
                }
            } else if (eventType === 'update') {
                // on update, move the element in previously calculated path
                const oldItem = currentList.get(fromIndex as number)
                const newList = reorderWidgets(
                    currentList
                        .delete(fromIndex as number)
                        .insert(toIndex as number, oldItem)
                )

                newState = newState
                    .setIn(widgetsItems, newList)
                    .setIn(['_internal', 'isDirty'], true)
            }

            return newState
        }

        case types.REMOVE_EDITED_WIDGET: {
            const {templatePath, absolutePath} = action

            let newAbsolutePath = absolutePath as string[]
            let newTemplatePath = templatePath as string

            // remove last lists in source absolute path, since objects and arrays are here considered the same
            let listCounter = 0

            while (_last(newAbsolutePath) === '[]') {
                listCounter++
                newAbsolutePath = _initial(newAbsolutePath)
            }

            // remove last lists from template path
            // if we remove something in an array, we remove the array
            for (let i = 0; i < listCounter; i++) {
                newTemplatePath = newTemplatePath.replace(
                    new RegExp('.widgets.0$'),
                    ''
                )
            }

            // we guess the target is a root source if the template path never goes under as 'widgets' key
            // it means the target is the highest element
            const isRootTarget = !~(templatePath as string).indexOf('widgets')
            // if the target is a root widget, remove the whole item and not only the template
            if (isRootTarget && (templatePath as string).length) {
                newTemplatePath = (templatePath as string).split('.')[0]
            }

            const widgetsPath = ['_internal', 'editedItems']

            // remove the widget
            return state
                .setIn(
                    widgetsPath,
                    reorderWidgets(
                        (
                            state.getIn(widgetsPath, fromJS({})) as Map<
                                any,
                                any
                            >
                        ).removeIn(
                            newTemplatePath.split('.')
                        ) as unknown as List<any>
                    )
                )
                .setIn(['_internal', 'isDirty'], true)
        }

        case types.UPDATE_EDITED_WIDGET: {
            const {item} = action

            // get edited widget path
            const widgetsItems = ['_internal', 'editedItems']
            let widgetPath: string | string[] = state.getIn(
                ['_internal', 'currentlyEditedWidgetPath'],
                ''
            ) as string
            widgetPath = widgetsItems.concat(widgetPath.split('.'))

            return state
                .setIn(
                    widgetPath,
                    (
                        state.getIn(widgetPath, fromJS({})) as Map<any, any>
                    ).mergeDeep(item as Map<any, any>)
                )
                .setIn(['_internal', 'isDirty'], true)
        }

        case types.UPDATE_CUSTOM_ACTION: {
            const editedActionsPath: string = state.getIn(
                ['_internal', 'currentlyEditedWidgetPath'],
                ''
            )
            return state
                .setIn(
                    ['_internal', 'editedItems'].concat(
                        editedActionsPath.split('.')
                    ),
                    fromJS(action.data)
                )
                .setIn(['_internal', 'isDirty'], true)
        }

        case types.SUBMIT_WIDGET_START: {
            return state.setIn(['_internal', 'loading', 'saving'], true)
        }

        case types.SUBMIT_WIDGET_SUCCESS: {
            const items = state.get('items', fromJS([])) as List<any>
            const updatedItems = itemsWithUpdatedWidgets(
                items,
                action.context as WidgetContextType,
                fromJS(action.items)
            )

            return state
                .set('items', updatedItems)
                .setIn(['_internal', 'editedItems'], fromJS(action.items))
                .setIn(['_internal', 'loading', 'saving'], false)
                .setIn(['_internal', 'isDirty'], false)
        }

        case types.SUBMIT_WIDGET_ERROR: {
            return state.setIn(['_internal', 'loading', 'saving'], false)
        }

        default:
            return state
    }
}
