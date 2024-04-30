import React from 'react'
import {TemplateCard} from 'pages/common/components/TemplateCard'
import {GuidanceTemplate} from '../../types'
import css from './GuidanceTemplateCard.less'

type Props = {
    guidanceTemplate: GuidanceTemplate
}

export const GuidanceTemplateCard = ({guidanceTemplate}: Props) => {
    return (
        <TemplateCard
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
            description={guidanceTemplate.excerpt}
        />
    )
}
