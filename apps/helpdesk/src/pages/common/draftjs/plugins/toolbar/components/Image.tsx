import { Component } from 'react'
import type { ImgHTMLAttributes } from 'react'

import classnames from 'classnames'
import type {
    ContentBlock,
    ContentState,
    DraftDecorator,
    EditorState,
    SelectionState,
} from 'draft-js'
import _omit from 'lodash/omit'

import { replaceAttachmentURL } from 'utils'

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

// image render in draft js
class Image extends Component<Props> {
    static defaultProps: Pick<Props, 'className' | 'theme'> = {
        className: '',
        theme: {},
    }

    render() {
        const { alt, block, className, theme, contentState, ...otherProps } =
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

        const { src } = contentState.getEntity(block.getEntityAt(0)).getData()

        return (
            <img
                alt={alt}
                {...elementProps}
                src={replaceAttachmentURL(src)}
                role="presentation"
                className={classnames(theme.image, className)}
            />
        )
    }
}

export default Image
