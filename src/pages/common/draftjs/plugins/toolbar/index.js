//@flow
import decorateComponentWithProps from 'decorate-component-with-props'
import {ContentBlock, EditorState, KeyBindingUtil} from 'draft-js'
import {foundUrl, link} from './decorators'
import Toolbar from './Toolbar'
import Image from './components/Image'
import type {PluginMethods} from '../types'
import {removeLink} from '../utils'
import {getSelectedEntityKey, getSelectedText} from '../../../../../utils/editor'
import type {ActionName} from './types'
import type {Node} from 'react'

// documentation:
// https://github.com/draft-js-plugins/draft-js-plugins/blob/master/HOW_TO_CREATE_A_PLUGIN.md

export type Config = {
    imageDecorator?: Node => Node,
    theme?: any,
    getDisplayedActions: () => ?ActionName[],
    onLinkEdit: (entityKey: string, text: string, url: string) => void,
    onLinkCreate: (text: string) => void
}

export default (config: Config) => {
    const isLinkDisplayed = () => Toolbar.isDisplayedAction('LINK', config.getDisplayedActions())

    return ({
        decorators: [
            foundUrl(),
            link({
                isActive: isLinkDisplayed,
                onLinkEdit: config.onLinkEdit
            })
        ],

        blockRendererFn: (block: ContentBlock, { getEditorState }: PluginMethods) => {
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

        keyBindingFn: (e: SyntheticKeyboardEvent<*>) => {
            // Mod+K
            if (isLinkDisplayed() && e.key === 'k' && KeyBindingUtil.hasCommandModifier(e)) {
                return 'insert-link'
            }
        },

        handleKeyCommand: (command: string, editorState: EditorState, pluginMethods: PluginMethods) => {
            const { setEditorState } = pluginMethods
            const contentState = editorState.getCurrentContent()
            const selection = editorState.getSelection()

            if (command === 'insert-link') {
                const entityKey = getSelectedEntityKey(contentState, selection)

                if (entityKey && contentState.getEntity(entityKey).getType() === 'link') {
                    setEditorState(removeLink(entityKey, editorState))
                } else {
                    config.onLinkCreate(getSelectedText(contentState, selection))
                }

                return 'handled'
            }

            return 'not-handled'
        }
    })
}
