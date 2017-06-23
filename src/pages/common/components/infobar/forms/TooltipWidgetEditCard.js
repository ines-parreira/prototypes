import React, {PropTypes} from 'react'
import {Field, reduxForm} from 'redux-form'
import {fromJS} from 'immutable'
import {Form, FormGroup, Button} from 'reactstrap'

import {isSimpleTemplateWidget} from '../utils'

import ReduxFormInputField from '../../../forms/ReduxFormInputField'
import BooleanField from '../../../forms/BooleanField'

class TooltipWidgetEditCard extends React.Component {
    componentDidMount() {
        const {template, parent, isParentList} = this.props

        const cardModel = {
            title: template.get('title', ''),
            // we need to specify the initial values for each field
            // otherwise they will not be sent if they are empty
            meta: fromJS({
                link: '',
                displayCard: true
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
            <Form onSubmit={handleSubmit(this._handleSubmit)}>
                <Field
                    type="text"
                    name="card.title"
                    label="Title"
                    placeholder="Order {id}"
                    component={ReduxFormInputField}
                />
                {
                    !editionHiddenFields.includes('link') && (
                        <Field
                            type="text"
                            name="card.meta.link"
                            label="Link"
                            placeholder="http://myapi.com/{id}"
                            component={ReduxFormInputField}
                        />
                    )
                }
                {
                    !editionHiddenFields.includes('displayCard') && (
                        <FormGroup>
                            <Field
                                type="checkbox"
                                name="card.meta.displayCard"
                                label="Display card"
                                component={ReduxFormInputField}
                                tag={BooleanField}
                            />
                        </FormGroup>
                    )
                }
                {
                    isParentList && [
                        <Field
                            key="limit"
                            type="number"
                            name="list.meta.limit"
                            label="Limit"
                            placeholder="ex: 0"
                            component={ReduxFormInputField}
                        />,
                        <Field
                            key="order"
                            type="select"
                            name="list.meta.orderBy"
                            label="Order by"
                            component={ReduxFormInputField}
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
