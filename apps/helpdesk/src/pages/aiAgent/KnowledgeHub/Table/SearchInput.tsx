import { TextField } from '@gorgias/axiom'

import css from './SearchInput.less'

type SearchInputProps = {
    value: string
    onChange: (value: string) => void
    placeholder?: string
}

export const SearchInput = ({
    value,
    onChange,
    placeholder = 'Search...',
}: SearchInputProps) => {
    return (
        <div className={css.searchInput}>
            <TextField
                type="text"
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                leadingSlot="search-magnifying-glass"
                aria-label="Search knowledge items"
            />
        </div>
    )
}
