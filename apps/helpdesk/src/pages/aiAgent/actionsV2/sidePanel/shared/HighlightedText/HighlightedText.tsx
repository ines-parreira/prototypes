import { Fragment } from 'react'

import css from './HighlightedText.less'

type Props = {
    text: string
    query: string
}

export const HighlightedText = ({ text, query }: Props) => {
    const trimmedQuery = query.trim()
    if (!trimmedQuery) {
        return <>{text}</>
    }

    const lowerText = text.toLowerCase()
    const lowerQuery = trimmedQuery.toLowerCase()
    const segments: { value: string; isMatch: boolean }[] = []
    let cursor = 0

    while (cursor < text.length) {
        const matchIndex = lowerText.indexOf(lowerQuery, cursor)
        if (matchIndex === -1) {
            segments.push({ value: text.slice(cursor), isMatch: false })
            break
        }
        if (matchIndex > cursor) {
            segments.push({
                value: text.slice(cursor, matchIndex),
                isMatch: false,
            })
        }
        segments.push({
            value: text.slice(matchIndex, matchIndex + lowerQuery.length),
            isMatch: true,
        })
        cursor = matchIndex + lowerQuery.length
    }

    return (
        <>
            {segments.map((segment, index) =>
                segment.isMatch ? (
                    <mark key={index} className={css.mark}>
                        {segment.value}
                    </mark>
                ) : (
                    <Fragment key={index}>{segment.value}</Fragment>
                ),
            )}
        </>
    )
}
