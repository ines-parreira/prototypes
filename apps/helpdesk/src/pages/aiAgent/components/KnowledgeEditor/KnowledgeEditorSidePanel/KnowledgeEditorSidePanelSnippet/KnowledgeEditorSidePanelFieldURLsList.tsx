import { useState } from 'react'

import { Box, Icon } from '@gorgias/axiom'

import Collapse from 'pages/common/components/Collapse/Collapse'

import css from './KnowledgeEditorSidePanelFieldURLsList.less'

export const KnowledgeEditorSidePanelFieldURLsList = ({
    urls,
}: {
    urls: string[]
}) => {
    const [isOpen, setIsOpen] = useState(true)

    return (
        <div className={css.container}>
            <div onClick={() => setIsOpen(!isOpen)} className={css.title}>
                Source URLs
                <span
                    className={css.arrow}
                    data-state={isOpen ? 'open' : 'closed'}
                >
                    <Icon name="arrow-chevron-down" />
                </span>
            </div>
            <Collapse isOpen={isOpen}>
                <Box gap="xxxs" flexDirection="column">
                    {urls.map((url, index) => (
                        <a
                            key={index}
                            href={url}
                            className={css.url}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            {url}
                        </a>
                    ))}
                </Box>
            </Collapse>
        </div>
    )
}
