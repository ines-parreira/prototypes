import React from 'react'

import {TEMPLATES_LIST} from 'pages/settings/SLAs/config/templates'

import PageHeader from '../../PageHeader/PageHeader'

import Templates from './Templates'
import css from './TemplateListView.less'

export default function TemplateListView() {
    return (
        <div className={css.wrapper}>
            <div className={css.header}>
                <PageHeader
                    secondaryBreadcrumb="SLAs Templates"
                    showTemplateButton={false}
                />
            </div>
            <div className={css.content}>
                <h1 className={css.title} data-candu-id="sla-templates">
                    SLA templates
                </h1>
                <div className={css.description}>
                    Start with an SLA template that you can customize to fit
                    your needs.
                </div>
                <Templates templates={TEMPLATES_LIST.slice(0, 2)} />
            </div>
        </div>
    )
}
