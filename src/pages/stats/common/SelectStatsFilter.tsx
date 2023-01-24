import classnames from 'classnames'
import React, {ComponentProps} from 'react'

import SelectFilter from 'pages/stats/common/SelectFilter'

import css from './SelectStatsFilter.less'

function SelectStatsFilter(props: ComponentProps<typeof SelectFilter>) {
    return (
        <SelectFilter
            {...props}
            toggleClassName={classnames('mr-2', css.toggle)}
        />
    )
}

SelectStatsFilter.Item = SelectFilter.Item
SelectStatsFilter.Group = SelectFilter.Group

export default SelectStatsFilter
