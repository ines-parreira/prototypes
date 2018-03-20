import React, {PropTypes} from 'react'
import ImmutablePropsTypes from 'react-immutable-proptypes'
import {connect} from 'react-redux'
import {Link, browserHistory} from 'react-router'
import classNames from 'classnames'
import _truncate from 'lodash/truncate'
import {
    Form,
    FormGroup,
    Breadcrumb,
    BreadcrumbItem,
    Button, Container,
} from 'reactstrap'

import Loader from '../../../../common/components/Loader'

import BooleanField from '../../../../common/forms/BooleanField'

import * as integrationsSelectors from '../../../../../state/integrations/selectors'

import css from './FacebookIntegrationSetup.less'
import PageHeader from '../../../../common/components/PageHeader'

@connect((state) => {
    // Here we only want the DELETED integrations of the current_user
    return {
        integrations: integrationsSelectors.getFacebookOnboardingPages(state)
    }
})
export default class FacebookIntegrationSetup extends React.Component {
    static propTypes = {
        integrations: ImmutablePropsTypes.list.isRequired,
        actions: PropTypes.object.isRequired,
        loading: PropTypes.object.isRequired,
    }

    componentWillMount() {
        this._initializeState(this.props)
    }

    componentWillReceiveProps(nextProps) {
        if (this.props.integrations.isEmpty() && !nextProps.integrations.isEmpty()) {
            this._initializeState(nextProps)
        }
    }

    _initializeState(props) {
        const pages = {}

        props.integrations
            .forEach((integration) => {
                pages[integration.get('id')] = {
                    page_enabled: false,
                    private_messages_enabled: true,
                    posts_enabled: true,
                    instagram_comments_enabled: !!integration.getIn(['meta', 'instagram', 'id']),
                    import_history_enabled: false,
                }
            })

        this.setState({pages})
    }

    _handleSubmit = (e) => {
        e.preventDefault()
        const {actions, integrations} = this.props

        const data = []

        integrations.forEach((integration) => {
            const settings = this.state.pages[integration.get('id')] || {}

            if (settings.page_enabled) {
                // If the private messages are enabled, then enable messenger by default
                // This is to avoid duplicate messages when receiving the first Messenger message on a new Facebook
                // integration.
                // todo(@martin): when we have completely deactivated `conversations` and use only `messenger`,
                // definitely replace `private_messages_enabled` by `messenger_enabled`
                if (settings.private_messages_enabled) {
                    settings.messenger_enabled = true
                }

                const updated = integration
                    .set('deleted_datetime', null)
                    .mergeDeep({
                        facebook: {
                            settings
                        }
                    })

                data.push(updated.toJS())
            }
        })

        actions.activateFacebookOnboardingPage(data).then(() => actions.fetchIntegrations())
        browserHistory.push('/app/settings/integrations/facebook')
    }

    _onChange = (integration, value, id, name) => {
        this.state.pages[id][name] = value

        const canEnableInstagram = !!integration.getIn(['meta', 'instagram', 'id'])

        // if page_enabled option changes, set the same value for following values
        if (name === 'page_enabled') {
            this.state.pages[id]['private_messages_enabled'] = value
            this.state.pages[id]['posts_enabled'] = value
            this.state.pages[id]['instagram_comments_enabled'] = value && canEnableInstagram
        }

        this.setState(this.state)
    }

    _getValue = (id, key) => {
        return this.state.pages[id][key]
    }

    _renderPages = () => {
        const {integrations} = this.props

        if (integrations.isEmpty()) {
            return null
        }

        return (
            <div>
                {
                    integrations.map((integration) => {
                        const id = integration.get('id')
                        const page = integration.get('facebook')

                        const instagramIsDisabled = !integration.getIn(['meta', 'instagram', 'id'])

                        return (
                            <div
                                key={id}
                                className="mb-5"
                            >
                                <div className="d-flex align-items-center mb-3">
                                    <img
                                        className={classNames('image rounded mr-3', css.icon)}
                                        alt={page.get('name')}
                                        src={page.getIn(['picture', 'data', 'url'])}
                                    />
                                    <div className="d-flex flex-column">
                                        <h3 className="header mb-1">
                                            {page.get('name')}
                                        </h3>
                                        <div className="text-faded">
                                            {_truncate(page.get('about'), {length: 100})}
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <FormGroup>
                                        <BooleanField
                                            name={`${id}.page_enabled`}
                                            type="checkbox"
                                            label="Enable this page"
                                            value={this._getValue(id, 'page_enabled')}
                                            onChange={(value) => this._onChange(integration, value, id, 'page_enabled')}
                                        />
                                        <BooleanField
                                            name={`${id}.private_messages_enabled`}
                                            type="checkbox"
                                            label="Enable Messenger"
                                            value={this._getValue(id, 'private_messages_enabled')}
                                            onChange={(value) => this._onChange(integration, value, id, 'private_messages_enabled')}
                                            disabled={!this._getValue(id, 'page_enabled')}
                                        />
                                        <BooleanField
                                            name={`${id}.posts_enabled`}
                                            type="checkbox"
                                            label="Enable Facebook posts & comments"
                                            value={this._getValue(id, 'posts_enabled')}
                                            onChange={(value) => this._onChange(integration, value, id, 'posts_enabled')}
                                            disabled={!this._getValue(id, 'page_enabled')}
                                        />
                                        <BooleanField
                                            name={`${id}.instagram_comments_enabled`}
                                            type="checkbox"
                                            label="Enable Instagram comments"
                                            value={this._getValue(id, 'instagram_comments_enabled')}
                                            onChange={(value) => this._onChange(integration, value, id, 'instagram_comments_enabled')}
                                            disabled={!this._getValue(id, 'page_enabled') || instagramIsDisabled}
                                        />
                                        <BooleanField
                                            name={`${id}.import_history_enabled`}
                                            type="checkbox"
                                            label="Import 30 days of history (posts, comments and messages) as closed tickets"
                                            value={this._getValue(id, 'import_history_enabled')}
                                            onChange={(value) => this._onChange(integration, value, id, 'import_history_enabled')}
                                            disabled={!this._getValue(id, 'page_enabled')}
                                        />
                                    </FormGroup>
                                </div>
                            </div>
                        )
                    })
                }
            </div>
        )
    }


    render() {
        const {loading} = this.props

        if (loading.get('integration')) {
            return <Loader />
        }

        return (
            <div className="full-width">
                <PageHeader title={(
                    <Breadcrumb>
                        <BreadcrumbItem>
                            <Link to="/app/settings/integrations">Integrations</Link>
                        </BreadcrumbItem>
                        <BreadcrumbItem>
                            <Link to="/app/settings/integrations/facebook">Facebook</Link>
                        </BreadcrumbItem>
                        <BreadcrumbItem active>
                            Facebook Pages setup
                        </BreadcrumbItem>
                    </Breadcrumb>
                )}/>

                <Container fluid className="page-container">
                    <h1>Facebook Pages setup</h1>
                    <p>
                        One last step: choose the pages you want to manage with Gorgias.<br/>
                        If you just wanted to update your integrations or your permissions: it's done,{' '}
                        you can leave this page.
                    </p>


                    <Form onSubmit={this._handleSubmit}>
                        {this._renderPages()}

                        <div className="mt-3">
                            <Button
                                type="submit"
                                color="success"
                                className={classNames({
                                    'btn-loading': loading.get('updateIntegration'),
                                })}
                            >
                                Add Pages
                            </Button>
                        </div>
                    </Form>
                </Container>
            </div>
        )
    }
}

