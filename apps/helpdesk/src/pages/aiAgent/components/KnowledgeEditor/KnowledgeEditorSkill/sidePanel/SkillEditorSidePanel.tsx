import { useState } from 'react'

import { useShallow } from 'zustand/react/shallow'

import { Box, Button, Tooltip, TooltipContent } from '@gorgias/axiom'

import { useSkillEditorStore } from '../context'
import { SkillEditorSidePanelInfoTab } from './SkillEditorSidePanelInfoTab'
import { SkillEditorSidePanelPerformanceTab } from './SkillEditorSidePanelPerformanceTab'
import { SkillEditorSidePanelSkeleton } from './SkillEditorSidePanelSkeleton'

import css from './SkillEditorSidePanel.less'

type Tab = 'info' | 'performance'

type Props = {
    isLoading?: boolean
}

export const SkillEditorSidePanel = ({ isLoading = false }: Props) => {
    const [activeTab, setActiveTab] = useState<Tab>('info')
    const { isDetailsView, dispatch } = useSkillEditorStore(
        useShallow((storeState) => ({
            isDetailsView: storeState.state.isDetailsView,
            dispatch: storeState.dispatch,
        })),
    )

    const toggleDetailsView = () => {
        dispatch({ type: 'TOGGLE_DETAILS_VIEW' })
    }

    return (
        <Box flexDirection="row" className={css.sidePanel}>
            {isDetailsView && (
                <div className={css.contentArea}>
                    {isLoading ? (
                        <SkillEditorSidePanelSkeleton tab={activeTab} />
                    ) : (
                        <>
                            {activeTab === 'info' && (
                                <SkillEditorSidePanelInfoTab />
                            )}
                            {activeTab === 'performance' && (
                                <SkillEditorSidePanelPerformanceTab />
                            )}
                        </>
                    )}
                </div>
            )}

            <div className={css.iconBar}>
                <Tooltip
                    trigger={
                        <Button
                            variant="tertiary"
                            icon={
                                isDetailsView
                                    ? 'system-bar-collapse'
                                    : 'system-bar-expand'
                            }
                            aria-label={isDetailsView ? 'Collapse' : 'Expand'}
                            onClick={toggleDetailsView}
                        />
                    }
                >
                    <TooltipContent
                        title={isDetailsView ? 'Collapse' : 'Expand'}
                    />
                </Tooltip>
                <div
                    className={
                        activeTab === 'info' ? css.iconButtonActive : undefined
                    }
                >
                    <Tooltip
                        trigger={
                            <Button
                                variant="tertiary"
                                icon="settings"
                                aria-label="Info"
                                onClick={() => {
                                    setActiveTab('info')
                                }}
                            />
                        }
                    >
                        <TooltipContent title="Info" />
                    </Tooltip>
                </div>
                <div
                    className={
                        activeTab === 'performance'
                            ? css.iconButtonActive
                            : undefined
                    }
                >
                    <Tooltip
                        trigger={
                            <Button
                                variant="tertiary"
                                icon="chart-line"
                                aria-label="Performance"
                                onClick={() => {
                                    setActiveTab('performance')
                                }}
                            />
                        }
                    >
                        <TooltipContent title="Performance" />
                    </Tooltip>
                </div>
            </div>
        </Box>
    )
}
