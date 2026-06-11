import type { KeyboardEvent } from 'react'

import { useHistory } from 'react-router-dom'
import type { StoreWorkflowsConfiguration } from 'pages/aiAgent/actions/types'
import { useAiAgentNavigation } from 'pages/aiAgent/hooks/useAiAgentNavigation'
import { BodyCell } from 'pages/common/components/table/cells/BodyCell'
import { DefaultExportTableBodyRow as TableBodyRow } from 'pages/common/components/table/TableBodyRow'

import { ACTION_LIBRARY_APP_COLUMN_WIDTH } from '../constants'
import type { ServiceConnectionStatuses } from '../hooks/useServiceConnectionStatuses'
import { AutonomousCell } from './cells/AutonomousCell'
import { NameCell } from './cells/NameCell'
import { ProviderCell } from './cells/ProviderCell'
import { QuickActionsCell } from './cells/QuickActionsCell'
import { StatusCell } from './cells/StatusCell'
import { UsedInCell } from './cells/UsedInCell'

import css from './ActionsTableRow.less'

type Props = {
    action: StoreWorkflowsConfiguration
    shopName: string
    shopType: 'shopify'
    serviceConnectionStatuses: ServiceConnectionStatuses
}

const ActionsTableRow = ({
    action,
    shopName,
    shopType,
    serviceConnectionStatuses,
}: Props) => {
    const history = useHistory()
    const { routes } = useAiAgentNavigation({ shopName })
    const isDisabled = !!action.entrypoints[0]?.deactivated_datetime

    const navigateToDetail = () => history.push(routes.editAction(action.id))

    const handleKeyDown = (event: KeyboardEvent<HTMLTableRowElement>) => {
        if (event.target !== event.currentTarget) return
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault()
            navigateToDetail()
        }
    }

    return (
        <TableBodyRow
            className={`${css.row} ${isDisabled ? css.rowDisabled : ''}`}
            onClick={navigateToDetail}
            tabIndex={0}
            // eslint-disable-next-line jsx-a11y/prefer-tag-over-role -- <tr> can't be an <a>; row-level click target is exposed as a link per WCAG technique.
            role="link"
            aria-label={`Open action ${action.name}`}
            onKeyDown={handleKeyDown}
        >
            <BodyCell
                width={ACTION_LIBRARY_APP_COLUMN_WIDTH}
                justifyContent="right"
            >
                <ProviderCell action={action} />
            </BodyCell>
            <BodyCell width={320}>
                <NameCell name={action.name} />
            </BodyCell>
            <BodyCell width="100%" aria-hidden="true" />
            <BodyCell width={100}>
                <StatusCell
                    action={action}
                    serviceConnectionStatuses={serviceConnectionStatuses}
                    shopName={shopName}
                />
            </BodyCell>
            <BodyCell width={110}>
                <AutonomousCell action={action} />
            </BodyCell>
            <BodyCell width={180}>
                <UsedInCell action={action} shopName={shopName} />
            </BodyCell>
            <BodyCell width={56} justifyContent="right">
                <QuickActionsCell
                    action={action}
                    shopName={shopName}
                    shopType={shopType}
                />
            </BodyCell>
        </TableBodyRow>
    )
}

export { ActionsTableRow }
