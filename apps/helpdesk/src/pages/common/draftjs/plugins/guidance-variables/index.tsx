import type { ContentBlock, ContentState, EditorState } from 'draft-js'

import type { GuidanceVariableList } from 'pages/aiAgent/components/GuidanceEditor/variables.types'
import type {
    DecoratorComponentProps,
    DecoratorStrategyCallback,
} from 'pages/common/draftjs/plugins/types'

import type { GuidanceVariableTagProps } from './GuidanceVariableTag'
import { GuidanceVariableTag } from './GuidanceVariableTag'
import { attachGuidanceVariableEntities } from './utils'

type Options = {
    size?: GuidanceVariableTagProps['size']
    getVariables?: () => GuidanceVariableList
    onClick?: (entityKey: string, element: HTMLElement) => void
}

export function createGuidanceVariablesPlugin(options: Options = {}) {
    return {
        decorators: [
            {
                strategy: (
                    contentBlock: ContentBlock,
                    callback: DecoratorStrategyCallback,
                    contentState: ContentState,
                ) => {
                    contentBlock.findEntityRanges((character) => {
                        const entityKey = character.getEntity()
                        return (
                            entityKey !== null &&
                            contentState.getEntity(entityKey).getType() ===
                                'guidance_variable'
                        )
                    }, callback)
                },
                component: (props: DecoratorComponentProps) => {
                    const { contentState, entityKey, children } = props

                    const handleClick = (element: HTMLElement) => {
                        options.onClick?.(entityKey, element)
                    }

                    const value = contentState.getEntity(entityKey).getData()
                        .value as string // eslint-disable-line @typescript-eslint/no-unsafe-member-access
                    return (
                        <GuidanceVariableTag
                            value={value}
                            size={options.size}
                            onClick={handleClick}
                        >
                            {children}
                        </GuidanceVariableTag>
                    )
                },
            },
        ],
        // reference https://github.com/draft-js-plugins/draft-js-plugins/blob/master/packages/emoji/src/modifiers/attachImmutableEntitiesToEmojis.ts
        onChange: (editorState: EditorState) =>
            attachGuidanceVariableEntities(editorState),
    }
}
