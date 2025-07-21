import css from 'pages/common/components/Spotlight/SpotlightNoResults.less'

type Props = {
    title: string
    bodyText: string
    handleAdvancedSearch: () => void
    showAdvancedSearch?: boolean
}

const SpotlightNoResults = ({
    title,
    bodyText,
    handleAdvancedSearch,
    showAdvancedSearch = true,
}: Props) => {
    return (
        <div className={css.wrapper}>
            <div className={css.title}>{title}</div>
            <div className={css.body}>
                {bodyText}
                {showAdvancedSearch && (
                    <button
                        onClick={handleAdvancedSearch}
                        className={css.advancedSearchCta}
                    >
                        Use advanced search
                    </button>
                )}
            </div>
        </div>
    )
}

export default SpotlightNoResults
