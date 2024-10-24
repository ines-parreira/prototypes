import React from 'react'
import {Link} from 'react-router-dom'

import {CampaignTemplate} from 'pages/convert/campaigns/templates/types'

import css from './CampaignLibraryTileTemplate.less'

type Props = {
    template: CampaignTemplate
    integrationId: number
}

const CampainLibraryTileTemplate = ({template, integrationId}: Props) => {
    return (
        <Link
            className={css.link}
            to={`/app/convert/${integrationId}/campaigns/new/${template.slug}`}
        >
            <div className={css.container}>
                <div className={css.preview}>
                    <img src={template.preview} alt={template.name} />
                </div>
                <div className={css.content}>
                    <div>
                        <div className={css.title}>{template.name}</div>
                        <div>{template.description}</div>
                    </div>
                </div>
            </div>
        </Link>
    )
}

export default CampainLibraryTileTemplate
