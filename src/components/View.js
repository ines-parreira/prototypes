/**
 * A view is used to displayed filtered information.
 *
 * It's an abstract concept, not an actual view from MVC
 *
 * It takes as input 2 things:
 *  - Filters (a list of Filter components)
 *  - Data (a list of objects)
 *
 * And outputs:
 *  - Data (which is filtered)
 */

import React from 'react'

const View = React.createClass({
    render() {
        let filteredData = this.params.data
        this.params.filters.map((filter) => {
            filteredData = <Filter filter={filter} data={filteredData} />
        })

        return (
            <div className="View">{filteredData}</div>
        )
    }
})

export default View
