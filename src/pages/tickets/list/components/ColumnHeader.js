import React, {PropTypes} from 'react'
import classnames from 'classnames'
import FilterDropdown from './FilterDropdown'
import PlainColumnHeader from './PlainColumnHeader'
import Portal from 'react-portal'


export default class ColumnHeader extends React.Component {
    constructor() {
        super()

        this.state = {
            isOpened: false
        }
    }

    onClose = () => {
        this.setState({isOpened: false})
    }

    onClick = (e) => {
        const bodyRect = document.body.getBoundingClientRect()
        const targetRect = e.target.getBoundingClientRect()
        this.setState({
            isOpened: true,
            top: targetRect.top - bodyRect.top,
            left: targetRect.left - bodyRect.left,
            width: targetRect.width
        })

        if (this.props.field.getIn(['filter', 'enum_query'])) {
            this.props.updateFieldEnumSearch(this.props.field, this.props.field.getIn(['filter', 'enum_query']))
        }
    }

    renderDropdown = () => {
        if (!this.props.field.get('filter')) {
            return null
        }

        /**
         * Important to maintain this structure when implementing Portals:
         *
         *   <Portal>
         *       <Outer>
         *           <Inner>
         *           </Inner>
         *       </Outer>
         *   </Portal>
         */
        const portalStyle = {
            position: 'absolute',
            top: this.state.top,
            left: this.state.left,
            width: this.state.width
        }

        return (
            <Portal closeOnOutsideClick
                    isOpened={this.state.isOpened}
                    onClose={this.onClose}
            >
                <div style={portalStyle}>
                    <FilterDropdown
                        field={this.props.field}
                        schemas={this.props.schemas}
                        addFieldFilter={this.props.addFieldFilter}
                        updateFieldEnumSearch={this.props.updateFieldEnumSearch}
                        onClose={this.onClose}
                    />
                </div>
            </Portal>
        )
    }

    render() {
        const {field, view} = this.props
        if (!field.get('visible')) {
            return null
        }

        const classes = classnames('ColumnHeader', {
            filterable: field.get('filter')
        })

        return (
            <th className={classes}>
                <PlainColumnHeader
                    field={field}
                    view={view}
                    updateView={this.props.updateView}
                    onClick={this.onClick}
                />
                {this.renderDropdown()}
            </th>
        )
    }
}

ColumnHeader.propTypes = {
    field: PropTypes.object.isRequired,
    view: PropTypes.object.isRequired,
    schemas: PropTypes.object.isRequired,

    addFieldFilter: PropTypes.func.isRequired, // called when a value is selected in the dropdown
    updateFieldEnumSearch: PropTypes.func.isRequired, // called when the field has to get enum data from the API
    updateView: PropTypes.func.isRequired
}
