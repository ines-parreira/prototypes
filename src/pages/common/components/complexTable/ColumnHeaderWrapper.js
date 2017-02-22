import React, {PropTypes} from 'react'
import classnames from 'classnames'
import FilterDropdown from './FilterDropdown'
import ColumnHeader from './ColumnHeader'
import Portal from 'react-portal'

export default class ColumnHeaderWrapper extends React.Component {
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
            top: targetRect.top + targetRect.height - bodyRect.top,
            left: targetRect.left - bodyRect.left,
            width: targetRect.width
        })
    }

    renderDropdown = () => {
        if (!this.props.field.get('filter')) {
            return
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
            <Portal
                closeOnOutsideClick
                isOpened={this.state.isOpened}
                onClose={this.onClose}
            >
                <div style={portalStyle}>
                    <FilterDropdown
                        viewConfig={this.props.viewConfig}
                        field={this.props.field}
                        schemas={this.props.schemas}
                        addFieldFilter={this.props.addFieldFilter}
                        onClose={this.onClose}
                    />
                </div>
            </Portal>
        )
    }

    render() {
        const {field, view} = this.props

        const classes = classnames({
            'complex-list-table-col': true,
            filterable: field.get('filter')
        })

        return (
            <div className={classes}>
                <ColumnHeader
                    field={field}
                    view={view}
                    updateView={this.props.updateView}
                    onClick={this.onClick}
                />
                {this.renderDropdown()}
            </div>
        )
    }
}

ColumnHeaderWrapper.propTypes = {
    viewConfig: PropTypes.object.isRequired,
    field: PropTypes.object.isRequired,
    view: PropTypes.object.isRequired,
    schemas: PropTypes.object.isRequired,

    addFieldFilter: PropTypes.func.isRequired, // called when a value is selected in the dropdown
    updateView: PropTypes.func.isRequired,
}
