import React, {useMemo} from 'react'
import {useRouteMatch} from 'react-router'
import {useSelector} from 'react-redux'
import classNames from 'classnames'

import ChatIntegrationPreview from '../../../../../integrations/detail/components/chat/ChatIntegrationPreview'
import {SelectableOption} from '../../../../../common/forms/SelectField/types'
import {
    Integration,
    IntegrationType,
} from '../../../../../../models/integration/types'

import {getIntegrations} from '../../../../../../state/integrations/selectors'

import css from './Preview.less'

interface PreviewProps {
    reasonOptions: SelectableOption[]
}

const Preview = ({reasonOptions}: PreviewProps) => {
    const immutableIntegrations = useSelector(getIntegrations)
    const {
        params: {shopName},
    } = useRouteMatch<{
        shopName: string
    }>()

    const chatIntegration = useMemo(() => {
        const integrations: Integration[] = immutableIntegrations.toJS()

        const shopifyIntegration = integrations.find((integration) => {
            return (
                integration.type === 'shopify' && integration.name === shopName
            )
        }) as Integration

        const chatIntegration = integrations.find((integration) => {
            return (
                integration.type ===
                    IntegrationType.GorgiasChatIntegrationType &&
                integration.meta.shop_integration_id === shopifyIntegration.id
            )
        })
        return chatIntegration
    }, [immutableIntegrations])

    if (!chatIntegration) {
        return null
    }

    return (
        <ChatIntegrationPreview
            name={chatIntegration.name}
            introductionText={chatIntegration.decoration?.introduction_text}
            mainColor={chatIntegration.decoration?.main_color}
            avatarTeamPictureUrl={
                chatIntegration.decoration?.avatar_team_picture_url
            }
            avatarType={chatIntegration.decoration?.avatar_type}
            isOnline
            language={chatIntegration.meta.language}
            renderFooter={false}
        >
            <span className={css.header}>What is wrong with your order?</span>

            <ul className={css.list}>
                {reasonOptions.map((reason) => (
                    <li className={css.listItem} key={reason.value}>
                        <span>{reason.label}</span>

                        <span
                            className={classNames(
                                'material-icons-outlined',
                                css.chevronIcon
                            )}
                        >
                            chevron_right
                        </span>
                    </li>
                ))}
            </ul>
        </ChatIntegrationPreview>
    )
}

export default Preview
