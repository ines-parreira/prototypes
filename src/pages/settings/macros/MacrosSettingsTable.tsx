import {ListMacrosParams, Macro} from '@gorgias/api-queries'
import {Tooltip} from '@gorgias/merchant-ui-kit'
import classnames from 'classnames'
import React, {useMemo} from 'react'
import {Link} from 'react-router-dom'

import {DateAndTimeFormatting} from 'constants/datetime'
import {ISO639English} from 'constants/languages'
import useGetDateAndTimeFormat from 'hooks/useGetDateAndTimeFormat'
import useHasAgentPrivileges from 'hooks/useHasAgentPrivileges'
import {OrderDirection} from 'models/api/types'
import {MacroSortableProperties} from 'models/macro/types'
import {MacroActionName} from 'models/macroAction/types'
import Badge, {ColorType} from 'pages/common/components/Badge'
import IconButton from 'pages/common/components/button/IconButton'
import Loader from 'pages/common/components/Loader/Loader'
import ConfirmationPopover from 'pages/common/components/popover/ConfirmationPopover'
import BodyCell from 'pages/common/components/table/cells/BodyCell'
import bodyCellCss from 'pages/common/components/table/cells/BodyCell.less'
import BodyCellContent from 'pages/common/components/table/cells/BodyCellContent'
import HeaderCell from 'pages/common/components/table/cells/HeaderCell'
import HeaderCellProperty from 'pages/common/components/table/cells/HeaderCellProperty'
import TableBody from 'pages/common/components/table/TableBody'
import TableBodyRow from 'pages/common/components/table/TableBodyRow'
import TableHead from 'pages/common/components/table/TableHead'
import TableWrapper from 'pages/common/components/table/TableWrapper'
import TicketTag from 'pages/common/components/TicketTag'
import {formatDatetime} from 'utils'

import css from './MacrosSettingsTable.less'

type Props = {
    isLoading: boolean
    macros?: Macro[]
    onSortOptionsChange: (
        orderBy: MacroSortableProperties,
        orderDir: OrderDirection
    ) => void
    onMacroDelete: (id: number) => Promise<void>
    onMacroDuplicate: (macro: Macro) => Promise<void>
    options: ListMacrosParams
}

export function MacrosSettingsTable({
    isLoading,
    macros,
    onSortOptionsChange,
    onMacroDelete,
    onMacroDuplicate,
    options,
}: Props) {
    const datetimeFormat = useGetDateAndTimeFormat(
        DateAndTimeFormatting.CompactDate
    )

    const orderByValue = useMemo(
        () => options.order_by?.split(':')[0],
        [options.order_by]
    )
    const orderDirValue = useMemo(
        () => options.order_by?.split(':')[1] as OrderDirection,
        [options.order_by]
    )
    const hasAgentPrivileges = useHasAgentPrivileges()

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
                    macros?.map((macro) => {
                        if (!macro) {
                            return null
                        }

                        const {name, language, updated_datetime, usage} = macro
                        const to = `/app/settings/macros/${macro.id}`

                        const tags = macro.actions
                            ?.filter(
                                (action) =>
                                    action.name === MacroActionName.AddTags
                            )
                            .reduce((allTags: string[], action) => {
                                const tags = (
                                    action.arguments as {tags: string}
                                ).tags?.split(',')
                                if (tags) allTags.push(...tags)
                                return allTags
                            }, [])
                            .map((tag) => tag.trim())

                        if (options.tags?.length && tags) {
                            const idx = tags.findIndex(
                                (tag) => tag === options.tags![0]
                            )
                            if (idx !== -1) {
                                const temp = tags[0]
                                tags[0] = tags[idx]
                                tags[idx] = temp
                            }
                        }

                        const tagId = `tags-${macro.id}`
                        const tag = tags?.length ? (
                            <div className={css.tags} id={tagId}>
                                <TicketTag text={tags[0]} />
                                {tags.length > 1 && (
                                    <>
                                        <Tooltip target={tagId}>
                                            {tags.join(', ')}
                                        </Tooltip>
                                        <Badge
                                            type={ColorType.LightDark}
                                            corner="square"
                                        >
                                            +{tags.length - 1}
                                        </Badge>
                                    </>
                                )}
                            </div>
                        ) : (
                            '-'
                        )

                        return (
                            <TableBodyRow
                                className={css.tableBodyRow}
                                key={macro.id}
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
                                            {!!updated_datetime &&
                                                formatDatetime(
                                                    updated_datetime,
                                                    datetimeFormat
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
                                                !!macro.id &&
                                                    void onMacroDuplicate(macro)
                                            }}
                                            title="Duplicate macro"
                                            isDisabled={!hasAgentPrivileges}
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
                                            id={`delete-button-${macro.id}`}
                                            onConfirm={() =>
                                                !!macro.id &&
                                                void onMacroDelete(macro.id)
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
                                                    isDisabled={
                                                        !hasAgentPrivileges
                                                    }
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

export default MacrosSettingsTable
