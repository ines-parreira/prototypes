import React, {PropTypes} from 'react'
import ReactDOM from 'react-dom'
import {Field, reduxForm} from 'redux-form'
import {Form, Button} from 'reactstrap'

import ReduxFormInputField from '../../../forms/ReduxFormInputField'

class TooltipWidgetEditField extends React.Component {
    componentDidMount() {
        const {template} = this.props

        document.addEventListener('click', this._onClickOutside, false)

        // populating the form
        this.props.initialize({
            title: template.get('title', ''),
            type: template.get('type', '')
        })
    }

    componentWillUnmount() {
        document.removeEventListener('click', this._onClickOutside, false)
    }

    _preventPropagation = (e) => {
        e.stopPropagation()
    }

    _onClickOutside = (e) => {
        if (!ReactDOM.findDOMNode(this).contains(e.target)) {
            this._closePopup(e)
        }
    }

    _closePopup = (e) => {
        if (e) {
            e.stopPropagation()
        }
        this.props.actions.stopWidgetEdition()
    }

    _handleSubmit = (values) => {
        this.props.actions.updateEditedWidget(values)
        this._closePopup()
    }

    render() {
        const {handleSubmit} = this.props

        return (
            <div
                className="ui popup fake-popup bottom left visible"
                onClick={this._preventPropagation}
            >
                <div className="content">
                    <Form onSubmit={handleSubmit(this._handleSubmit)}>
                        <Field
                            type="text"
                            name="title"
                            label="Title"
                            required
                            component={ReduxFormInputField}
                        />
                        <Field
                            type="select"
                            name="type"
                            label="Type"
                            required
                            component={ReduxFormInputField}
                        >
                            <option value="text">Text</option>
                            <option value="date">Date</option>
                            <option value="age">Age</option>
                            <option value="url">Url</option>
                            <option value="email">Email</option>
                            <option value="boolean">Boolean (true/false)</option>
                            <option value="array">List</option>
                        </Field>

                        <div>
                            <Button
                                color="primary"
                                type="submit"
                                className="mr-2"
                            >
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
                </div>
            </div>
        )
    }
}

TooltipWidgetEditField.propTypes = {
    initialize: PropTypes.func.isRequired,
    handleSubmit: PropTypes.func.isRequired,
    template: PropTypes.object.isRequired,
    actions: PropTypes.object.isRequired
}

export default reduxForm({
    form: 'tooltipWidgetField',
})(TooltipWidgetEditField)

