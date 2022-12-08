import classnames from 'classnames'
import moment from 'moment'
import React, {useMemo} from 'react'
import {connect, ConnectedProps} from 'react-redux'

import {Link} from 'react-router-dom'
import IconButton from 'pages/common/components/button/IconButton'
import {ISO639English} from 'constants/languages'
import {MACRO_ACTION_NAME} from 'models/macroAction/constants'
import {TagLabel} from 'pages/common/utils/labels'
import Tooltip from 'pages/common/components/Tooltip'
import ConfirmationPopover from 'pages/common/components/popover/ConfirmationPopover'
import {OrderDirection, GorgiasApiError} from '../../../models/api/types'
import {createMacro, deleteMacro} from '../../../models/macro/resources'
import {
    FetchMacrosOptions,
    MacroSortableProperties,
} from '../../../models/macro/types'
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
import BodyCellContent from '../../common/components/table/cells/BodyCellContent'
import bodyCellCss from '../../common/components/table/cells/BodyCell.less'
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
    options: FetchMacrosOptions
}

export function MacrosSettingsTableContainer({
    isLoading,
    macroIds,
    macros,
    macroCreated,
    macroDeleted,
    notify,
    onSortOptionsChange,
    options,
}: OwnProps & ConnectedProps<typeof connector>) {
    const orderByValue = useMemo(
        () => options.orderBy?.split(':')[0],
        [options.orderBy]
    )
    const orderDirValue = useMemo(
        () => options.orderBy?.split(':')[1] as OrderDirection,
        [options.orderBy]
    )

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
                title: (error as GorgiasApiError).response.data.error.msg,
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
        const {actions, name, language} = macro
        try {
            const res = await createMacro({
                actions,
                name: `${name} (copy)`,
                language,
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

    const defaultDescendingSort = [
        MacroSortableProperties.Usage,
        MacroSortableProperties.UpdatedDatetime,
    ]

    const handleSortChange = (orderBy: MacroSortableProperties) => {
        onSortOptionsChange(
            orderBy,
            orderBy === orderByValue
                ? orderDirValue === OrderDirection.Asc
                    ? OrderDirection.Desc
                    : OrderDirection.Asc
                : defaultDescendingSort.includes(orderBy)
                ? OrderDirection.Desc
                : OrderDirection.Asc
        )
    }

    return (
        <TableWrapper>
            <TableHead className={css.tableHead}>
                <HeaderCellProperty
                    direction={orderDirValue}
                    isOrderedBy={orderByValue === MacroSortableProperties.Name}
                    onClick={() =>
                        handleSortChange(MacroSortableProperties.Name)
                    }
                    title="Macro"
                />
                <HeaderCellProperty title="Tags" />
                <HeaderCellProperty
                    direction={orderDirValue}
                    isOrderedBy={
                        orderByValue === MacroSortableProperties.Language
                    }
                    onClick={() =>
                        handleSortChange(MacroSortableProperties.Language)
                    }
                    title="Language"
                />
                <HeaderCellProperty
                    direction={orderDirValue}
                    isOrderedBy={orderByValue === MacroSortableProperties.Usage}
                    onClick={() =>
                        handleSortChange(MacroSortableProperties.Usage)
                    }
                    title="Usage count"
                />
                <HeaderCellProperty
                    direction={orderDirValue}
                    isOrderedBy={
                        orderByValue === MacroSortableProperties.UpdatedDatetime
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

                        const {name, language, updated_datetime, usage} = macro
                        const to = `/app/settings/macros/${macroId}`

                        const tags = macro.actions
                            .filter(
                                (action) =>
                                    action.name === MACRO_ACTION_NAME.ADD_TAGS
                            )
                            .reduce((allTags: string[], action) => {
                                const tags = action.arguments.tags?.split(',')
                                if (tags) allTags.push(...tags)
                                return allTags
                            }, [])
                            .map((tag) => tag.trim())

                        if (options.tags?.length) {
                            const idx = tags.findIndex(
                                (tag) => tag === options.tags![0]
                            )
                            if (idx !== -1) {
                                const temp = tags[0]
                                tags[0] = tags[idx]
                                tags[idx] = temp
                            }
                        }

                        const tagId = `tags-${macroId}`
                        const tag = tags.length ? (
                            <div className="flex" id={tagId}>
                                <TagLabel>{tags[0]}</TagLabel>
                                {tags.length > 1 && (
                                    <>
                                        <Tooltip target={tagId}>
                                            {tags.join(', ')}
                                        </Tooltip>
                                        <TagLabel className="text-info">
                                            +{tags.length - 1}
                                        </TagLabel>
                                    </>
                                )}
                            </div>
                        ) : (
                            '-'
                        )

                        return (
                            <TableBodyRow
                                className={css.tableBodyRow}
                                key={macroId}
                            >
                                <td
                                    className={classnames(
                                        css.macroTitle,
                                        bodyCellCss.wrapper
                                    )}
                                >
                                    <Link to={to}>
                                        <BodyCellContent>
                                            {name}
                                        </BodyCellContent>
                                    </Link>
                                </td>
                                <td className={bodyCellCss.wrapper}>
                                    <Link to={to} tabIndex={-1}>
                                        <BodyCellContent>{tag}</BodyCellContent>
                                    </Link>
                                </td>
                                <td className={bodyCellCss.wrapper}>
                                    <Link to={to} tabIndex={-1}>
                                        <BodyCellContent>
                                            {language
                                                ? ISO639English[language]
                                                : '-'}
                                        </BodyCellContent>
                                    </Link>
                                </td>
                                <td className={bodyCellCss.wrapper}>
                                    <Link to={to} tabIndex={-1}>
                                        <BodyCellContent>
                                            {usage}
                                        </BodyCellContent>
                                    </Link>
                                </td>
                                <td
                                    className={classnames(
                                        bodyCellCss.wrapper,
                                        css.dateCell
                                    )}
                                >
                                    <Link to={to} tabIndex={-1}>
                                        <BodyCellContent>
                                            {moment(updated_datetime).format(
                                                'YYYY-MM-DD'
                                            )}
                                        </BodyCellContent>
                                    </Link>
                                </td>
                                <td
                                    className={classnames(
                                        bodyCellCss.wrapper,
                                        bodyCellCss.smallest,
                                        css.actions
                                    )}
                                >
                                    <BodyCellContent>
                                        <IconButton
                                            className="mr-1"
                                            fillStyle="ghost"
                                            intent="secondary"
                                            onClick={() => {
                                                void handleMacroDuplicate(
                                                    macroId
                                                )
                                            }}
                                            title="Duplicate macro"
                                        >
                                            file_copy
                                        </IconButton>
                                        <ConfirmationPopover
                                            buttonProps={{
                                                intent: 'destructive',
                                            }}
                                            content={
                                                <>
                                                    You are about to delete{' '}
                                                    <b>{name || 'this'}</b>{' '}
                                                    macro.
                                                </>
                                            }
                                            id={`delete-button-${macroId}`}
                                            onConfirm={() =>
                                                handleMacroDelete(macroId)
                                            }
                                            placement="left"
                                        >
                                            {({uid, onDisplayConfirmation}) => (
                                                <IconButton
                                                    className="mr-1"
                                                    id={uid}
                                                    fillStyle="ghost"
                                                    intent="destructive"
                                                    onClick={
                                                        onDisplayConfirmation
                                                    }
                                                    title="Delete macro"
                                                >
                                                    delete
                                                </IconButton>
                                            )}
                                        </ConfirmationPopover>
                                    </BodyCellContent>
                                </td>
                            </TableBodyRow>
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
