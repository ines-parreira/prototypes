import classnames from 'classnames'
import {Map, List} from 'immutable'
import React, {useEffect, useRef} from 'react'

import {useDesktopOnlyShowGlobalNavFeatureFlag} from 'common/navigation/hooks/useShowGlobalNavFeatureFlag'
import useAgentsViewing from 'hooks/realtime/useAgentsViewing'
import useAppDispatch from 'hooks/useAppDispatch'
import {EntityType} from 'models/view/types'

import ViewingIndicator from 'pages/common/components/ViewingIndicator/ViewingIndicator'
import css from 'pages/common/components/ViewTable/Table.less'
import CheckBox from 'pages/common/forms/CheckBox'
import {scrollToReactNode} from 'pages/common/utils/keyboard'

import * as viewsActions from 'state/views/actions'

import * as viewsUtils from 'state/views/utils'

import Cell from './Cell'

type Props = {
    onItemClick?: (item: Map<any, any>) => void
    itemUrl: Maybe<string>
    fields: List<any>
    item: Map<any, any>
    isSelected: boolean
    hasCursor: boolean
    selectable: boolean | null
    type: EntityType
}

export default function Row({
    fields,
    item,
    isSelected,
    selectable,
    type,
    hasCursor,
    onItemClick,
    itemUrl,
}: Props) {
    const showGlobalNav = useDesktopOnlyShowGlobalNavFeatureFlag()
    const dispatch = useAppDispatch()
    const rowRef = useRef<HTMLTableRowElement>(null)
    useEffect(() => {
        if (hasCursor) {
            // only if it just got the cursor.
            // to prevent focusing on the cursor item when a different one updates.
            scrollToReactNode(rowRef.current as HTMLElement)
        }
    }, [hasCursor, item])

    const toggleSelection = () => {
        dispatch(viewsActions.toggleIdInSelectedItemsIds(item.get('id')))
    }

    const {agentsViewing} = useAgentsViewing(item.get('id') as number)

    return (
        <tr
            ref={rowRef}
            className={classnames({
                highlighted: item.get('is_unread'),
                [css['has-cursor']]: hasCursor,
            })}
        >
            {/* istanbul ignore next */}
            {selectable ? (
                <td
                    className={classnames(
                        'cell-wrapper clickable d-none d-md-table-cell smallest',
                        /* istanbul ignore next */
                        showGlobalNav ? 'cell-global-nav' : 'cell-short'
                    )}
                    onClick={toggleSelection}
                >
                    {
                        // display an eye on row if an agent is currently viewing this item
                        agentsViewing.length > 0 && (
                            <ViewingIndicator
                                title={viewsUtils.agentsViewingMessage(
                                    agentsViewing
                                )}
                            />
                        )
                    }
                    <CheckBox
                        labelClassName={css.checkBoxLabel}
                        className={css.checkBox}
                        isChecked={isSelected}
                    />
                </td>
            ) : null}
            {fields.map((field: Map<any, any>) => (
                <Cell
                    key={`${item.get('id') as number}-${field.get('name') as string}`}
                    item={item}
                    field={field}
                    type={type}
                    onClick={onItemClick}
                    itemUrl={itemUrl}
                />
            ))}
        </tr>
    )
}
