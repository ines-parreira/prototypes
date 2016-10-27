import React, {PropTypes} from 'react'

const RightSelect = ({node, options, updateFieldFilter, index}) => {
    function selectChange(value) {
        updateFieldFilter(index, value)
    }

    function uid(i, filterIndex) {
        return `${filterIndex}-${i}`
    }

    function createDropdown(select) {
        $(select)
            .dropdown({
                onChange: selectChange
            })
            .dropdown('set selected', node.value)
    }

    return (
        <div className="view-filters-expression-value">
            <select className="ui search dropdown"
                value={node.value}
                ref={createDropdown}
            >
                {
                    options.map((option, i) => {
                        return (
                            <option
                                key={uid(i, index)}
                                value={option.get('id')}
                            >
                                {option.get('name')}
                            </option>
                        )
                    })
                }
            </select>
        </div>
    )
}
RightSelect.propTypes = {
    node: PropTypes.object.isRequired,
    options: PropTypes.object.isRequired,
    index: PropTypes.number.isRequired,
    updateFieldFilter: PropTypes.func.isRequired
}

export default RightSelect
