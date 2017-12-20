// @flow
import React from 'react'
import {removeCategory} from '../../../../../state/ticket/actions'
import {Badge, UncontrolledTooltip} from 'reactstrap'


type Props = {
    category: string,
    removeCategory: typeof removeCategory,
}

const categoryLabels = {
    'delivery/status': {
        'label': 'Delivery status',
        'icon': 'fa-truck'
    },
    'order/cancel': {
        'label': 'Cancel order',
        'icon': 'fa-ban'
    },
    'order/return': {
        'label': 'Return',
        'icon': 'fa-undo'
    },
}

export default class TicketCategory extends React.Component<Props> {
    render() {
        const {category, removeCategory} = this.props

        if (!category) {
            return null
        }

        const categoryLabel = categoryLabels[category]
        const label = categoryLabel ? categoryLabel.label : category
        const icon = categoryLabel ? categoryLabel.icon : 'fa-magic'

        return (
            <div className="d-inline-flex align-items-center flex-wrap hidden-sm-down">
                <UncontrolledTooltip placement="bottom" target="ticket-category">
                    Ticket category (beta). Gorgias automatically tags tickets with a category.
                </UncontrolledTooltip>
                <Badge
                    id="ticket-category"
                    className="ticket-category"
                    color='info'
                >
                    <i className={`fa ${icon}`} aria-hidden="true"/>
                    &nbsp;
                    {label}
                    <i
                        className="fa fa-fw fa-close cursor-pointer ml-1"
                        onClick={() => removeCategory(category)}
                    />
                </Badge>
                &nbsp;
            </div>
        )
    }
}
