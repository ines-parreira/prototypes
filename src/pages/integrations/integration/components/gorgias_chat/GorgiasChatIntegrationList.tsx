import React, {useMemo, useState} from 'react'
import {List, Map} from 'immutable'
import classnames from 'classnames'
import {Breadcrumb, BreadcrumbItem, Button, Container} from 'reactstrap'

import Alert, {AlertType} from 'pages/common/components/Alert/Alert'

import {getIntegrationConfig} from 'state/integrations/helpers'

import history from '../../../../history'
import {IntegrationType} from '../../../../../models/integration/types'

import HeaderCell from '../../../../common/components/table/cells/HeaderCell'
import HeaderCellProperty from '../../../../common/components/table/cells/HeaderCellProperty'
import TableBody from '../../../../common/components/table/TableBody'
import TableHead from '../../../../common/components/table/TableHead'
import TableWrapper from '../../../../common/components/table/TableWrapper'
import PageHeader from '../../../../common/components/PageHeader'
import settingsCss from '../../../../settings/settings.less'

import NoIntegration from '../NoIntegration'

import GorgiasChatIntegrationListRow from './GorgiasChatIntegrationListRow'
import css from './GorgiasChatIntegrationList.less'

type Props = {
    integrations: List<Map<any, any>>
    loading: Map<any, any>
}

function GorgiasChatIntegrationList({integrations, loading}: Props) {
    const [calloutDisplayed, setCalloutDisplayed] = useState<boolean>(true)

    const longTypeDescription = (
        <div>
            Chat with your customers by adding our Chat widget on your website.
            Every time a customer starts a conversation on your website, it
            opens a ticket in Gorgias.
        </div>
    )

    const toggleMovedToInstallationTabInfoCallout = (
        <Alert
            className="mb-4"
            type={AlertType.Info}
            icon
            onClose={() => setCalloutDisplayed(false)}
        >
            The toggle to hide the chat from your website was moved to the{' '}
            <b>Installation</b> tab of your chat's settings.
        </Alert>
    )

    const chats = useMemo(
        () =>
            integrations.filter(
                (integration) =>
                    integration?.get('type') === IntegrationType.GorgiasChat
            ) as List<Map<any, any>>,
        [integrations]
    )
    const shopifyIntegrations = useMemo(
        () =>
            integrations.filter(
                (integration) =>
                    integration?.get('type') === IntegrationType.Shopify
            ) as List<Map<any, any>>,
        [integrations]
    )

    const integrationTitle = getIntegrationConfig(
        IntegrationType.GorgiasChat
    )!.title

    return (
        <div className="w-100">
            <PageHeader
                title={
                    <Breadcrumb>
                        <BreadcrumbItem active>
                            {integrationTitle}
                        </BreadcrumbItem>
                    </Breadcrumb>
                }
            >
                <Button
                    type="submit"
                    color="success"
                    onClick={() =>
                        history.push(
                            `/app/settings/channels/${IntegrationType.GorgiasChat}/new/appearance`
                        )
                    }
                >
                    <div className={css.createIntegrationBtn}>
                        <i className="material-icons mr-2">add</i>Add New
                    </div>
                </Button>
            </PageHeader>

            <Container
                data-candu-id="integration-list-top"
                fluid
                className={classnames(
                    settingsCss.pageContainer,
                    settingsCss.pb0
                )}
            >
                <div className="mb-3">{longTypeDescription}</div>
                {calloutDisplayed && (
                    <div>{toggleMovedToInstallationTabInfoCallout}</div>
                )}

                {integrations.isEmpty() && (
                    <div className="mt-3">
                        <NoIntegration
                            loading={loading.get('integrations', false)}
                        />
                    </div>
                )}
            </Container>

            {!chats.isEmpty() && (
                <TableWrapper className={css.table}>
                    <TableHead className={css.header}>
                        <HeaderCellProperty title="Chat name" />
                        <HeaderCellProperty title="Store" />
                        <HeaderCellProperty title="Status" />
                        <HeaderCellProperty title="Language" />
                        <HeaderCell />
                    </TableHead>
                    <TableBody>
                        {chats.map(
                            (chat) =>
                                chat && (
                                    <GorgiasChatIntegrationListRow
                                        chat={chat}
                                        integrations={shopifyIntegrations}
                                        isLoadingIntegrations={loading.get(
                                            'integrations',
                                            true
                                        )}
                                        key={chat.get('id')}
                                    />
                                )
                        )}
                    </TableBody>
                </TableWrapper>
            )}

            <Container fluid data-candu-id="integration-list-bottom" />
        </div>
    )
}

export default GorgiasChatIntegrationList
