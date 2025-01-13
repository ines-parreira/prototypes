import React, {useCallback, useEffect, useState} from 'react'

import {useCustomReportActions} from 'hooks/reporting/custom-reports/useCustomReportActions'
import Button from 'pages/common/components/button/Button'
import Modal from 'pages/common/components/modal/Modal'
import ModalActionsFooter from 'pages/common/components/modal/ModalActionsFooter'
import ModalBody from 'pages/common/components/modal/ModalBody'
import ModalHeader from 'pages/common/components/modal/ModalHeader'
import {ChartsDefaultFrame} from 'pages/stats/custom-reports/ChartsDefaultFrame'
import {REPORTS_MODAL_CONFIG} from 'pages/stats/custom-reports/config'
import css from 'pages/stats/custom-reports/CustomReportsModal/CustomReportsModal.less'
import {ModalSearchBar} from 'pages/stats/custom-reports/CustomReportsModal/ModalSearchBar'
import {SelectableCharts} from 'pages/stats/custom-reports/CustomReportsModal/SelectableCharts'
import {SelectableReports} from 'pages/stats/custom-reports/CustomReportsModal/SelectableReports'
import {
    ReportConfig,
    ReportsModalConfig,
    CustomReportSchema,
} from 'pages/stats/custom-reports/types'
import {getSavedChartsIds} from 'pages/stats/custom-reports/utils'

type Props = {
    isOpen: boolean
    setIsOpen: (isOpen: boolean) => void
    customReport?: CustomReportSchema
}

export const MODAL_TITLE = 'Select charts to display'
export const GRAPH_DESCRIPTION =
    'Select from available graphs, tables, and charts from existing reports'
export const GRAPH_LINK = 'Read more about available charts'
export const ADD_CHARTS_CTA = 'Add Charts'
export const READ_MORE_ABOUT_CHARTS = 'Read more about available charts'
export const NO_SEARCH_RESULT =
    'No search results. Please check your spelling and try again.'

const NoSearchResult = () => {
    return (
        <div className={css.noResult}>
            <div>{NO_SEARCH_RESULT}</div>
            <div className={css.link}>{READ_MORE_ABOUT_CHARTS}</div>
        </div>
    )
}

const InitialChartsFrame = () => {
    return (
        <div className={css.SVGWrapper}>
            <ChartsDefaultFrame />
            <div className={css.footer}>
                <div className={css.description}>{GRAPH_DESCRIPTION}</div>
                <div className={css.link}>{READ_MORE_ABOUT_CHARTS}</div>
            </div>
        </div>
    )
}

export const CustomReportsModal = ({
    isOpen,
    setIsOpen,
    customReport,
}: Props) => {
    const [selectedReport, setSelectedReport] =
        useState<null | ReportConfig<string>>(null)
    const [checkedCharts, setCheckedCharts] = useState<string[]>([])
    const [config, setConfig] = useState<ReportsModalConfig | null>(
        REPORTS_MODAL_CONFIG
    )

    useEffect(() => {
        setCheckedCharts(customReport ? getSavedChartsIds(customReport) : [])
    }, [customReport])

    const onClose = useCallback(() => {
        setIsOpen(false)
        setSelectedReport(null)
        setConfig(REPORTS_MODAL_CONFIG)
    }, [setIsOpen])

    const {updateDashboardHandler} = useCustomReportActions()

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="huge">
            <ModalHeader title={ADD_CHARTS_CTA} />
            <ModalBody className={css.body}>
                <div className={css.left}>
                    <p className={css.title}>{MODAL_TITLE}</p>
                    <ModalSearchBar
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
                <Button onClick={onClose} intent="secondary">
                    Cancel
                </Button>
                <Button
                    onClick={() => {
                        updateDashboardHandler({
                            dashboard: customReport,
                            chartIds: checkedCharts,
                            onClose,
                        })
                    }}
                >
                    {ADD_CHARTS_CTA}
                    {checkedCharts.length ? ` (${checkedCharts.length})` : ''}
                </Button>
            </ModalActionsFooter>
        </Modal>
    )
}
