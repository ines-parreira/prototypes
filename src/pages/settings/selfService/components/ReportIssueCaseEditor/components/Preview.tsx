import React, {useMemo} from 'react'
import {useRouteMatch} from 'react-router'
import classNames from 'classnames'

import ChatIntegrationPreview from 'pages/integrations/integration/components/chat/ChatIntegrationPreview/ChatIntegrationPreview'
import {
    Integration,
    isGorgiasChatIntegration,
    isShopifyIntegration,
} from 'models/integration/types'
import {DEPRECATED_getIntegrations} from 'state/integrations/selectors'
import useAppSelector from 'hooks/useAppSelector'
import {GORGIAS_CHAT_SSP_TEXTS} from 'config/integrations/gorgias_chat'
import {ReportIssueCaseReason} from 'models/selfServiceConfiguration/types'

import {SELECTABLE_REASONS_DROPDOWN_OPTIONS} from '../constants'

import css from './Preview.less'

interface PreviewProps {
    reasons: ReportIssueCaseReason[]
}

const Preview = ({reasons}: PreviewProps) => {
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

    const sspTexts =
        GORGIAS_CHAT_SSP_TEXTS[chatIntegration?.meta?.language || 'en-US']

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
            <span className={css.header}>{sspTexts.whatIsWrongWithOrder}</span>

            <ul className={css.list}>
                {reasons.map(({reasonKey}) => (
                    <li className={css.listItem} key={reasonKey}>
                        <span>
                            {sspTexts[reasonKey] ??
                                SELECTABLE_REASONS_DROPDOWN_OPTIONS.find(
                                    (option) => option.value === reasonKey
                                )?.label}
                        </span>

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
