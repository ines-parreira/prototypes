import classnames from 'classnames'
import _orderBy from 'lodash/orderBy'
import React, {useMemo} from 'react'
import {useHistory, useParams} from 'react-router-dom'

import {useAiAgentNavigation} from 'pages/aiAgent/hooks/useAiAgentNavigation'
import {ActionTemplate} from 'pages/automate/actionsPlatform/types'
import Button from 'pages/common/components/button/Button'
import {TemplateCard} from 'pages/common/components/TemplateCard'

import css from './ActionsTemplatesCards.less'
import UseCaseTemplateCard from './UseCaseTemplateCard'

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

    const {shopName} = useParams<{shopName: string}>()
    const {routes} = useAiAgentNavigation({shopName})

    const sortedTemplates = useMemo(
        () =>
            _orderBy(
                templates.filter((template) => !!template.category),
                ['category', 'name'],
                ['asc', 'asc']
            ),
        [templates]
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
                                css.customActionIcon
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
