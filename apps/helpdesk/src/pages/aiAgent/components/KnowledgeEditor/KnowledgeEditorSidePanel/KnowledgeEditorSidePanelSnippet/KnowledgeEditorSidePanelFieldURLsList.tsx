import { useState } from 'react'

import { Icon } from '@gorgias/axiom'

import Collapse from 'pages/common/components/Collapse/Collapse'

import css from './KnowledgeEditorSidePanelFieldURLsList.less'

export const KnowledgeEditorSidePanelFieldURLsList = ({
    urls,
}: {
    urls: string[]
}) => {
    const [isOpen, setIsOpen] = useState(false)

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
                {urls.map((url, index) => (
                    <div key={index} className={css.url}>
                        {url}
                    </div>
                ))}
            </Collapse>
        </div>
    )
}
