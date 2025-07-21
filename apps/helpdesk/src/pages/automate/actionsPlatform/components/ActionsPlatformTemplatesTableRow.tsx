import { DateAndTimeFormatting } from 'constants/datetime'
import useGetDateAndTimeFormat from 'hooks/useGetDateAndTimeFormat'
import { DraftBadge } from 'pages/automate/workflows/components/DraftBadge'
import IconButton from 'pages/common/components/button/IconButton'
import ConfirmationPopover from 'pages/common/components/popover/ConfirmationPopover'
import BodyCell from 'pages/common/components/table/cells/BodyCell'
import TableBodyRow from 'pages/common/components/table/TableBodyRow'
import { formatDatetime } from 'utils'

import { ActionTemplate, App } from '../types'

import css from './ActionsPlatformTemplatesTableRow.less'

type Props = {
    template: Pick<
        ActionTemplate,
        'apps' | 'is_draft' | 'name' | 'updated_datetime' | 'category'
    >
    app?: App
    onClick: () => void
    onDelete: () => void
    isDisabled?: boolean
}

const ActionsPlatformTemplatesTableRow = ({
    template,
    app,
    onClick,
    onDelete,
    isDisabled,
}: Props) => {
    const datetimeFormat = useGetDateAndTimeFormat(
        DateAndTimeFormatting.CompactDate,
    )

    return (
        <TableBodyRow onClick={isDisabled ? undefined : onClick}>
            <BodyCell innerClassName={css.nameCell}>
                {template.is_draft && <DraftBadge />}
                <img
                    src={app?.icon}
                    alt={app?.name}
                    className={css.icon}
                    title={app?.name}
                />
                <span className={css.name}>{template.name}</span>
            </BodyCell>
            <BodyCell size="smallest" justifyContent="right">
                {formatDatetime(template.updated_datetime, datetimeFormat)}
            </BodyCell>
            <BodyCell
                size="smallest"
                onClick={(event) => {
                    event.stopPropagation()
                }}
            >
                <ConfirmationPopover
                    buttonProps={{ intent: 'destructive' }}
                    cancelButtonProps={{ intent: 'secondary' }}
                    content="Are you sure you want to delete this template? This action cannot be undone."
                    title={<b>Delete template?</b>}
                    onConfirm={onDelete}
                    confirmLabel="Delete"
                    showCancelButton
                >
                    {({ uid, onDisplayConfirmation }) => (
                        <IconButton
                            onClick={onDisplayConfirmation}
                            fillStyle="ghost"
                            intent="destructive"
                            title="Delete"
                            id={uid}
                            isDisabled={!template.is_draft || isDisabled}
                        >
                            delete
                        </IconButton>
                    )}
                </ConfirmationPopover>
            </BodyCell>
        </TableBodyRow>
    )
}

export default ActionsPlatformTemplatesTableRow
