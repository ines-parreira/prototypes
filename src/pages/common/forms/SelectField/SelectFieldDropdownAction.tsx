import React, {ReactNode} from 'react'
import css from './SelectFieldDropdownAction.less'

const SelectFieldDropdownAction: React.FC<{
    icon?: ReactNode
}> = ({icon, children}) => (
    <div className={css.dropdownAction}>
        <div className={css.dropdownActionIcon}>{icon}</div>
        {children}
    </div>
)
export default SelectFieldDropdownAction
