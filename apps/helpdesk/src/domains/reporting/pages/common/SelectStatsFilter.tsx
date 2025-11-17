import type { ComponentProps } from 'react'
import React from 'react'

import classnames from 'classnames'

import SelectFilter from 'domains/reporting/pages/common/SelectFilter'
import css from 'domains/reporting/pages/common/SelectStatsFilter.less'

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
