import { useState } from 'react'

import { LegacyIconButton as IconButton } from '@gorgias/axiom'

import PlaygroundActionsModal from 'pages/aiAgent/Playground/components/PlaygroundActionsModal/PlaygroundActionsModal'
import { getActionsToggleTooltipContent } from 'pages/aiAgent/PlaygroundV2/utils/playground.utils'
import { useAppContext } from 'pages/AppContext'
import IconTooltip from 'pages/common/forms/IconTooltip/IconTooltip'
import { NewToggleButton } from 'pages/common/forms/NewToggleButton'

import { AiAgentPlayground } from '../../PlaygroundV2/AiAgentPlayground'

import css from './PlaygroundPanel.less'

type Props = {
    shopName?: string
}

export const PlaygroundPanel = ({ shopName }: Props) => {
    const { setIsCollapsibleColumnOpen } = useAppContext()
    const [resetPlayground, setResetPlayground] = useState(false)
    const [actionsAllowed, setActionsAllowed] = useState(false)
    const [isModalOpen, setIsModalOpen] = useState(false)

    const onModalConfirm = () => {
        setActionsAllowed(true)
        setIsModalOpen(false)
    }

    const handleClose = () => {
        setIsCollapsibleColumnOpen(false)
    }

    const handleResetPlayground = () => {
        setResetPlayground(true)
    }

    const resetPlaygroundCallback = () => {
        setResetPlayground(false)
    }

    return (
        <div className={css['playground-panel']}>
            <PlaygroundActionsModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onConfirm={onModalConfirm}
            />
            <div className={css['panel-header']}>
                <div className={css['panel-header-title-container']}>
                    <span className={css['panel-header-title']}>Test</span>
                </div>
                <div className={css['panel-header-actions']}>
                    <div className={css['actions-allowed-container']}>
                        <div className={css['actions-allowed-toggle']}>
                            <NewToggleButton
                                checked={actionsAllowed}
                                onChange={() =>
                                    actionsAllowed
                                        ? setActionsAllowed(false)
                                        : setIsModalOpen(true)
                                }
                            />
                            <span className={css['toggle-label']}>Actions</span>
                        </div>
                        <IconTooltip icon="info" interactive>
                            {getActionsToggleTooltipContent(actionsAllowed)}
                        </IconTooltip>
                    </div>
                    <div>
                        <IconButton
                            icon="replay"
                            intent="secondary"
                            fillStyle="ghost"
                            onClick={handleResetPlayground}
                            aria-label="reset playground"
                        />
                        <IconButton
                            icon="close"
                            intent="secondary"
                            fillStyle="ghost"
                            onClick={handleClose}
                            aria-label="close playground panel"
                        />
                    </div>
                </div>
            </div>
            <div className={css['panel-body']}>
                <AiAgentPlayground
                    arePlaygroundActionsAllowed={actionsAllowed}
                    resetPlaygroundCallback={resetPlaygroundCallback}
                    resetPlayground={resetPlayground}
                    shopName={shopName}
                    shouldDisplayResetButton={false}
                />
            </div>
        </div>
    )
}
