import * as React from 'react'
import {ContentBlock, ContentState} from 'draft-js'
import {Map} from 'immutable'

import {
    DecoratorStrategyCallback,
    DecoratorComponentProps,
    Decorator,
} from '../../types'
import {linkify} from '../../../../../../utils/editor'
import LinkPopover from '../components/LinkPopover'

const foundUrl = (): Decorator => ({
    strategy: (
        contentBlock: ContentBlock,
        callback: DecoratorStrategyCallback,
        contentState: ContentState
    ) => {
        // BUG double-closing curly braces, brackets, etc. break linkify-it detection,
        // because they're not valid URL characters.
        // https://github.com/markdown-it/linkify-it/issues/52
        // we just need the text start/end indexes,
        // so we can replace them with anything of the same length.
        const encodedText = (
            (contentBlock as Map<any, any>).get('text') as string
        ).replace(/{{(.*?)}}/g, (m, group: string) => `**${group}**`)

        const links = linkify.match(encodedText)

        if (!links) {
            return
        }

        links.forEach((link) => {
            // Check if it's not a link entity
            for (let i = link.index; i <= link.lastIndex; i++) {
                const entityKey = contentBlock.getEntityAt(i)
                if (!entityKey) {
                    continue
                }

                const entity = contentState.getEntity(entityKey)
                if (entity && entity.getType() === 'link') {
                    return
                }
            }

            callback(link.index, link.lastIndex)
        })
    },
    component: (props: DecoratorComponentProps) => {
        const {decoratedText, children, offsetKey} = props
        const links = linkify.match(decoratedText)
        const url = links && links[0] ? links[0].url : ''
        return (
            <LinkPopover id={offsetKey} url={url}>
                {children}
            </LinkPopover>
        )
    },
})

export default foundUrl
