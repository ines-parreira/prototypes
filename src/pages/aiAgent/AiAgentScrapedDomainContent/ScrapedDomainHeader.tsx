import Search from 'pages/common/components/Search'

import css from './ScrapedDomainHeader.less'

type Props = {
    description: string
    searchValue: string
    onSearch: ((value: string) => void) | undefined
}

const ScrapedDomainHeader = ({ description, searchValue, onSearch }: Props) => {
    return (
        <div className={css.container}>
            <span>{description}</span>
            {onSearch && (
                <div>
                    <Search
                        value={searchValue}
                        onChange={onSearch}
                        className={css.searchInput}
                        placeholder="Search"
                    />
                </div>
            )}
        </div>
    )
}

export default ScrapedDomainHeader
