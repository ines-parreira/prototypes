import classnames from 'classnames'
import React from 'react'
import {useHistory, useParams} from 'react-router-dom'

import {useFlag} from 'common/flags'
import {FeatureFlagKey} from 'config/featureFlags'
import {useAiAgentNavigation} from 'pages/automate/aiAgent/hooks/useAiAgentNavigation'
import Button from 'pages/common/components/button/Button'
import {TemplateCard} from 'pages/common/components/TemplateCard'

import useEnabledActionTemplates from '../hooks/useEnabledActionTemplates'
import useSortedActionTemplates from '../hooks/useSortedActionTemplates'
import {TemplateConfiguration} from '../types'
import css from './ActionsTemplatesCards.less'
import AppActionTemplateCard from './AppActionTemplateCard'
import NativeActionTemplateCard from './NativeActionTemplateCard'
import UseCaseTemplateCard from './UseCaseTemplateCard'

type Props = {
    showCustomAction?: boolean
    templateConfigurations: TemplateConfiguration[]
    max?: number
}

const ActionsTemplatesCards = ({
    showCustomAction,
    templateConfigurations,
    max = Infinity,
}: Props) => {
    const history = useHistory()

    const {shopName} = useParams<{shopName: string}>()
    const {routes} = useAiAgentNavigation({shopName})

    const enabledTemplates = useEnabledActionTemplates(templateConfigurations)
    const sortedTemplates = useSortedActionTemplates(enabledTemplates)

    const isMultiStepActionEnabled = useFlag(
        FeatureFlagKey.ActionsUseCaseTemplates,
        false
    )

    return (
        <div className={css.container}>
            {sortedTemplates.slice(0, max).map((template) => {
                const {id, apps, name} = template
                const app = apps[0]

                if (isMultiStepActionEnabled) {
                    return <UseCaseTemplateCard key={id} template={template} />
                }
                if (app.type === 'app') {
                    return (
                        <AppActionTemplateCard
                            key={id}
                            app={app}
                            shopName={shopName}
                            templateName={name}
                            templateId={id}
                        />
                    )
                }

                return (
                    <NativeActionTemplateCard
                        key={id}
                        app={app}
                        shopName={shopName}
                        templateName={name}
                        templateId={id}
                    />
                )
            })}
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
                        {isMultiStepActionEnabled
                            ? 'See all Templates'
                            : 'See all Actions'}
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

export default ActionsTemplatesCards
