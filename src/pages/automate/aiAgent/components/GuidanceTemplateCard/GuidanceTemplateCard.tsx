import React from 'react'
import sanitizeHtml from 'sanitize-html'
import {TemplateCard} from 'pages/common/components/TemplateCard'
import {GuidanceTemplate} from '../../types'
import css from './GuidanceTemplateCard.less'

const getHtmlExcerpt = (html: string) => {
    return sanitizeHtml(html, {
        allowedTags: [],
        allowedAttributes: {},
    })
}

type Props = {
    guidanceTemplate: GuidanceTemplate
    onClick: () => void
}

export const GuidanceTemplateCard = ({guidanceTemplate, onClick}: Props) => {
    return (
        <TemplateCard
            onClick={onClick}
            className={css.card}
            tag={
                <div
                    className={css.tag}
                    style={{
                        color: guidanceTemplate.style.color,
                        backgroundColor: guidanceTemplate.style.background,
                    }}
                >
                    {guidanceTemplate.tag}
                </div>
            }
            title={guidanceTemplate.name}
            description={getHtmlExcerpt(guidanceTemplate.content)}
        />
    )
}
