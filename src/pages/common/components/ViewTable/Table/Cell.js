// @flow
import React from 'react'
import {connect} from 'react-redux'
import {fromJS, Map} from 'immutable'
import {RenderLabel} from '../../../utils/labels'

import * as viewsConfig from '../../../../../config/views'

import css from '../Table.less'
import {Link} from 'react-router'

type Props = {
    config: Map<*,*>,
    field: Map<*,*>,
    item: Map<*,*>,
    type: string,
    onClick: ?(Map<*,*>) => void,
    itemUrl: ?string
}


class Cell extends React.Component<Props> {
    static defaultProps = {
        item: fromJS({}),
    }

    _labelValue = () => {
        const {config, field, item} = this.props

        const cellRenderFunction = config.get('cell')

        return cellRenderFunction(field.get('name'), item)
    }

    render() {
        const {item, field, onClick, itemUrl} = this.props

        let content
        let children = (
            <RenderLabel
                field={field}
                value={this._labelValue()}
            />
        )

        if (onClick) {
            content = (
                <div className="cell-wrapper" onClick={() => onClick(item)}>
                    {children}
                </div>
            )
        } else if (itemUrl) {
            content = (
                <Link to={itemUrl}>
                    <div className="cell-wrapper">
                        {children}
                    </div>
                </Link>
            )
        } else {
            content = (
                <div className="cell-wrapper">
                    {children}
                </div>
            )
        }

        return (
            <td className={css['limit-overflow']}>
                {content}
            </td>
        )
    }
}


export default connect((state, ownProps) => {
    return {
        config: viewsConfig.getConfigByName(ownProps.type),
    }
})(Cell)
