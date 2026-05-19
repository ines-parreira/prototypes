import { useCallback, useMemo, useState } from 'react'

import { FeatureFlagKey, useFlag } from '@repo/feature-flags'
import { useHistory } from 'react-router-dom'

import { ListItem, Select, SelectTrigger, toast } from '@gorgias/axiom'
import { JourneyStatusEnum } from '@gorgias/convert-client'
import type { JourneyTypeEnum } from '@gorgias/convert-client'

import { CUSTOM_JOURNEY_TYPE, STEPS_NAMES } from 'AIJourney/constants'
import { useJourneyUpdateHandler } from 'AIJourney/hooks'
import { useJourneyContext } from 'AIJourney/providers'
import { useDeleteJourney } from 'AIJourney/queries/useDeleteJourney/useDeleteJourney'
import { getSetupStepPath } from 'AIJourney/utils'
import { isGorgiasApiError } from 'models/api/types'

import { DeleteFlowConfirmation } from '../DeleteFlowConfirmation/DeleteFlowConfirmation'

import css from './RowAdditionalOptions.less'

const Options = {
    Edit: 'edit',
    Preview: 'preview',
    Activation: 'activation',
    Pause: 'pause',
    Play: 'play',
    Delete: 'delete',
}

type Options = (typeof Options)[keyof typeof Options]

export const CAMPAIGN_STATE_TO_FIELDS: Record<JourneyStatusEnum, Options[]> = {
    [JourneyStatusEnum.Active]: [
        Options.Edit,
        Options.Preview,
        Options.Activation,
        Options.Pause,
    ],
    [JourneyStatusEnum.Draft]: [Options.Edit],
    [JourneyStatusEnum.Paused]: [
        Options.Edit,
        Options.Preview,
        Options.Activation,
        Options.Play,
    ],
}

const CUSTOM_FLOW_OPTIONS: Options[] = [Options.Edit, Options.Delete]

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
        name?: string | undefined | null
    }
}) => {
    const history = useHistory()
    const { currentIntegration } = useJourneyContext()
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

    const {
        id: journeyId,
        state: journeyState,
        message_instructions: messageInstructions,
        store_name: shopName,
        type: journeyType,
        name: journeyName,
    } = journeyRowData

    // JourneyTypeEnum does not yet include Custom — compare as string until SDK is updated
    const isCustomFlow = (journeyType as string) === CUSTOM_JOURNEY_TYPE
    const isAiJourneyCustomFlowEnabled = useFlag(
        FeatureFlagKey.AiJourneyCustomFlowEnabled,
    )

    const integrationId = useMemo(() => {
        return currentIntegration?.id || 0
    }, [currentIntegration])

    const { handleUpdate } = useJourneyUpdateHandler({
        integrationId,
        journeyId,
    })

    const { mutateAsync: deleteJourney, isLoading: isDeletePending } =
        useDeleteJourney()

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
            toast.error(`Error updating journey: ${error}`)
        }
    }, [handleUpdate, journeyState, messageInstructions])

    const handleDeleteConfirm = useCallback(async () => {
        if (!journeyId) return
        try {
            await deleteJourney({ id: journeyId })
            setIsDeleteDialogOpen(false)
        } catch (error) {
            setIsDeleteDialogOpen(false)
            const message = isGorgiasApiError(error)
                ? error.response.data.error.msg
                : 'Failed to delete flow.'
            toast.error(message)
        }
    }, [deleteJourney, journeyId])

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
                case Options.Preview:
                    history.push(
                        getSetupStepPath({
                            shopName,
                            journeyType,
                            stepName: STEPS_NAMES.PREVIEW,
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
                case Options.Delete:
                    setIsDeleteDialogOpen(true)
                    break
                default:
                    break
            }
        },
        [shopName, journeyId, history, journeyType, handleUpdateJourneyState],
    )

    const options = useMemo(() => {
        const availableOptions =
            isCustomFlow && isAiJourneyCustomFlowEnabled
                ? CUSTOM_FLOW_OPTIONS
                : CAMPAIGN_STATE_TO_FIELDS[journeyState] || []

        return availableOptions
            .map((option) => {
                switch (option) {
                    case Options.Edit:
                        return {
                            icon: 'edit',
                            id: option,
                            name: 'Edit',
                        }
                    case Options.Preview:
                        return {
                            icon: 'list',
                            id: option,
                            name: 'Preview',
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
                    case Options.Delete:
                        return {
                            icon: 'delete',
                            id: option,
                            name: 'Delete',
                        }
                    default:
                        return null
                }
            })
            .filter((option): option is OptionEntry => option !== null)
    }, [journeyState, isCustomFlow, isAiJourneyCustomFlowEnabled])

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
            {isCustomFlow && isAiJourneyCustomFlowEnabled && (
                <DeleteFlowConfirmation
                    flowName={journeyName || 'this flow'}
                    isOpen={isDeleteDialogOpen}
                    isLoading={isDeletePending}
                    onClose={() => setIsDeleteDialogOpen(false)}
                    onConfirm={handleDeleteConfirm}
                />
            )}
        </div>
    )
}
