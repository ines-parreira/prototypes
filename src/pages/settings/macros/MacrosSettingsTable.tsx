import classnames from 'classnames'
import moment from 'moment'
import React, {useState} from 'react'
import {connect, ConnectedProps} from 'react-redux'
import {Button, Popover, PopoverHeader, PopoverBody} from 'reactstrap'

import {
    OrderDirection,
    MetaSortOptions,
    GorgiasError,
} from '../../../models/api/types'
import {createMacro, deleteMacro} from '../../../models/macro/resources'
import {MacroSortableProperties} from '../../../models/macro/types'
import {
    macroCreated,
    macroDeleted,
} from '../../../state/entities/macros/actions'
import {notify} from '../../../state/notifications/actions'
import {NotificationStatus} from '../../../state/notifications/types'
import {RootState} from '../../../state/types'
import Loader from '../../common/components/Loader/Loader'
import BodyCell from '../../common/components/table/cells/BodyCell'
import HeaderCell from '../../common/components/table/cells/HeaderCell'
import HeaderCellProperty from '../../common/components/table/cells/HeaderCellProperty'
import TableBody from '../../common/components/table/TableBody'
import TableBodyRow from '../../common/components/table/TableBodyRow'
import TableHead from '../../common/components/table/TableHead'
import TableWrapper from '../../common/components/table/TableWrapper'
import history from '../../history'
import {errorToChildren} from '../../../utils'

import css from './MacrosSettingsTable.less'

type OwnProps = {
    isLoading: boolean
    macroIds: number[]
    onSortOptionsChange: (
        orderBy: MacroSortableProperties,
        orderDir: OrderDirection
    ) => void
    sortOptions: {
        orderBy?: Maybe<MacroSortableProperties | MetaSortOptions>
        orderDir?: Maybe<OrderDirection>
    }
}

export function MacrosSettingsTableContainer({
    isLoading,
    macroIds,
    macros,
    macroCreated,
    macroDeleted,
    notify,
    onSortOptionsChange,
    sortOptions,
}: OwnProps & ConnectedProps<typeof connector>) {
    const [visiblePopoverId, setVisiblePopoverId] = useState<Maybe<string>>(
        null
    )
    const toggleVisiblePopover = (nextId: string) => {
        setVisiblePopoverId(nextId === visiblePopoverId ? null : nextId)
    }
    const handleMacroDelete = async (macroId: number) => {
        try {
            await deleteMacro(macroId)
            macroDeleted(macroId)
            void notify({
                message: 'Successfully deleted macro',
                status: NotificationStatus.Success,
            })
        } catch (error) {
            void notify({
                title: (error as GorgiasError).response.data.error.msg,
                message: errorToChildren(error)!,
                allowHTML: true,
                status: NotificationStatus.Error,
            })
        }
    }
    const handleMacroDuplicate = async (macroId: number) => {
        const macro = macros[macroId.toString()]

        if (!macro) {
            return
        }
        const {actions, name} = macro
        try {
            const res = await createMacro({
                actions,
                name: `${name} (copy)`,
            })
            macroCreated(res)
            history.push(`/app/settings/macros/${res.id}`)
        } catch (error) {
            void notify({
                message: 'Failed to duplicate macro',
                status: NotificationStatus.Error,
            })
        }
    }
    const handleSortChange = (orderBy: MacroSortableProperties) => {
        onSortOptionsChange(
            orderBy,
            orderBy !== sortOptions.orderBy ||
                sortOptions.orderDir === OrderDirection.Desc
                ? OrderDirection.Asc
                : OrderDirection.Desc
        )
    }

    return (
        <TableWrapper>
            <TableHead className={css.tableHead}>
                <HeaderCellProperty
                    direction={sortOptions.orderDir}
                    isOrderedBy={
                        sortOptions.orderBy === MacroSortableProperties.Name
                    }
                    onClick={() =>
                        handleSortChange(MacroSortableProperties.Name)
                    }
                    title="Macro"
                />
                <HeaderCellProperty
                    direction={sortOptions.orderDir}
                    isOrderedBy={
                        sortOptions.orderBy === MacroSortableProperties.Usage
                    }
                    onClick={() =>
                        handleSortChange(MacroSortableProperties.Usage)
                    }
                    title="Usage count"
                />
                <HeaderCellProperty
                    direction={sortOptions.orderDir}
                    isOrderedBy={
                        sortOptions.orderBy ===
                        MacroSortableProperties.UpdatedDatetime
                    }
                    onClick={() =>
                        handleSortChange(
                            MacroSortableProperties.UpdatedDatetime
                        )
                    }
                    title="Last updated"
                />
                <HeaderCell />
            </TableHead>
            <TableBody>
                {isLoading ? (
                    <TableBodyRow>
                        <BodyCell colSpan={4}>
                            <Loader />
                        </BodyCell>
                    </TableBodyRow>
                ) : (
                    macroIds.map((macroId) => {
                        const macro = macros[macroId.toString()]

                        if (!macro) {
                            return null
                        }
                        const {name, updated_datetime, usage} = macro
                        const deleteButtonId = `delete-button-${macroId}`

                        return (
                            <>
                                <TableBodyRow
                                    className={css.tableBodyRow}
                                    key={macroId}
                                    onClick={() => {
                                        history.push(
                                            `/app/settings/macros/${macroId}`
                                        )
                                    }}
                                >
                                    <BodyCell className={css.macroTitle}>
                                        {name}
                                    </BodyCell>
                                    <BodyCell>{usage}</BodyCell>
                                    <BodyCell className={css.dateCell}>
                                        {moment(updated_datetime).format(
                                            'YYYY-MM-DD'
                                        )}
                                    </BodyCell>
                                    <BodyCell
                                        className={classnames(
                                            'smallest',
                                            css.actions
                                        )}
                                    >
                                        <Button
                                            className="mr-1 btn-transparent"
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                void handleMacroDuplicate(
                                                    macroId
                                                )
                                            }}
                                            title="Duplicate macro"
                                            type="button"
                                        >
                                            <i className="material-icons">
                                                file_copy
                                            </i>
                                        </Button>
                                        <Button
                                            className={classnames(
                                                'mr-1 btn-transparent',
                                                css.deleteButton
                                            )}
                                            id={deleteButtonId}
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                toggleVisiblePopover(
                                                    deleteButtonId
                                                )
                                            }}
                                            title="Delete macro"
                                            type="button"
                                        >
                                            <i className="material-icons">
                                                delete
                                            </i>
                                        </Button>
                                    </BodyCell>
                                </TableBodyRow>
                                <Popover
                                    isOpen={deleteButtonId === visiblePopoverId}
                                    placement="left"
                                    target={deleteButtonId}
                                    toggle={() =>
                                        toggleVisiblePopover(deleteButtonId)
                                    }
                                    trigger="legacy"
                                >
                                    <PopoverHeader>Are you sure?</PopoverHeader>
                                    <PopoverBody>
                                        <p>
                                            You are about to delete{' '}
                                            <b>{name || 'this'}</b> macro.
                                        </p>
                                        <Button
                                            color="danger"
                                            onClick={() =>
                                                handleMacroDelete(macroId)
                                            }
                                            type="submit"
                                        >
                                            Confirm
                                        </Button>
                                    </PopoverBody>
                                </Popover>
                            </>
                        )
                    })
                )}
            </TableBody>
        </TableWrapper>
    )
}

const connector = connect(
    (state: RootState) => ({
        macros: state.entities.macros,
    }),
    {
        macroCreated,
        macroDeleted,
        notify,
    }
)

export default connector(MacrosSettingsTableContainer)
