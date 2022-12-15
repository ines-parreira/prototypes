import React, {ImgHTMLAttributes} from 'react'

import ReactPlayer from 'react-player'

import classnames from 'classnames'
import {
    ContentBlock,
    ContentState,
    DraftDecorator,
    EditorState,
    SelectionState,
} from 'draft-js'
import _omit from 'lodash/omit'

type Props = {
    alt: string
    block: ContentBlock
    contentState: ContentState
    className: string
    theme: Record<string, any>
    blockProps?: Record<string, unknown>
    customStyleMap?: any
    customStyleFn?: any
    decorator?: DraftDecorator
    forceSelection?: typeof EditorState.forceSelection
    offsetKey?: string
    selection?: SelectionState
    tree?: any
    blockStyleFn?: (block: ContentBlock) => string | void
} & ImgHTMLAttributes<HTMLImageElement>

// video render in draft js
class Video extends React.Component<Props> {
    static defaultProps: Pick<Props, 'className' | 'theme'> = {
        className: '',
        theme: {},
    }

    render() {
        const {alt, block, className, theme, contentState, ...otherProps} =
            this.props

        const elementProps = _omit(otherProps, [
            'blockProps',
            'customStyleMap',
            'customStyleFn',
            'decorator',
            'forceSelection',
            'offsetKey',
            'selection',
            'tree',
            'blockStyleFn',
        ])

        const {url, width} = contentState
            .getEntity(block.getEntityAt(0))
            .getData()

        return (
            <div
                aria-label={alt}
                {...elementProps}
                role="presentation"
                className={classnames(theme.image, className)}
            >
                <ReactPlayer
                    url={url}
                    controls={true}
                    light={true}
                    width={width}
                    height={(width * 9) / 16}
                />
            </div>
        )
    }
}

export default Video
