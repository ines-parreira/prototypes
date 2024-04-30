import React from 'react'
import {Link} from 'react-router-dom'

import Button from 'pages/common/components/button/Button'
import Header from 'pages/common/components/PageHeader'
import {SectionPageHeader} from 'config/pages'

import css from './PageHeader.less'

export default function PageHeader() {
    return (
        <div className={css.header}>
            <Header title={SectionPageHeader.SLAPolicies}>
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
            </Header>
        </div>
    )
}
