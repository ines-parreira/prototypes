import { Link } from 'react-router-dom'

import { Text } from '@gorgias/axiom'

import { ChannelToggle } from 'pages/aiAgent/Activation/components/AiAgentActivationStoreCard/ChannelToggle'

import { PostOnboardingStepMetadata } from './types'

import css from './DeploySection.less'

type Props = {
    stepMetadata: PostOnboardingStepMetadata
}
export const DeploySection = ({ stepMetadata }: Props) => {
    return (
        <div className={css.container}>
            <Text size="md" variant="regular">
                {stepMetadata.stepDescription}
            </Text>

            <div className={css.channelsToggles}>
                <ChannelToggle
                    color="var(--surface-inverted-default)"
                    label="Email"
                    checked={true}
                    disabled={false}
                    onChange={() => {}}
                    warnings={[
                        {
                            visible: false,
                            hint: 'An email integration must be selected for this store.',
                            action: (
                                <Link to={'/'} onClick={() => {}}>
                                    <span>Select Integration for Email</span>
                                    <i
                                        className={`${css.warningLinkIcon} material-icons`}
                                    >
                                        open_in_new
                                    </i>
                                </Link>
                            ),
                        },
                    ]}
                    tooltip={{
                        visible: false,
                        content: (
                            <>
                                integrated emails:
                                <div>test</div>
                            </>
                        ),
                    }}
                />
                <ChannelToggle
                    label="Chat"
                    checked={false}
                    disabled={true}
                    onChange={() => {}}
                    warnings={[
                        {
                            visible: false,
                            hint: 'A chat integration must be selected for this store.',
                            action: (
                                <Link to={'/'} onClick={() => {}}>
                                    <span>Select Integration for Chat</span>
                                    <i
                                        className={`${css.warningLinkIcon} material-icons`}
                                    >
                                        open_in_new
                                    </i>
                                </Link>
                            ),
                        },
                        {
                            visible: false,
                            hint: 'A chat integration must be installed for this store.',
                            action: (
                                <Link
                                    to={`/app/settings/channels/gorgias_chat/1/installation`}
                                    onClick={() => {}}
                                >
                                    <span>Install Chat</span>
                                    <i
                                        className={`${css.warningLinkIcon} material-icons`}
                                    >
                                        open_in_new
                                    </i>
                                </Link>
                            ),
                        },
                    ]}
                    tooltip={{
                        visible: false,
                        content: (
                            <>
                                integrated chats:
                                <div>test</div>
                            </>
                        ),
                    }}
                />
            </div>
        </div>
    )
}
