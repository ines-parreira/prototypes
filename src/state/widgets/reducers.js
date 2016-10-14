import * as types from './constants'
import {fromJS} from 'immutable'
import _ from 'lodash'
import {
    isRootSource,
    stripLastListsFromPath,
    jsonToWidget
} from '../../pages/tickets/detail/components/infobar/utils'
import {itemsWithContext, itemsWithUpdatedWidgets, reorderWidgets} from './utils'

export const initialState = fromJS({
    items: [],
    currentContext: 'ticket',
    _internal: {
        currentlyEditedWidgetPath: '',
        drag: {
            group: '',
            isDragging: false
        },
        editedItems: [],
        hasFetchedWidgets: false,
        hasGeneratedWidgets: false,
        isEditing: false,
        isDirty: false,
        loading: {}
    }
})

export default (state = initialState, action) => {
    switch (action.type) {
        case types.FETCH_WIDGETS_SUCCESS: {
            const receivedItems = fromJS(action.items)

            return state
                .set('items', reorderWidgets(receivedItems))
                .setIn(['_internal', 'hasFetchedWidgets'], true)
                .setIn(['_internal', 'hasGeneratedWidgets'], false)
        }

        case types.RESET_WIDGETS: {
            return state.setIn(['_internal', 'hasGeneratedWidgets'], false)
        }

        case types.START_EDITION_MODE: {
            // put current template as edited template
            const items = state.get('items', fromJS([]))
            const ticketWidgets = itemsWithContext(items, action.context)

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
            return state
                .setIn(['_internal', 'currentlyEditedWidgetPath'], action.path)
        }

        case types.STOP_WIDGET_EDITION: {
            return state
                .setIn(['_internal', 'currentlyEditedWidgetPath'], '')
        }

        case types.GENERATE_AND_SET_WIDGETS: {
            const items = state.get('items', fromJS([]))

            return state
                .set('items', itemsWithUpdatedWidgets(items, action.context, fromJS(action.items)))
                .setIn(['_internal', 'hasGeneratedWidgets'], true)
                .setIn(['_internal', 'isDirty'], true)
        }

        case types.SET_EDITED_WIDGETS: {
            return state
                .setIn(['_internal', 'editedItems'], fromJS(action.items))
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
                source
            } = action

            const currentGroup = state.getIn(['_internal', 'drag', 'group'])

            const isDraggingARootSource = isRootSource(currentGroup)

            // build absolute path of dragged property
            let sourceAbsolutePath = currentGroup
            if (isDraggingARootSource) {
                sourceAbsolutePath = key
            } else if (key) {
                sourceAbsolutePath += `.${key}`
            }

            // get data from source path to generate a widget for it
            const relativeSourcePath = sourceAbsolutePath.replace(/\[]/g, '.0')
            const sourceData = source.getIn(relativeSourcePath.split('.'))

            // drag is off
            let newState = state
                .setIn(['_internal', 'drag', 'isDragging'], false)
                .setIn(['_internal', 'drag', 'group'], '')

            // key (so the path) is calculated from the difference between the source and the target paths
            const strippedKey = stripLastListsFromPath(key)


            // prepare data to be transformed into widget
            const isSimpleField = !_.isObject(sourceData)
            const preparedData = {
                [strippedKey]: isSimpleField ? sourceData : sourceData.toJS()
            }

            // generate the widget we are going to put with the others
            let widget = fromJS(jsonToWidget(isDraggingARootSource ? preparedData[key] : preparedData))

            const context = state.get('currentContext', '')

            // path where to put generated widgets
            // if dragging a root source, dragged items are real widgets items (coming from server)
            // otherwise they are templates widget (with the template syntax)
            const widgetsItems = isDraggingARootSource
                ? ['_internal', 'editedItems']
                : ['_internal', 'editedItems']
                .concat(targetParentTemplatePath.split('.'))
                .concat(['widgets'])

            // if is a dragging source, wrap it in a wrapper
            if (isDraggingARootSource) {
                const strippedSourceAbsolutePath = stripLastListsFromPath(sourceAbsolutePath)

                widget = fromJS({
                    type: 'custom',
                    order: widgetsItems.size,
                    context,
                    template: {
                        type: 'wrapper',
                        path: strippedSourceAbsolutePath,
                        widgets: [widget]
                    }
                })
            }

            // get first child widget, may be useful later
            const childWidget = widget.getIn(['widgets', '0'], fromJS({}))

            // current list at the path to put generated widgets
            const currentList = newState
                .getIn(widgetsItems, fromJS([]))

            if (eventType === 'add') {
                // on add, insert the element at previously calculated path
                const element = isDraggingARootSource ? widget : childWidget

                newState = newState
                    .setIn(
                        widgetsItems,
                        currentList
                            .insert(toIndex, element)
                    )
            } else if (eventType === 'update') {
                // on update, move the element in previously calculated path
                const oldItem = currentList.get(fromIndex)
                const newList = currentList.delete(fromIndex).insert(toIndex, oldItem)

                newState = newState
                    .setIn(widgetsItems, newList)
            }

            return newState
                .setIn(['_internal', 'isDirty'], true)
        }

        case types.REMOVE_EDITED_WIDGET: {
            const {
                templatePath,
                absolutePath
            } = action

            let newAbsolutePath = absolutePath
            let newTemplatePath = templatePath

            // remove last lists in source absolute path, since objects and arrays are here considered the same
            let listCounter = 0
            while (_.endsWith(newAbsolutePath, '[]')) {
                listCounter++
                newAbsolutePath = newAbsolutePath.slice(0, -2)
            }

            // remove last lists from template path
            // if we remove something in an array, we remove the array
            for (let i = 0; i < listCounter; i++) {
                newTemplatePath = newTemplatePath.replace(new RegExp('.widgets.0$'), '')
            }

            // we guess the target is a root source if the template path never goes under as 'widgets' key
            // it means the target is the highest element
            const isRootTarget = !~templatePath.indexOf('widgets')
            // if the target is a root widget, remove the whole item and not only the template
            if (isRootTarget && templatePath.length) {
                newTemplatePath = templatePath.split('.')[0]
            }

            const widgetsPath = ['_internal', 'editedItems']

            // remove the widget
            return state
                .setIn(widgetsPath, state
                    .getIn(widgetsPath)
                    .removeIn(newTemplatePath.split('.'))
                )
                .setIn(['_internal', 'isDirty'], true)
        }

        case types.UPDATE_EDITED_WIDGET: {
            const {
                item
            } = action

            // get edited widget path
            const widgetsItems = ['_internal', 'editedItems']
            let widgetPath = state.getIn(['_internal', 'currentlyEditedWidgetPath'], '')
            widgetPath = widgetsItems.concat(widgetPath.split('.'))

            return state
                .setIn(widgetPath, state
                    .getIn(widgetPath)
                    .mergeDeep(item)
                )
                .setIn(['_internal', 'isDirty'], true)
        }

        case types.SUBMIT_WIDGET_START: {
            return state.setIn(['_internal', 'loading', 'saving'], true)
        }

        case types.SUBMIT_WIDGET_SUCCESS: {
            const items = state.get('items', fromJS([]))
            let updatedItems = itemsWithUpdatedWidgets(items, action.context, fromJS(action.items))
            updatedItems = reorderWidgets(updatedItems)

            return state
                .set('items', updatedItems)
                .setIn(['_internal', 'editedItems'], updatedItems)
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
