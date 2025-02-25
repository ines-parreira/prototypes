import { ComponentType, KeyboardEvent, ReactNode } from 'react'

import decorateComponentWithProps from 'decorate-component-with-props'
import { ContentBlock, EditorState, KeyBindingUtil } from 'draft-js'

import { draftjsGorgiasCustomBlockRenderers } from 'common/editor'

import {
    EditorHandledNotHandled,
    getSelectedEntityKey,
    getSelectedText,
} from '../../../../../utils/editor'
import { Plugin, PluginMethods } from '../types'
import { removeLink } from '../utils'
import Image from './components/Image'
import Video from './components/Video'
import discountCodeLink from './decorators/discountCodeLink'
import foundUrl from './decorators/foundUrl'
import link from './decorators/link'
import { ActionName, Config } from './types'

// documentation:
// https://github.com/draft-js-plugins/draft-js-plugins/blob/master/HOW_TO_CREATE_A_PLUGIN.md

export const isDisplayedAction = (
    name: ActionName,
    displayedActions?: ActionName[] | null,
) => {
    if (!displayedActions) {
        return true
    }

    return displayedActions.indexOf(name) !== -1
}

export default function toolbarPlugin(config: Config): Plugin {
    const isLinkDisplayed = () =>
        isDisplayedAction(ActionName.Link, config.getDisplayedActions())

    return {
        decorators: [
            foundUrl(),
            link({
                isActive: isLinkDisplayed,
                onLinkEdit: config.onLinkEdit,
            }),
            discountCodeLink(),
        ],

        blockRendererFn: (
            block: ContentBlock,
            { getEditorState }: PluginMethods,
        ) => {
            const contetState = getEditorState().getCurrentContent()
            // render img (atomic block)
            const entityKey = block.getEntityAt(0)
            if (block.getType() === 'atomic' && entityKey) {
                const entity = contetState.getEntity(entityKey)
                const type = entity.getType()
                if (type === draftjsGorgiasCustomBlockRenderers.Img) {
                    let component: ReactNode = Image
                    const theme = config.theme ? config.theme : {}
                    if (config.imageDecorator) {
                        component = config.imageDecorator(component)
                    }
                    component = decorateComponentWithProps(
                        component as ComponentType<any>,
                        { theme },
                    )
                    return {
                        component,
                        editable: false,
                    }
                }
                if (type === draftjsGorgiasCustomBlockRenderers.Video) {
                    let component: ReactNode = Video
                    const theme = config.theme ? config.theme : {}
                    if (config.imageDecorator) {
                        component = config.imageDecorator(component)
                    }
                    component = decorateComponentWithProps(
                        component as ComponentType<any>,
                        { theme },
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
                e.stopPropagation()
                return 'insert-link'
            }
        },

        handleKeyCommand: (
            command: string,
            editorState: EditorState,
            pluginMethods: PluginMethods,
        ) => {
            const { setEditorState } = pluginMethods
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
                        getSelectedText(contentState, selection),
                    )
                }

                return EditorHandledNotHandled.Handled
            }

            return EditorHandledNotHandled.NotHandled
        },
    }
}
