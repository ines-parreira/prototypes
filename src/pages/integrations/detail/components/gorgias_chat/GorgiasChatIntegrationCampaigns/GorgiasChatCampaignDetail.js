import React from 'react'
import PropTypes from 'prop-types'
import {fromJS} from 'immutable'
import {Link, browserHistory} from 'react-router'
import {connect} from 'react-redux'
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

import InputField from '../../../../../common/forms/InputField'
import SelectField from '../../../../../common/forms/SelectField'
import RichField from '../../../../../common/forms/RichField'
import ConfirmButton from '../../../../../common/components/ConfirmButton.tsx'
import PageHeader from '../../../../../common/components/PageHeader.tsx'
import {AgentLabel} from '../../../../../common/utils/labels'

import {sanitizeHtmlDefault} from '../../../../../../utils/html.ts'
import {convertToHTML} from '../../../../../../utils/editor.tsx'

import {notify} from '../../../../../../state/notifications/actions.ts'
import * as campaignActions from '../../../../../../state/campaigns/actions'
import * as integrationsSelectors from '../../../../../../state/integrations/selectors.ts'
import * as agentSelectors from '../../../../../../state/agents/selectors.ts'

import GorgiasChatIntegrationNavigation from '../GorgiasChatIntegrationNavigation'

import {
    CAMPAIGNS_TRIGGER_KEYS,
    GORGIAS_CHAT_WIDGET_LANGUAGE_DEFAULT,
    GORGIAS_CHAT_WIDGET_TEXTS,
} from '../../../../../../config/integrations/gorgias_chat'

import CampaignPreview from './CampaignPreview'
import css from './GorgiasChatCampaignDetail.less'

/**
 * Generate and return a default empty trigger associated with a trigger configuration.
 * @param idx: the index of the trigger configuration, in CAMPAIGN_TRIGGER_KEYS
 */
const DEFAULT_TRIGGER = (idx) =>
    fromJS({
        key: CAMPAIGNS_TRIGGER_KEYS.getIn([idx, 'name']),
        operator: CAMPAIGNS_TRIGGER_KEYS.getIn([idx, 'operators'])
            .keySeq()
            .get(0),
        value: CAMPAIGNS_TRIGGER_KEYS.getIn([idx, 'value', 'default']),
    })

class ValueInput extends React.Component {
    static propTypes = {
        keyConfig: PropTypes.object.isRequired,
        trigger: PropTypes.object.isRequired,
        onChange: PropTypes.func.isRequired,
    }

    render() {
        const {keyConfig, trigger, onChange} = this.props

        const triggerValue = trigger.get('value')

        switch (keyConfig.getIn(['value', 'input'])) {
            case 'text':
                return (
                    <InputField
                        type="input"
                        name="value"
                        value={triggerValue || ''}
                        onChange={onChange}
                    />
                )
            case 'number': {
                return (
                    <InputField
                        className={css.secondsCounter}
                        type="number"
                        step="1"
                        value={triggerValue}
                        onChange={(value) => {
                            onChange(value < 0 ? 0 : value)
                        }}
                        onBlur={(event) => {
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

class TriggerRow extends React.Component {
    static propTypes = {
        trigger: PropTypes.object.isRequired,
        nbOfTriggers: PropTypes.number.isRequired,
        idx: PropTypes.number.isRequired,

        onOperatorChange: PropTypes.func.isRequired,
        onValueChange: PropTypes.func.isRequired,
        onDelete: PropTypes.func.isRequired,
    }

    render() {
        const {
            trigger,
            nbOfTriggers,
            idx,
            onOperatorChange,
            onValueChange,
            onDelete,
        } = this.props

        const keyConfig = CAMPAIGNS_TRIGGER_KEYS.find(
            (config) => config.get('name') === trigger.get('key')
        )

        const currentOperator = trigger.get('operator')
        const defaultOperator = keyConfig.get('operators').keySeq().get(0)
        const isLastCondition = idx + 1 >= nbOfTriggers

        return (
            <div key={idx} className={css.triggerWrapper}>
                <Button className="btn-frozen" color="info" tag="div">
                    {keyConfig.get('label')}
                </Button>
                <SelectField
                    onChange={onOperatorChange}
                    value={
                        keyConfig
                            .get('operators')
                            .keySeq()
                            .includes(currentOperator)
                            ? currentOperator
                            : defaultOperator
                    }
                    options={keyConfig
                        .get('operators')
                        .map((operatorData, operator) => {
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

export class GorgiasChatCampaignDetailComponent extends React.Component {
    static propTypes = {
        id: PropTypes.string.isRequired,
        integration: PropTypes.object.isRequired,
        campaign: PropTypes.object.isRequired,

        agents: PropTypes.object.isRequired,

        createCampaign: PropTypes.func.isRequired,
        updateCampaign: PropTypes.func.isRequired,
        deleteCampaign: PropTypes.func.isRequired,
        notify: PropTypes.func.isRequired,
    }

    state = {
        name: '',
        triggers: fromJS({}),
        message: fromJS({}),
    }

    _initState = (campaign) => {
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

    _addNewTrigger = (keyConfigIdx) => {
        this.setState({
            triggers: this.state.triggers.push(DEFAULT_TRIGGER(keyConfigIdx)),
        })
    }

    _handleSubmit = (e) => {
        e.preventDefault()

        const {id, campaign, integration, agents} = this.props

        const isUpdate = id !== 'new'
        const authorEmail = this.state.message.getIn(['author', 'email'])

        // In case an agent has no email address, we don't want to find him
        // todo(@louisbarranqueiro): remove that when the no-email agent issue is fixed
        const author = authorEmail
            ? agents.find((agent) => agent.get('email') === authorEmail)
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

        const form = fromJS({
            name: this.state.name,
            id: campaign.get('id'),
            triggers: this.state.triggers,
            message: message,
        })

        this.setState({loading: true})

        if (isUpdate) {
            this.props
                .updateCampaign(form, integration)
                .then(() => this.setState({loading: false}))
        } else {
            this.props
                .createCampaign(form, integration)
                .then(() => this.setState({loading: false}))
        }
    }

    _setAgent = (email) => {
        const {agents} = this.props
        const author = email
            ? agents.find((agent) => agent.get('email') === email)
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
        deleteCampaign(campaign, integration).then(() => {
            browserHistory.push(
                `/app/settings/integrations/${integration.get(
                    'type'
                )}/${integration.get('id')}/campaigns`
            )
        })
    }

    render() {
        const {integration, campaign, id, agents} = this.props
        const {name, triggers, message} = this.state

        const isUpdate = id !== 'new'

        const authorOptions = agents
            .map((agent) => {
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
            value: null,
            text: 'randomagent',
            label: 'Random agent',
        })

        return (
            <div className="full-width">
                <PageHeader
                    title={
                        <Breadcrumb>
                            <BreadcrumbItem>
                                <Link to="/app/settings/integrations">
                                    Integrations
                                </Link>
                            </BreadcrumbItem>
                            <BreadcrumbItem>
                                <Link
                                    to={`/app/settings/integrations/${integration.get(
                                        'type'
                                    )}/${integration.get('id')}`}
                                >
                                    Chat (New)
                                </Link>
                            </BreadcrumbItem>
                            <BreadcrumbItem>
                                {integration.get('name')}
                            </BreadcrumbItem>
                            <BreadcrumbItem>
                                <Link
                                    to={`/app/settings/integrations/${integration.get(
                                        'type'
                                    )}/${integration.get('id')}/campaigns`}
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

                <GorgiasChatIntegrationNavigation integration={integration} />

                <Container fluid className="page-container">
                    <Row>
                        <Col>
                            <Form onSubmit={this._handleSubmit}>
                                <div className="mb-4">
                                    <InputField
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
                                                    trigger={trigger}
                                                    nbOfTriggers={triggers.size}
                                                    idx={idx}
                                                    onOperatorChange={(
                                                        value
                                                    ) => {
                                                        this.setState({
                                                            triggers: triggers.setIn(
                                                                [
                                                                    idx,
                                                                    'operator',
                                                                ],
                                                                value
                                                            ),
                                                        })
                                                    }}
                                                    onValueChange={(value) => {
                                                        this.setState({
                                                            triggers: this.state.triggers.setIn(
                                                                [idx, 'value'],
                                                                value
                                                            ),
                                                        })
                                                    }}
                                                    onDelete={() => {
                                                        this.setState({
                                                            triggers: triggers.delete(
                                                                idx
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
                                                (keyConfig, idx) => {
                                                    return (
                                                        <DropdownItem
                                                            key={keyConfig.get(
                                                                'name'
                                                            )}
                                                            type="button"
                                                            onClick={() =>
                                                                this._addNewTrigger(
                                                                    idx
                                                                )
                                                            }
                                                        >
                                                            {keyConfig.get(
                                                                'label'
                                                            )}
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
                                            onChange={this._setAgent}
                                        />
                                    </div>
                                    {this.isInitialized && (
                                        <RichField
                                            type="text"
                                            rows="8"
                                            value={{html: message.get('html')}}
                                            onChange={(value) => {
                                                const content = value.getCurrentContent()

                                                this.setState({
                                                    message: message
                                                        .set(
                                                            'html',
                                                            convertToHTML(
                                                                content
                                                            )
                                                        )
                                                        .set(
                                                            'text',
                                                            content.getPlainText()
                                                        ),
                                                })
                                            }}
                                            displayedActions={[
                                                'BOLD',
                                                'ITALIC',
                                                'UNDERLINE',
                                                'IMAGE',
                                                'EMOJI',
                                            ]}
                                            placeholder={'Write your message'}
                                            required
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
                                        id="delete-campaign-button"
                                        className="float-right"
                                        placement="bottom right"
                                        color="secondary"
                                        confirm={this._deleteCampaign}
                                        content="Are you sure you want to delete this campaign?"
                                    >
                                        <i className="material-icons mr-1 text-danger">
                                            delete
                                        </i>
                                        Delete campaign
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
                                    GORGIAS_CHAT_WIDGET_TEXTS[
                                        integration.getIn([
                                            'meta',
                                            'language',
                                        ]) ||
                                            GORGIAS_CHAT_WIDGET_LANGUAGE_DEFAULT
                                    ]
                                }
                            />
                        </Col>
                    </Row>
                </Container>
            </div>
        )
    }
}

export default connect(
    (state, props) => {
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
)(GorgiasChatCampaignDetailComponent)
