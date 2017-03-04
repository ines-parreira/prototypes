import decorateComponentWithProps from 'decorate-component-with-props'
import createStore from './createStore'
import decorators from './decorators'
import {getToolbarActions} from './utils'
import Toolbar from './Toolbar'

const toolbarPlugin = () => {
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
    }
}

export default toolbarPlugin
