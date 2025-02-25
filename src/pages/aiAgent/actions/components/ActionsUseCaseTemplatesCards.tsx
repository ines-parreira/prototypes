import React, { useMemo } from 'react'

import classnames from 'classnames'
import _orderBy from 'lodash/orderBy'
import { useHistory, useParams } from 'react-router-dom'

import { useAiAgentNavigation } from 'pages/aiAgent/hooks/useAiAgentNavigation'
import useGetIsActionStepEnabled from 'pages/automate/actionsPlatform/hooks/useGetIsActionStepEnabled'
import { ActionTemplate } from 'pages/automate/actionsPlatform/types'
import Button from 'pages/common/components/button/Button'
import { TemplateCard } from 'pages/common/components/TemplateCard'

import UseCaseTemplateCard from './UseCaseTemplateCard'

import css from './ActionsUseCaseTemplatesCards.less'

type Props = {
    showCustomAction?: boolean
    templates: ActionTemplate[]
    max?: number
}

const ActionsUseCaseTemplatesCards = ({
    showCustomAction,
    templates,
    max = Infinity,
}: Props) => {
    const history = useHistory()

    const { shopName } = useParams<{ shopName: string }>()
    const { routes } = useAiAgentNavigation({ shopName })

    const getIsActionStepEnabled = useGetIsActionStepEnabled()

    const sortedTemplates = useMemo(
        () =>
            _orderBy(
                templates.filter((template) => {
                    if (!template.category) {
                        return false
                    }

                    return template.steps.some((step) => {
                        if (step.kind === 'reusable-llm-prompt-call') {
                            return getIsActionStepEnabled(
                                step.settings.configuration_internal_id,
                            )
                        }

                        return false
                    })
                }),
                ['category', 'name'],
                ['asc', 'asc'],
            ),
        [templates, getIsActionStepEnabled],
    )

    return (
        <div className={css.container}>
            {sortedTemplates.slice(0, max).map((template) => (
                <UseCaseTemplateCard key={template.id} template={template} />
            ))}
            {sortedTemplates.length > max && (
                <div className={css.seeAll}>
                    <Button
                        intent="secondary"
                        fillStyle="ghost"
                        onClick={() => {
                            history.push(routes.actionsTemplates)
                        }}
                        trailingIcon="arrow_forward"
                    >
                        See all Templates
                    </Button>
                </div>
            )}
            {showCustomAction && (
                <TemplateCard
                    onClick={() => {
                        history.push(routes.newAction())
                    }}
                    icon={
                        <i
                            className={classnames(
                                'material-icons',
                                css.customActionIcon,
                            )}
                        >
                            add_circle
                        </i>
                    }
                    title="Create custom Action"
                    showOnlyTitle
                />
            )}
        </div>
    )
}

export default ActionsUseCaseTemplatesCards
