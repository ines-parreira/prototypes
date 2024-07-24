import React from 'react'

import css from 'pages/common/components/Spotlight/SpotlightNoResults.less'

type Props = {
    title: string
    bodyText: string
    handleAdvancedSearch: () => void
}

const SpotlightNoResults = ({title, bodyText, handleAdvancedSearch}: Props) => {
    return (
        <div className={css.wrapper}>
            <div className={css.title}>{title}</div>
            <div className={css.body}>
                {bodyText}
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
