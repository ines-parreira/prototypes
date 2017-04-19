import React, {PropTypes} from 'react'
import ReactDOM from 'react-dom'
import {Field, reduxForm} from 'redux-form'
import {fromJS} from 'immutable'
import {InputField, SelectField} from '../../../forms'
import {isSimpleTemplateWidget} from '../utils'

class TooltipWidgetEditCard extends React.Component {
    componentDidMount() {
        const {template, parent, isParentList} = this.props

        document.addEventListener('click', this._onClickOutside, false)

        const cardModel = {
            title: template.get('title', ''),
            // we need to specify the initial values for each field
            // otherwise they will not be sent if they are empty
            meta: fromJS({
                link: ''
            }).merge(template.get('meta', fromJS({}))).toJS()
        }

        const listModel = {
            // we need to specify the initial values for each field
            // otherwise they will not be sent if they are empty
            meta: fromJS({
                limit: '',
                orderBy: ''
            }).merge(parent.get('meta', fromJS({}))).toJS()
        }

        // populating the form
        if (isParentList) {
            // editing the parent list AND the card inside that list
            this.props.initialize({
                card: cardModel,
                list: listModel,
            })
        } else {
            // editing only the card
            this.props.initialize({
                card: cardModel,
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
        const {handleSubmit, isParentList, template, editionHiddenFields} = this.props

        let orderByOptions = fromJS([])
        if (isParentList) {
            orderByOptions = template
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
                            placeholder="Order {id}"
                            component={InputField}
                        />
                        {
                            !editionHiddenFields.includes('link') && (
                                <Field
                                    label="Link"
                                    name="card.meta.link"
                                    placeholder="http://myapi.com/{id}"
                                    component={InputField}
                                />
                            )
                        }
                        {
                            isParentList && [
                                <Field
                                    key="limit"
                                    label="Limit"
                                    type="number"
                                    name="list.meta.limit"
                                    placeholder="Limit"
                                    component={InputField}
                                />,
                                <Field
                                    key="order"
                                    label="Order by"
                                    name="list.meta.orderBy"
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
                            ]
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
    editionHiddenFields: PropTypes.array.isRequired,

    initialize: PropTypes.func.isRequired,
    handleSubmit: PropTypes.func.isRequired,
    template: PropTypes.object.isRequired,
    actions: PropTypes.object.isRequired,
    isParentList: PropTypes.bool.isRequired,
    parent: PropTypes.object
}

TooltipWidgetEditCard.defaultProps = {
    editionHiddenFields: [],
    isParentList: false,
}

export default reduxForm({
    form: 'tooltipWidgetCard',
})(TooltipWidgetEditCard)
