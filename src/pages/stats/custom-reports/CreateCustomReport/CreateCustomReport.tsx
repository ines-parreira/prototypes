import React from 'react'

import {ChartsFrameSVG} from 'pages/stats/custom-reports/CreateCustomReport/ChartsFrameSVG'
import css from 'pages/stats/custom-reports/CreateCustomReport/CreateCustomReport.less'

export const CREATE_CUSTOM_REPORT = '📊 Custom Report'
export const CREATE_REPORT_DESCRIPTION =
    'Add Charts such as KPIs, tables, and graphs by copying from report or select multiple via list view'
export const LEARN_ABOUT = 'Learn about'
export const CUSTOM_REPORTS = 'Custom Reports'

export const CreateCustomReport = () => {
    return (
        <div className={css.wrapper}>
            <div className={css.chartsWrapper}>
                <ChartsFrameSVG />
            </div>
            <div className={css.title}>{CREATE_CUSTOM_REPORT}</div>
            <div className={css.subtitle}>{CREATE_REPORT_DESCRIPTION}</div>
            <div className={css.footNote}>
                <p className={css.learnMore}>{LEARN_ABOUT} </p>
                <p className={css.customReports}>{CUSTOM_REPORTS}</p>
            </div>
        </div>
    )
}
