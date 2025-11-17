import type { ContentBlock, ContentState } from 'draft-js'

import type {
    Decorator,
    DecoratorComponentProps,
    DecoratorStrategyCallback,
} from '../../types'
import { removeLink } from '../../utils'
import LinkPopover from '../components/LinkPopover'

type Config = {
    isActive: () => boolean
    onLinkEdit: (
        entityKey: string,
        text: string,
        url: string,
        target: string,
    ) => void
}

const link = (config: Config): Decorator => ({
    strategy: (
        contentBlock: ContentBlock,
        callback: DecoratorStrategyCallback,
        contentState: ContentState,
    ) => {
        contentBlock.findEntityRanges((character) => {
            const entityKey = character.getEntity()
            return (
                entityKey !== null &&
                contentState.getEntity(entityKey).getType() === 'link'
            )
        }, callback)
    },

    component: (props: DecoratorComponentProps) => {
        const {
            contentState,
            entityKey,
            children,
            decoratedText,
            getEditorState,
            setEditorState,
        } = props
        const { url, target } = contentState.getEntity(entityKey).getData()
        return (
            <LinkPopover
                url={url}
                onEdit={
                    config.isActive()
                        ? () => {
                              config.onLinkEdit(
                                  entityKey,
                                  decoratedText,
                                  url,
                                  target || '_blank',
                              )
                          }
                        : undefined
                }
                // Hide delete button if url === decoratedText:
                // https://github.com/gorgias/gorgias/pull/3942#issuecomment-443758756
                onDelete={
                    url !== decoratedText
                        ? () => {
                              setEditorState(
                                  removeLink(entityKey, getEditorState()),
                              )
                          }
                        : undefined
                }
            >
                {children}
            </LinkPopover>
        )
    },
})

export default link
