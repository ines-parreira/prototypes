import React from 'react'

import css from './AiAgentSales.less'
import {SalesSettings} from './components/SalesSettings/SalesSettings'

export const AiAgentSales = () => {
    return (
        <div className={css.sales}>
            <SalesSettings />
        </div>
    )
}
