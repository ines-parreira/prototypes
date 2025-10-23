import { FeatureFlagKey } from '@repo/feature-flags'

import { useFlag } from 'core/flags'
import { AddStepMenuItem } from 'core/ui/flows/components/AddStepMenuItem'
import { StepCardIcon } from 'core/ui/flows/components/StepCardIcon'

import { VoiceFlowNodeType } from './constants'
import { useAddNode } from './utils/useAddNode'

function AddStepMenuContent({
    source,
    target,
}: {
    source: string
    target: string
}) {
    const isExtendedCallFlowsGAReady = useFlag(
        FeatureFlagKey.ExtendedCallFlowsGAReady,
    )
    const { addNode, canAddFinalNode } = useAddNode(source, target)

    return (
        <>
            <AddStepMenuItem
                icon={<StepCardIcon backgroundColor="purple" name="clock" />}
                label={'Time rule'}
                onClick={() => addNode(VoiceFlowNodeType.TimeSplitConditional)}
            />
            {isExtendedCallFlowsGAReady && (
                <AddStepMenuItem
                    icon={
                        <StepCardIcon
                            backgroundColor="fuchsia"
                            name="search-magnifying-glass"
                        />
                    }
                    label={'Customer lookup'}
                    onClick={() => addNode(VoiceFlowNodeType.CustomerLookup)}
                />
            )}
            <AddStepMenuItem
                icon={
                    <StepCardIcon
                        backgroundColor="blue"
                        name="media-play-circle"
                    />
                }
                label={'Play message'}
                onClick={() => addNode(VoiceFlowNodeType.PlayMessage)}
            />
            <AddStepMenuItem
                icon={<StepCardIcon backgroundColor="teal" name="comm-ivr" />}
                label={'IVR Menu'}
                onClick={() => addNode(VoiceFlowNodeType.IvrMenu)}
            />
            <AddStepMenuItem
                icon={
                    <StepCardIcon
                        backgroundColor="orange"
                        name="arrow-routing"
                    />
                }
                label={'Route to'}
                onClick={() => addNode(VoiceFlowNodeType.Enqueue)}
            />
            <AddStepMenuItem
                icon={
                    <StepCardIcon
                        backgroundColor="coral"
                        name="arrow-chevron-right-duo"
                    />
                }
                label={'Forward to'}
                onClick={() =>
                    addNode(VoiceFlowNodeType.ForwardToExternalNumber)
                }
            />
            {canAddFinalNode && (
                <>
                    <AddStepMenuItem
                        icon={
                            <StepCardIcon
                                backgroundColor="green"
                                name="comm-chat-dots"
                            />
                        }
                        label={'Send to SMS'}
                        onClick={() => addNode(VoiceFlowNodeType.SendToSMS)}
                    />
                    <AddStepMenuItem
                        icon={
                            <StepCardIcon
                                backgroundColor="yellow"
                                name="comm-voicemail"
                            />
                        }
                        label={'Send to voicemail'}
                        onClick={() =>
                            addNode(VoiceFlowNodeType.SendToVoicemail)
                        }
                    />
                </>
            )}
        </>
    )
}

export default AddStepMenuContent
