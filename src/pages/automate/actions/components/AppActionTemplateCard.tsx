import React, {useState} from 'react'
import {useHistory} from 'react-router-dom'

import {useGetActionsApp} from 'models/workflows/queries'
import {useAiAgentNavigation} from 'pages/automate/aiAgent/hooks/useAiAgentNavigation'
import {TemplateCard} from 'pages/common/components/TemplateCard'

import useGetAppImageUrl from '../hooks/useGetAppImageUrl'
import {ActionAppConfiguration, TemplateConfiguration} from '../types'
import css from './ActionsTemplatesCards.less'
import AppConfirmationModal from './AppConfirmationModal'

type Props = {
    app: Extract<ActionAppConfiguration, {type: 'app'}>
    shopName: string
    templateId: string
    templateName: string
}

const AppActionTemplateCard = ({
    app,
    shopName,
    templateId,
    templateName,
}: Props) => {
    const [isModalOpen, setIsModalOpen] = useState(false)
    const appImageUrl = useGetAppImageUrl(app)
    const {routes} = useAiAgentNavigation({shopName})
    const history = useHistory<
        | Omit<
              Extract<TemplateConfiguration['apps'][number], {type: 'app'}>,
              'type'
          >
        | undefined
    >()
    const {data: actionAppConnected} = useGetActionsApp(app.app_id)

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
                onClick={() => {
                    setIsModalOpen(true)
                }}
            />
            <AppConfirmationModal
                actionAppConnected={actionAppConnected}
                templateId={templateId}
                templateName={templateName}
                actionAppConfiguration={app}
                onConfirm={(apiKey) => {
                    history.push(routes.newAction(templateId), {
                        app_id: app.app_id,
                        api_key: apiKey,
                    })
                }}
                setOpen={setIsModalOpen}
                isOpen={isModalOpen}
            />
        </>
    )
}

export default AppActionTemplateCard
