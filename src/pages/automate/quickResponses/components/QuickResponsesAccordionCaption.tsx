import React from 'react'

import css from './QuickResponsesAccordionCaption.less'

const QuickResponsesAccordionCaption = () => {
    return (
        <div className={css.container}>
            <i className="material-icons md-2">arrow_downward</i>
            <span>Buttons appear in the order below</span>
        </div>
    )
}

export default QuickResponsesAccordionCaption
