import React, {useMemo} from 'react'
import {useRouteMatch} from 'react-router'
import classNames from 'classnames'

import ChatIntegrationPreview from 'pages/integrations/integration/components/chat/ChatIntegrationPreview'
import {SelectableOption} from 'pages/common/forms/SelectField/types'
import {
    Integration,
    isGorgiasChatIntegration,
    isShopifyIntegration,
} from 'models/integration/types'
import {DEPRECATED_getIntegrations} from 'state/integrations/selectors'
import useAppSelector from 'hooks/useAppSelector'

import css from './Preview.less'

interface PreviewProps {
    reasonOptions: SelectableOption[]
}

const Preview = ({reasonOptions}: PreviewProps) => {
    const immutableIntegrations = useAppSelector(DEPRECATED_getIntegrations)
    const {
        params: {shopName},
    } = useRouteMatch<{
        shopName: string
    }>()

    const chatIntegration = useMemo(() => {
        const integrations: Integration[] = immutableIntegrations.toJS()

        const shopifyIntegration = integrations
            .filter(isShopifyIntegration)
            .find((integration) => {
                return integration.name === shopName
            })

        const chatIntegration = integrations
            .filter(isGorgiasChatIntegration)
            .find((integration) => {
                return (
                    integration.meta.shop_integration_id ===
                    shopifyIntegration?.id
                )
            })
        return chatIntegration
        // eslint-disable-next-line react-hooks/exhaustive-deps
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
