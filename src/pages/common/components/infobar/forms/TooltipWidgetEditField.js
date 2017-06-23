import React, {PropTypes} from 'react'
import {Field, reduxForm} from 'redux-form'
import {Form, Button} from 'reactstrap'

import ReduxFormInputField from '../../../forms/ReduxFormInputField'

class TooltipWidgetEditField extends React.Component {
    componentDidMount() {
        const {template} = this.props

        // populating the form
        this.props.initialize({
            title: template.get('title', ''),
            type: template.get('type', '')
        })
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

