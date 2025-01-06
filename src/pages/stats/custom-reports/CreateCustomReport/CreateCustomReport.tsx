import React from 'react'

import {ChartsFrameSVG} from 'pages/stats/custom-reports/CreateCustomReport/ChartsFrameSVG'
import css from 'pages/stats/custom-reports/CreateCustomReport/CreateCustomReport.less'

export const CREATE_CUSTOM_REPORT = '📊 Dashboards'
export const CREATE_REPORT_DESCRIPTION =
    'Add Charts such as KPIs, tables, and graphs by copying from report or select multiple via list view'
export const LEARN_ABOUT = 'Learn about'
export const CUSTOM_REPORTS = 'Dashboards'

export const CreateCustomReport = () => {
    return (
        <div className={css.root}>
            <div className={css.wrapper}>
                <div className={css.chartsWrapper}>
                    <ChartsFrameSVG />
                </div>
                <h1 className={css.title}>{CREATE_CUSTOM_REPORT}</h1>
                <p className={css.subtitle}>{CREATE_REPORT_DESCRIPTION}</p>
                <p className={css.footNote}>
                    {LEARN_ABOUT} <a href="#">{CUSTOM_REPORTS}</a>
                </p>
            </div>
        </div>
    )
}
