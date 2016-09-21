import * as types from './constants'
import {fromJS} from 'immutable'
import _ from 'lodash'
import {jsonToWidget} from '../../pages/tickets/detail/components/infobar/utils'
import {DEFAULT_SOURCE_PATH} from '../../config'

export const initialState = fromJS({
    items: [],
    _internal: {
        hasFetchedWidgets: false,
        hasGeneratedWidgets: false,
        currentlyEditedWidgetPath: '',
        editedTemplate: [],
        isEditing: false,
        drag: {
            isDragging: false,
            absolutePath: ''
        }
    }
})

export default (state = initialState, action) => {
    switch (action.type) {
        case types.FETCH_WIDGETS_SUCCESS: {
            return state
                .set('items', fromJS(action.items))
                .setIn(['_internal', 'hasFetchedWidgets'], true)
                .setIn(['_internal', 'hasGeneratedWidgets'], false)
        }

        case types.RESET_WIDGETS: {
            return state.setIn(['_internal', 'hasGeneratedWidgets'], false)
        }

        case types.START_EDITION: {
            const ticketWidgetsTemplate = state
                .get('items')
                .find((w) => w.get('context') === action.context)
                .get('template', fromJS([]))

            return state
                .setIn(['_internal', 'isEditing'], true)
                .setIn(['_internal', 'editedTemplate'], ticketWidgetsTemplate)
        }

        case types.STOP_EDITION: {
            return state
                .setIn(['_internal', 'isEditing'], false)
                .setIn(['_internal', 'editedTemplate'], fromJS([]))
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
            return state
                .set('items', fromJS(action.items))
                .setIn(['_internal', 'hasGeneratedWidgets'], true)
        }

        case types.DRAG: {
            return state
                .setIn(['_internal', 'drag', 'isDragging'], true)
                .setIn(['_internal', 'drag', 'absolutePath'], action.absolutePath)
        }

        case types.CANCEL_DRAG: {
            return state
                .setIn(['_internal', 'drag', 'isDragging'], false)
                .setIn(['_internal', 'drag', 'absolutePath'], '')
        }

        case types.DROP: {
            const sourceAbsolutePath = state.getIn(['_internal', 'drag', 'absolutePath'])
            const {
                templatePath,
                targetAbsolutePath,
                source
            } = action

            console.log('DROP', sourceAbsolutePath, 'INTO', targetAbsolutePath)
            console.log('DONE', templatePath, source)

            // remove last lists in source absolute path, since objects and arrays are here considered the same
            let newSourceAbsolutePath = sourceAbsolutePath
            while (_.endsWith(newSourceAbsolutePath, '[]')) {
                newSourceAbsolutePath = newSourceAbsolutePath.slice(0, -2)
            }

            // get data from source path to generate a widget for it
            const relativeSourcePath = newSourceAbsolutePath.replace(/\[]/g, '.0')
            const sourceData = source.getIn(relativeSourcePath.split('.'))

            console.log('SOURCE DATA', relativeSourcePath, sourceData)

            // drag is off
            let newState = state
                .setIn(['_internal', 'drag', 'isDragging'], false)
                .setIn(['_internal', 'drag', 'absolutePath'], '')

            // key (so the path) is calculated from the difference between the source and the target paths
            let key = newSourceAbsolutePath.replace(targetAbsolutePath, '')
            key = _.trim(key, '.[]')

            const isSimpleField = !_.isObject(sourceData)
            let preparedData = isSimpleField ? sourceData : sourceData.toJS()
            preparedData = {
                [key]: preparedData
            }

            // generate the widget we are going to put with the others
            const widget = fromJS(jsonToWidget(preparedData))

            const childWidget = widget.getIn(['widgets', '0'])

            const hasTargetedRoot = !targetAbsolutePath

            let widgetsPath = ''
            let element = null

            // if target is root
            if (hasTargetedRoot) {
                // if simple field (not object nor list)
                if (isSimpleField) {
                    // check if a root widget already exists
                    const rootWidgetTemplatePath = newState
                        .getIn(['_internal', 'editedTemplate'])
                        .findKey((w) => {
                            return w.get('path') === DEFAULT_SOURCE_PATH
                        })

                    const rootWidgetAlreadyExists = !_.isUndefined(rootWidgetTemplatePath)

                    if (rootWidgetAlreadyExists) {
                        // if a root widget already exists, put the widgets child in there
                        element = childWidget
                        widgetsPath = ['_internal', 'editedTemplate']
                            .concat([rootWidgetTemplatePath])
                            .concat(['widgets'])
                    } else {
                        // if there is no root widget, create it
                        element = widget
                        widgetsPath = ['_internal', 'editedTemplate']
                    }
                } else {
                    // if object or list
                    element = childWidget
                    widgetsPath = ['_internal', 'editedTemplate']
                }
            } else {
                // if target is not root
                element = childWidget
                widgetsPath = ['_internal', 'editedTemplate']
                    .concat(templatePath.split('.'))
                    .concat(['widgets'])
            }

            // add widget to target widgets
            newState = newState
                .setIn(widgetsPath, newState
                    .getIn(widgetsPath, fromJS([]))
                    .push(element)
                )

            return newState
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

            const widgetsPath = ['_internal', 'editedTemplate']

            // remove the widget
            return state
                .setIn(widgetsPath, state
                    .getIn(widgetsPath)
                    .removeIn(newTemplatePath.split('.'))
                )
        }

        case types.UPDATE_EDITED_WIDGET: {
            const {
                item
            } = action

            // get edited widget path
            const widgetsPath = ['_internal', 'editedTemplate']
            let widgetPath = state.getIn(['_internal', 'currentlyEditedWidgetPath'], '')
            widgetPath = widgetsPath.concat(widgetPath.split('.'))

            return state
                .setIn(widgetPath, state
                    .getIn(widgetPath)
                    .merge(item)
                )
        }

        /*
         case types.ADD_EDITED_WIDGET: {
         return state
         .updateIn(['_internal', 'editedTemplate'], (items) => {
         return items.push(action.item)
         })
         }

         case types.UPDATE_EDITED_WIDGET: {
         if (!~action.index) {
         return state
         }

         return state
         .setIn(['_internal', 'editedTemplate', action.index], fromJS(action.item))
         }

         case types.REMOVE_EDITED_WIDGET: {
         if (!~action.index) {
         return state
         }

         return state
         .removeIn(['_internal', 'editedTemplate', action.index])
         }

         case types.ADD_FIELD_EDITED_WIDGET: {
         if (!~action.widgetIndex) {
         return state
         }

         return state
         .updateIn(['_internal', 'editedTemplate', action.widgetIndex, 'fields'], (fields) => {
         return fields.push(action.field)
         })
         }

         case types.UPDATE_FIELD_EDITED_WIDGET: {
         if (!~action.widgetIndex || !~action.fieldIndex) {
         return state
         }

         return state
         .setIn(['_internal', 'editedTemplate', action.widgetIndex, 'fields', action.fieldIndex], fromJS(action.field))
         }
         */

        default:
            return state
    }
}
