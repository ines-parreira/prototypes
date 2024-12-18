import _noop from 'lodash/noop'
import React from 'react'

import DropdownItem from 'pages/common/components/dropdown/DropdownItem'
import DropdownItemLabel from 'pages/common/components/dropdown/DropdownItemLabel'
import Skeleton from 'pages/common/components/Skeleton/Skeleton'

const EdgeBlockMenuSkeletonItem = () => {
    return (
        <DropdownItem
            option={{
                label: '',
                value: '',
            }}
            onClick={_noop}
        >
            <DropdownItemLabel>
                <Skeleton height={20} />
            </DropdownItemLabel>
        </DropdownItem>
    )
}

export default EdgeBlockMenuSkeletonItem
