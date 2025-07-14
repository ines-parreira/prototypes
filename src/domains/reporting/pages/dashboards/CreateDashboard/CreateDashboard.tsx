import { DASHBOARDS_DOCUMENTATION_URL } from 'domains/reporting/pages/dashboards/constants'
import { ChartsFrameSVG } from 'domains/reporting/pages/dashboards/CreateDashboard/ChartsFrameSVG'
import css from 'domains/reporting/pages/dashboards/CreateDashboard/CreateDashboard.less'

export const CREATE_DASHBOARD = '📊 Dashboards'
export const CREATE_REPORT_DESCRIPTION =
    'Add Charts such as KPIs, tables, and graphs by copying from report or select multiple via list view'
export const LEARN_ABOUT = 'Learn about'
export const DASHBOARDS = 'Dashboards'

export const CreateDashboard = () => {
    return (
        <div className={css.root}>
            <div className={css.wrapper}>
                <div className={css.chartsWrapper}>
                    <ChartsFrameSVG />
                </div>
                <h1 className={css.title}>{CREATE_DASHBOARD}</h1>
                <p className={css.subtitle}>{CREATE_REPORT_DESCRIPTION}</p>
                <p className={css.footNote}>
                    {LEARN_ABOUT}{' '}
                    <a
                        href={DASHBOARDS_DOCUMENTATION_URL}
                        target="_blank"
                        rel="noreferrer"
                    >
                        {DASHBOARDS}
                    </a>
                </p>
            </div>
        </div>
    )
}
