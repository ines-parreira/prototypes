import React from 'react'

import { Link } from 'react-router-dom'
import { Breadcrumb, BreadcrumbItem } from 'reactstrap'

import { SectionPageHeader } from 'config/pages'
import Button from 'pages/common/components/button/Button'
import Header from 'pages/common/components/PageHeader'

import css from './PageHeader.less'

type PageHeaderProps = {
    secondaryBreadcrumb?: string
    showCreateButtons?: boolean
    showTemplateButton?: boolean
}

export default function PageHeader({
    secondaryBreadcrumb,
    showCreateButtons = true,
    showTemplateButton = true,
}: PageHeaderProps) {
    return (
        <div className={css.header}>
            <Header
                title={
                    <Breadcrumb>
                        <BreadcrumbItem>
                            {secondaryBreadcrumb ? (
                                <Link to="/app/settings/sla">
                                    {SectionPageHeader.SLAPolicies}
                                </Link>
                            ) : (
                                SectionPageHeader.SLAPolicies
                            )}
                        </BreadcrumbItem>
                        {!!secondaryBreadcrumb && (
                            <BreadcrumbItem active>
                                {secondaryBreadcrumb}
                            </BreadcrumbItem>
                        )}
                    </Breadcrumb>
                }
            >
                {showCreateButtons && (
                    <div className={css.headerButtons}>
                        <Link to="/app/settings/sla/new">
                            <Button intent="secondary" tabIndex={-1}>
                                Create SLA
                            </Button>
                        </Link>

                        {showTemplateButton && (
                            <Link to="/app/settings/sla/templates">
                                <Button tabIndex={-1}>
                                    Create From Template
                                </Button>
                            </Link>
                        )}
                    </div>
                )}
            </Header>
        </div>
    )
}
