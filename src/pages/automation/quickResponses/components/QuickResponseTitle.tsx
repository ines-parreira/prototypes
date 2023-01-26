import React, {useEffect, useState} from 'react'
import classnames from 'classnames'

import TextInput from 'pages/common/forms/input/TextInput'
import {useAccordionItemContext} from 'pages/common/components/accordion/AccordionItemContext'

import {usePropagateError} from '../QuickResponsesViewContext'
import {QUICK_RESPONSE_TITLE_MAX_LENGTH} from '../constants'

import css from './QuickResponseTitle.less'

type Props = {
    title: string
    onChange: (nextTitle: string) => void
}

const QuickResponseTitle = ({title, onChange}: Props) => {
    const [ref, setRef] = useState<HTMLInputElement | null>(null)
    const {isExpanded} = useAccordionItemContext()

    const hasError =
        !title.length || title.length > QUICK_RESPONSE_TITLE_MAX_LENGTH

    usePropagateError('title', hasError)

    useEffect(() => {
        if (isExpanded && ref) {
            ref.focus()
        }
    }, [ref, isExpanded])

    return (
        <TextInput
            ref={setRef}
            className={classnames(css.input, {
                [css.isExpanded]: isExpanded,
            })}
            value={title}
            onChange={isExpanded ? onChange : undefined}
            placeholder="Button text"
            maxLength={QUICK_RESPONSE_TITLE_MAX_LENGTH}
            hasError={hasError}
        />
    )
}

export default QuickResponseTitle
