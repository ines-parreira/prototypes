import React from 'react'

import {useParams} from 'react-router-dom'
import {
    CustomCardLink,
    TemplateCardLink,
} from 'pages/common/components/TemplateCard'
import {TemplateConfiguration, ActionApps} from '../types'
import useGetAppImageUrl from '../hooks/useGetAppImageUrl'
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

    return (
        <div className={css.container}>
            {templateConfigurations.map(({id, name, apps}) => {
                if (!apps?.length) {
                    return null
                }
                const app = apps[0]
                return (
                    <TemplateCard
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
                    to={`/app/automation/${shopType}/${shopName}/actions/new`}
                    icon={<i className="material-icons">add_circle</i>}
                    title="Create custom Action"
                    description=""
                />
            )}
        </div>
    )
}

function TemplateCard({
    app,
    shopName,
    shopType,
    templateId,
    templateName,
}: {
    app: ActionApps
    shopType: string
    shopName: string
    templateId: string
    templateName: string
}) {
    const appImageUrl = useGetAppImageUrl(app)

    return (
        <TemplateCardLink
            to={`/app/automation/${shopType}/${shopName}/actions/new?template_id=${templateId}`}
            description=""
            title={templateName}
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
    )
}
