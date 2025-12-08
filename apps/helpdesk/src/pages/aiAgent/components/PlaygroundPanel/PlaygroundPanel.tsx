import { useRef, useState } from 'react'

import { FeatureFlagKey } from '@repo/feature-flags'
import { useEffectOnce } from '@repo/hooks'

import { Button, LegacyTooltip as Tooltip } from '@gorgias/axiom'

import { useNavBar } from 'common/navigation/hooks/useNavBar/useNavBar'
import { useFlag } from 'core/flags'
import PlaygroundActionsModal from 'pages/aiAgent/Playground/components/PlaygroundActionsModal/PlaygroundActionsModal'
import { getActionsToggleTooltipContent } from 'pages/aiAgent/PlaygroundV2/utils/playground.utils'
import { useAppContext } from 'pages/AppContext'
import IconTooltip from 'pages/common/forms/IconTooltip/IconTooltip'
import { NewToggleButton } from 'pages/common/forms/NewToggleButton'

import { AiAgentPlayground } from '../../PlaygroundV2/AiAgentPlayground'

import css from './PlaygroundPanel.less'

type Props = {
    shopName?: string
    onClose?: () => void
}

type ActionsSectionProps = {
    actionsAllowed: boolean
    setActionsAllowed: (value: boolean) => void
    setIsModalOpen: (value: boolean) => void
}

const ActionsSection = ({
    actionsAllowed,
    setActionsAllowed,
    setIsModalOpen,
}: ActionsSectionProps) => {
    const handleActionsAllowed = () =>
        actionsAllowed ? setActionsAllowed(false) : setIsModalOpen(true)

    return (
        <div className={css['actions-allowed-container']}>
            <div className={css['actions-allowed-toggle']}>
                <NewToggleButton
                    checked={actionsAllowed}
                    onChange={handleActionsAllowed}
                />
                <span className={css['toggle-label']}>Actions</span>
            </div>
            <IconTooltip icon="info" interactive>
                {getActionsToggleTooltipContent(actionsAllowed)}
            </IconTooltip>
        </div>
    )
}

export const PlaygroundPanel = ({ shopName, onClose }: Props) => {
    const { setIsCollapsibleColumnOpen } = useAppContext()
    const [resetPlayground, setResetPlayground] = useState(false)
    const [actionsAllowed, setActionsAllowed] = useState(false)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isSettingsOpen, setIsSettingsOpen] = useState(false)
    const resetRef = useRef<HTMLButtonElement>(null)
    const closeRef = useRef<HTMLButtonElement>(null)
    const settingsRef = useRef<HTMLButtonElement>(null)

    const { setNavBarDisplay } = useNavBar()

    useEffectOnce(() => {
        setNavBarDisplay('collapsed')
    })

    const onModalConfirm = () => {
        setActionsAllowed(true)
        setIsModalOpen(false)
    }

    const handleClose = () => {
        setIsCollapsibleColumnOpen(false)
        if (onClose) {
            onClose()
        }
    }

    const handleResetPlayground = () => {
        setResetPlayground(true)
    }

    const resetPlaygroundCallback = () => {
        setResetPlayground(false)
    }

    const handleClickSettings = () => {
        setIsSettingsOpen((prev) => !prev)
    }

    const usePlaygroundSettings = useFlag(FeatureFlagKey.AiJourneyPlayground)

    return (
        <div className={css['playground-panel']} data-name={'playground-panel'}>
            <PlaygroundActionsModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onConfirm={onModalConfirm}
            />
            {!isSettingsOpen && (
                <div className={css['panel-header']} data-name={'panel-header'}>
                    <div className={css['panel-header-title-container']}>
                        <span className={css['panel-header-title']}>Test</span>
                    </div>
                    <div className={css['panel-header-actions']}>
                        {!usePlaygroundSettings && (
                            <ActionsSection
                                actionsAllowed={actionsAllowed}
                                setActionsAllowed={setActionsAllowed}
                                setIsModalOpen={setIsModalOpen}
                            />
                        )}
                        <div>
                            {usePlaygroundSettings && (
                                <>
                                    <Button
                                        icon="settings"
                                        variant="tertiary"
                                        onClick={handleClickSettings}
                                        aria-label="open playground settings"
                                        ref={settingsRef}
                                    />
                                    <Tooltip target={settingsRef}>
                                        Open settings
                                    </Tooltip>
                                </>
                            )}
                            <Button
                                icon="undo"
                                variant="tertiary"
                                onClick={handleResetPlayground}
                                aria-label="reset playground"
                                ref={resetRef}
                            />
                            <Tooltip target={resetRef}>Reset test</Tooltip>
                            <Button
                                icon="close"
                                variant="tertiary"
                                onClick={handleClose}
                                aria-label="close playground panel"
                                ref={closeRef}
                            />
                            <Tooltip target={closeRef}>Close</Tooltip>
                        </div>
                    </div>
                </div>
            )}
            <div className={css['panel-body']}>
                <AiAgentPlayground
                    arePlaygroundActionsAllowed={actionsAllowed}
                    resetPlaygroundCallback={resetPlaygroundCallback}
                    resetPlayground={resetPlayground}
                    shopName={shopName}
                    withResetButton={false}
                    inplaceSettingsOpen={isSettingsOpen}
                    onInplaceSettingsOpenChange={setIsSettingsOpen}
                    supportedModes={['inbound']}
                />
            </div>
        </div>
    )
}
