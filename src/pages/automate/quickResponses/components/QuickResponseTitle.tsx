import React, {useEffect, useState} from 'react'
import classnames from 'classnames'
import _noop from 'lodash/noop'

import TextArea from 'pages/common/forms/TextArea'
import {useAccordionItemContext} from 'pages/common/components/accordion/AccordionItemContext'

import {usePropagateError} from '../QuickResponsesViewContext'
import {QUICK_RESPONSE_TITLE_MAX_LENGTH} from '../constants'

import css from './QuickResponseTitle.less'

type Props = {
    title: string
    onChange: (nextTitle: string) => void
}

const QuickResponseTitle = ({title, onChange}: Props) => {
    const [ref, setRef] = useState<HTMLTextAreaElement | null>(null)
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
        <TextArea
            data-testid="quick-response-title"
            key={isExpanded ? 1 : 0} // force rerender to trigger height re-computation
            ref={setRef}
            className={classnames(css.input, {
                [css.isExpanded]: isExpanded,
                [css.hasError]: hasError,
            })}
            value={title}
            onChange={isExpanded ? onChange : _noop}
            placeholder="Button text"
            maxLength={QUICK_RESPONSE_TITLE_MAX_LENGTH}
            rows={1}
            autoRowHeight
        />
    )
}

export default QuickResponseTitle
