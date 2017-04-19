import React, {PropTypes} from 'react'
import ImmutablePropsTypes from 'react-immutable-proptypes'
import {connect} from 'react-redux'
import {Link, browserHistory} from 'react-router'
import classNames from 'classnames'
import _truncate from 'lodash/truncate'
import {
    Breadcrumb,
    BreadcrumbItem,
    Button,
} from 'reactstrap'

import {CheckboxField} from '../../../../common/forms'
import {Loader} from '../../../../common/components/Loader'

import * as integrationsSelectors from '../../../../../state/integrations/selectors'

@connect((state) => {
    return {
        integrations: integrationsSelectors.getFacebookIntegrations(state),
    }
})
export default class FacebookIntegrationSetup extends React.Component {
    static propTypes = {
        integrations: ImmutablePropsTypes.list.isRequired,
        actions: PropTypes.object.isRequired,
        loading: PropTypes.object.isRequired,
    }

    constructor(props) {
        super()
        this.state = {
            pages: {}
        }

        // setting initial state
        props.integrations.forEach(i => {
            this.state.pages[i.get('id')] = {
                page_enabled: true,
                private_messages_enabled: true,
                posts_enabled: true,
                import_history_enabled: false,
            }
        })
    }

    _handleSubmit = (e) => {
        e.preventDefault()
        const {actions, integrations} = this.props

        integrations.forEach(i => {
            const settings = this.state.pages[i.get('id')]
            if (settings.page_enabled) {
                delete settings.page_enabled
                const updated = i.set('deactivated_datetime', null).mergeDeep({
                    facebook: {
                        settings
                    }
                })
                actions.updateOrCreateIntegration(updated, 'onboard')
            }
        })
        browserHistory.push('/app/integrations/facebook')
    }

    _onChange = (event) => {
        const [id, name] = event.target.name.split('.')
        this.state.pages[id][name] = event.target.checked
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
            <div className="ui list">
                {
                    integrations.map(i => {
                        const id = i.get('id')
                        const page = i.get('facebook')
                        return (
                            <div
                                className="ui item mb-4"
                                key={id}
                            >
                                <div className="d-flex align-items-center mb-3">
                                    <img
                                        className="ui image rounded mr-3"
                                        alt={page.get('name')}
                                        src={page.getIn(['picture', 'data', 'url'])}
                                    />
                                    <div className="d-flex flex-column">
                                        <h2 className="header">
                                            {page.get('name')}
                                        </h2>
                                        <p className="text-faded">
                                            {_truncate(page.get('about'), {length: 100})}
                                        </p>
                                    </div>
                                </div>
                                <div className="ui content">
                                    <div className="field">
                                        <CheckboxField
                                            label="Enable this page"
                                            name={`${id}.page_enabled`}
                                            input={{
                                                value: this._getValue(id, 'page_enabled'),
                                                onChange: this._onChange,
                                            }}
                                        />
                                    </div>
                                    <div className="field">
                                        <CheckboxField
                                            label="Enable Facebook Messenger"
                                            name={`${id}.private_messages_enabled`}
                                            input={{
                                                value: this._getValue(id, 'private_messages_enabled'),
                                                disabled: !this._getValue(id, 'page_enabled'),
                                                onChange: this._onChange,
                                            }}
                                        />
                                    </div>
                                    <div className="field">
                                        <CheckboxField
                                            label="Enable Facebook Posts & Comments"
                                            name={`${id}.posts_enabled`}
                                            input={{
                                                value: this._getValue(id, 'posts_enabled'),
                                                disabled: !this._getValue(id, 'page_enabled'),
                                                onChange: this._onChange,
                                            }}
                                        />
                                    </div>
                                    <div className="field">
                                        <CheckboxField
                                            label="Import 30 days of history (posts, comments and messages) as closed tickets"
                                            name={`${id}.import_history_enabled`}
                                            input={{
                                                value: this._getValue(id, 'import_history_enabled'),
                                                disabled: !this._getValue(id, 'page_enabled'),
                                                onChange: this._onChange,
                                            }}
                                        />
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
            return <Loader />
        }

        return (
            <div>
                <Breadcrumb>
                    <BreadcrumbItem>
                        <Link to="/app/integrations">Integrations</Link>
                    </BreadcrumbItem>
                    <BreadcrumbItem>
                        <Link to="/app/integrations/facebook">Facebook</Link>
                    </BreadcrumbItem>
                    <BreadcrumbItem active>
                        Facebook Pages setup
                    </BreadcrumbItem>
                </Breadcrumb>

                <h1>Facebook Pages setup</h1>
                <p>One last step: choose the pages you want to manage with Gorgias.</p>

                <form
                    className="ui form"
                    onSubmit={this._handleSubmit}
                >
                    {this._renderPages()}

                    <div className="mt-3">
                        <Button
                            color="primary"
                            className={classNames({
                                'btn-loading': loading.get('updateIntegration'),
                            })}
                        >
                            Finish setup
                        </Button>
                    </div>
                </form>
            </div>
        )
    }
}

