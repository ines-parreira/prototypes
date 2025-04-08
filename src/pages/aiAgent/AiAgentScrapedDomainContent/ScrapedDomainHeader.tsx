import Search from 'pages/common/components/Search'

import css from './ScrapedDomainHeader.less'

type Props = {
    description: string
}

const ScrapedDomainHeader = ({ description }: Props) => {
    return (
        <div className={css.container}>
            <span>{description}</span>
            <div>
                <Search className={css.searchInput} placeholder="Search" />
            </div>
        </div>
    )
}

export default ScrapedDomainHeader
