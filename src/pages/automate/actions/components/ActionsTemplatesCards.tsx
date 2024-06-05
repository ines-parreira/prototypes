import React from 'react'

import {useParams} from 'react-router-dom'
import {assetsUrl} from 'utils'
import {INTEGRATION_TYPE_CONFIG} from 'config'
import {
    CustomCardLink,
    TemplateCardLink,
} from 'pages/common/components/TemplateCard'
import {useGetApps} from 'models/integration/queries'
import {TemplateConfiguration} from '../types'
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

    const {data: appsList} = useGetApps()

    return (
        <div className={css.container}>
            {templateConfigurations.map(({id, name, apps}) => {
                const app = apps?.[0]

                let appImage: undefined | string = undefined

                if (app?.type === 'app') {
                    appImage = appsList?.find(
                        (item) => (item.id = app.app_id)
                    )?.app_icon
                } else {
                    const integrationConfig = INTEGRATION_TYPE_CONFIG.find(
                        (item) => item.type === app?.type
                    )
                    appImage = integrationConfig?.image
                        ? assetsUrl(integrationConfig?.image)
                        : undefined
                }
                return (
                    <TemplateCardLink
                        to={`/app/automation/${shopType}/${shopName}/actions/new/template/${id}`}
                        description=""
                        title={name}
                        key={id}
                        icon={
                            <>
                                {!appImage ? (
                                    <div className={css.appIcon}></div>
                                ) : (
                                    <img
                                        className={css.appIcon}
                                        src={appImage}
                                        alt={app?.type}
                                    />
                                )}
                            </>
                        }
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
