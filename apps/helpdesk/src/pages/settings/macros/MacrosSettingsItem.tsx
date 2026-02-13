import type { Dispatch, SetStateAction } from 'react'
import { useCallback, useMemo } from 'react'

import { formatDatetime } from '@repo/utils'
import type { DateTimeResultFormatType } from '@repo/utils'
import classnames from 'classnames'
import { Link, useLocation } from 'react-router-dom'

import type { Macro } from '@gorgias/helpdesk-queries'

import { ISO639English } from 'constants/languages'
import { MacroActionName } from 'models/macroAction/types'
import bodyCellCss from 'pages/common/components/table/cells/BodyCell.less'
import BodyCellContent from 'pages/common/components/table/cells/BodyCellContent'
import TableBodyRow from 'pages/common/components/table/TableBodyRow'
import CheckBox from 'pages/common/forms/CheckBox'

import { MacrosSettingsItemTag } from './MacrosSettingsItemTag'
import MoreActions from './MoreActions'

import css from './MacrosSettingsItem.less'

type Props = {
    datetimeFormat: DateTimeResultFormatType
    hasAgentPrivileges: boolean
    macro: Macro
    onMacroDelete: (id: number) => void
    onMacroDuplicate: (macro: Macro) => void
    onMacroArchiveOrUnarchived: (id: number) => void
    firstTagFilter?: string | null
    selectedMacrosIds: number[]
    setSelectedMacrosIds: Dispatch<SetStateAction<number[]>>
}

export function MacrosSettingsItem({
    datetimeFormat,
    hasAgentPrivileges,
    macro,
    onMacroDelete,
    onMacroDuplicate,
    onMacroArchiveOrUnarchived,
    firstTagFilter,
    selectedMacrosIds,
    setSelectedMacrosIds,
}: Props) {
    const { actions, language, name, updated_datetime, usage } = macro
    const location = useLocation()
    const to = {
        pathname: `/app/settings/macros/${macro.id}`,
        state: { search: location.search },
    }

    const tags = useMemo(() => {
        const tags = actions
            ?.filter((action) => action.name === MacroActionName.AddTags)
            .reduce<string[]>((allTags, action) => {
                const tags = (action.arguments as { tags: string }).tags?.split(
                    ',',
                )
                if (tags) allTags.push(...tags)
                return allTags
            }, [])
            .map((tag) => tag.trim())
        if (!!(firstTagFilter && tags)) {
            const indexFirstTag = tags.findIndex(
                (tag) => tag === firstTagFilter,
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
                    : [...selectedMacrosIds, macro.id!],
            ),
        [isChecked, macro.id, selectedMacrosIds, setSelectedMacrosIds],
    )

    return (
        <TableBodyRow className={css.tableBodyRow} key={macro.id}>
            <td className={classnames(css.macroTitle, bodyCellCss.wrapper)}>
                {
                    <CheckBox
                        inputClassName={css.checkbox}
                        name={`${macro.id}`}
                        aria-label={`${macro.id}`}
                        isChecked={isChecked}
                        onChange={handleMacroSelection}
                    />
                }
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
                <MoreActions
                    hasAgentPrivileges={hasAgentPrivileges}
                    macro={macro}
                    onMacroDuplicate={onMacroDuplicate}
                    onMacroDelete={onMacroDelete}
                    onMacroArchiveOrUnarchived={onMacroArchiveOrUnarchived}
                />
            </td>
        </TableBodyRow>
    )
}
