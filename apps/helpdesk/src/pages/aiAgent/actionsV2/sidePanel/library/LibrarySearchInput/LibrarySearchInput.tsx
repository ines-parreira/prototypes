import classNames from 'classnames'

import { SearchField } from '@gorgias/axiom'

import css from './LibrarySearchInput.less'

type Props = {
    value: string
    onChange: (value: string) => void
    placeholder?: string
    ariaLabel?: string
    autoFocus?: boolean
    className?: string
}

export const LibrarySearchInput = ({
    value,
    onChange,
    placeholder = 'Search...',
    ariaLabel = 'Search actions',
    autoFocus = false,
    className,
}: Props) => {
    return (
        <SearchField
            value={value}
            onChange={onChange}
            onClear={() => onChange('')}
            placeholder={placeholder}
            aria-label={ariaLabel}
            autoFocus={autoFocus}
            className={classNames(css.searchField, className)}
        />
    )
}
