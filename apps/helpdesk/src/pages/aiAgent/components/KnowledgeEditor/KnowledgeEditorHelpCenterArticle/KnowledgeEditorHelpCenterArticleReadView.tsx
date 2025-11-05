import { useMemo } from 'react'

import htmlToReact from 'html-react-parser'

import { Heading } from '@gorgias/axiom'

import css from './KnowledgeEditorHelpCenterArticleReadView.less'

type Props = {
    content: string
    title: string
}

export const KnowledgeEditorHelpCenterArticleReadView = ({
    content,
    title,
}: Props) => {
    const parsedContent = useMemo(() => htmlToReact(content), [content])

    return (
        <div className={css.container}>
            <Heading size="xl">{title}</Heading>
            <div className={css.contentWrapper}>{parsedContent}</div>
        </div>
    )
}
