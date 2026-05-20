import { useCallback } from 'react'

import { FeatureFlagKey, useFlag } from '@repo/feature-flags'
import type { Map } from 'immutable'
import { Link } from 'react-router-dom'

import { Text } from '@gorgias/axiom'

import useAppSelector from 'hooks/useAppSelector'
import {
    GorgiasChatCreationWizardStatus,
    IntegrationType,
} from 'models/integration/types'
import ForwardIcon from 'pages/integrations/common/components/ForwardIcon'
import { Tab } from 'pages/integrations/integration/types'
import { makeGetRedirectUri } from 'state/integrations/selectors'

import css from './ActionsCell.less'

type ActionsCellProps = {
    chat: Map<any, any>
    storeIntegration: Map<any, any>
}

export const ActionsCell = ({ chat, storeIntegration }: ActionsCellProps) => {
    const showUpdatePermissions = useFlag(
        FeatureFlagKey.ChatScopeUpdateChatList,
    )

    const getRedirectUri = useAppSelector(makeGetRedirectUri)

    const renderAction = useCallback(() => {
        const chatIntegrationId = chat.get('id') as number
        const wizardStatus: GorgiasChatCreationWizardStatus = chat.getIn([
            'meta',
            'wizard',
            'status',
        ])

        const needScopeUpdate = Boolean(
            storeIntegration?.getIn(['meta', 'need_scope_update'], false),
        )

        const shopIntegrationId: number | null = chat.getIn(
            ['meta', 'shop_integration_id'],
            null,
        )
        const shopifyIntegrationIds: number[] = chat
            .getIn(['meta', 'shopify_integration_ids'], null)
            ?.toArray()

        const isOneClickInstallation = shopIntegrationId
            ? shopifyIntegrationIds?.includes(shopIntegrationId)
            : false

        const baseLink = `/app/settings/channels/${IntegrationType.GorgiasChat}/${chatIntegrationId}`
        const editLink = `${baseLink}/${
            wizardStatus === GorgiasChatCreationWizardStatus.Draft
                ? Tab.CreateWizard
                : Tab.Appearance
        }`

        const shopName = storeIntegration?.getIn(['meta', 'shop_name'])

        const redirectUri = getRedirectUri(IntegrationType.Shopify)

        const retriggerOAuthFlow = (ev: React.MouseEvent) => {
            ev.stopPropagation()
            window.location.href = redirectUri.replace('{shop_name}', shopName)
        }

        if (wizardStatus === GorgiasChatCreationWizardStatus.Draft) {
            return (
                <Text size="md" variant="medium" align="right">
                    <Link to={editLink} onClick={(e) => e.stopPropagation()}>
                        Finish setup
                    </Link>
                </Text>
            )
        }

        if (
            showUpdatePermissions &&
            isOneClickInstallation &&
            needScopeUpdate
        ) {
            return (
                <Text size="md" variant="medium" align="right">
                    <a onClick={retriggerOAuthFlow} href="#">
                        Update permissions
                    </a>
                </Text>
            )
        }

        return (
            <ForwardIcon href={editLink} onClick={(e) => e.stopPropagation()} />
        )
    }, [chat, storeIntegration, showUpdatePermissions, getRedirectUri])

    return <div className={css.actionsCell}>{renderAction()}</div>
}
