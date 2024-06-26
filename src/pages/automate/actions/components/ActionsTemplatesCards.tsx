import React, {useState} from 'react'
import _ from 'lodash'
import {useParams} from 'react-router-dom'
import {useFlags} from 'launchdarkly-react-client-sdk'
import {
    CustomCardLink,
    TemplateCard,
} from 'pages/common/components/TemplateCard'
import history from 'pages/history'
import {FeatureFlagKey} from 'config/featureFlags'
import useGetActionAppIntegration from '../hooks/useGetActionAppIntegration'
import {TemplateConfiguration, ActionAppConfiguration} from '../types'
import useGetAppImageUrl from '../hooks/useGetAppImageUrl'
import AppIntegrationDisabledModal from './AppIntegrationDisabledModal'
import css from './ActionsTemplatesCards.less'

type Props = {
    showCustomAction?: boolean
    templateConfigurations: TemplateConfiguration[]
}

export default function ActionsTemplatesCards({
    showCustomAction = false,
    templateConfigurations,
}: Props) {
    const {shopName, shopType} = useParams<{
        shopType: string
        shopName: string
    }>()
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

    return (
        <div className={css.container}>
            {sortedTemplateConfigurations.map(({id, name, apps}) => {
                if (!apps?.length) {
                    return null
                }
                const app = apps[0]
                return (
                    <TemplateCardWrapper
                        shopType={shopType}
                        shopName={shopName}
                        app={app}
                        templateName={name}
                        templateId={id}
                        key={id}
                    />
                )
            })}
            {showCustomAction && (
                <CustomCardLink
                    className={css.templateCardLink}
                    to={`/app/automation/${shopType}/${shopName}/actions/new`}
                    icon={<i className="material-icons">add_circle</i>}
                    title="Create custom Action"
                    description=""
                />
            )}
        </div>
    )
}

function TemplateCardWrapper({
    app,
    shopName,
    shopType,
    templateId,
    templateName,
}: {
    app: ActionAppConfiguration
    shopType: string
    shopName: string
    templateId: string
    templateName: string
}) {
    const [isDisabledAppModalOpen, setIsDisabledAppModalOpen] = useState(false)
    const appImageUrl = useGetAppImageUrl(app)

    const actionAppIntegration = useGetActionAppIntegration({
        appType: app?.type,
        shopName,
    })

    const isNativeAppIntegration = !!app && app.type !== 'app'

    const handleClick = () => {
        if (isNativeAppIntegration && !actionAppIntegration) {
            if (isDisabledAppModalOpen) return
            setIsDisabledAppModalOpen(true)
            return
        }
        history.push(
            `/app/automation/${shopType}/${shopName}/actions/new?template_id=${templateId}`
        )
    }

    return (
        <div onClick={handleClick}>
            <TemplateCard
                description=""
                title={templateName}
                className={css.templateCardLink}
                icon={
                    <>
                        {!appImageUrl ? (
                            <div className={css.appIcon}></div>
                        ) : (
                            <img
                                className={css.appIcon}
                                src={appImageUrl}
                                alt={app?.type}
                            />
                        )}
                    </>
                }
            />
            {isNativeAppIntegration && (
                <AppIntegrationDisabledModal
                    templateName={templateName}
                    actionAppConfiguration={app}
                    isOpen={isDisabledAppModalOpen}
                    setOpen={setIsDisabledAppModalOpen}
                />
            )}
        </div>
    )
}
