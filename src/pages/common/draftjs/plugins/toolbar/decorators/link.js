//@flow
import React from 'react'
import { ContentBlock, ContentState } from 'draft-js'
import LinkPopover from '../components/LinkPopover'
import { removeLink } from '../../utils'
import type { StrategyCallback, ComponentProps } from './types'

type Config = {
    isActive: () => boolean,
    onLinkEdit: (entityKey: string, text: string, url: string) => void
}

export default (config: Config) => ({
    strategy: (contentBlock: ContentBlock, callback: StrategyCallback, contentState: ContentState) => {
        contentBlock.findEntityRanges(
            (character) => {
                const entityKey = character.getEntity()
                return entityKey !== null && contentState.getEntity(entityKey).getType() === 'link'
            }, callback
        )
    },
    component: (props: ComponentProps) => {
        const { contentState, entityKey, children, decoratedText, getEditorState, setEditorState } = props
        const { url } = contentState.getEntity(entityKey).getData()
        return (
            <LinkPopover
                id={entityKey}
                url={url}
                onEdit={config.isActive() ? () => {
                    config.onLinkEdit(entityKey, decoratedText, url)
                } : undefined}
                // Hide delete button if url === decoratedText:
                // https://github.com/gorgias/gorgias/pull/3942#issuecomment-443758756
                onDelete={url !== decoratedText ?  () => {
                    setEditorState(removeLink(entityKey, getEditorState()))
                } : undefined}
            >
                {children}
            </LinkPopover>
        )
    },
})
