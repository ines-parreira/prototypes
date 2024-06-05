import React from 'react'
import {useParams, Link} from 'react-router-dom'
import {Breadcrumb, BreadcrumbItem} from 'reactstrap'
import AutomateView from 'pages/automate/common/components/AutomateView'

import Button from 'pages/common/components/button/Button'
import {useGetWorkflowConfigurationTemplates} from 'models/workflows/queries'
import {ACTIONS} from '../common/components/constants'
import ActionsTemplatesCards from './components/ActionsTemplatesCards'
import CreateCustomActionButton from './components/CreateCustomActionButton'
import css from './ActionTemplatesView.less'

export default function ActionTemplatesView() {
    const {shopName, shopType} = useParams<{
        shopType: string
        shopName: string
    }>()

    const {data: templateConfigurations, isInitialLoading} =
        useGetWorkflowConfigurationTemplates(['llm-prompt'])

    return (
        <AutomateView
            isLoading={isInitialLoading}
            title={
                <Breadcrumb>
                    <BreadcrumbItem>
                        <Link
                            to={`/app/automation/${shopType}/${shopName}/actions`}
                        >
                            {ACTIONS}
                        </Link>
                    </BreadcrumbItem>
                    <BreadcrumbItem active>All Actions</BreadcrumbItem>
                </Breadcrumb>
            }
            className={css.container}
            action={<CreateCustomActionButton />}
        >
            {templateConfigurations && templateConfigurations.length > 0 && (
                <>
                    <p>Choose an Action and customize it to fit your needs</p>
                    <ActionsTemplatesCards
                        showCustomAction
                        templateConfigurations={templateConfigurations}
                    />
                    <div className={css.requestBannerContainer}>
                        <h3>Which Actions should we build next?</h3>
                        <p>
                            Let us know which Actions you would like AI Agent to
                            handle.
                        </p>
                        <a
                            href="https://link.gorgias.com/fhc"
                            rel="noreferrer"
                            target="_blank"
                        >
                            <Button intent="secondary">Request action</Button>
                        </a>
                    </div>
                </>
            )}
        </AutomateView>
    )
}
