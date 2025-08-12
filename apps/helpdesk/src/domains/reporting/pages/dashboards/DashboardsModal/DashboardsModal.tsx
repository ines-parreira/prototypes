import React, { useState } from 'react'

import { Button } from '@gorgias/axiom'

import { logEvent, SegmentEvent } from 'common/segment'
import { useRestrictedReportsConfig } from 'domains/reporting/hooks/dashboards/useRestrictedReportsConfig'
import { ChartsDefaultFrame } from 'domains/reporting/pages/dashboards/ChartsDefaultFrame'
import { DASHBOARDS_DOCUMENTATION_URL } from 'domains/reporting/pages/dashboards/constants'
import css from 'domains/reporting/pages/dashboards/DashboardsModal/DashboardsModal.less'
import { ModalSearchBar } from 'domains/reporting/pages/dashboards/DashboardsModal/ModalSearchBar'
import { SelectableCharts } from 'domains/reporting/pages/dashboards/DashboardsModal/SelectableCharts'
import { SelectableReports } from 'domains/reporting/pages/dashboards/DashboardsModal/SelectableReports'
import {
    DashboardChild,
    ReportConfig,
    ReportsModalConfig,
} from 'domains/reporting/pages/dashboards/types'
import { getChildrenIds } from 'domains/reporting/pages/dashboards/utils'
import Modal from 'pages/common/components/modal/Modal'
import ModalActionsFooter from 'pages/common/components/modal/ModalActionsFooter'
import ModalBody from 'pages/common/components/modal/ModalBody'
import ModalHeader from 'pages/common/components/modal/ModalHeader'

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
    charts?: DashboardChild[]
    onSave: (charts: string[]) => void
    onCancel: () => void
    isLoading?: boolean
}

const ChartsSelector = ({
    charts,
    onSave,
    onCancel,
    isLoading,
}: ChartsSelectorProps) => {
    const restrictedReports = useRestrictedReportsConfig()

    const [checkedCharts, setCheckedCharts] = useState(() =>
        getChildrenIds(charts),
    )

    const [selectedReport, setSelectedReport] =
        useState<null | ReportConfig<string>>(null)

    const [config, setConfig] = useState<ReportsModalConfig | null>(
        restrictedReports,
    )

    const handleAddCharts = () => {
        onSave(checkedCharts)
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

export type DashboardsModalProps = { isOpen: boolean } & ChartsSelectorProps

export const DashboardsModal = ({
    charts = [],
    onSave,
    onCancel,
    isLoading,
    isOpen,
}: DashboardsModalProps) => {
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
