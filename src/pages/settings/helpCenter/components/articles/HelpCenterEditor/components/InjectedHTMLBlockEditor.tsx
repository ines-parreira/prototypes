import React from 'react'
import {ContentBlock, ContentState} from 'draft-js'

import css from './InjectedHTMLBlockEditor.less'

type InjectedHTMLBlockEditorProps = {
    block: ContentBlock
    contentState: ContentState
}

/**
 * Edit injected html blocks in the content.
 *
 * As of now it's only a non editable block and
 * will be improved and made editable with advanced
 * content customization.
 */
export const InjectedHTMLBlockEditor = ({
    block,
    contentState,
}: InjectedHTMLBlockEditorProps) => {
    const entity = contentState.getEntity(block.getEntityAt(0))
    const {src} = entity.getData()
    return (
        <div className={css.container}>
            <h6>Custom code block</h6>
            <pre>{src}</pre>
        </div>
    )
}
