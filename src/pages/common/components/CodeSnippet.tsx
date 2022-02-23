import React from 'react'
import {Alert} from 'reactstrap'

import {withClipboardButton} from '../utils/withClipboardButton/withClipboardButton'

import css from './CodeSnippet.less'

type Props = {
    id: string
    code: string
}

function CodeSnippet({id, code}: Props) {
    return (
        <Alert className={css.wrapper}>
            <pre id={id} className={css.code}>
                {code}
            </pre>
        </Alert>
    )
}

export default withClipboardButton(CodeSnippet, 'code-snippet-')
