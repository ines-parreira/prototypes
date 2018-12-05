import React, {PropTypes} from 'react'
import ImmutablePropsTypes from 'react-immutable-proptypes'
import {connect} from 'react-redux'
import {Link, browserHistory} from 'react-router'
import classnames from 'classnames'
import _truncate from 'lodash/truncate'
import _some from 'lodash/some'
import {
    Form,
    FormGroup,
    Breadcrumb,
    BreadcrumbItem,
    Button,
    Container,
    Alert,
} from 'reactstrap'

import Loader from '../../../../common/components/Loader'

import BooleanField from '../../../../common/forms/BooleanField'

import * as integrationsSelectors from '../../../../../state/integrations/selectors'

import css from './FacebookIntegrationSetup.less'
import PageHeader from '../../../../common/components/PageHeader'

import pageIconDefault from '../../../../../../img/integrations/facebook-page.png'
import ToggleButton from '../../../../common/components/ToggleButton'

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
                    messenger_enabled: true,
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
            this.state.pages[id]['messenger_enabled'] = value
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
            <div className="mb-4">
                <p className="font-weight-medium">
                    We found {integrations.size} pages associated with your account.{' '}
                    Please activate the pages you want to use with Gorgias:
                </p>

                {
                    integrations.map((integration) => {
                        const id = integration.get('id')
                        const page = integration.get('facebook')

                        const instagramIsDisabled = !integration.getIn(['meta', 'instagram', 'id'])
                        const pageEnabled = this._getValue(id, 'page_enabled')

                        return (
                            <div
                                key={id}
                                className={classnames(css.page, {
                                    [css.enabled]: !!pageEnabled
                                })}
                            >
                                <div className="d-flex flex-wrap flex-md-nowrap">
                                    <div className="mr-auto">
                                        <div>
                                            <img
                                                className={classnames('image rounded mr-3 mb-2 mb-md-0', css.icon)}
                                                src={page.getIn(['picture', 'data', 'url'], pageIconDefault)}
                                            />
                                            <div className={classnames(css.details, 'mr-3 text-faded')}>
                                                <h3 className={classnames(css.name, 'mr-3')}>
                                                    {page.get('name')}
                                                </h3>
                                                <span>{_truncate(page.get('about'), {length: 100})}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <ToggleButton
                                        value={pageEnabled}
                                        onChange={(value) => this._onChange(integration, value, id, 'page_enabled')}
                                    />
                                </div>

                                <div className={css.settings}>
                                    <p className="font-weight-medium">
                                        Choose the Facebook channels you want to use to communicate with your customers:
                                    </p>

                                    <div className="d-md-flex">
                                        <FormGroup className="mr-5">
                                            <BooleanField
                                                name={`${id}.messenger_enabled`}
                                                type="checkbox"
                                                label="Enable Messenger"
                                                value={this._getValue(id, 'messenger_enabled')}
                                                onChange={(value) => this._onChange(integration, value, id, 'messenger_enabled')}
                                            />
                                            <BooleanField
                                                name={`${id}.posts_enabled`}
                                                type="checkbox"
                                                label="Enable Facebook posts & comments"
                                                value={this._getValue(id, 'posts_enabled')}
                                                onChange={(value) => this._onChange(integration, value, id, 'posts_enabled')}
                                            />
                                            {!instagramIsDisabled && (
                                                <BooleanField
                                                    name={`${id}.instagram_comments_enabled`}
                                                    type="checkbox"
                                                    label="Enable Instagram comments"
                                                    value={this._getValue(id, 'instagram_comments_enabled')}
                                                    onChange={(value) => this._onChange(integration, value, id, 'instagram_comments_enabled')}
                                                />
                                            )}
                                        </FormGroup>
                                        {instagramIsDisabled && (
                                            <div>
                                                <Alert
                                                    color="warning"
                                                    className="d-flex align-items-center"
                                                >
                                                    <i className="material-icons md-3 mr-3">
                                                        warning
                                                    </i>
                                                    Create an Instagram account for this page and you will be able to
                                                    enable Instagram comments.
                                                </Alert>
                                            </div>
                                        )}
                                    </div>

                                    <p className="font-weight-medium">
                                        Import your Facebook data:
                                    </p>
                                    <div className="d-md-flex">
                                        <FormGroup className="mr-5">
                                            <BooleanField
                                                name={`${id}.import_history_enabled`}
                                                type="checkbox"
                                                label="Import 30 days of history (posts and comments) as closed tickets"
                                                value={this._getValue(id, 'import_history_enabled')}
                                                onChange={(value) => this._onChange(integration, value, id, 'import_history_enabled')}
                                            />
                                        </FormGroup>
                                    </div>
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
            return <Loader/>
        }

        const pagesEnabled = _some(this.state.pages, 'page_enabled')

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
                    <h1>Facebook pages setup</h1>
                    <p>
                        One last step: choose the pages you want to manage with Gorgias.
                        <br/>
                        If you just wanted to re-activate your facebook integration or update your permissions:
                        it's done, you can leave this page.
                    </p>

                    <Form onSubmit={this._handleSubmit}>
                        {this._renderPages()}

                        <div>
                            <Button
                                type="submit"
                                color="success"
                                disabled={!pagesEnabled}
                                className={classnames({
                                    'btn-loading': loading.get('updateIntegration'),
                                })}
                            >
                                Save Changes
                            </Button>
                        </div>
                    </Form>
                </Container>
            </div>
        )
    }
}

