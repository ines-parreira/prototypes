import React, {Component} from 'react'
import classnames from 'classnames'
import {connect, ConnectedProps} from 'react-redux'
import {fromJS, Map, List} from 'immutable'
import {EntityType} from 'models/view/types'

import ViewingIndicator from 'pages/common/components/ViewingIndicator/ViewingIndicator'
import CheckBox from 'pages/common/forms/CheckBox'
import {scrollToReactNode} from 'pages/common/utils/keyboard'

import css from 'pages/common/components/ViewTable/Table.less'

import * as agentSelectors from 'state/agents/selectors'
import * as viewsActions from 'state/views/actions'

import * as viewsUtils from 'state/views/utils'

import {RootState} from 'state/types'

import Cell from './Cell'

type OwnProps = {
    onItemClick?: (item: Map<any, any>) => void
    itemUrl: Maybe<string>
    fields: List<any>
    item: Map<any, any>
    isSelected: boolean
    hasCursor: boolean
    selectable: boolean | null
    type: EntityType
}

type Props = OwnProps & ConnectedProps<typeof connector>

export class RowContainer extends Component<Props> {
    static defaultProps: Pick<Props, 'item' | 'selectable'> = {
        item: fromJS({}),
        selectable: true,
    }

    componentDidUpdate(prevProps: Props) {
        // only if it just got the cursor.
        // to prevent focusing on the cursor item when a different one updates.
        if (this.props.hasCursor && !prevProps.hasCursor) {
            scrollToReactNode(this as unknown as HTMLElement)
        }
    }

    _toggleSelection = () => {
        this.props.toggleIdInSelectedItemsIds(this.props.item.get('id'))
    }

    render() {
        const {
            fields,
            getAgentsViewing,
            item,
            isSelected,
            selectable,
            type,
            hasCursor,
            onItemClick,
            itemUrl,
        } = this.props

        const agentsViewing = getAgentsViewing(item.get('id'))

        return (
            <tr
                className={classnames({
                    highlighted: item.get('is_unread'),
                    [css['has-cursor']]: hasCursor,
                })}
            >
                {selectable ? (
                    <td
                        className="cell-wrapper cell-short clickable d-none d-md-table-cell smallest"
                        onClick={this._toggleSelection}
                    >
                        {
                            // display an eye on row if an agent is currently viewing this item
                            agentsViewing.size > 0 && (
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
                        key={`${item.get('id') as number}-${
                            field.get('name') as string
                        }`}
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
}

const connector = connect(
    (state: RootState) => {
        return {
            getAgentsViewing: agentSelectors.makeGetOtherAgentsOnTicket(state),
        }
    },
    {
        toggleIdInSelectedItemsIds: viewsActions.toggleIdInSelectedItemsIds,
    }
)

export default connector(RowContainer)
