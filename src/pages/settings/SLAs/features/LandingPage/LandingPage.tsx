import React from 'react'

import Templates from 'pages/settings/SLAs/features/SLATemplateList/views/Templates'
import {TEMPLATES_LIST} from 'pages/settings/SLAs/config/templates'

import PageHeader from '../PageHeader/PageHeader'

import LandingBanner from './LandingBanner'
import css from './LandingPage.less'

const LandingPage = () => {
    return (
        <div className={css.wrapper}>
            <PageHeader />
            <div className={css.page}>
                <LandingBanner />
                <Templates
                    className={css.content}
                    templates={TEMPLATES_LIST}
                    showSeeAllTemplates={TEMPLATES_LIST.length > 2}
                />
            </div>
        </div>
    )
}

export default LandingPage
