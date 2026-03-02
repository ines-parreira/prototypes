import { useMemo } from 'react'

import { history } from '@repo/routing'
import type { List, Map } from 'immutable'

import { Button, Heading, Text } from '@gorgias/axiom'

import { IntegrationType } from 'models/integration/types'
import Loader from 'pages/common/components/Loader/Loader'
import { getIntegrationConfig } from 'state/integrations/helpers'

import { ChatIntegrationsTable } from './ChatIntegrationsTable'

import css from './GorgiasChatIntegrationList.less'

type Props = {
    integrations: List<Map<any, any>>
    loading: Map<any, any>
}

function GorgiasChatIntegrationList({ integrations, loading }: Props) {
    const chats = useMemo(
        () =>
            integrations.filter(
                (integration) =>
                    integration?.get('type') === IntegrationType.GorgiasChat,
            ) as List<Map<any, any>>,
        [integrations],
    )

    const integrationTitle = getIntegrationConfig(
        IntegrationType.GorgiasChat,
    )!.title

    return (
        <div className={css.chatIntegrationList}>
            <div className={css.pageHeader}>
                <Heading size="xl">{integrationTitle}</Heading>
                <Button
                    variant="primary"
                    onClick={() =>
                        history.push(
                            `/app/settings/channels/${
                                IntegrationType.GorgiasChat
                            }/new/create-wizard`,
                        )
                    }
                    leadingSlot="add-plus"
                >
                    New chat
                </Button>
            </div>

            {chats.isEmpty() ? (
                <div className={css.emptyChatIntegrationList}>
                    <div>
                        <Text size="md" variant="medium">
                            Chat with your customers by adding our Chat widget
                            on your website. Every time a customer starts a
                            conversation on your website, it opens a ticket in
                            Gorgias.
                        </Text>
                    </div>
                    <div>
                        {loading.get('integrations', false) ? (
                            <Loader />
                        ) : (
                            <Text>
                                You have no integration of this type at the
                                moment.
                            </Text>
                        )}
                    </div>
                </div>
            ) : (
                <ChatIntegrationsTable
                    chats={chats}
                    integrations={integrations}
                    loading={loading}
                />
            )}
        </div>
    )
}

export default GorgiasChatIntegrationList
