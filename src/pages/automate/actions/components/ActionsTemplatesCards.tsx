import React from 'react'
import _ from 'lodash'
import {useHistory, useParams} from 'react-router-dom'
import {useFlags} from 'launchdarkly-react-client-sdk'
import classnames from 'classnames'

import {TemplateCard} from 'pages/common/components/TemplateCard'
import {useAiAgentNavigation} from 'pages/automate/aiAgent/hooks/useAiAgentNavigation'
import {FeatureFlagKey} from 'config/featureFlags'

import {TemplateConfiguration} from '../types'
import AppActionTemplateCard from './AppActionTemplateCard'
import NativeActionTemplateCard from './NativeActionTemplateCard'

import css from './ActionsTemplatesCards.less'

type Props = {
    showCustomAction?: boolean
    templateConfigurations: TemplateConfiguration[]
}

export default function ActionsTemplatesCards({
    showCustomAction = false,
    templateConfigurations,
}: Props) {
    const {shopName} = useParams<{
        shopType: string
        shopName: string
    }>()
    const {routes} = useAiAgentNavigation({shopName})
    const enabledTemplates: string[] | Record<never, never> | undefined =
        useFlags()[FeatureFlagKey.ActionTemplates]
    const sortedTemplateConfigurations = _.chain<TemplateConfiguration>(
        templateConfigurations
    )
        .filter(
            (value) =>
                !Array.isArray(enabledTemplates) ||
                !!enabledTemplates.includes(value.internal_id)
        )
        .groupBy('apps[0].type')
        .map((value, key) => ({
            type: key,
            items: _.orderBy(value, ['name'], ['asc']),
        }))
        .orderBy([(group) => group.type !== 'shopify', 'type'], ['asc', 'asc'])
        .flatMap<TemplateConfiguration>('items')
        .value()
    const history = useHistory()

    return (
        <div className={css.container}>
            {sortedTemplateConfigurations.map(({id, name, apps}) => {
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
