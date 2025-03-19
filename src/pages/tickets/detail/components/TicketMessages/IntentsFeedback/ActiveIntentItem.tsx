import _noop from 'lodash/noop'

import type { Option } from '../../../../../common/components/RichDropdown/types'
import { DropdownOptionButton } from './DropdownOptionButton'
import { DropdownOptionItem } from './DropdownOptionItem'

import css from './ActiveIntentItem.less'

type Props = {
    option: Option
    onReject?: (key: string) => void
}

export const ActiveIntentItem = ({ option, onReject = _noop }: Props) => (
    <DropdownOptionItem
        renderAction={() => (
            <DropdownOptionButton
                className={css.reject}
                icon="close"
                onClick={() => onReject(option.key)}
            />
        )}
        option={option}
    />
)
