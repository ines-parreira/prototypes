import { useCallback, useMemo } from 'react'

import { NotificationStatus } from '@repo/agent-status'
import { useHistory } from 'react-router-dom'

import { ListItem, Select, SelectTrigger } from '@gorgias/axiom'
import { JourneyStatusEnum } from '@gorgias/convert-client'
import type { JourneyTypeEnum } from '@gorgias/convert-client'

import { STEPS_NAMES } from 'AIJourney/constants'
import { useJourneyUpdateHandler } from 'AIJourney/hooks'
import { useJourneyContext } from 'AIJourney/providers'
import { getSetupStepPath } from 'AIJourney/utils'
import useAppDispatch from 'hooks/useAppDispatch'
import { notify } from 'state/notifications/actions'

import css from './RowAdditionalOptions.less'

const Options = {
    Edit: 'edit',
    Test: 'test',
    Activation: 'activation',
    Pause: 'pause',
    Play: 'play',
}

type Options = (typeof Options)[keyof typeof Options]

export const CAMPAIGN_STATE_TO_FIELDS: Record<JourneyStatusEnum, Options[]> = {
    [JourneyStatusEnum.Active]: [
        Options.Edit,
        Options.Test,
        Options.Activation,
        Options.Pause,
    ],
    [JourneyStatusEnum.Draft]: [Options.Edit],
    [JourneyStatusEnum.Paused]: [
        Options.Edit,
        Options.Test,
        Options.Activation,
        Options.Play,
    ],
}

type OptionEntry = { id: Options; name: string; icon: string }

export const RowAdditionalOptions = ({
    journeyRowData,
}: {
    journeyRowData: {
        id?: string
        state: JourneyStatusEnum
        message_instructions?: string | undefined | null
        store_name: string
        type: JourneyTypeEnum
    }
}) => {
    const history = useHistory()
    const dispatch = useAppDispatch()
    const { currentIntegration } = useJourneyContext()

    const {
        id: journeyId,
        state: journeyState,
        message_instructions: messageInstructions,
        store_name: shopName,
        type: journeyType,
    } = journeyRowData

    const integrationId = useMemo(() => {
        return currentIntegration?.id || 0
    }, [currentIntegration])

    const { handleUpdate } = useJourneyUpdateHandler({
        integrationId,
        journeyId,
    })

    const handleUpdateJourneyState = useCallback(async () => {
        try {
            await handleUpdate({
                journeyState:
                    journeyState === JourneyStatusEnum.Active
                        ? JourneyStatusEnum.Paused
                        : JourneyStatusEnum.Active,
                journeyMessageInstructions: messageInstructions,
            })
        } catch (error) {
            void dispatch(
                notify({
                    message: `Error updating journey: ${error}`,
                    status: NotificationStatus.Error,
                }),
            )
        }
    }, [dispatch, handleUpdate, journeyState, messageInstructions])

    const handleAction = useCallback(
        (option: OptionEntry) => {
            switch (option.id) {
                case Options.Edit:
                    history.push(
                        getSetupStepPath({
                            shopName,
                            journeyType,
                            stepName: STEPS_NAMES.SETUP,
                            journeyId,
                        }),
                    )
                    break
                case Options.Test:
                    history.push(
                        getSetupStepPath({
                            shopName,
                            journeyType,
                            stepName: STEPS_NAMES.TEST,
                            journeyId,
                        }),
                    )
                    break
                case Options.Activation:
                    history.push(
                        getSetupStepPath({
                            shopName,
                            journeyType,
                            stepName: STEPS_NAMES.ACTIVATE,
                            journeyId,
                        }),
                    )
                    break
                case Options.Pause:
                    handleUpdateJourneyState()
                    break
                case Options.Play:
                    handleUpdateJourneyState()
                    break
                default:
                    break
            }
        },
        [shopName, journeyId, history, journeyType, handleUpdateJourneyState],
    )

    const options = useMemo(() => {
        const availableOptions = CAMPAIGN_STATE_TO_FIELDS[journeyState] || []
        return availableOptions
            .map((option) => {
                switch (option) {
                    case Options.Edit:
                        return {
                            icon: 'edit',
                            id: option,
                            name: 'Edit',
                        }
                    case Options.Test:
                        return {
                            icon: 'list',
                            id: option,
                            name: 'Test',
                        }
                    case Options.Activation:
                        return {
                            icon: 'play_circle',
                            id: option,
                            name: 'Activation',
                        }
                    case Options.Pause:
                        return {
                            icon: 'pause',
                            id: option,
                            name: 'Pause',
                        }
                    case Options.Play:
                        return {
                            icon: 'play_arrow',
                            id: option,
                            name: 'Play',
                        }
                    default:
                        return null
                }
            })
            .filter((option): option is OptionEntry => option !== null)
    }, [journeyState])

    if (options.length === 0) {
        return null
    }

    return (
        <div className={css.statusRight} style={{ position: 'relative' }}>
            <Select
                data-name="select-field"
                placement="bottom right"
                trigger={({ ref }) => (
                    <SelectTrigger ref={ref}>
                        <div
                            className={css.menuButton}
                            aria-label="Open options"
                        >
                            <i className="material-icons-outlined">
                                more_horiz
                            </i>
                        </div>
                    </SelectTrigger>
                )}
                items={options}
                onSelect={handleAction}
            >
                {(option) => (
                    <ListItem
                        id={option.id}
                        leadingSlot={option.icon}
                        label={option.name}
                    />
                )}
            </Select>
        </div>
    )
}
