import {ReactNode, ComponentType, KeyboardEvent} from 'react'
import decorateComponentWithProps from 'decorate-component-with-props'
import {ContentBlock, EditorState, KeyBindingUtil} from 'draft-js'

import {PluginMethods} from '../types'
import {removeLink} from '../utils'
import {
    getSelectedEntityKey,
    getSelectedText,
} from '../../../../../utils/editor'

import foundUrl from './decorators/foundUrl'
import link from './decorators/link'
import Toolbar from './Toolbar'
import Image from './components/Image'
import {Config, ActionName} from './types'

// documentation:
// https://github.com/draft-js-plugins/draft-js-plugins/blob/master/HOW_TO_CREATE_A_PLUGIN.md

export * from './types.js'

export default function toolbarPlugin(config: Config) {
    const isLinkDisplayed = () =>
        Toolbar.isDisplayedAction(ActionName.Link, config.getDisplayedActions())

    return {
        decorators: [
            foundUrl(),
            link({
                isActive: isLinkDisplayed,
                onLinkEdit: config.onLinkEdit,
            }),
        ],

        blockRendererFn: (
            block: ContentBlock,
            {getEditorState}: PluginMethods
        ) => {
            const contetState = getEditorState().getCurrentContent()
            // render img (atomic block)
            const entityKey = block.getEntityAt(0)
            if (block.getType() === 'atomic' && entityKey) {
                const entity = contetState.getEntity(entityKey)
                const type = entity.getType()
                if (type === 'img') {
                    let component: ReactNode = Image
                    const theme = config.theme ? config.theme : {}
                    if (config.imageDecorator) {
                        component = config.imageDecorator(component)
                    }
                    component = decorateComponentWithProps(
                        component as ComponentType<any>,
                        {theme}
                    )
                    return {
                        component,
                        editable: false,
                    }
                }
            }

            return null
        },

        keyBindingFn: (e: KeyboardEvent) => {
            // Mod+K
            if (
                isLinkDisplayed() &&
                e.key === 'k' &&
                KeyBindingUtil.hasCommandModifier(e)
            ) {
                return 'insert-link'
            }
        },

        handleKeyCommand: (
            command: string,
            editorState: EditorState,
            pluginMethods: PluginMethods
        ) => {
            const {setEditorState} = pluginMethods
            const contentState = editorState.getCurrentContent()
            const selection = editorState.getSelection()

            if (command === 'insert-link') {
                const entityKey = getSelectedEntityKey(contentState, selection)

                if (
                    entityKey &&
                    contentState.getEntity(entityKey).getType() === 'link'
                ) {
                    setEditorState(removeLink(entityKey, editorState))
                } else {
                    config.onLinkCreate(
                        getSelectedText(contentState, selection)
                    )
                }

                return 'handled'
            }

            return 'not-handled'
        },
    }
}
