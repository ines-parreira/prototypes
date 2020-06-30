import React from 'react'
import PropTypes from 'prop-types'
import {Form, Button} from 'reactstrap'
import _pick from 'lodash/pick'

import InputField from '../../../../../../../forms/InputField'

class PopoverWidgetEditField extends React.Component {
    state = {
        title: '',
        type: '',
    }

    componentDidMount() {
        const {template} = this.props

        // populating the form
        this.setState({
            title: template.get('title', ''),
            type: template.get('type', ''),
        })
    }

    _closePopup = (e) => {
        if (e) {
            e.stopPropagation()
        }
        this.props.actions.stopWidgetEdition()
    }

    _handleSubmit = (e) => {
        e.preventDefault()
        this.props.actions.updateEditedWidget(
            _pick(this.state, ['title', 'type'])
        )
        this._closePopup()
    }

    render() {
        return (
            <Form onSubmit={this._handleSubmit}>
                <InputField
                    type="text"
                    name="title"
                    label="Title"
                    required
                    value={this.state.title}
                    onChange={(title) => this.setState({title})}
                />
                <InputField
                    type="select"
                    name="type"
                    label="Type"
                    required
                    value={this.state.type}
                    onChange={(type) => this.setState({type})}
                >
                    <option value="text">Text</option>
                    <option value="date">Date</option>
                    <option value="age">Age</option>
                    <option value="url">Url</option>
                    <option value="email">Email</option>
                    <option value="boolean">Boolean (true/false)</option>
                    <option value="array">List</option>
                </InputField>

                <div>
                    <Button color="primary" type="submit" className="mr-2">
                        Submit
                    </Button>
                    <Button
                        color="secondary"
                        type="button"
                        onClick={this._closePopup}
                    >
                        Cancel
                    </Button>
                </div>
            </Form>
        )
    }
}

PopoverWidgetEditField.propTypes = {
    template: PropTypes.object.isRequired,
    actions: PropTypes.object.isRequired,
}

export default PopoverWidgetEditField
