import React from 'react'
import {useHistory, useParams} from 'react-router-dom'
import classnames from 'classnames'

import Button from 'pages/common/components/button/Button'
import ButtonIconLabel from 'pages/common/components/button/ButtonIconLabel'
import {useAiAgentNavigation} from 'pages/automate/aiAgent/hooks/useAiAgentNavigation'
import {TemplateCard} from 'pages/common/components/TemplateCard'

import {TemplateConfiguration} from '../types'
import useSortedActionTemplates from '../hooks/useSortedActionTemplates'
import useEnabledActionTemplates from '../hooks/useEnabledActionTemplates'
import AppActionTemplateCard from './AppActionTemplateCard'
import NativeActionTemplateCard from './NativeActionTemplateCard'

import css from './ActionsTemplatesCards.less'

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

    return (
        <div className={css.container}>
            {sortedTemplates.slice(0, max).map(({id, name, apps}) => {
                const app = apps[0]

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
                    >
                        <ButtonIconLabel position="right" icon="arrow_forward">
                            See all Actions
                        </ButtonIconLabel>
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
