import decorateComponentWithProps from 'decorate-component-with-props'
import {Entity} from 'draft-js'

import createStore from './createStore'
import decorators from './decorators'
import {
    getToolbarActions,
    attachImmutableEntitiesToVariables,
} from './utils'
import Toolbar from './Toolbar'
import Image from './components/Image'

// documentation: https://github.com/draft-js-plugins/draft-js-plugins/blob/master/HOW_TO_CREATE_A_PLUGIN.md

const toolbarPlugin = (config = {}) => {
    const store = createStore()

    const toolbarProps = {
        store,
        actions: getToolbarActions(store),
    }

    return {
        initialize: ({getEditorState, setEditorState}) => {
            store.updateItem('getEditorState', getEditorState)
            store.updateItem('setEditorState', setEditorState)
        },
        Toolbar: decorateComponentWithProps(Toolbar, toolbarProps),
        decorators,
        blockRendererFn: (block) => {
            // render img (atomic block)
            if (block.getType() === 'atomic') {
                const entity = Entity.get(block.getEntityAt(0))
                const type = entity.getType()
                if (type === 'img') {
                    let component = Image
                    const theme = config.theme ? config.theme : {}
                    if (config.imageDecorator) {
                        component = config.imageDecorator(component)
                    }
                    component = decorateComponentWithProps(component, {theme})
                    return {
                        component,
                        editable: false,
                    }
                }
            }

            return null
        },
        onChange: (editorState) => {
            // transform variables in badges
            let newEditorState = attachImmutableEntitiesToVariables(editorState)

            // DO NOT FORCE SELECTION in this `onChange` function otherwise is focuses in the editor on each change

            return newEditorState
        },
    }
}

export default toolbarPlugin
