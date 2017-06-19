import React, {PropTypes} from 'react'
import classnames from 'classnames'
import ImmutablePropTypes from 'react-immutable-proptypes'
import {connect} from 'react-redux'
import {fromJS} from 'immutable'

import Cell from './Cell'

import css from '../Table.less'

import * as usersSelectors from '../../../../../state/users/selectors'
import * as viewsActions from '../../../../../state/views/actions'
import * as viewsSelectors from '../../../../../state/views/selectors'

import * as viewsUtils from '../../../../../state/views/utils'

class Row extends React.Component {
    static propTypes = {
        config: ImmutablePropTypes.map.isRequired,
        fields: ImmutablePropTypes.list.isRequired,
        getAgentsViewing: PropTypes.func.isRequired,
        item: ImmutablePropTypes.map.isRequired,
        isSelected: PropTypes.bool.isRequired,
        toggleSelection: PropTypes.func.isRequired,
        type: PropTypes.string.isRequired,
    }

    static defaultProps = {
        item: fromJS({}),
    }

    _toggleSelection = () => {
        this.props.toggleSelection(this.props.item.get('id'))
    }

    render() {
        const {config, fields, getAgentsViewing, item, isSelected, type} = this.props

        const link = `/app/${config.get('routeItem')}/${item.get('id')}`

        const agentsViewing = getAgentsViewing(item.get('id'))

        return (
            <tr
                className={classnames({
                    highlighted: item.get('is_unread'),
                })}
            >
                <td
                    className="cell-wrapper cell-short clickable hidden-sm-down"
                    onClick={this._toggleSelection}
                >
                    {
                        // display an eye on row if an agent is currently viewing this item
                        agentsViewing.size > 0 && (
                            <div
                                className={css.viewers}
                                title={viewsUtils.agentsViewingMessage(agentsViewing)}
                            >
                                <i className="fa fa-fw fa-eye" />
                            </div>
                        )
                    }
                    <span className="ui checkbox">
                        <input
                            type="checkbox"
                            checked={isSelected}
                        />
                        <label />
                    </span>
                </td>
                {
                    fields.map((field) => (
                        <Cell
                            key={`${item.get('id')}-${field.get('name')}`}
                            link={link}
                            item={item}
                            field={field}
                            type={type}
                        />
                    ))
                }
            </tr>
        )
    }
}

const mapStateToProps = (state, ownProps) => {
    return {
        config: viewsSelectors.getViewConfig(ownProps.type),
        getAgentsViewing: usersSelectors.makeGetOtherAgentsOnTicket(state),
    }
}

const mapDispatchToProps = {
    toggleSelection: viewsActions.toggleSelection,
}

export default connect(mapStateToProps, mapDispatchToProps)(Row)
