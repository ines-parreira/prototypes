import type { ComponentType, KeyboardEvent, ReactNode } from 'react'

import decorateComponentWithProps from 'decorate-component-with-props'
import type { ContentBlock } from 'draft-js'
import { EditorState, KeyBindingUtil, Modifier } from 'draft-js'

import { draftjsGorgiasCustomBlockRenderers } from 'common/editor'

import {
    EditorHandledNotHandled,
    getSelectedEntityKey,
    getSelectedText,
} from '../../../../../utils/editor'
import type { Plugin, PluginMethods } from '../types'
import { removeLink } from '../utils'
import Image from './components/Image'
import Video from './components/Video'
import discountCodeLink from './decorators/discountCodeLink'
import foundUrl from './decorators/foundUrl'
import link from './decorators/link'
import type { Config } from './types'
import { ActionName } from './types'

// documentation:
// https://github.com/draft-js-plugins/draft-js-plugins/blob/master/HOW_TO_CREATE_A_PLUGIN.md

export const isDisplayedAction = (
    name: ActionName,
    displayedActions?: ActionName[] | null,
) => {
    if (!displayedActions) {
        // Translate should only be shown when explicitly included
        if (name === ActionName.Translate) {
            return false
        }
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
            const contentState = getEditorState().getCurrentContent()
            // render img (atomic block)
            const entityKey = block.getEntityAt(0)
            if (block.getType() === 'atomic' && entityKey) {
                const entity = contentState.getEntity(entityKey)
                const type = entity.getType()
                const theme = config.theme ?? {}

                const decorate = (
                    Base: ComponentType<any>,
                ): ComponentType<any> => {
                    const Decorated =
                        config.imageDecorator?.(Base as unknown as ReactNode) ??
                        Base
                    return decorateComponentWithProps(
                        Decorated as unknown as ComponentType<any>,
                        { theme },
                    )
                }

                if (type === draftjsGorgiasCustomBlockRenderers.Img) {
                    const component = decorate(Image)
                    return { component, editable: false }
                }

                if (type === draftjsGorgiasCustomBlockRenderers.Video) {
                    const component = decorate(Video)
                    return { component, editable: false }
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
                    let selectionRect: DOMRect | undefined
                    try {
                        const nativeSel = window.getSelection()
                        if (nativeSel && nativeSel.rangeCount > 0) {
                            const range = nativeSel.getRangeAt(0)
                            const rect = range.getBoundingClientRect()
                            if (rect.width > 0) selectionRect = rect
                        }
                    } catch {}
                    if (!selection.isCollapsed()) {
                        const highlighted = Modifier.applyInlineStyle(
                            contentState,
                            selection,
                            'LINK_HIGHLIGHT',
                        )
                        setEditorState(
                            EditorState.push(
                                editorState,
                                highlighted,
                                'change-inline-style',
                            ),
                        )
                    }

                    config.onLinkCreate(
                        getSelectedText(contentState, selection),
                        selectionRect,
                    )
                }

                return EditorHandledNotHandled.Handled
            }

            return EditorHandledNotHandled.NotHandled
        },
    }
}
