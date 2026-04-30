import { forwardRef } from 'react'
import type { ComponentProps } from 'react'

import css from './EditorForm.less'

export const EditorForm = forwardRef<HTMLFormElement, ComponentProps<'form'>>(
    function EditorForm(props, ref) {
        return (
            <form
                {...props}
                ref={ref}
                id="ticket-reply-editor"
                onSubmit={props.onSubmit}
                className={css.editorForm}
            />
        )
    },
)
