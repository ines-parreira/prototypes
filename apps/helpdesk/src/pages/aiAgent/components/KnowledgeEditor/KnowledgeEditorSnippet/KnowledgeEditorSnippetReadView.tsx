import { Box, Heading, Icon } from '@gorgias/axiom'

import { SnippetType } from 'pages/aiAgent/KnowledgeHub/types'

import css from './KnowledgeEditorSnippetReadView.less'

type Props = {
    title: string
    content: string
    sourceLabel: string
    sourceUrl: string
    snippetType: SnippetType
}

export const KnowledgeEditorSnippetReadView = ({
    title,
    content,
    sourceLabel,
    sourceUrl,
    snippetType,
}: Props) => {
    const getIcon = () => {
        switch (snippetType) {
            case SnippetType.Store:
                return <Icon size={'sm'} name={'nav-globe'} />
            case SnippetType.URL:
                return <Icon size={'sm'} name={'link-horizontal'} />
            case SnippetType.Document:
                return <Icon size={'sm'} name={'paperclip-attachment'} />
        }
    }

    return (
        <div className={css.container}>
            <Box gap="xs" flexDirection="column">
                {sourceLabel && (
                    <a
                        href={sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={css.source}
                    >
                        {getIcon()}
                        <span>{sourceLabel}</span>
                    </a>
                )}
                <Heading size="xl">{title}</Heading>
            </Box>
            <div className={css.contentWrapper}>{content}</div>
        </div>
    )
}
