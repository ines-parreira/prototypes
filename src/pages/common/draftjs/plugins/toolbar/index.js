import decorateComponentWithProps from 'decorate-component-with-props'

import createStore from './createStore'
import decorators from './decorators'
import {getToolbarActions} from './utils'
import Toolbar from './Toolbar'
import Image from './components/Image'

// documentation:
// https://github.com/draft-js-plugins/draft-js-plugins/blob/master/HOW_TO_CREATE_A_PLUGIN.md

const toolbarPlugin = (config = {}) => {
    const toolbarStore = createStore()

    const toolbarProps = {
        toolbarStore,
        actions: getToolbarActions(config.toolbarProps),
    }

    return {
        initialize: ({getEditorState, setEditorState}) => {
            toolbarStore.updateItem('getEditorState', getEditorState)
            toolbarStore.updateItem('setEditorState', setEditorState)
        },
        Toolbar: decorateComponentWithProps(Toolbar, toolbarProps),
        decorators,
        blockRendererFn: (block, {getEditorState}) => {
            const contetState = getEditorState().getCurrentContent()
            // render img (atomic block)
            const entityKey = block.getEntityAt(0)
            if (block.getType() === 'atomic' && entityKey) {
                const entity = contetState.getEntity(entityKey)
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
    }
}

export default toolbarPlugin
