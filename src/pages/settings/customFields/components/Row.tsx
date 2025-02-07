import {Tooltip, Badge} from '@gorgias/merchant-ui-kit'
import classnames from 'classnames'
import React, {useState} from 'react'
import {Link} from 'react-router-dom'
import {ulid} from 'ulidx'

import {SegmentEvent, logEvent} from 'common/segment'
import {DateAndTimeFormatting} from 'constants/datetime'
import {useUpdateCustomFieldArchiveStatus} from 'custom-fields/hooks/queries/useUpdateCustomFieldArchiveStatus'
import {CustomField, isCustomFieldAIManagedType} from 'custom-fields/types'
import IconButton from 'pages/common/components/button/IconButton'
import BodyCell from 'pages/common/components/table/cells/BodyCell'
import BodyCellContent from 'pages/common/components/table/cells/BodyCellContent'
import {TableBodyRowDraggable} from 'pages/common/components/table/TableBodyRowDraggable'
import {Callbacks} from 'pages/common/hooks/useReorderDnD'
import DatetimeLabel from 'pages/common/utils/DatetimeLabel'
import ArchiveConfirmationModal from 'pages/settings/customFields/components/ArchiveConfirmationModal'
import {CUSTOM_FIELD_ROUTES} from 'routes/constants'

import css from './Row.less'

export type Props = {
    position: number
    customField: CustomField
    canReorder: boolean
    onMoveEntity: Callbacks['onHover']
    onDropEntity: Callbacks['onDrop']
}
export default function Row({
    position,
    customField,
    canReorder,
    onMoveEntity,
    onDropEntity,
}: Props) {
    const {mutate, isLoading} = useUpdateCustomFieldArchiveStatus(
        customField.id,
        customField.object_type
    )

    const link = `/app/settings/${
        CUSTOM_FIELD_ROUTES[customField.object_type]
    }/${customField.id}/edit`
    const [archiveModalVisible, setArchiveModalVisible] = useState(false)
    const isAIManaged = isCustomFieldAIManagedType(customField.managed_type)
    const tooltipId = 'a' + ulid()

    return (
        <TableBodyRowDraggable
            className={classnames(
                'draggable',
                css.row,
                canReorder && css.canReorder
            )}
            dragItem={{
                id: customField.id,
                position,
                type: 'custom-fields-row',
            }}
            isDisabled={!canReorder}
            isDragIndicatorInvisible={!canReorder}
            onMoveEntity={onMoveEntity}
            onDropEntity={onDropEntity}
        >
            <td id={`custom-field-label-${customField.id}`}>
                <Link to={link}>
                    <BodyCellContent>
                        <strong>
                            {customField.label}
                            {isAIManaged && (
                                <>
                                    {' '}
                                    <i
                                        id={tooltipId}
                                        className={classnames(
                                            'material-icons-outlined',
                                            'ml-1',
                                            'md-2',
                                            css.infoIcon
                                        )}
                                    >
                                        info
                                    </i>
                                    <>
                                        <Tooltip target={tooltipId}>
                                            {customField.label} is a Gorgias AI
                                            managed field and cannot be edited
                                        </Tooltip>
                                    </>
                                </>
                            )}
                        </strong>
                    </BodyCellContent>
                </Link>
            </td>
            <td>
                <Link to={link}>
                    <BodyCellContent>
                        <span
                            className={classnames(
                                'text-faded',
                                css.description
                            )}
                        >
                            {customField.description}
                        </span>
                    </BodyCellContent>
                </Link>
            </td>
            <BodyCell>
                {customField.required && !customField.deactivated_datetime && (
                    <Badge type={'warning'}>REQUIRED</Badge>
                )}
            </BodyCell>
            <BodyCell>
                <div className={'text-faded'}>
                    <DatetimeLabel
                        dateTime={customField.updated_datetime}
                        labelFormat={DateAndTimeFormatting.CompactDate}
                    />
                </div>
            </BodyCell>

            <BodyCell>
                {!customField.deactivated_datetime && (
                    <>
                        <IconButton
                            className={classnames(css.actionButton, 'mr-1')}
                            onClick={() => setArchiveModalVisible(true)}
                            fillStyle="ghost"
                            intent="secondary"
                            isLoading={isLoading}
                            isDisabled={isCustomFieldAIManagedType(
                                customField.managed_type
                            )}
                            title="Archive"
                            id={`archive-custom-field-${customField.id}`}
                        >
                            archive
                        </IconButton>

                        <ArchiveConfirmationModal
                            customFieldLabel={customField.label}
                            isOpen={archiveModalVisible}
                            onConfirm={() => {
                                setArchiveModalVisible(false)
                                mutate(true)
                                logEvent(
                                    SegmentEvent.CustomFieldArchivedFieldClicked,
                                    {
                                        objectType: customField.object_type,
                                    }
                                )
                            }}
                            onClose={() => setArchiveModalVisible(false)}
                            objectType={customField.object_type}
                        />
                    </>
                )}

                {customField.deactivated_datetime && (
                    <IconButton
                        className={classnames(css.actionButton, 'mr-1')}
                        onClick={() => {
                            mutate(false)
                        }}
                        fillStyle="ghost"
                        intent="secondary"
                        isDisabled={isCustomFieldAIManagedType(
                            customField.managed_type
                        )}
                        isLoading={isLoading}
                        title="Unarchive"
                        id={`restore-custom-field-${customField.id}`}
                    >
                        unarchive
                    </IconButton>
                )}
            </BodyCell>
        </TableBodyRowDraggable>
    )
}
