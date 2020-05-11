//@flow
import classnames from 'classnames'
import _pick from 'lodash/pick'
import moment from 'moment'
//$FlowFixMe
import React, {useState} from 'react'
import {connect} from 'react-redux'
import {browserHistory} from 'react-router'
import {
    Button,
    Popover,
    PopoverHeader,
    PopoverBody,
} from 'reactstrap'

import {ORDER_DIRECTION, type OrderDirection} from '../../../models/api'
import {createMacro, deleteMacro, MACRO_SORTABLE_PROPERTIES, type MacroSortableProperties} from '../../../models/macro'
import {macroCreated, macroDeleted, type MacrosState} from '../../../state/entities/macros'
import {notify} from '../../../state/notifications/actions'
import Loader from '../../common/components/Loader'
import BodyCell from '../../common/components/table/cells/BodyCell'
import HeaderCell from '../../common/components/table/cells/HeaderCell'
import HeaderCellProperty from '../../common/components/table/cells/HeaderCellProperty'
import TableBody from '../../common/components/table/TableBody'
import TableBodyRow from '../../common/components/table/TableBodyRow'
import TableHead from '../../common/components/table/TableHead'
import TableWrapper from '../../common/components/table/TableWrapper'

import css from './MacrosSettingsTable.less'

type OwnProps = {
    isLoading: boolean,
    macroIds: number[],
    onSortOptionsChange: (orderBy: MacroSortableProperties, orderDir: OrderDirection) => void,
    sortOptions: {
        orderBy: MacroSortableProperties,
        orderDir: OrderDirection,
    },
}

type Props = OwnProps & {
    macros: MacrosState,
    macroCreated: typeof macroCreated,
    macroDeleted: typeof macroDeleted,
    notify: typeof notify,
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
}: Props) {
    const [visiblePopoverId, setVisiblePopoverId] = useState(null)
    const toggleVisiblePopover = (nextId: string) => {
        setVisiblePopoverId(
            nextId === visiblePopoverId ?
                null
                :
                nextId
        )
    }
    const handleMacroDelete = async (macroId: number) => {
        try {
            await deleteMacro(macroId)
            macroDeleted(macroId)
            notify({
                message: 'Successfully deleted macro',
                status: 'success',
            })
        } catch (error) {
            notify({
                message: 'Failed to delete macro',
                status: 'error',
            })
        }
    }
    const handleMacroDuplicate = async (macroId: number) => {
        const macro = macros[macroId.toString()]

        if (!macro) {
            return
        }
        try {
            const res = await createMacro(_pick(macro, ['actions', 'intent', 'name']))
            macroCreated(res)
            browserHistory.push(`/app/settings/macros/${res.id}`)
        } catch (error) {
            notify({
                message: 'Failed to duplicate macro',
                status: 'error',
            })
        }
    }
    const handleSortChange = (orderBy: MacroSortableProperties) => {
        onSortOptionsChange(
            orderBy,
            orderBy !== sortOptions.orderBy || sortOptions.orderDir === ORDER_DIRECTION.DESC ?
                ORDER_DIRECTION.ASC
                :
                ORDER_DIRECTION.DESC
        )
    }

    return (
        <TableWrapper>
            <TableHead className={css.tableHead}>
                <HeaderCellProperty
                    direction={sortOptions.orderDir}
                    isOrderedBy={sortOptions.orderBy === MACRO_SORTABLE_PROPERTIES.NAME}
                    onClick={() => handleSortChange(MACRO_SORTABLE_PROPERTIES.NAME)}
                    title="Macro"
                />
                <HeaderCellProperty
                    direction={sortOptions.orderDir}
                    isOrderedBy={sortOptions.orderBy === MACRO_SORTABLE_PROPERTIES.USAGE}
                    onClick={() => handleSortChange(MACRO_SORTABLE_PROPERTIES.USAGE)}
                    title="Usage count"
                />
                <HeaderCellProperty
                    direction={sortOptions.orderDir}
                    isOrderedBy={sortOptions.orderBy === MACRO_SORTABLE_PROPERTIES.UPDATED_DATETIME}
                    onClick={() => handleSortChange(MACRO_SORTABLE_PROPERTIES.UPDATED_DATETIME)}
                    title="Last updated"
                />
                <HeaderCell/>
            </TableHead>
            <TableBody>
                {isLoading ?
                    <TableBodyRow>
                        <BodyCell colSpan={4}>
                            <Loader/>
                        </BodyCell>
                    </TableBodyRow>
                    :
                    macroIds.map((macroId) => {
                        const macro = macros[macroId.toString()]

                        if (!macro) {
                            return null
                        }
                        const {
                            name,
                            updatedDatetime,
                            usage,
                        } = macro
                        const deleteButtonId = `delete-button-${macroId}`

                        return (
                            <TableBodyRow
                                className={css.tableBodyRow}
                                key={macroId}
                                onClick={() => {
                                    browserHistory.push(`/app/settings/macros/${macroId}`)
                                }}
                            >
                                <BodyCell className={css.macroTitle}>
                                    {name}
                                </BodyCell>
                                <BodyCell>
                                    {usage}
                                </BodyCell>
                                <BodyCell className={css.dateCell}>
                                    {moment(updatedDatetime).format('YYYY-MM-DD')}
                                </BodyCell>
                                <BodyCell className={classnames('smallest', css.actions)}>
                                    <Button
                                        className="mr-1 btn-transparent"
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            handleMacroDuplicate(macroId)
                                        }}
                                        title="Duplicate macro"
                                        type="button"
                                    >
                                        <i className="material-icons">
                                            file_copy
                                        </i>
                                    </Button>
                                    <Button
                                        className={classnames('mr-1 btn-transparent', css.deleteButton)}
                                        id={deleteButtonId}
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            toggleVisiblePopover(deleteButtonId)
                                        }}
                                        title="Delete macro"
                                        type="button"
                                    >
                                        <i className="material-icons">
                                            delete
                                        </i>
                                    </Button>
                                    <Popover
                                        isOpen={deleteButtonId === visiblePopoverId}
                                        placement="left"
                                        target={deleteButtonId}
                                        toggle={() => toggleVisiblePopover(deleteButtonId)}
                                    >
                                        <PopoverHeader>
                                            Are you sure?
                                        </PopoverHeader>
                                        <PopoverBody>
                                            <p>
                                                You are about to delete <b>{name || 'this'}</b> macro.
                                            </p>
                                            <Button
                                                color="danger"
                                                onClick={() => handleMacroDelete(macroId)}
                                                type="submit"
                                            >
                                                Confirm
                                            </Button>
                                        </PopoverBody>
                                    </Popover>
                                </BodyCell>
                            </TableBodyRow>
                        )
                    })
                }
            </TableBody>
        </TableWrapper>
    )
}

const mapStateToProps = (state) => ({
    macros: state.entities.macros,
})

const mapDispatchToProps = {
    macroCreated,
    macroDeleted,
    notify,
}

export default connect<Props, OwnProps>(mapStateToProps, mapDispatchToProps)(MacrosSettingsTableContainer)
