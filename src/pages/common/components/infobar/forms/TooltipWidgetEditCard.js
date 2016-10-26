import React, {PropTypes} from 'react'
import ReactDOM from 'react-dom'
import {Field, reduxForm} from 'redux-form'
import {fromJS} from 'immutable'
import {InputField, SelectField} from '../../formFields'
import {isSimpleTemplateWidget} from '../utils'

class TooltipWidgetEditCard extends React.Component {
    componentDidMount() {
        const {widget, parent, isParentList} = this.props

        document.addEventListener('click', this._onClickOutside, false)

        // populating the form
        if (isParentList) {
            // editing the parent list AND the card inside that list
            this.props.initialize({
                card: {
                    title: widget.get('title', ''),
                },
                list: {
                    // we really need to specify the initial values for each field
                    // otherwise they will not be sent if they are empty
                    meta: fromJS({
                        limit: '',
                        orderBy: ''
                    }).merge(parent.get('meta', fromJS({}))).toJS()
                }
            })
        } else {
            // editing only the card
            this.props.initialize({
                card: {
                    title: widget.get('title', ''),
                },
            })
        }
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
        const {isParentList} = this.props

        if (isParentList) {
            // saving the parent list AND the card inside that list
            this.props.actions.updateEditedWidget({
                ...values.list,
                widgets: [{...values.card}]
            })
        } else {
            // saving only the card
            this.props.actions.updateEditedWidget(values.card)
        }

        this._closePopup()
    }

    render() {
        const {handleSubmit, isParentList, widget} = this.props

        let orderByOptions = fromJS([])
        if (isParentList) {
            orderByOptions = widget
                .get('widgets', fromJS([]))
                .filter(isSimpleTemplateWidget)
                .map((w) => ({
                    label: w.get('title', ''),
                    value: w.get('path', '')
                }))
        }

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
                            name="card.title"
                            component={InputField}
                        />
                        {
                            isParentList && (
                                <div className="field">
                                    <Field
                                        label="Limit"
                                        type="number"
                                        name="list.meta.limit"
                                        placeholder="Limit"
                                        component={InputField}
                                    />
                                    <Field
                                        label="Order by"
                                        name="list.meta.orderBy"
                                        direction="upward"
                                        component={SelectField}
                                    >
                                        {
                                            orderByOptions
                                                .map((option) => {
                                                    return ['-', '+']
                                                        .map((order) => {
                                                            const value = `${order}${option.value}`
                                                            const label = `${option.label} (${order === '-' ? 'DESC' : 'ASC'})`

                                                            return (
                                                                <option
                                                                    value={value}
                                                                    key={value}
                                                                >
                                                                    {label}
                                                                </option>
                                                            )
                                                        })
                                                })
                                        }
                                    </Field>
                                </div>
                            )
                        }
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

TooltipWidgetEditCard.propTypes = {
    initialize: PropTypes.func.isRequired,
    handleSubmit: PropTypes.func.isRequired,
    widget: PropTypes.object.isRequired,
    actions: PropTypes.object.isRequired,
    isParentList: PropTypes.bool.isRequired,
    parent: PropTypes.object
}

TooltipWidgetEditCard.defaultProps = {
    isParentList: false
}

export default reduxForm({
    form: 'tooltipWidgetCard',
})(TooltipWidgetEditCard)
