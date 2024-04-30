import React from 'react'
import {Breadcrumb, BreadcrumbItem} from 'reactstrap'
import {Link} from 'react-router-dom'

import {SectionPageHeader} from 'config/pages'
import Button from 'pages/common/components/button/Button'
import {TEMPLATES_LIST} from 'pages/settings/SLAs/config/templates'
import PageHeader from 'pages/common/components/PageHeader'

import Templates from './Templates'

import css from './TemplateListView.less'

export default function TemplateListView() {
    return (
        <div className={css.wrapper}>
            <div className={css.header}>
                <PageHeader
                    title={
                        <Breadcrumb>
                            <BreadcrumbItem>
                                <Link to="/app/settings/sla">
                                    {SectionPageHeader.SLAPolicies}
                                </Link>
                            </BreadcrumbItem>
                            <BreadcrumbItem active>
                                SLAs Templates
                            </BreadcrumbItem>
                        </Breadcrumb>
                    }
                >
                    <Link to="/app/settings/sla/new">
                        <Button intent="secondary" tabIndex={-1}>
                            Create SLA
                        </Button>
                    </Link>
                </PageHeader>
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
