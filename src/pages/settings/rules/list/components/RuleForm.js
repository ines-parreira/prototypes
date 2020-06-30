import React from 'react'
import PropTypes from 'prop-types'
import classnames from 'classnames'
import {Form, Button} from 'reactstrap'

import InputField from '../../../../common/forms/InputField'

const defaultValues = {
    dirty: false,
    submitting: false,
    name: '',
    description: '',
}

class RuleForm extends React.Component {
    state = Object.assign({}, defaultValues)

    _handleSubmit = (e) => {
        e.preventDefault()
        this.setState({
            submitting: true,
        })

        return this.props
            .onSubmit({
                name: this.state.name,
                description: this.state.description,
            })
            .then((res) => {
                this.setState(defaultValues)

                return res
            })
    }

    _updateField = (value) => {
        this.setState(
            Object.assign(
                {
                    dirty: true,
                },
                value
            )
        )
    }

    render() {
        const {onCancel} = this.props

        return (
            <div>
                <Form onSubmit={this._handleSubmit}>
                    <div className="content">
                        <InputField
                            type="text"
                            name="name"
                            label="Name"
                            required
                            value={this.state.name}
                            onChange={(name) => this._updateField({name})}
                        />
                        <InputField
                            type="textarea"
                            name="description"
                            label="Description"
                            rows="3"
                            value={this.state.description}
                            onChange={(description) =>
                                this._updateField({description})
                            }
                        />
                    </div>
                    <div className="actions float-right mt-3">
                        <Button
                            className="mr-2"
                            color="secondary"
                            type="button"
                            onClick={onCancel}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            color="primary"
                            className={classnames({
                                'btn-loading': this.state.submitting,
                            })}
                            disabled={
                                this.state.submitting || !this.state.dirty
                            }
                        >
                            Create rule
                        </Button>
                    </div>
                </Form>
            </div>
        )
    }
}

RuleForm.propTypes = {
    onSubmit: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired,
}

export default RuleForm
