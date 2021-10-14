import React from 'react'
import PropTypes from 'prop-types'
import {Form, Button} from 'reactstrap'
import _pick from 'lodash/pick'

import {IntegrationType} from '../../../../../../../../../models/integration/types/index.ts'

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
        let path = this.props.template.get('path')
        if (Array.isArray(path) && path.length) path = path[0]
        const widgetType = this.props.widget.get('type')
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
                    {path === 'tags' &&
                        widgetType === IntegrationType.Shopify && (
                            <option value="editableList">Editable List</option>
                        )}
                    <option value="array">List</option>
                    <option value="sentiment">Sentiment</option>
                    <option value="rating">Rating</option>
                    <option value="points">Points</option>
                    <option value="percent">Percent</option>
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
    widget: PropTypes.object.isRequired,
}

export default PopoverWidgetEditField
