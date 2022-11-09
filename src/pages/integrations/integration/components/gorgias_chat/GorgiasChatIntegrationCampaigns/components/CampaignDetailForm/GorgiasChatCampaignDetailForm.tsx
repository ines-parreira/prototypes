import React, {
    useState,
    useEffect,
    FormEvent,
    useCallback,
    useMemo,
} from 'react'
import {
    Button,
    DropdownItem,
    DropdownMenu,
    DropdownToggle,
    Form,
    UncontrolledDropdown,
} from 'reactstrap'
import {fromJS, Map, List} from 'immutable'
import classnames from 'classnames'
import {EditorState} from 'draft-js'
import {Link} from 'react-router-dom'
import {useFlags} from 'launchdarkly-react-client-sdk'

import {
    CAMPAIGNS_TRIGGER_KEYS,
    GORGIAS_CHAT_WIDGET_LANGUAGE_DEFAULT,
    GORGIAS_CHAT_WIDGET_TEXTS,
    GORGIAS_CHAT_WIDGET_POSITION_DEFAULT,
} from 'config/integrations/gorgias_chat'
import RadioFieldSet from 'pages/common/forms/RadioFieldSet'
import DEPRECATED_RichField from 'pages/common/forms/RichField/DEPRECATED_RichField'
import DEPRECATED_InputField from 'pages/common/forms/DEPRECATED_InputField'
import SelectField from 'pages/common/forms/SelectField/SelectField'
import {Value} from 'pages/common/forms/SelectField/types'
import {AgentLabel} from 'pages/common/utils/labels'
import {sanitizeHtmlDefault} from 'utils/html'
import {convertToHTML} from 'utils/editor'
import history from 'pages/history'
import ArrowBackwardIcon from 'assets/img/icons/arrow-backward.svg'
import GorgiasChatIntegrationPreviewContainer from 'pages/integrations/integration/components/gorgias_chat/GorgiasChatIntegrationPreviewContainer/GorgiasChatIntegrationPreviewContainer'
import ConfirmButton from 'pages/common/components/button/ConfirmButton'
import ButtonIconLabel from 'pages/common/components/button/ButtonIconLabel'
import {FeatureFlagKey} from 'config/featureFlags'

import CampaignPreview from '../CampaignPreview'
import {GorgiasChatCampaignDetailTriggerRow} from '../CampaignDetailTriggerRow'

import css from './GorgiasChatCampaignDetailForm.less'

/**
 * Generate and return a default empty trigger associated with a trigger configuration.
 * @param idx: the index of the trigger configuration, in CAMPAIGN_TRIGGER_KEYS
 */
const DEFAULT_TRIGGER = (idx: number) => {
    const operators: Map<any, any> = CAMPAIGNS_TRIGGER_KEYS.getIn([
        idx,
        'operators',
    ])
    const defaultTrigger: Map<any, any> = fromJS({
        key: CAMPAIGNS_TRIGGER_KEYS.getIn([idx, 'name']),
        operator: operators.keySeq().get(0),
        value: CAMPAIGNS_TRIGGER_KEYS.getIn([idx, 'value', 'default']),
    })

    return defaultTrigger
}

type Props = {
    id: string
    integration: Map<any, any>
    campaign: Map<any, any>
    agents: List<any>
    createCampaign: (form: any, integration: Map<any, any>) => Promise<unknown>
    updateCampaign: (form: any, integration: Map<any, any>) => Promise<unknown>
    deleteCampaign: (form: any, integration: Map<any, any>) => Promise<unknown>
}

type State = {
    name: string
    triggers: List<any>
    message: Map<any, any>
    loading: boolean
}

export const GorgiasChatCampaignDetailForm = ({
    id,
    integration,
    campaign,
    agents,
    createCampaign,
    updateCampaign,
    deleteCampaign,
}: Props) => {
    const flags = useFlags()
    const isRevenueAlphaTester = useMemo(() => {
        if (
            flags &&
            Object.keys(flags).includes(FeatureFlagKey.RevenueAlphaTesters)
        ) {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-return
            return flags[FeatureFlagKey.RevenueAlphaTesters]
        }
        return false
    }, [flags])
    const [state, setState] = useState<State>({
        name: '',
        triggers: fromJS({}),
        message: fromJS({}),
        loading: false,
    })

    const [stateInitialized, setStateInitialialized] = useState(false)

    const initState = useCallback(
        (_campaign: Map<any, any>) => {
            const defaultTriggers = isRevenueAlphaTester
                ? [
                      DEFAULT_TRIGGER(0), // default `business_hours` empty trigger in case of new campaign
                      DEFAULT_TRIGGER(1), // default `current_url` empty trigger in case of new campaign
                  ]
                : [
                      DEFAULT_TRIGGER(1), // default `current_url` empty trigger in case of new campaign
                  ]

            setStateInitialialized(true)
            setState({
                name: _campaign.get('name'),
                triggers: _campaign.get('triggers') || fromJS(defaultTriggers),
                message: _campaign.get('message') || fromJS({}),
                loading: false,
            })
        },
        [setStateInitialialized, setState, isRevenueAlphaTester]
    )

    // We do not allow a second "business_hours" trigger so we should
    // not allow the user to add this kind of condition
    const triggerOptions = useMemo(() => {
        return CAMPAIGNS_TRIGGER_KEYS.filter(
            // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
            (trigger) => trigger.get('name') !== 'business_hours'
        )
    }, [])

    const businessHourTrigger = useMemo(() => {
        const found: Map<any, any> = state.triggers.find(
            (trigger: Map<any, any>) => trigger.get('key') === 'business_hours'
        )

        if (found) {
            return {
                key: found.get('key'),
                operator: found.get('operator'),
                value: found.get('value'),
            }
        }
        return null
    }, [state.triggers])

    const audienceTriggers = useMemo(() => {
        return state.triggers.filter(
            (trigger: Map<any, any>) => trigger.get('key') !== 'business_hours'
        )
    }, [state.triggers])

    useEffect(() => {
        if (isRevenueAlphaTester) {
            const {triggers} = campaign.toJS()
            let immutableTriggers: List<Map<any, any>> =
                campaign.get('triggers')
            if (Array.isArray(triggers)) {
                const triggerKeys = triggers.map(
                    (trigger: Record<string, string>) => trigger.key
                )

                if (!triggerKeys.includes('business_hours')) {
                    immutableTriggers = immutableTriggers.insert(
                        0,
                        DEFAULT_TRIGGER(0)
                    )
                }
            }
            const defaultedCampaign = campaign.set(
                'triggers',
                immutableTriggers
            )
            initState(defaultedCampaign)
        } else {
            initState(campaign)
        }
    }, [initState, isRevenueAlphaTester, campaign])

    const addNewTrigger = (keyConfigIdx: number) => {
        setState((state) => ({
            ...state,
            triggers: state.triggers.push(DEFAULT_TRIGGER(keyConfigIdx)),
        }))
    }

    const handleUpdateBusinessHoursSchedule = useCallback(
        (value: string) => {
            const triggerIndex = state.triggers.findIndex(
                (trigger: Map<any, any>) =>
                    trigger.get('key') === 'business_hours'
            )

            if (triggerIndex >= 0) {
                setState((state) => ({
                    ...state,
                    triggers: state.triggers.setIn(
                        [triggerIndex, 'operator'],
                        value
                    ),
                }))
            }
        },
        [setState, state.triggers]
    )

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault()

        const isUpdate = id !== 'new'
        const authorEmail = state.message.getIn(['author', 'email'])

        // In case an agent has no email address, we don't want to find him
        // todo(@louisbarranqueiro): remove that when the no-email agent issue is fixed
        const author: Map<any, any> = authorEmail
            ? agents.find(
                  (agent: Map<any, any>) => agent.get('email') === authorEmail
              )
            : null

        // If there's no author, it means we want to display a random agent as author.
        // If empty, we have to delete the field because, if `author` is present, validation server-side will expect it
        // to have the required fields
        let message
        if (author) {
            message = state.message.set(
                'author',
                fromJS({
                    name: author.get('name'),
                    email: author.get('email'),
                })
            )

            const authorAvatarUrl = author.getIn([
                'meta',
                'profile_picture_url',
            ])

            if (authorAvatarUrl) {
                message = message.setIn(
                    ['author', 'avatar_url'],
                    authorAvatarUrl
                )
            }
        } else {
            message = state.message.delete('author')
        }

        const form = fromJS({
            name: state.name,
            id: campaign.get('id'),
            triggers: state.triggers,
            message: message,
        })

        setState((state) => ({...state, loading: true}))

        if (isUpdate) {
            await updateCampaign(form, integration)
        } else {
            await createCampaign(form, integration)
        }
        setState((state) => ({...state, loading: false}))
    }

    const indexIfBusinessHours = (index: number) => {
        const {triggers} = campaign.toJS()

        if (isRevenueAlphaTester) {
            return index + 1
        }

        if (Array.isArray(triggers)) {
            const triggerKeys = triggers.map(
                (trigger: Record<string, string>) => trigger.key
            )

            if (triggerKeys.includes('business_hours')) {
                return index + 1
            }
        }
        return index
    }

    const setAgent = (email: Value) => {
        const author: Map<any, any> = email
            ? agents.find(
                  (agent: Map<any, any>) => agent.get('email') === email
              )
            : null

        const message = author
            ? state.message.set(
                  'author',
                  fromJS({
                      name: author.get('name'),
                      email: author.get('email'),
                      avatar_url: author.getIn(['meta', 'profile_picture_url']),
                  })
              )
            : state.message.delete('author')

        setState((state) => ({...state, message}))
    }

    const _deleteCampaign = async () => {
        await deleteCampaign(campaign, integration)

        history.push(
            `/app/settings/integrations/${integration.get('type') as string}/${
                integration.get('id') as string
            }/campaigns`
        )
    }

    const position = {
        alignment: integration.getIn(
            ['decoration', 'position', 'alignment'],
            GORGIAS_CHAT_WIDGET_POSITION_DEFAULT.alignment
        ),
        offsetX: integration.getIn(
            ['decoration', 'position', 'offsetX'],
            GORGIAS_CHAT_WIDGET_POSITION_DEFAULT.offsetX
        ),
        offsetY: integration.getIn(
            ['decoration', 'position', 'offsetY'],
            GORGIAS_CHAT_WIDGET_POSITION_DEFAULT.offsetY
        ),
    }

    const isUpdate = id !== 'new'

    const authorOptions: any[] = agents
        .map((agent: Map<any, any>) => {
            const label = <AgentLabel name={agent.get('name')} maxWidth="100" />

            return {
                value: agent.get('email'),
                text: agent.get('name'),
                label,
            }
        })
        .toJS()

    // This is the default value; if no author is specified, any agent displayed in the widget when the customer sees
    // the campaign can be displayed as author of the campaign
    authorOptions.push({
        value: null,
        text: 'randomagent',
        label: <AgentLabel name={'Random agent'} maxWidth="100" />,
    })

    const {loading, message, triggers, name} = state

    return (
        <div data-testid="common-campaign-details-page">
            <div className={css.backWrapper}>
                <Link
                    to={`/app/settings/integrations/${
                        integration.get('type') as string
                    }/${integration.get('id') as string}/campaigns`}
                    className="d-flex"
                >
                    <img src={ArrowBackwardIcon} alt="Back to campaigns" />
                    {isUpdate ? 'Edit Campaign' : 'New Campaign'}
                </Link>
            </div>
            <GorgiasChatIntegrationPreviewContainer
                preview={
                    <CampaignPreview
                        html={sanitizeHtmlDefault(message.get('html'))}
                        mainColor={integration.getIn([
                            'decoration',
                            'main_color',
                        ])}
                        authorName={message.getIn(['author', 'name'])}
                        authorAvatarUrl={message.getIn([
                            'author',
                            'avatar_url',
                        ])}
                        translatedTexts={
                            GORGIAS_CHAT_WIDGET_TEXTS[
                                (integration.getIn([
                                    'meta',
                                    'language',
                                ]) as string) ||
                                    GORGIAS_CHAT_WIDGET_LANGUAGE_DEFAULT
                            ]
                        }
                        position={position}
                    />
                }
            >
                <div className={css.formWrapper}>
                    <Form onSubmit={handleSubmit}>
                        <div className="mb-4">
                            <DEPRECATED_InputField
                                type="text"
                                name="name"
                                label="Campaign name"
                                placeholder="My new campaign"
                                value={name}
                                onChange={(value: string) =>
                                    setState((state) => ({
                                        ...state,
                                        name: value,
                                    }))
                                }
                                required
                            />
                        </div>

                        {/* TRIGGERS */}

                        {businessHourTrigger && (
                            <>
                                <h5 className={css.section}>
                                    Schedule delivery
                                </h5>

                                <div className="mb-4">
                                    <RadioFieldSet
                                        selectedValue={
                                            businessHourTrigger?.operator ??
                                            'during'
                                        }
                                        options={[
                                            {
                                                value: 'during',
                                                label: 'During business hours',
                                            },
                                            {
                                                value: 'outside',
                                                label: 'Outside business hours',
                                            },
                                        ]}
                                        onChange={
                                            handleUpdateBusinessHoursSchedule
                                        }
                                    />
                                    <div className="mt-2">
                                        <span>
                                            You can check or update your
                                            business hours{' '}
                                            <Link to="/app/settings/business-hours">
                                                here
                                            </Link>
                                            .
                                        </span>
                                    </div>
                                </div>
                            </>
                        )}

                        <h5 className={css.section}>Choose your audience</h5>
                        <div className="mb-4">
                            {audienceTriggers
                                .map((trigger, idx) => {
                                    return (
                                        idx !== undefined && (
                                            <GorgiasChatCampaignDetailTriggerRow
                                                key={idx}
                                                trigger={trigger}
                                                idx={idx}
                                                onOperatorChange={(value) => {
                                                    setState((state) => ({
                                                        ...state,
                                                        triggers:
                                                            state.triggers.setIn(
                                                                [
                                                                    indexIfBusinessHours(
                                                                        idx
                                                                    ),
                                                                    'operator',
                                                                ],
                                                                value
                                                            ),
                                                    }))
                                                }}
                                                onValueChange={(value) => {
                                                    setState((state) => ({
                                                        ...state,
                                                        triggers:
                                                            state.triggers.setIn(
                                                                [
                                                                    indexIfBusinessHours(
                                                                        idx
                                                                    ),
                                                                    'value',
                                                                ],
                                                                value
                                                            ),
                                                    }))
                                                }}
                                                onDelete={() => {
                                                    setState((state) => ({
                                                        ...state,
                                                        triggers:
                                                            triggers.delete(
                                                                indexIfBusinessHours(
                                                                    idx
                                                                )
                                                            ),
                                                    }))
                                                }}
                                            />
                                        )
                                    )
                                })
                                .toList()
                                .toJS()}

                            <UncontrolledDropdown
                                className={css.addTriggerButton}
                            >
                                <DropdownToggle
                                    caret
                                    type="button"
                                    className="mr-2"
                                >
                                    <i className="material-icons mr-2">add</i>
                                    Add condition
                                </DropdownToggle>
                                <DropdownMenu>
                                    {triggerOptions.map(
                                        (keyConfig: Map<any, any>, idx) => {
                                            return (
                                                idx !== undefined && (
                                                    <DropdownItem
                                                        key={keyConfig.get(
                                                            'name'
                                                        )}
                                                        type="button"
                                                        onClick={() =>
                                                            addNewTrigger(
                                                                idx + 1
                                                            )
                                                        }
                                                    >
                                                        {keyConfig.get('label')}
                                                    </DropdownItem>
                                                )
                                            )
                                        }
                                    )}
                                </DropdownMenu>
                            </UncontrolledDropdown>
                        </div>

                        {/* MESSAGE + AUTHOR */}

                        <h5 className={css.section}>Write your message</h5>
                        <div className="mb-4">
                            <div
                                className={classnames(
                                    'mb-2',
                                    css.authorWrapper
                                )}
                            >
                                <span>From: </span>
                                <SelectField
                                    className={css.authorInput}
                                    value={message.getIn(
                                        ['author', 'email'],
                                        null
                                    )}
                                    options={authorOptions}
                                    onChange={setAgent}
                                />
                            </div>
                            {stateInitialized && (
                                <DEPRECATED_RichField
                                    value={{
                                        html: message.get('html'),
                                    }}
                                    allowExternalChanges={true}
                                    onChange={(value: EditorState) => {
                                        const content =
                                            value.getCurrentContent()

                                        setState((state) => ({
                                            ...state,
                                            message: state.message
                                                .set(
                                                    'html',
                                                    convertToHTML(content)
                                                )
                                                .set(
                                                    'text',
                                                    content.getPlainText()
                                                ),
                                        }))
                                    }}
                                    placeholder={'Write your message'}
                                    isRequired
                                />
                            )}
                        </div>

                        <Button
                            color="success"
                            className={classnames({
                                'btn-loading': loading,
                            })}
                            disabled={loading}
                        >
                            {isUpdate ? 'Save' : 'Create & activate'}
                        </Button>

                        {isUpdate && (
                            <ConfirmButton
                                className="float-right"
                                placement="bottom-end"
                                onConfirm={_deleteCampaign}
                                confirmationContent="Are you sure you want to delete this campaign?"
                                intent="destructive"
                                isDisabled={loading}
                            >
                                <ButtonIconLabel icon="delete">
                                    Delete campaign
                                </ButtonIconLabel>
                            </ConfirmButton>
                        )}
                    </Form>
                </div>
            </GorgiasChatIntegrationPreviewContainer>
        </div>
    )
}
