import _noop from 'lodash/noop'

import { Skeleton } from '@gorgias/axiom'

import DropdownItem from 'pages/common/components/dropdown/DropdownItem'
import DropdownItemLabel from 'pages/common/components/dropdown/DropdownItemLabel'

const MenuSkeletonItem = () => {
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

export default MenuSkeletonItem
