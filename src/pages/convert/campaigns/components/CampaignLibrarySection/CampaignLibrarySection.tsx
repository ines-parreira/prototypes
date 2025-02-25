import React from 'react'

import { CampaignTemplateSectionType } from 'pages/convert/campaigns/templates/types'

import CampainLibraryTileTemplate from '../CampaignLibraryTileTemplate'

import css from './CampaignLibrarySection.less'

type OwnProps = {
    integrationId: number
    section: CampaignTemplateSectionType
}

const CampaignLibrarySection = ({ section, integrationId }: OwnProps) => {
    return (
        <section className={css.section}>
            <h3 className={css.header}>{section.title}</h3>
            <div className={css.description}>{section.description}</div>
            <div className={css.templatesContainer}>
                {section.templates.map((template, idx) => (
                    <CampainLibraryTileTemplate
                        key={idx}
                        template={template}
                        integrationId={integrationId}
                    />
                ))}
            </div>
        </section>
    )
}

export default CampaignLibrarySection
