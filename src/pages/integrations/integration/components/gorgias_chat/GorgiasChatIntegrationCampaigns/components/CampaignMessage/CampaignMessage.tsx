import React, {memo, useMemo} from 'react'
import classnames from 'classnames'
import {List} from 'immutable'

import {EditorState} from 'draft-js'
import {useFlags} from 'launchdarkly-react-client-sdk'

import {User} from 'config/types/user'
import {FeatureFlagKey} from 'config/featureFlags'

import {AgentLabel} from 'pages/common/utils/labels'
import SelectField from 'pages/common/forms/SelectField/SelectField'
import DEPRECATED_RichField from 'pages/common/forms/RichField/DEPRECATED_RichField'
import {ActionName} from 'pages/common/draftjs/plugins/toolbar/types'
import TicketAttachments from 'pages/tickets/detail/components/ReplyArea/TicketAttachments'

import {Option, Value} from 'pages/common/forms/SelectField/types'

import css from './CampaignMessage.less'

type Props = {
    agents: User[]
    attachments: List<any>
    html: string
    isRevenueBetaTester?: boolean
    text: string
    selectedAgent: string
    onSelectAgent: (agent: Value) => void
    onChangeMessage: (value: EditorState) => void
    onDeleteAttachment: (index: number) => void
}

export const CampaignMessage = memo(
    ({
        agents,
        attachments,
        html,
        isRevenueBetaTester = false,
        text,
        selectedAgent,
        onSelectAgent,
        onChangeMessage,
        onDeleteAttachment,
    }: Props): JSX.Element => {
        const options = useMemo<Option[]>(() => {
            const initialArr: Option[] = [
                {
                    value: '',
                    text: 'randomagent',
                    label: (
                        <AgentLabel
                            name={'Random agent'}
                            maxWidth="100"
                            shouldDisplayAvatar
                        />
                    ),
                },
            ]

            return agents.reduce((acc, agent) => {
                const props: Record<string, string> = {
                    name: agent.name,
                }

                if (agent.meta?.profile_picture_url) {
                    props['profilePictureUrl'] = agent.meta
                        .profile_picture_url as unknown as string
                }

                return [
                    ...acc,
                    {
                        label: <AgentLabel {...props} shouldDisplayAvatar />,
                        value: agent.email,
                        text: agent.name,
                    },
                ]
            }, initialArr)
        }, [agents])

        const value = useMemo(
            () => ({
                html,
                text,
            }),
            [html, text]
        )

        const allowVideoSharingForCampaigns: boolean | undefined =
            useFlags()[FeatureFlagKey.ChatVideoSharingCampaigns]

        const displayedActions = useMemo(() => {
            const actions = [
                ActionName.Bold,
                ActionName.Italic,
                ActionName.Underline,
                ActionName.Link,
                ActionName.Image,
                ActionName.Emoji,
            ]

            if (attachments.size < 5) {
                actions.push(ActionName.ProductPicker)
            }

            if (allowVideoSharingForCampaigns) {
                actions.push(ActionName.Video)
            }

            return actions
        }, [attachments, allowVideoSharingForCampaigns])

        return (
            <div className="mb-4">
                <div
                    data-testid="campaign-agent-section"
                    className={classnames('mb-2', css.authorWrapper)}
                >
                    <span>From: </span>
                    <SelectField
                        className={css.authorInput}
                        value={selectedAgent}
                        options={options}
                        onChange={onSelectAgent}
                    />
                </div>
                <div className={css.textEditorWrapper}>
                    <DEPRECATED_RichField
                        value={value}
                        attachments={attachments}
                        allowExternalChanges
                        productCardsEnabled={isRevenueBetaTester}
                        onChange={onChangeMessage}
                        placeholder={'Write your message'}
                        displayedActions={displayedActions}
                        isRequired
                    />
                    <TicketAttachments
                        removable
                        attachments={attachments}
                        className="p-2 d-flex flex-wrap"
                        deleteAttachment={onDeleteAttachment}
                    />
                </div>
            </div>
        )
    }
)
