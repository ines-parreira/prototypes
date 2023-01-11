import React from 'react'

import css from './SpotlightNoResults.less'

type Props = {
    handleAdvancedSearch: () => void
}

const SpotlightNoResults = ({handleAdvancedSearch}: Props) => {
    return (
        <div className={css.wrapper}>
            <div className={css.title}>No results</div>
            <div className={css.body}>
                You may want to try using different keywords or check for typos.
                <button
                    onClick={handleAdvancedSearch}
                    className={css.advancedSearchCta}
                >
                    Use advanced search
                </button>
            </div>
        </div>
    )
}

export default SpotlightNoResults
