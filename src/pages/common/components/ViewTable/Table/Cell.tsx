import React, {ReactNode} from 'react'
import {connect, ConnectedProps} from 'react-redux'
import {fromJS, Map} from 'immutable'
import {Link} from 'react-router-dom'

import {RenderLabel} from '../../../utils/labels.js'

import * as viewsConfig from '../../../../../config/views'

import css from '../Table.less'
import {RootState} from '../../../../../state/types'

type OwnProps = {
    field: Map<any, any>
    item: Map<any, any>
    type: string
    onClick?: (item: Map<any, any>) => void
    itemUrl: Maybe<string>
}

type Props = OwnProps & ConnectedProps<typeof connector>

export class CellContainer extends React.Component<Props> {
    static defaultProps: Partial<Props> = {
        item: fromJS({}),
    }

    _labelValue = () => {
        const {config, field, item} = this.props

        const cellRenderFunction = config.get(
            'cell'
        ) as typeof viewsConfig.defaultCell

        return cellRenderFunction(field.get('name') as string, item)
    }

    render() {
        const {item, field, onClick, itemUrl} = this.props

        let content: ReactNode
        const children = (
            <RenderLabel field={field} value={this._labelValue()} />
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
                    <div className="cell-wrapper">{children}</div>
                </Link>
            )
        } else {
            content = <div className="cell-wrapper">{children}</div>
        }

        return <td className={css['limit-overflow']}>{content}</td>
    }
}

const connector = connect((state: RootState, ownProps: OwnProps) => {
    return {
        config: viewsConfig.getConfigByName(ownProps.type),
    }
})

export default connector(CellContainer)
