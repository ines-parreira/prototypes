import {ListMacrosTagsItem, Macro} from '@gorgias/api-queries'
import classnames from 'classnames'
import React, {Dispatch, SetStateAction, useCallback, useMemo} from 'react'
import {Link, useRouteMatch} from 'react-router-dom'

import {DateTimeResultFormatType} from 'constants/datetime'
import {ISO639English} from 'constants/languages'
import {MacroActionName} from 'models/macroAction/types'
import IconButton from 'pages/common/components/button/IconButton'
import ConfirmationPopover from 'pages/common/components/popover/ConfirmationPopover'
import bodyCellCss from 'pages/common/components/table/cells/BodyCell.less'
import BodyCellContent from 'pages/common/components/table/cells/BodyCellContent'
import TableBodyRow from 'pages/common/components/table/TableBodyRow'
import CheckBox from 'pages/common/forms/CheckBox'
import {formatDatetime} from 'utils'

import css from './MacrosSettingsItem.less'
import {MacrosSettingsItemTag} from './MacrosSettingsItemTag'
import MoreActions from './MoreActions'

type Props = {
    datetimeFormat: DateTimeResultFormatType
    hasAgentPrivileges: boolean
    isArchivingAvailable: boolean
    macro: Macro
    onMacroDelete: (id: number) => Promise<void>
    onMacroDuplicate: (macro: Macro) => Promise<void>
    onMacroArchiveOrUnarchived: (id: number) => void
    firstTagFilter?: ListMacrosTagsItem
    selectedMacrosIds: number[]
    setSelectedMacrosIds: Dispatch<SetStateAction<number[]>>
}

export function MacrosSettingsItem({
    datetimeFormat,
    hasAgentPrivileges,
    isArchivingAvailable,
    macro,
    onMacroDelete,
    onMacroDuplicate,
    onMacroArchiveOrUnarchived,
    firstTagFilter,
    selectedMacrosIds,
    setSelectedMacrosIds,
}: Props) {
    const {actions, language, name, updated_datetime, usage} = macro
    const isArchiveTab = !!useRouteMatch('/app/settings/macros/archived')
    const to = isArchiveTab
        ? {
              pathname: `/app/settings/macros/${macro.id}`,
              state: {
                  isArchived: true,
              },
          }
        : `/app/settings/macros/${macro.id}`

    const tags = useMemo(() => {
        const tags = actions
            ?.filter((action) => action.name === MacroActionName.AddTags)
            .reduce<string[]>((allTags, action) => {
                const tags = (action.arguments as {tags: string}).tags?.split(
                    ','
                )
                if (tags) allTags.push(...tags)
                return allTags
            }, [])
            .map((tag) => tag.trim())
        if (!!(firstTagFilter && tags)) {
            const indexFirstTag = tags.findIndex(
                (tag) => tag === firstTagFilter
            )
            if (indexFirstTag !== -1) {
                ;[tags[0], tags[indexFirstTag]] = [tags[indexFirstTag], tags[0]]
            }
        }
        return tags
    }, [actions, firstTagFilter])

    const isChecked = !!macro.id && selectedMacrosIds.includes(macro.id)

    const handleMacroSelection = useCallback(
        () =>
            setSelectedMacrosIds(
                isChecked
                    ? selectedMacrosIds.filter((id) => macro.id !== id)
                    : [...selectedMacrosIds, macro.id!]
            ),
        [isChecked, macro.id, selectedMacrosIds, setSelectedMacrosIds]
    )

    return (
        <TableBodyRow className={css.tableBodyRow} key={macro.id}>
            <td
                className={classnames(css.macroTitle, bodyCellCss.wrapper, {
                    [css.wrapper]: isArchivingAvailable,
                })}
            >
                {isArchivingAvailable && (
                    <CheckBox
                        inputClassName={css.checkbox}
                        name={`${macro.id}`}
                        aria-label={`${macro.id}`}
                        isChecked={isChecked}
                        onChange={handleMacroSelection}
                    />
                )}
                <Link to={to}>
                    <BodyCellContent>{name}</BodyCellContent>
                </Link>
            </td>
            <td className={bodyCellCss.wrapper}>
                <Link to={to} tabIndex={-1}>
                    <BodyCellContent>
                        <MacrosSettingsItemTag
                            tags={tags}
                            id={`tags-${macro.id}`}
                        />
                    </BodyCellContent>
                </Link>
            </td>
            <td className={bodyCellCss.wrapper}>
                <Link to={to} tabIndex={-1}>
                    <BodyCellContent>
                        {language ? ISO639English[language] : '-'}
                    </BodyCellContent>
                </Link>
            </td>
            <td className={bodyCellCss.wrapper}>
                <Link to={to} tabIndex={-1}>
                    <BodyCellContent>{usage}</BodyCellContent>
                </Link>
            </td>
            <td className={classnames(bodyCellCss.wrapper, css.dateCell)}>
                <Link to={to} tabIndex={-1}>
                    <BodyCellContent>
                        {!!updated_datetime &&
                            formatDatetime(updated_datetime, datetimeFormat)}
                    </BodyCellContent>
                </Link>
            </td>
            <td className={classnames(bodyCellCss.wrapper, css.actions)}>
                {isArchivingAvailable ? (
                    <MoreActions
                        hasAgentPrivileges={hasAgentPrivileges}
                        macro={macro}
                        onMacroDuplicate={onMacroDuplicate}
                        onMacroDelete={onMacroDelete}
                        onMacroArchiveOrUnarchived={onMacroArchiveOrUnarchived}
                    />
                ) : (
                    <BodyCellContent>
                        <IconButton
                            className="mr-1"
                            fillStyle="ghost"
                            intent="secondary"
                            onClick={() => {
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
                                    <b>{name || 'this'}</b> macro.
                                </>
                            }
                            id={`delete-button-${macro.id}`}
                            onConfirm={() => onMacroDelete(macro.id!)}
                            placement="left"
                        >
                            {({uid, onDisplayConfirmation}) => (
                                <IconButton
                                    className="mr-1"
                                    id={uid}
                                    fillStyle="ghost"
                                    intent="destructive"
                                    onClick={onDisplayConfirmation}
                                    title="Delete macro"
                                    isDisabled={!hasAgentPrivileges}
                                >
                                    delete
                                </IconButton>
                            )}
                        </ConfirmationPopover>
                    </BodyCellContent>
                )}
            </td>
        </TableBodyRow>
    )
}
