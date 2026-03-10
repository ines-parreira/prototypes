import type React from 'react'
import { useState } from 'react'

import { SegmentEvent } from '@repo/logging'
import { history } from '@repo/routing'
import type { Map } from 'immutable'
import { fromJS } from 'immutable'

import { Card, Heading, Text } from '@gorgias/axiom'

import {
    GORGIAS_CHAT_DEFAULT_COLOR_REVAMP,
    GORGIAS_CHAT_WIDGET_POSITION_DEFAULT,
} from 'config/integrations/gorgias_chat'
import useAppDispatch from 'hooks/useAppDispatch'
import type { GorgiasChatPosition } from 'models/integration/types'
import {
    GorgiasChatCreationWizardSteps,
    IntegrationType,
} from 'models/integration/types'
import useNavigateWizardSteps from 'pages/common/components/wizard/hooks/useNavigateWizardSteps'
import { ColorPicker } from 'pages/integrations/integration/components/gorgias_chat/legacy/components/ColorPicker'
import { LauncherPositionPicker } from 'pages/integrations/integration/components/gorgias_chat/legacy/components/LauncherPositionPicker'
import { LogoUpload } from 'pages/integrations/integration/components/gorgias_chat/legacy/components/LogoUpload'
import { updateOrCreateIntegration } from 'state/integrations/actions'

import { GorgiasChatCreationWizardStep } from '../../GorgiasChatCreationWizardStep'
import useLogWizardEvent from '../../hooks/useLogWizardEvent'
import { GorgiasChatCreationWizardFooter } from '../GorgiasChatCreationWizardFooter'
import SaveChangesPrompt from '../SaveChangesPrompt'

import css from './GorgiasChatCreationWizardStepBranding.less'

type SubmitForm = {
    type: IntegrationType.GorgiasChat
    id: number
    decoration: Record<string, any>
    meta: Record<string, any>
}

type Props = {
    integration: Map<any, any>
    isSubmitting: boolean
}

const GorgiasChatCreationWizardStepBranding: React.FC<Props> = ({
    integration,
    isSubmitting,
}) => {
    const logWizardEvent = useLogWizardEvent()

    const dispatch = useAppDispatch()

    const { goToNextStep, goToPreviousStep } = useNavigateWizardSteps()

    const [hasSubmitted, setHasSubmitted] = useState(false)

    const [currentMainColor, setCurrentMainColor] = useState<string>()
    const [currentHeaderPictureUrl, setCurrentHeaderPictureUrl] =
        useState<string>()
    const [currentPosition, setCurrentPosition] =
        useState<GorgiasChatPosition>()

    const mainColor =
        currentMainColor ||
        (integration.getIn(
            ['decoration', 'main_color'],
            GORGIAS_CHAT_DEFAULT_COLOR_REVAMP,
        ) as string)
    const headerPictureUrl =
        currentHeaderPictureUrl ??
        (integration.getIn(['decoration', 'header_picture_url']) as
            | string
            | undefined)

    const savedPosition: GorgiasChatPosition | undefined = integration
        .getIn(['decoration', 'position'])
        ?.toJS()

    const position: GorgiasChatPosition =
        currentPosition ?? savedPosition ?? GORGIAS_CHAT_WIDGET_POSITION_DEFAULT

    const isPristine =
        currentMainColor === undefined &&
        currentHeaderPictureUrl === undefined &&
        currentPosition === undefined

    const onSave = (shouldGoToNextStep = false, isContinueLater = false) => {
        const form: SubmitForm = {
            type: IntegrationType.GorgiasChat,
            id: integration.get('id'),
            decoration: (integration.get('decoration') as Map<any, any>)
                .set('conversation_color', mainColor) // Backwards compatibility: setting main color for conversation color
                .set('main_color', mainColor)
                .set('header_picture_url', headerPictureUrl)
                .set('position', position)
                .toJS(),
            meta: (integration.get('meta') as Map<any, any>)
                .setIn(
                    ['wizard', 'step'],
                    shouldGoToNextStep
                        ? GorgiasChatCreationWizardSteps.Automate
                        : GorgiasChatCreationWizardSteps.Branding,
                )
                .toJS(),
        }

        return dispatch(
            updateOrCreateIntegration(
                fromJS(form),
                undefined,
                true,
                () => {
                    logWizardEvent(
                        isContinueLater
                            ? SegmentEvent.ChatWidgetWizardSaveLaterClicked
                            : SegmentEvent.ChatWidgetWizardStepCompleted,
                    )

                    setHasSubmitted(true)
                    if (shouldGoToNextStep) {
                        goToNextStep()
                    }
                },
                shouldGoToNextStep,
                'Changes saved',
            ),
        )
    }

    return (
        <>
            <SaveChangesPrompt
                onSave={() => onSave()}
                when={!isPristine && !hasSubmitted}
                shouldRedirectAfterSave
            />
            <GorgiasChatCreationWizardStep
                footer={
                    <GorgiasChatCreationWizardFooter
                        backButton={{
                            label: 'Back',
                            onClick: goToPreviousStep,
                            isDisabled: isSubmitting,
                        }}
                        primaryButton={{
                            label: 'Continue',
                            onClick: () => onSave(true),
                            isLoading: isSubmitting,
                        }}
                        exitButton={{
                            label: 'Save and Exit',
                            onClick: () =>
                                onSave(false, true).then(() => {
                                    history.push(
                                        '/app/settings/channels/gorgias_chat',
                                    )
                                }),
                            isDisabled: isSubmitting,
                        }}
                    />
                }
            >
                <Card p="lg">
                    <div className={css.content}>
                        <div className={css.heading}>
                            <Heading size="md">Brand</Heading>
                            <Text size="md">
                                Give the chat widget your brand&apos;s look and
                                feel
                            </Text>
                        </div>
                        <div className={css.section}>
                            <Text variant="bold" size="md">
                                Brand color
                            </Text>
                            <Text size="sm" className={css.caption}>
                                Make your chat fit in with your brand color
                            </Text>
                            <ColorPicker
                                className={css.colorPicker}
                                value={mainColor}
                                defaultValue={
                                    integration.getIn(
                                        ['decoration', 'main_color'],
                                        GORGIAS_CHAT_DEFAULT_COLOR_REVAMP,
                                    ) as string
                                }
                                onChange={setCurrentMainColor}
                                label="Main color"
                            />
                        </div>
                        <div className={css.section}>
                            <Text variant="bold" size="md">
                                Home page logo
                            </Text>
                            <Text size="sm" className={css.caption}>
                                Add a PNG, JPG or GIF horizontal logo with a
                                transparent background.
                            </Text>
                            <LogoUpload
                                url={headerPictureUrl}
                                onChange={setCurrentHeaderPictureUrl}
                            />
                        </div>
                        <div className={css.section}>
                            <LauncherPositionPicker
                                value={position}
                                onChange={setCurrentPosition}
                            />
                        </div>
                    </div>
                </Card>
            </GorgiasChatCreationWizardStep>
        </>
    )
}

export default GorgiasChatCreationWizardStepBranding
