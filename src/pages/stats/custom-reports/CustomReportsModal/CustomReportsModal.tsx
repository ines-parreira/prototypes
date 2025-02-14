import React, {useState} from 'react'

import {logEvent, SegmentEvent} from 'common/segment'
import {useReportRestrictions} from 'hooks/reporting/custom-reports/useReportRestrictions'
import Button from 'pages/common/components/button/Button'
import Modal from 'pages/common/components/modal/Modal'
import ModalActionsFooter from 'pages/common/components/modal/ModalActionsFooter'
import ModalBody from 'pages/common/components/modal/ModalBody'
import ModalHeader from 'pages/common/components/modal/ModalHeader'
import {ChartsDefaultFrame} from 'pages/stats/custom-reports/ChartsDefaultFrame'
import {REPORTS_CONFIG} from 'pages/stats/custom-reports/config'
import {DASHBOARDS_DOCUMENTATION_URL} from 'pages/stats/custom-reports/constants'
import css from 'pages/stats/custom-reports/CustomReportsModal/CustomReportsModal.less'
import {ModalSearchBar} from 'pages/stats/custom-reports/CustomReportsModal/ModalSearchBar'
import {SelectableCharts} from 'pages/stats/custom-reports/CustomReportsModal/SelectableCharts'
import {SelectableReports} from 'pages/stats/custom-reports/CustomReportsModal/SelectableReports'
import {
    CustomReportChild,
    ReportConfig,
    ReportsModalConfig,
} from 'pages/stats/custom-reports/types'
import {
    getChildrenIds,
    getGroupChartsIntoRows,
} from 'pages/stats/custom-reports/utils'

export const MODAL_TITLE = 'Select charts to display'
export const GRAPH_DESCRIPTION =
    'Select from available graphs, tables, and charts from existing reports'
export const ADD_CHARTS_CTA = 'Add Charts'
export const READ_MORE_ABOUT_CHARTS = 'Read more about available charts'
export const NO_SEARCH_RESULT =
    'No search results. Please check your spelling and try again.'

const ReadMoreAboutChartsLink = () => {
    return (
        <a href={DASHBOARDS_DOCUMENTATION_URL} target="_blank" rel="noreferrer">
            {READ_MORE_ABOUT_CHARTS}
        </a>
    )
}

const NoSearchResult = () => {
    return (
        <div className={css.noResult}>
            <div>{NO_SEARCH_RESULT}</div>
            <div className={css.link}>
                <ReadMoreAboutChartsLink />
            </div>
        </div>
    )
}

const InitialChartsFrame = () => {
    return (
        <div className={css.SVGWrapper}>
            <ChartsDefaultFrame />
            <div className={css.footer}>
                <div className={css.description}>{GRAPH_DESCRIPTION}</div>
                <ReadMoreAboutChartsLink />
            </div>
        </div>
    )
}

type ChartsSelectorProps = {
    charts?: CustomReportChild[]
    onSave: (charts: CustomReportChild[], size: number) => void
    onCancel: () => void
    isLoading?: boolean
}

const ChartsSelector = ({
    charts,
    onSave,
    onCancel,
    isLoading,
}: ChartsSelectorProps) => {
    const [checkedCharts, setCheckedCharts] = useState(() =>
        getChildrenIds(charts)
    )

    const [selectedReport, setSelectedReport] =
        useState<null | ReportConfig<string>>(null)

    const {restrictionsMap} = useReportRestrictions()
    const restrictedReports = REPORTS_CONFIG.map((section) => ({
        ...section,
        children: section.children.filter(
            (report) => !Boolean(restrictionsMap[report.config.reportPath])
        ),
    }))

    const [config, setConfig] = useState<ReportsModalConfig | null>(
        restrictedReports
    )

    const handleAddCharts = () => {
        onSave(getGroupChartsIntoRows(checkedCharts), checkedCharts.length)
        logEvent(SegmentEvent.StatDashboardModalAddChartsClicked)
    }

    return (
        <>
            <ModalHeader title={ADD_CHARTS_CTA} />
            <ModalBody className={css.body}>
                <div className={css.left}>
                    <p className={css.title}>{MODAL_TITLE}</p>
                    <ModalSearchBar
                        config={restrictedReports}
                        setConfig={setConfig}
                        setSelectedReport={setSelectedReport}
                    />
                    <SelectableReports
                        config={config}
                        checkedCharts={checkedCharts}
                        selectedReport={selectedReport}
                        setSelectedReport={setSelectedReport}
                    />
                </div>
                <div className={css.right}>
                    {selectedReport !== null && selectedReport?.charts ? (
                        <SelectableCharts
                            charts={selectedReport.charts}
                            checkedCharts={checkedCharts}
                            setCheckedCharts={setCheckedCharts}
                        />
                    ) : config === null ? (
                        <NoSearchResult />
                    ) : (
                        <InitialChartsFrame />
                    )}
                </div>
            </ModalBody>
            <ModalActionsFooter>
                <Button onClick={onCancel} intent="secondary">
                    Cancel
                </Button>
                <Button onClick={handleAddCharts} isLoading={isLoading}>
                    {ADD_CHARTS_CTA}
                    {checkedCharts.length ? ` (${checkedCharts.length})` : ''}
                </Button>
            </ModalActionsFooter>
        </>
    )
}

export type CustomReportsModalProps = {isOpen: boolean} & ChartsSelectorProps

export const CustomReportsModal = ({
    charts = [],
    onSave,
    onCancel,
    isLoading,
    isOpen,
}: CustomReportsModalProps) => {
    return (
        <Modal isOpen={isOpen} onClose={onCancel} size="huge">
            <ChartsSelector
                charts={charts}
                onSave={onSave}
                onCancel={onCancel}
                isLoading={isLoading}
            />
        </Modal>
    )
}
