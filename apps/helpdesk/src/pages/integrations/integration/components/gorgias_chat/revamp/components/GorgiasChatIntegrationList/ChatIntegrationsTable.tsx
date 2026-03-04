import { useMemo } from 'react'

import { history } from '@repo/routing'
import type { List, Map } from 'immutable'

import {
    createSortableColumn,
    HeaderRowGroup,
    TableBodyContent,
    TableHeader,
    TableRoot,
    useTable,
} from '@gorgias/axiom'
import type { ColumnDef } from '@gorgias/axiom'
import { IntegrationType } from '@gorgias/helpdesk-types'

import { GorgiasChatCreationWizardStatus } from 'models/integration/types'
import { AiAgentStatusCell } from 'pages/integrations/integration/components/gorgias_chat/revamp/components/GorgiasChatIntegrationList/AiAgentStatusCell'
import { Tab } from 'pages/integrations/integration/types'

import { ActionsCell } from './ActionsCell'
import { ChatCell } from './ChatCell'
import { StatusCell } from './StatusCell'
import { StoreIntegrationCell } from './StoreIntegrationCell'

type Props = {
    chats: List<Map<any, any>>
    integrations: List<Map<any, any>>
    loading: Map<any, any>
}

type StoreIntegrationField = {
    chat: Map<any, any>
    storeIntegration: Map<any, any>
}

type StatusField = {
    chat: Map<any, any>
    loading: Map<any, any>
}

type ActionsField = {
    chat: Map<any, any>
    storeIntegration: Map<any, any>
}

type AiAgentStatusField = {
    chat: Map<any, any>
}

type ChatIntegrationFields = {
    chat: Map<any, any>
    storeIntegration: StoreIntegrationField
    status: StatusField
    actions: ActionsField
    aiAgentStatus: AiAgentStatusField
}

export function ChatIntegrationsTable({ chats, integrations, loading }: Props) {
    const goToChat = (row: ChatIntegrationFields) => {
        const needScopeUpdate = Boolean(
            row.storeIntegration.storeIntegration?.getIn(
                ['meta', 'need_scope_update'],
                false,
            ),
        )

        const wizardStatus: GorgiasChatCreationWizardStatus = row.chat.getIn([
            'meta',
            'wizard',
            'status',
        ])

        const baseLink = `/app/settings/channels/${IntegrationType.GorgiasChat}/${row.chat.get('id')}`
        const installationLink = `${baseLink}/${Tab.Installation}`
        const editLink = `${baseLink}/${
            wizardStatus === GorgiasChatCreationWizardStatus.Draft
                ? Tab.CreateWizard
                : Tab.Appearance
        }`

        if (needScopeUpdate) {
            history.push(installationLink)
            return
        }

        history.push(editLink)
    }

    const data: Array<ChatIntegrationFields> = useMemo(() => {
        return chats.toArray().map((chat) => {
            const shopIntegrationId: number | null = chat.getIn(
                ['meta', 'shop_integration_id'],
                null,
            )

            const storeIntegration: Map<any, any> = integrations.find(
                (_integration) => _integration?.get('id') === shopIntegrationId,
            )

            return {
                chat,
                storeIntegration: {
                    chat,
                    storeIntegration,
                },
                status: {
                    chat,
                    loading,
                },
                actions: {
                    chat,
                    storeIntegration,
                },
                aiAgentStatus: {
                    chat,
                },
            }
        })
    }, [chats, integrations, loading])

    const columns: ColumnDef<ChatIntegrationFields>[] = useMemo(
        () => [
            createSortableColumn('chat', 'Chat Name', (data) => {
                return <ChatCell chat={data.getValue<Map<any, any>>()} />
            }),
            {
                accessorKey: 'storeIntegration',
                header: 'Store',
                enableSorting: false,
                cell: (data) => {
                    const { storeIntegration, chat } =
                        data.getValue<StoreIntegrationField>()

                    return (
                        <StoreIntegrationCell
                            storeIntegration={storeIntegration}
                            chat={chat}
                        />
                    )
                },
            },
            {
                accessorKey: 'status',
                header: 'Status',
                enableSorting: false,
                cell: (data) => {
                    const { chat, loading } = data.getValue<StatusField>()
                    return <StatusCell chat={chat} loading={loading} />
                },
            },
            {
                accessorKey: 'aiAgentStatus',
                header: 'AI Agent Status',
                enableSorting: false,
                cell: (data) => {
                    const { chat } = data.getValue<AiAgentStatusField>()

                    return <AiAgentStatusCell chat={chat} />
                },
            },
            {
                accessorKey: 'actions',
                header: '',
                enableSorting: false,
                cell: (data) => {
                    const { chat, storeIntegration } =
                        data.getValue<ActionsField>()

                    return (
                        <ActionsCell
                            chat={chat}
                            storeIntegration={storeIntegration}
                        />
                    )
                },
            },
        ],
        [],
    )

    const table = useTable({
        columns,
        data,
        sortingConfig: {
            enableSorting: true,
        },
    })

    return (
        <TableRoot>
            <TableHeader>
                <HeaderRowGroup headerGroups={table.getHeaderGroups()} />
            </TableHeader>

            <TableBodyContent
                rows={table.getRowModel().rows}
                columnCount={columns.length}
                table={table}
                onRowClick={goToChat}
            />
        </TableRoot>
    )
}
