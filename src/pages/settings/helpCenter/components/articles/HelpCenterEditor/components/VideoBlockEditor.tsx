import React from 'react'
import {ContentBlock, ContentState} from 'draft-js'

import {Button} from 'reactstrap'

import css from './VideoBlockEditor.less'

type VideoBlockEditorProps = {
    block: ContentBlock
    contentState: ContentState
    blockProps: {
        onDelete: (atomicBlock: ContentBlock, fragment: ContentState) => void
    }
}

/**
 * Show Embedded Video. Allow Delete
 */
export const VideoBlockEditor = ({
    block,
    contentState,
    blockProps,
}: VideoBlockEditorProps): JSX.Element => {
    const {onDelete} = blockProps
    const entity = contentState.getEntity(block.getEntityAt(0))
    const {src, width = 500, height = 281} = entity.getData()

    const handleOnDelete = () => {
        onDelete(block, contentState)
    }

    return (
        <div className={css.wrapper}>
            <div className={css.container}>
                <iframe
                    title="Video"
                    src={src}
                    width={width}
                    height={height}
                    allowFullScreen
                    frameBorder="0"
                />
            </div>
            <div className={css.footer}>
                <Button color="danger" onClick={handleOnDelete}>
                    Delete
                </Button>
            </div>
        </div>
    )
}
