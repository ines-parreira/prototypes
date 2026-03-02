import { useMemo } from 'react'

import classnames from 'classnames'
import _orderBy from 'lodash/orderBy'
import { useHistory, useParams } from 'react-router-dom'

import { LegacyButton as Button } from '@gorgias/axiom'

import { useAiAgentNavigation } from 'pages/aiAgent/hooks/useAiAgentNavigation'
import { CATEGORIES_SORT_ORDER } from 'pages/automate/actionsPlatform/constants'
import type { CATEGORIES } from 'pages/automate/actionsPlatform/constants'
import useGetIsActionStepEnabled from 'pages/automate/actionsPlatform/hooks/useGetIsActionStepEnabled'
import type { ActionTemplate } from 'pages/automate/actionsPlatform/types'
import { TemplateCard } from 'pages/common/components/TemplateCard'

import { useSearchParam } from '../../../../hooks/useSearchParam'
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

    const { shopName } = useParams<{
        shopName: string
    }>()
    const [templateId] = useSearchParam('use_case_template')
    const { routes } = useAiAgentNavigation({ shopName })

    const getIsActionStepEnabled = useGetIsActionStepEnabled()

    const sortedTemplates = useMemo(() => {
        const getCategorySortPriority = (template: ActionTemplate) => {
            const categoryIndex = CATEGORIES_SORT_ORDER.indexOf(
                template.category as CATEGORIES,
            )
            const isUnknownCategory = categoryIndex === -1
            return isUnknownCategory
                ? CATEGORIES_SORT_ORDER.length
                : categoryIndex
        }

        return _orderBy(
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
            [getCategorySortPriority, 'name'],
            ['asc', 'asc'],
        )
    }, [templates, getIsActionStepEnabled])

    return (
        <div className={css.container}>
            {sortedTemplates.slice(0, max).map((template) => (
                <UseCaseTemplateCard
                    key={template.id}
                    template={template}
                    isOpenDefault={templateId === template.id}
                />
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
