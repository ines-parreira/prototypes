import React, {MouseEvent, useMemo} from 'react'
import {Link} from 'react-router-dom'
import {List, Map} from 'immutable'
import classnames from 'classnames'
import {Breadcrumb, BreadcrumbItem, Button, Container} from 'reactstrap'

import shopifyLogo from 'assets/img/integrations/shopify.png'
import warningIcon from 'assets/img/icons/warning.svg'

import {getIntegrationConfig} from 'state/integrations/helpers'

import ToggleInput from '../../../../common/forms/ToggleInput'
import Tooltip from '../../../../common/components/Tooltip'
import history from '../../../../history'
import {IntegrationType} from '../../../../../models/integration/types'

import BodyCell from '../../../../common/components/table/cells/BodyCell'
import HeaderCell from '../../../../common/components/table/cells/HeaderCell'
import HeaderCellProperty from '../../../../common/components/table/cells/HeaderCellProperty'
import TableBody from '../../../../common/components/table/TableBody'
import TableBodyRow from '../../../../common/components/table/TableBodyRow'
import TableHead from '../../../../common/components/table/TableHead'
import TableWrapper from '../../../../common/components/table/TableWrapper'
import {LanguageBullet} from '../../../../common/components/LanguageBulletList'
import PageHeader from '../../../../common/components/PageHeader'
import settingsCss from '../../../../settings/settings.less'
import ForwardIcon from '../ForwardIcon'

import NoIntegration from '../NoIntegration'

import css from './GorgiasChatIntegrationList.less'

type Props = {
    integrations: List<Map<any, any>>
    loading: Map<any, any>
    actions: {
        activateIntegration: (id: number) => unknown
        deactivateIntegration: (id: number) => unknown
    }
}

function GorgiasChatIntegrationList({
    integrations,
    loading,
    actions: {activateIntegration, deactivateIntegration},
}: Props) {
    const longTypeDescription = (
        <div>
            Live chat with your customers by adding our Chat widget on your
            website. Every time a customer starts a conversation on your
            website, it opens a ticket in Gorgias.
        </div>
    )

    const chats = useMemo(
        () =>
            integrations.filter(
                (integration) =>
                    integration?.get('type') === IntegrationType.GorgiasChat
            ) as List<Map<any, any>>,
        [integrations]
    )

    const chatToRow = (chat: Map<any, any>) => {
        const integrationId: number = chat.get('id')
        const toggleIntegration = (
            isToggled: boolean,
            event?: MouseEvent<HTMLLabelElement>
        ) => {
            event?.stopPropagation()
            isToggled
                ? activateIntegration(integrationId)
                : deactivateIntegration(integrationId)
        }

        const editLink = `/app/settings/integrations/${IntegrationType.GorgiasChat}/${integrationId}/campaigns`
        const isEnabled = !chat.get('deactivated_datetime')
        const isLoading = loading.get('updateIntegration') === integrationId
        const shopifyStoreName: string | null = chat.getIn(
            ['meta', 'shop_name'],
            null
        )
        const shopifyStore: Map<any, any> = integrations.find(
            (_integration) =>
                _integration?.get('name') === shopifyStoreName &&
                _integration?.get('type') === IntegrationType.Shopify
        )
        const isStoreDisconnected =
            !shopifyStore || shopifyStore.get('deactivated_datetime')

        const language: string = chat.getIn(['meta', 'language'])

        const goToChat = () => history.push(editLink)

        return (
            <TableBodyRow onClick={goToChat}>
                <BodyCell>
                    <ToggleInput
                        isToggled={isEnabled}
                        onClick={toggleIntegration}
                        isLoading={isLoading}
                        isDisabled={!!loading.get('updateIntegration')}
                    />
                </BodyCell>
                <BodyCell innerClassName={css.chatName}>
                    {chat.get('name')}
                </BodyCell>
                <BodyCell size="small">
                    {shopifyStoreName !== null ? (
                        <div className={css.shopifyStoreDiv}>
                            <span className={css.shopifyStoreName}>
                                <img src={shopifyLogo} alt="logo Shopify" />
                                <span>{shopifyStoreName}</span>
                            </span>
                            {isStoreDisconnected && (
                                <>
                                    <img
                                        src={warningIcon}
                                        alt="warning icon"
                                        id={`store-disconnected-${integrationId}`}
                                        className={`material-icons ${css.warningIcon}`}
                                    />
                                    <Tooltip
                                        target={`store-disconnected-${integrationId}`}
                                        placement="top"
                                    >
                                        This store is currently disconnected
                                    </Tooltip>
                                </>
                            )}
                        </div>
                    ) : (
                        <div className={css.noStore}>No store connected</div>
                    )}
                </BodyCell>
                <BodyCell size="small">
                    <LanguageBullet code={language} />
                </BodyCell>
                <BodyCell size="smallest">
                    <ForwardIcon href={editLink} />
                </BodyCell>
            </TableBodyRow>
        )
    }

    const integrationTitle = getIntegrationConfig(
        IntegrationType.GorgiasChat
    )!.title

    return (
        <div className="w-100">
            <PageHeader
                title={
                    <Breadcrumb>
                        <BreadcrumbItem>
                            <Link to="/app/settings/integrations">
                                Integrations
                            </Link>
                        </BreadcrumbItem>
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
                            `/app/settings/integrations/${IntegrationType.GorgiasChat}/new`
                        )
                    }
                >
                    <div className={css.createIntegrationBtn}>
                        <i className="material-icons mr-2">add</i>Add New
                    </div>
                </Button>
            </PageHeader>

            <Container
                fluid
                className={classnames(
                    settingsCss.pageContainer,
                    settingsCss.pb0
                )}
            >
                <div className="mb-3">{longTypeDescription}</div>

                {integrations.isEmpty() && (
                    <div className="mt-3">
                        <NoIntegration
                            loading={loading.get('integrations', false)}
                        />
                    </div>
                )}
            </Container>

            {!chats.isEmpty() && (
                <TableWrapper>
                    <TableHead className={css.tableHead}>
                        <HeaderCell size="smallest" />
                        <HeaderCellProperty
                            className={css.chatNameHeader}
                            title="Chat name"
                        />
                        <HeaderCellProperty title="Store" />
                        <HeaderCellProperty title="Language" />
                        <HeaderCell />
                    </TableHead>
                    <TableBody>
                        {chats.map(
                            (value) =>
                                chatToRow(
                                    value!
                                ) /* using ! because Immutable typing expects Map | undefined while it should be Map */
                        )}
                    </TableBody>
                </TableWrapper>
            )}
        </div>
    )
}

export default GorgiasChatIntegrationList
