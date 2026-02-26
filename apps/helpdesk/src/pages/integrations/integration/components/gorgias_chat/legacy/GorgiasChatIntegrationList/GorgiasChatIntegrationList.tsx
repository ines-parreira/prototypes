import { useMemo } from 'react'

import { FeatureFlagKey, useFlag } from '@repo/feature-flags'
import { history } from '@repo/routing'
import classnames from 'classnames'
import type { List, Map } from 'immutable'
import {
    BreadcrumbItem,
    Container,
    Breadcrumb as LegacyBreadcrumb,
} from 'reactstrap'

import { Button } from '@gorgias/axiom'

import { getIntegrationConfig } from 'state/integrations/helpers'

import { IntegrationType } from '../../../../../../../models/integration/types'
import PageHeader from '../../../../../../common/components/PageHeader'
import HeaderCell from '../../../../../../common/components/table/cells/HeaderCell'
import HeaderCellProperty from '../../../../../../common/components/table/cells/HeaderCellProperty'
import TableBody from '../../../../../../common/components/table/TableBody'
import TableHead from '../../../../../../common/components/table/TableHead'
import TableWrapper from '../../../../../../common/components/table/TableWrapper'
import NoIntegration from '../../../NoIntegration'
import GorgiasChatIntegrationListRow from './GorgiasChatIntegrationListRow'
import GorgiasChatIntegrationListRevamped from './revamp/GorgiasChatIntegrationList'

import settingsCss from '../../../../../../settings/settings.less'
import css from './GorgiasChatIntegrationList.less'

type Props = {
    integrations: List<Map<any, any>>
    loading: Map<any, any>
}

function GorgiasChatIntegrationList({ integrations, loading }: Props) {
    const longTypeDescription = (
        <div>
            Chat with your customers by adding our Chat widget on your website.
            Every time a customer starts a conversation on your website, it
            opens a ticket in Gorgias.
        </div>
    )

    const chats = useMemo(
        () =>
            integrations.filter(
                (integration) =>
                    integration?.get('type') === IntegrationType.GorgiasChat,
            ) as List<Map<any, any>>,
        [integrations],
    )
    const shopifyIntegrations = useMemo(
        () =>
            integrations.filter((integration) =>
                [
                    IntegrationType.Shopify,
                    IntegrationType.BigCommerce,
                    IntegrationType.Magento2,
                ].includes(integration?.get('type')),
            ) as List<Map<any, any>>,
        [integrations],
    )

    const integrationTitle = getIntegrationConfig(
        IntegrationType.GorgiasChat,
    )!.title

    const chatMultiLanguagesEnabled = useFlag(FeatureFlagKey.ChatMultiLanguages)
    const isRevampEnabled = useFlag(FeatureFlagKey.ChatSettingsRevamp)

    if (isRevampEnabled) {
        return (
            <GorgiasChatIntegrationListRevamped
                integrations={integrations}
                loading={loading}
            ></GorgiasChatIntegrationListRevamped>
        )
    }

    return (
        <div className="w-100">
            <PageHeader
                title={
                    <LegacyBreadcrumb>
                        <BreadcrumbItem active>
                            {integrationTitle}
                        </BreadcrumbItem>
                    </LegacyBreadcrumb>
                }
            >
                <Button
                    onClick={() =>
                        history.push(
                            `/app/settings/channels/${
                                IntegrationType.GorgiasChat
                            }/new/create-wizard`,
                        )
                    }
                >
                    Add Chat
                </Button>
            </PageHeader>

            <Container
                data-candu-id="integration-list-top"
                fluid
                className={classnames(
                    settingsCss.pageContainer,
                    settingsCss.pb0,
                )}
            >
                {chats.isEmpty() && (
                    <>
                        <div className="mb-3">{longTypeDescription}</div>
                        <div className="mt-3">
                            <NoIntegration
                                loading={loading.get('integrations', false)}
                            />
                        </div>
                    </>
                )}
            </Container>

            {!chats.isEmpty() && (
                <TableWrapper className={css.table}>
                    <TableHead className={css.header}>
                        <HeaderCellProperty title="Chat name" />
                        <HeaderCellProperty title="Store" />
                        <HeaderCellProperty title="Status" />
                        <HeaderCellProperty
                            title={
                                chatMultiLanguagesEnabled
                                    ? 'Languages'
                                    : 'Language'
                            }
                        />
                        <HeaderCell />
                    </TableHead>
                    <TableBody>
                        {chats
                            .toArray()
                            .map(
                                (chat) =>
                                    chat && (
                                        <GorgiasChatIntegrationListRow
                                            chat={chat}
                                            integrations={shopifyIntegrations}
                                            isLoadingIntegrations={loading.get(
                                                'integrations',
                                                true,
                                            )}
                                            key={chat.get('id')}
                                        />
                                    ),
                            )}
                    </TableBody>
                </TableWrapper>
            )}

            <Container fluid data-candu-id="integration-list-bottom" />
        </div>
    )
}

export default GorgiasChatIntegrationList
