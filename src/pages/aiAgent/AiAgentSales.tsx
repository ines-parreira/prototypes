import React from 'react'

import { SalesSettings } from './components/SalesSettings/SalesSettings'

import css from './AiAgentSales.less'

export const AiAgentSales = () => {
    return (
        <div className={css.sales}>
            <SalesSettings />
        </div>
    )
}
