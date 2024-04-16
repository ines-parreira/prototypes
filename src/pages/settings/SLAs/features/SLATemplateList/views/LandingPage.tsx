import React from 'react'
import {Link} from 'react-router-dom'

import {SectionPageHeader} from 'config/pages'
import Button from 'pages/common/components/button/Button'
import PageHeader from 'pages/common/components/PageHeader'
import Templates from 'pages/settings/SLAs/features/SLATemplateList/views/Templates'

import {TEMPLATES_LIST} from './config'
import LandingBanner from './LandingBanner'
import css from './LandingPage.less'

const LandingPage = () => {
    return (
        <div className={css.wrapper}>
            <div className={css.header}>
                <PageHeader title={SectionPageHeader.SLAPolicies}>
                    <div className={css.headerButtons}>
                        <Link to="/app/settings/sla/new">
                            <Button intent="secondary" tabIndex={-1}>
                                Create SLA
                            </Button>
                        </Link>

                        <Link to="/app/settings/sla/templates">
                            <Button tabIndex={-1}>Create From Template</Button>
                        </Link>
                    </div>
                </PageHeader>
            </div>

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
