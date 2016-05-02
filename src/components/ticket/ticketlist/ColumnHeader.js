import React, { PropTypes } from 'react'
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
        this.setState({ isOpened: false })
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
    }

    portalContentStyle() {
        return {
            position: 'absolute',
            top: this.state.top,
            left: this.state.left,
            width: this.state.width
        }
    }

    render = () => {
        /*
        * Important to maintain this structure when implementing Portals:
        *
        *   <Portal>
        *       <Outer>
        *           <Inner>
        *           </Inner>
        *       </Outer>
        *   </Portal>
        */
        return (
            <div className="ColumnHeader">
                <PlainColumnHeader
                    column={this.props.column}
                    onClick={this.onClick}
                    sort={this.props.sort}
                    currentSort={this.props.currentSort}
                />
                <Portal
                    closeOnOutsideClick
                    isOpened={this.state.isOpened}
                    onClose={this.onClose}
                >
                    <div style={this.portalContentStyle()}>
                        <FilterDropdown
                              groupedFilters={this.props.groupedFilters}
                              filterSpec={this.props.filterSpec}
                              updateFilters={this.props.updateFilters}
                              onClose={this.onClose}
                        />
                    </div>
                </Portal>
            </div>
        )
    }
}

ColumnHeader.propTypes = {
    column: PropTypes.object.isRequired,
    updateFilters: PropTypes.func.isRequired,
    groupedFilters: PropTypes.object.isRequired,
    filterSpec: PropTypes.object.isRequired,
    sort: PropTypes.func.isRequired,
    currentSort: PropTypes.string.isRequired
}
