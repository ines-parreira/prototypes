import type { ComponentProps } from 'react'

import cn from 'classnames'

import css from './EditorContainer.less'

export function EditorContainer({ className, ...rest }: ComponentProps<'div'>) {
    return (
        <div
            data-name="reply-composer"
            className={cn('d-print-none', css.editorContainer, className)}
            {...rest}
        />
    )
}
