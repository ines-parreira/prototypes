import React, {FocusEvent, Component, FormEvent} from 'react'
import {fromJS, Map, List} from 'immutable'
import {Link} from 'react-router-dom'
import {connect, ConnectedProps} from 'react-redux'
import classnames from 'classnames'
import {
    Breadcrumb,
    BreadcrumbItem,
    Button,
    Col,
    Container,
    DropdownItem,
    DropdownMenu,
    DropdownToggle,
    Form,
    Row,
    UncontrolledDropdown,
} from 'reactstrap'

import {RootState} from 'state/types'
import ChatIntegrationNavigation from 'pages/integrations/integration/components/chat/ChatIntegrationNavigation'
import DEPRECATED_InputField from 'pages/common/forms/DEPRECATED_InputField'
import SelectField from 'pages/common/forms/SelectField/SelectField'
import {Option, Value} from 'pages/common/forms/SelectField/types'
import DEPRECATED_RichField from 'pages/common/forms/RichField/DEPRECATED_RichField'
import ConfirmButton from 'pages/common/components/button/ConfirmButton'
import ButtonIconLabel from 'pages/common/components/button/ButtonIconLabel'
import PageHeader from 'pages/common/components/PageHeader'
import {AgentLabel} from 'pages/common/utils/labels'
import {ActionName} from 'pages/common/draftjs/plugins/toolbar/types'

import {sanitizeHtmlDefault} from 'utils/html'
import {convertToHTML} from 'utils/editor'

import {notify} from 'state/notifications/actions'
import * as campaignActions from 'state/campaigns/actions'
import * as integrationsSelectors from 'state/integrations/selectors'
import * as agentSelectors from 'state/agents/selectors'

import {
    CAMPAIGNS_TRIGGER_KEYS,
    SMOOCH_INSIDE_WIDGET_LANGUAGE_DEFAULT,
    SMOOCH_INSIDE_WIDGET_TEXTS,
} from 'config/integrations/smooch_inside'
import history from 'pages/history'

import CampaignPreview from './CampaignPreview'
import css from './CampaignDetail.less'

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

type ValueInputProps = {
    keyConfig: Map<any, any>
    trigger: Map<any, any>
    onChange: (value: any) => void
}

class ValueInput extends Component<ValueInputProps> {
    render() {
        const {keyConfig, trigger, onChange} = this.props

        const triggerValue = trigger.get('value')

        switch (keyConfig.getIn(['value', 'input'])) {
            case 'text':
                return (
                    <DEPRECATED_InputField
                        type="input"
                        name="value"
                        value={triggerValue || ''}
                        onChange={onChange}
                    />
                )
            case 'number': {
                return (
                    <DEPRECATED_InputField
                        className={css.secondsCounter}
                        type="number"
                        step="1"
                        value={triggerValue}
                        onChange={(value) => {
                            onChange(value < 0 ? 0 : value)
                        }}
                        onBlur={(event: FocusEvent<HTMLInputElement>) => {
                            if (event.target.value === '') {
                                onChange(0)
                            }
                        }}
                        rightAddon="seconds"
                    />
                )
            }
            default:
                return <div />
        }
    }
}

type TriggerRowProps = {
    trigger: Map<any, any>
    nbOfTriggers: number
    idx: number
    onOperatorChange: (value: Value) => void
    onValueChange: (value: Value) => void
    onDelete: () => void
}

class TriggerRow extends Component<TriggerRowProps> {
    render() {
        const {
            trigger,
            nbOfTriggers,
            idx,
            onOperatorChange,
            onValueChange,
            onDelete,
        } = this.props

        const keyConfig: Map<any, any> = CAMPAIGNS_TRIGGER_KEYS.find(
            (config: Map<any, any>) => config.get('name') === trigger.get('key')
        )

        const currentOperator = trigger.get('operator')
        const defaultOperator = (keyConfig.get('operators') as Map<any, any>)
            .keySeq()
            .get(0)
        const isLastCondition = idx + 1 >= nbOfTriggers

        return (
            <div key={idx} className={css.triggerWrapper}>
                <Button className="btn-frozen" color="info" tag="div">
                    {keyConfig.get('label')}
                </Button>
                <SelectField
                    onChange={onOperatorChange}
                    value={
                        (keyConfig.get('operators') as Map<any, any>)
                            .keySeq()
                            .includes(currentOperator)
                            ? currentOperator
                            : defaultOperator
                    }
                    options={(keyConfig.get('operators') as Map<any, any>)
                        .map((operatorData: Map<any, any>, operator) => {
                            return {
                                value: operator,
                                text: operator,
                                label: operatorData.get('label'),
                            }
                        })
                        .toList()
                        .toJS()}
                />
                <ValueInput
                    keyConfig={keyConfig}
                    trigger={trigger}
                    onChange={onValueChange}
                />
                {!isLastCondition && (
                    <Button className="btn-frozen" color="warning" tag="div">
                        and
                    </Button>
                )}
                <div className={css.closeWrapper}>
                    <i
                        className="material-icons text-danger clickable"
                        onClick={onDelete}
                    >
                        clear
                    </i>
                </div>
            </div>
        )
    }
}

type CampainDetailOwnProps = {
    id: string
    integration: Map<any, any>
}

type CampaignDetailProps = CampainDetailOwnProps &
    ConnectedProps<typeof connector>

export class CampaignDetail extends Component<CampaignDetailProps> {
    render() {
        const {integration, campaign, id} = this.props

        const isUpdate = id !== 'new'

        return (
            <div className="full-width">
                <PageHeader
                    title={
                        <Breadcrumb>
                            <BreadcrumbItem>
                                <Link to="/app/settings/integrations">
                                    All Apps
                                </Link>
                            </BreadcrumbItem>
                            <BreadcrumbItem>
                                <Link
                                    to={`/app/settings/integrations/smooch_inside/${
                                        integration.get('id') as number
                                    }`}
                                >
                                    Chat (Deprecated)
                                </Link>
                            </BreadcrumbItem>
                            <BreadcrumbItem>
                                {integration.get('name')}
                            </BreadcrumbItem>
                            <BreadcrumbItem>
                                <Link
                                    to={`/app/settings/integrations/smooch_inside/${
                                        integration.get('id') as number
                                    }/campaigns`}
                                >
                                    Campaigns
                                </Link>
                            </BreadcrumbItem>
                            <BreadcrumbItem active>
                                {isUpdate
                                    ? campaign.get('name')
                                    : 'New campaign'}
                            </BreadcrumbItem>
                        </Breadcrumb>
                    }
                />

                <ChatIntegrationNavigation integration={integration} />
                <CampaignForm {...this.props} />
            </div>
        )
    }
}

type CampaignFormProps = CampaignDetailProps

type CampaignFormState = {
    name: string
    triggers: List<Map<any, any>>
    message: Map<any, any>
    loading: boolean
}

export class CampaignForm extends Component<
    CampaignFormProps,
    CampaignFormState
> {
    isInitialized = false
    state: CampaignFormState = {
        name: '',
        triggers: fromJS([]),
        message: fromJS({}),
        loading: false,
    }

    _initState = (campaign: Map<any, any>) => {
        this.isInitialized = true
        this.setState({
            name: campaign.get('name'),
            triggers:
                campaign.get('triggers') ||
                fromJS([
                    DEFAULT_TRIGGER(0), // default `current_url` empty trigger in case of new campaign
                ]),
            message: campaign.get('message') || fromJS({}),
        })
    }

    componentDidMount() {
        this.isInitialized = this.props.id === 'new'

        if (!this.props.campaign.isEmpty() || this.props.id === 'new') {
            this._initState(this.props.campaign)
        }
    }

    componentDidUpdate() {
        if (!this.isInitialized && !this.props.campaign.isEmpty()) {
            this._initState(this.props.campaign)
        }
    }

    _addNewTrigger = (keyConfigIdx: number) => {
        this.setState({
            triggers: this.state.triggers.push(DEFAULT_TRIGGER(keyConfigIdx)),
        })
    }

    _handleSubmit = (e: FormEvent) => {
        e.preventDefault()

        const {id, campaign, integration, agents} = this.props

        const isUpdate = id !== 'new'
        const authorEmail = this.state.message.getIn(['author', 'email'])

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
            message = this.state.message.set(
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
            message = this.state.message.delete('author')
        }

        const form: Map<any, any> = fromJS({
            name: this.state.name,
            id: campaign.get('id'),
            triggers: this.state.triggers,
            message: message,
        })

        this.setState({loading: true})

        if (isUpdate) {
            void this.props
                .updateCampaign(form, integration)
                .then(() => this.setState({loading: false}))
        } else {
            void this.props
                .createCampaign(form, integration)
                .then(() => this.setState({loading: false}))
        }
    }

    _setAgent = (email: string) => {
        const {agents} = this.props
        const author: Map<any, any> | null = email
            ? agents.find(
                  (agent: Map<any, any>) => agent.get('email') === email
              )
            : null

        const message = author
            ? this.state.message.set(
                  'author',
                  fromJS({
                      name: author.get('name'),
                      email: author.get('email'),
                      avatar_url: author.getIn(['meta', 'profile_picture_url']),
                  })
              )
            : this.state.message.delete('author')

        this.setState({message})
    }

    _deleteCampaign = () => {
        const {deleteCampaign, campaign, integration} = this.props
        void deleteCampaign(campaign, integration).then(() => {
            history.push(
                `/app/settings/integrations/${
                    integration.get('type') as string
                }/${integration.get('id') as number}/campaigns`
            )
        })
    }

    render() {
        const {integration, id, agents} = this.props
        const {name, triggers, message} = this.state

        const isUpdate = id !== 'new'

        const authorOptions: Option[] = agents
            .map((agent: Map<any, any>) => {
                const label = (
                    <AgentLabel name={agent.get('name')} maxWidth="100" />
                )

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
            value: null as unknown as Value,
            text: 'randomagent',
            label: 'Random agent',
        })

        return (
            <Container fluid className="page-container">
                <Row>
                    <Col>
                        <Form onSubmit={this._handleSubmit}>
                            <div className="mb-4">
                                <DEPRECATED_InputField
                                    type="input"
                                    name="name"
                                    label="Campaign name"
                                    placeholder="My new campaign"
                                    value={name}
                                    onChange={(value) =>
                                        this.setState({name: value})
                                    }
                                    required
                                />
                            </div>

                            {/* TRIGGERS */}

                            <h5>Choose your audience</h5>
                            <div className="mb-4">
                                {triggers
                                    .map((trigger, idx) => {
                                        return (
                                            <TriggerRow
                                                key={idx}
                                                trigger={trigger!}
                                                nbOfTriggers={triggers.size}
                                                idx={idx!}
                                                onOperatorChange={(
                                                    value: Value
                                                ) => {
                                                    this.setState({
                                                        triggers:
                                                            triggers.setIn(
                                                                [
                                                                    idx,
                                                                    'operator',
                                                                ],
                                                                value
                                                            ),
                                                    })
                                                }}
                                                onValueChange={(
                                                    value: Value
                                                ) => {
                                                    this.setState({
                                                        triggers:
                                                            this.state.triggers.setIn(
                                                                [idx, 'value'],
                                                                value
                                                            ),
                                                    })
                                                }}
                                                onDelete={() => {
                                                    this.setState({
                                                        triggers:
                                                            triggers.delete(
                                                                idx!
                                                            ),
                                                    })
                                                }}
                                            />
                                        )
                                    })
                                    .toList()
                                    .toJS()}

                                <UncontrolledDropdown>
                                    <DropdownToggle
                                        caret
                                        type="button"
                                        className="mr-2"
                                    >
                                        <i className="material-icons mr-2">
                                            add
                                        </i>
                                        Add condition
                                    </DropdownToggle>
                                    <DropdownMenu>
                                        {CAMPAIGNS_TRIGGER_KEYS.map(
                                            (keyConfig: Map<any, any>, idx) => {
                                                return (
                                                    <DropdownItem
                                                        key={keyConfig.get(
                                                            'name'
                                                        )}
                                                        type="button"
                                                        onClick={() =>
                                                            this._addNewTrigger(
                                                                idx!
                                                            )
                                                        }
                                                    >
                                                        {keyConfig.get('label')}
                                                    </DropdownItem>
                                                )
                                            }
                                        )}
                                    </DropdownMenu>
                                </UncontrolledDropdown>
                            </div>

                            {/* MESSAGE + AUTHOR */}

                            <h5>Write your message</h5>
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
                                        onChange={
                                            this._setAgent as (
                                                email: Value
                                            ) => void
                                        }
                                    />
                                </div>
                                {this.isInitialized && (
                                    <DEPRECATED_RichField
                                        value={{html: message.get('html')}}
                                        onChange={(value) => {
                                            const content =
                                                value.getCurrentContent()

                                            this.setState({
                                                message: message
                                                    .set(
                                                        'html',
                                                        convertToHTML(content)
                                                    )
                                                    .set(
                                                        'text',
                                                        content.getPlainText()
                                                    ),
                                            })
                                        }}
                                        displayedActions={[
                                            ActionName.Bold,
                                            ActionName.Italic,
                                            ActionName.Underline,
                                            ActionName.Image,
                                            ActionName.Emoji,
                                        ]}
                                        placeholder={'Write your message'}
                                        isRequired
                                    />
                                )}
                            </div>

                            <Button
                                color="success"
                                className={classnames({
                                    'btn-loading': this.state.loading,
                                })}
                                disabled={this.state.loading}
                            >
                                {isUpdate
                                    ? 'Save'
                                    : 'Create & activate campaign'}
                            </Button>

                            {isUpdate && (
                                <ConfirmButton
                                    className="float-right"
                                    placement="bottom-end"
                                    onConfirm={this._deleteCampaign}
                                    confirmationContent="Are you sure you want to delete this campaign?"
                                    type="button"
                                    intent="destructive"
                                    isDisabled={this.state.loading}
                                >
                                    <ButtonIconLabel icon="delete">
                                        Delete campaign
                                    </ButtonIconLabel>
                                </ConfirmButton>
                            )}
                        </Form>
                    </Col>
                    <Col>
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
                                SMOOCH_INSIDE_WIDGET_TEXTS[
                                    (integration.getIn([
                                        'meta',
                                        'language',
                                    ]) as string) ||
                                        SMOOCH_INSIDE_WIDGET_LANGUAGE_DEFAULT
                                ] as {
                                    poweredByGorgias: string
                                    campaignClickToReply: string
                                }
                            }
                        />
                    </Col>
                </Row>
            </Container>
        )
    }
}

const connector = connect(
    (state: RootState, props: CampainDetailOwnProps) => {
        return {
            campaign: integrationsSelectors.getChatIntegrationCampaignById(
                props.integration.get('id'),
                props.id
            )(state),
            agents: agentSelectors.getAgents(state),
        }
    },
    {
        createCampaign: campaignActions.createCampaign,
        updateCampaign: campaignActions.updateCampaign,
        deleteCampaign: campaignActions.deleteCampaign,
        notify,
    }
)

export default connector(CampaignDetail)
