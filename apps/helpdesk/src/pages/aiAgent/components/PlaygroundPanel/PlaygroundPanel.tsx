import { useCallback, useRef, useState } from 'react'

import { useEffectOnce } from '@repo/hooks'

import { Button, LegacyTooltip as Tooltip } from '@gorgias/axiom'

import { useNavBar } from 'common/navigation/hooks/useNavBar/useNavBar'
import PlaygroundActionsModal from 'pages/aiAgent/PlaygroundV2/components/PlaygroundActionsModal/PlaygroundActionsModal'
import type { DraftKnowledge } from 'pages/aiAgent/PlaygroundV2/types'
import { useAppContext } from 'pages/AppContext'

import { AiAgentPlayground } from '../../PlaygroundV2/AiAgentPlayground'

import css from './PlaygroundPanel.less'

type Props = {
    shopName?: string
    onClose?: () => void
    draftKnowledge?: DraftKnowledge
    onGuidanceClick?: (guidanceArticleId: number) => void
    collapseNavbar?: boolean
}

export const PlaygroundPanel = ({
    shopName,
    onClose,
    draftKnowledge,
    onGuidanceClick,
    collapseNavbar = true,
}: Props) => {
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
        if (collapseNavbar) {
            setNavBarDisplay('collapsed')
        }
    })

    const onModalConfirm = () => {
        setActionsAllowed(true)
        setIsModalOpen(false)
    }

    const handleClose = useCallback(() => {
        setIsCollapsibleColumnOpen(false)
        if (onClose) {
            onClose()
        }
    }, [setIsCollapsibleColumnOpen, onClose])

    const handleResetPlayground = () => {
        setResetPlayground(true)
    }

    const resetPlaygroundCallback = () => {
        setResetPlayground(false)
    }

    const handleClickSettings = () => {
        setIsSettingsOpen((prev) => !prev)
    }

    const handleGuidanceClick = useCallback(
        (guidanceArticleId: number) => {
            handleClose()
            if (onGuidanceClick) {
                onGuidanceClick(guidanceArticleId)
            }
        },
        [onGuidanceClick, handleClose],
    )

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
                        <div>
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
                    draftKnowledge={draftKnowledge}
                    onGuidanceClick={handleGuidanceClick}
                />
            </div>
        </div>
    )
}
