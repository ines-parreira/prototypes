import { useEffect, useRef } from 'react'

import classNames from 'classnames'

import { Text } from '@gorgias/axiom'

import { TruncatedTextWithTooltip } from 'pages/aiAgent/KnowledgeHub/Table/TruncatedTextWithTooltip'

import css from './KnowledgeEditorTopBarTitle.less'

type Props = {
    onChangeTitle?: (newTitle: string) => void
    title: string
    // Copilot follow-mode anchor, placed on the title element itself so the
    // highlight hugs the title field rather than the wider header row.
    anchorProps?: { 'data-copilot-anchor': string }
}

export const KnowledgeEditorTopBarTitle = ({
    title,
    onChangeTitle,
    anchorProps,
}: Props) => {
    const inputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        if (!title) {
            inputRef.current?.focus()
        }
        // Only run on mount — we want to focus once when the editor opens without a title
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    if (!onChangeTitle) {
        return (
            <TruncatedTextWithTooltip tooltipContent={title}>
                <span className={css.title} {...anchorProps}>
                    {title}
                </span>
            </TruncatedTextWithTooltip>
        )
    }

    return (
        <div className={css.editableTitleWrapper}>
            {!title && (
                <div className={css.placeholder} aria-hidden="true">
                    <span>Untitled</span>
                    <Text size="md" color="content-error-default">
                        *
                    </Text>
                </div>
            )}
            {/* Anchor on the input itself: `field-sizing: content` keeps it
                sized to the title text, so the highlight hugs the title rather
                than the full-width header grid cell. */}
            <input
                ref={inputRef}
                type="text"
                name="title"
                aria-label="title"
                value={title}
                className={classNames(css.title, css.editableTitle)}
                onChange={(event) => onChangeTitle(event.target.value)}
                {...anchorProps}
            />
        </div>
    )
}
