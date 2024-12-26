import React, {useState} from 'react'
import {useHistory} from 'react-router-dom'

import {useAiAgentNavigation} from 'pages/aiAgent/hooks/useAiAgentNavigation'
import {TemplateCard} from 'pages/common/components/TemplateCard'

import useGetActionAppIntegration from '../hooks/useGetActionAppIntegration'
import useGetAppImageUrl from '../hooks/useGetAppImageUrl'
import {ActionAppConfiguration} from '../types'
import css from './ActionsTemplatesCards.less'
import AppIntegrationDisabledModal from './AppIntegrationDisabledModal'

type Props = {
    app: Extract<ActionAppConfiguration, {type: 'shopify' | 'recharge'}>
    shopName: string
    templateId: string
    templateName: string
}

const NativeActionTemplateCard = ({
    app,
    shopName,
    templateId,
    templateName,
}: Props) => {
    const [isModalOpen, setIsModalOpen] = useState(false)
    const appImageUrl = useGetAppImageUrl(app)
    const {routes} = useAiAgentNavigation({shopName})
    const history = useHistory()
    const actionAppIntegration = useGetActionAppIntegration({
        appType: app.type,
        shopName,
    })

    const handleClick = () => {
        if (!actionAppIntegration) {
            setIsModalOpen(true)
        } else {
            history.push(routes.newAction(templateId))
        }
    }

    return (
        <>
            <TemplateCard
                title={templateName}
                showOnlyTitle
                icon={
                    !appImageUrl ? (
                        <div className={css.appIcon} />
                    ) : (
                        <img
                            className={css.appIcon}
                            src={appImageUrl}
                            alt={app.type}
                        />
                    )
                }
                onClick={handleClick}
            />
            <AppIntegrationDisabledModal
                templateName={templateName}
                actionAppConfiguration={app}
                isOpen={isModalOpen}
                setOpen={setIsModalOpen}
            />
        </>
    )
}

export default NativeActionTemplateCard
