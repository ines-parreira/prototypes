import React, {PropTypes} from 'react'
import {Link} from 'react-router'
import ImmutablePropTypes from 'react-immutable-proptypes'
import {connect} from 'react-redux'
import {fromJS} from 'immutable'
import {RenderLabel} from '../../../utils/labels'

import * as viewsActions from '../../../../../state/views/actions'

import * as viewsConfig from '../../../../../config/views'

import css from '../Table.less'

class Cell extends React.Component {
    static propTypes = {
        config: ImmutablePropTypes.map.isRequired,
        field: ImmutablePropTypes.map.isRequired,
        item: ImmutablePropTypes.map.isRequired,
        link: PropTypes.string.isRequired,
        type: PropTypes.string.isRequired,
    }

    static defaultProps = {
        item: fromJS({}),
    }

    _labelValue = () => {
        const {config, field, item} = this.props

        const cellRenderFunction = config.get('cell')

        return cellRenderFunction(field.get('name'), item)
    }

    render() {
        const {field, link} = this.props

        return (
            <td className={css['limit-overflow']}>
                <Link to={link}>
                    <div className="cell-wrapper">
                        <RenderLabel
                            field={field}
                            value={this._labelValue()}
                        />
                    </div>
                </Link>
            </td>
        )
    }
}

const mapStateToProps = (state, ownProps) => {
    return {
        config: viewsConfig.getConfigByName(ownProps.type),
    }
}

const mapDispatchToProps = {
    toggleSelection: viewsActions.toggleSelection,
}

export default connect(mapStateToProps, mapDispatchToProps)(Cell)
