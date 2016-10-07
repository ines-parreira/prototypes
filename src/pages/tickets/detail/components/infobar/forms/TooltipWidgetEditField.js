import React, {PropTypes} from 'react'
import ReactDOM from 'react-dom'
import {Field, reduxForm} from 'redux-form'
import {InputField, SelectField} from '../../../../../common/components/semantic'

class TooltipWidgetEditField extends React.Component {
    componentDidMount() {
        const {widget} = this.props

        document.addEventListener('click', this._onClickOutside, false)

        // populating the form
        this.props.initialize({
            title: widget.get('title', ''),
            type: widget.get('type', '')
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
                    <form
                        className="ui form"
                        onSubmit={handleSubmit(this._handleSubmit)}
                    >
                        <Field
                            label="Title"
                            name="title"
                            required
                            component={InputField}
                        />
                        <Field
                            label="Type"
                            name="type"
                            required
                            component={SelectField}
                        >
                            <option value="text">Text</option>
                            <option value="date">Date</option>
                            <option value="age">Age</option>
                            <option value="url">Url</option>
                            <option value="email">Email</option>
                            <option value="boolean">Boolean (true/false)</option>
                            <option value="array">List</option>
                        </Field>
                        <div className="two fields">
                            <div className="field">
                                <button
                                    className="ui tiny fluid green button"
                                    type="submit"
                                >
                                    Submit
                                </button>
                            </div>
                            <div className="field">
                                <button
                                    className="ui tiny fluid basic button"
                                    type="button"
                                    onClick={this._closePopup}
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        )
    }
}

TooltipWidgetEditField.propTypes = {
    initialize: PropTypes.func.isRequired,
    handleSubmit: PropTypes.func.isRequired,
    widget: PropTypes.object.isRequired,
    actions: PropTypes.object.isRequired
}

export default reduxForm({
    form: 'tooltipWidgetField',
})(TooltipWidgetEditField)

