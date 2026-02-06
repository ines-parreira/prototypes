import { useMemo } from 'react'

import { diffWords } from 'diff'
import htmlToReact from 'html-react-parser'
import HtmlDiff from 'htmldiff-js'

import { Heading } from '@gorgias/axiom'

import css from './KnowledgeEditorHelpCenterArticleDiffView.less'

type Props = {
    oldTitle: string
    oldContent: string
    newTitle: string
    newContent: string
}

export function KnowledgeEditorHelpCenterArticleDiffView({
    oldTitle,
    oldContent,
    newTitle,
    newContent,
}: Props) {
    const titleDiff = useMemo(
        () => diffWords(oldTitle, newTitle),
        [oldTitle, newTitle],
    )

    const diffHtml = useMemo(
        () => HtmlDiff.execute(oldContent, newContent),
        [oldContent, newContent],
    )

    const parsedDiffContent = useMemo(() => htmlToReact(diffHtml), [diffHtml])

    return (
        <div className={css.container}>
            <Heading size="xl">
                {titleDiff.map((part, index) => (
                    <span
                        key={index}
                        className={
                            part.added
                                ? css.titleAdded
                                : part.removed
                                  ? css.titleRemoved
                                  : undefined
                        }
                    >
                        {part.value}
                    </span>
                ))}
            </Heading>
            <div className={css.contentWrapper}>{parsedDiffContent}</div>
        </div>
    )
}
