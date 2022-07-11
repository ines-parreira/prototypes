import _noop from 'lodash/noop'
import React from 'react'

import type {Option} from '../../../../../common/components/RichDropdown/types'

import {DropdownOptionItem} from './DropdownOptionItem'
import css from './ActiveIntentItem.less'
import {DropdownOptionButton} from './DropdownOptionButton'

type Props = {
    option: Option
    onReject?: (key: string) => void
}

export const ActiveIntentItem = ({option, onReject = _noop}: Props) => (
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
