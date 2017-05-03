import React, {PropTypes} from 'react'
import {connect} from 'react-redux'
import classnames from 'classnames'
import {Link} from 'react-router'
import {
    Table,
    Form,
    Button,
    Breadcrumb,
    BreadcrumbItem,
} from 'reactstrap'

import {InputField, SelectField} from '../../common/forms'

import * as actions from '../../../state/agents/actions'

@connect(null, {
    createAgents: actions.createAgents,
})
export default class Add extends React.Component {
    static propTypes = {
        createAgents: PropTypes.func.isRequired,
    }

    state = {
        agents: [],
        errors: {},
        isSubmitting: false,
    }

    componentDidMount() {
        this._insertEmptyAgent()
    }

    _insertEmptyAgent = () => {
        const {agents} = this.state
        agents.push({
            name: '',
            email: '',
            role: 'agent',
        })
        this.setState({agents})
    }

    _removeAgent = (index) => {
        const {agents} = this.state
        agents.splice(index, 1)
        this.setState({agents})
    }

    _setAgentValue = (index, key, value) => {
        const {agents} = this.state
        agents[index][key] = value
        this.setState({agents})
    }

    _onCreate = (e) => {
        e.preventDefault()
        const form = this.state.agents
        return this.props.createAgents(form)
    }

    render() {
        return (
            <div>
                <Breadcrumb>
                    <BreadcrumbItem>
                        <Link to="/app/settings/team">Team members</Link>
                    </BreadcrumbItem>
                    <BreadcrumbItem active>
                        Add agents
                    </BreadcrumbItem>
                </Breadcrumb>

                <h1 className="mb-3">
                    Add agents
                </h1>

                <p>
                    Fill the information of the team members you want to invite on your team.
                </p>

                <Form onSubmit={this._onCreate}>
                    <Table>
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Role</th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                this.state.agents.map((agent, index) => {
                                    return (
                                        <tr key={index}>
                                            <td className="align-middle">
                                                <InputField
                                                    placeholder="Name"
                                                    input={{
                                                        value: agent.name,
                                                        onChange: e => this._setAgentValue(index, 'name', e.target.value),
                                                    }}
                                                    required
                                                />
                                            </td>
                                            <td className="align-middle">
                                                <InputField
                                                    placeholder="Email"
                                                    type="email"
                                                    input={{
                                                        value: agent.email,
                                                        onChange: e => this._setAgentValue(index, 'email', e.target.value),
                                                    }}
                                                    required
                                                />
                                            </td>
                                            <td className="align-middle">
                                                <SelectField
                                                    input={{
                                                        value: agent.role,
                                                        onChange: value => this._setAgentValue(index, 'role', value),
                                                    }}
                                                    required
                                                >
                                                    <option value="agent">Agent</option>
                                                    <option value="admin">Admin</option>
                                                </SelectField>
                                            </td>
                                            <td className="smallest">
                                                <Button
                                                    color="danger"
                                                    type="button"
                                                    outline
                                                    onClick={() => this._removeAgent(index)}
                                                >
                                                    Remove
                                                </Button>
                                            </td>
                                        </tr>
                                    )
                                })
                            }
                        </tbody>
                    </Table>

                    <div>
                        <Button
                            type="button"
                            color="secondary"
                            size="sm"
                            onClick={this._insertEmptyAgent}
                        >
                            <i className="fa fa-fw fa-plus fa-mr-2" />
                            Add line
                        </Button>
                    </div>

                    <div className="mt-3">
                        <Button
                            color="primary"
                            className={classnames({
                                'btn-loading': this.state.isSubmitting,
                            })}
                            disabled={this.state.isSubmitting || this.state.agents.length === 0}
                        >
                            Send invites
                        </Button>
                    </div>
                </Form>
            </div>
        )
    }
}
