import React, {PropTypes} from 'react'
import {Link, browserHistory} from 'react-router'
import classNames from 'classnames'
import truncate from 'lodash/truncate'
import {CheckboxField} from '../../../../common/forms'
import {Loader} from '../../../../common/components/Loader'


class FacebookIntegrationSetup extends React.Component {
    static propTypes = {
        integrations: PropTypes.object.isRequired,
        actions: PropTypes.object.isRequired,
        loading: PropTypes.object.isRequired,
    }

    constructor(props) {
        super()
        this.state = {
            pages: {}
        }

        // setting initial state
        props.integrations.filter(i => i.get('type') === 'facebook').forEach(i => {
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

        integrations.filter(i => i.get('type') === 'facebook').forEach(i => {
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
        if (!integrations) {
            return null
        }

        const facebookIntegrations = integrations.filter(i => i.get('type') === 'facebook')

        return (
            <div className="ui list">
                {facebookIntegrations.map(i => {
                    const id = i.get('id')
                    const page = i.get('facebook')
                    return (
                        <div className="ui item" key={id}>
                            <img className="ui image" alt={page.get('name')}
                                 src={page.getIn(['picture', 'data', 'url'])}
                            />
                            <div className="ui content">
                                <h2 className="header">{page.get('name')}</h2>
                                <p>{truncate(page.get('about'), {length: 100})}</p>
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
                            <br/>
                            <br/>
                        </div>
                    )
                })}
            </div>
        )
    }


    render() {
        const {loading} = this.props

        if (loading.get('integration')) {
            return <Loader />
        }

        return (
            <div className="ui grid">
                <div className="ten wide column">
                    <div className="ui large breadcrumb">
                        <Link to="/app/integrations">Integrations</Link>
                        <i className="right angle icon divider"/>
                        <Link to="/app/integrations/facebook" className="section">Facebook</Link>
                        <i className="right angle icon divider"/>
                        <a className="active section">Facebook Pages Setup</a>
                    </div>

                    <h1>Facebook Pages Setup</h1>
                    <p>One last step. Choose the pages you want to manage with Gorgias.</p>
                </div>
                <div className="ten wide column">
                    <form className="ui form" onSubmit={this._handleSubmit} method="post">
                        {this._renderPages()}
                        <div className="ten wide column">
                            <button className={classNames(['ui', 'green', 'button', {
                                loading: loading.get('updateIntegration')
                            }])}>
                                Finish Setup
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        )
    }
}

export default FacebookIntegrationSetup
