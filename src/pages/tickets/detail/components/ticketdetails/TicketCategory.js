// @flow
import React from 'react'
import {setCategory, removeCategory} from '../../../../../state/ticket/actions'
import {
    ButtonDropdown, DropdownItem, DropdownMenu, DropdownToggle
} from 'reactstrap'


type Props = {
    category: string,
    setCategory: typeof setCategory,
    removeCategory: typeof removeCategory,
}

type State = {
    dropdownOpen: boolean
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

export default class TicketCategory extends React.Component<Props, State> {
    state = {
        dropdownOpen: false
    }

    _toggle = () => {
        this.setState({dropdownOpen: !this.state.dropdownOpen})
    }

    _shouldDisplay() {
        return window.DEVELOPMENT || document.cookie.includes('is_gorgias_staff')
    }

    render() {
        const {category, setCategory, removeCategory} = this.props
        const categoryLabel = categoryLabels[category]

        if (!this._shouldDisplay()) {
            return null
        }

        const label = categoryLabel ? categoryLabel.label : category
        const icon = categoryLabel ? categoryLabel.icon : 'fa-magic'

        return (
            <div className="d-inline-flex align-items-center flex-wrap hidden-sm-down">
                <ButtonDropdown
                    id="ticket-category"
                    isOpen={this.state.dropdownOpen}
                    toggle={this._toggle}
                >
                    <DropdownToggle
                        caret
                        color="info"
                        size="sm"
                    >
                        <i className={`fa ${icon}`} aria-hidden="true"/>
                        &nbsp;
                        {label}
                    </DropdownToggle>
                    <DropdownMenu>
                        <DropdownItem
                            header
                        >
                            Ticket category (beta)
                        </DropdownItem>
                        {Object.keys(categoryLabels).map((category) => (
                            <DropdownItem
                                className="dropdown-item-input"
                                key={category}
                                onClick={() => setCategory(category)}
                            >
                                <i className={`fa ${categoryLabels[category].icon}`} aria-hidden="true"/>
                                &nbsp;
                                {categoryLabels[category].label}
                            </DropdownItem>
                        ))}
                        <DropdownItem divider/>
                        <DropdownItem onClick={removeCategory}>Clear category</DropdownItem>
                    </DropdownMenu>
                </ButtonDropdown>
                &nbsp;
            </div>
        )
    }
}
