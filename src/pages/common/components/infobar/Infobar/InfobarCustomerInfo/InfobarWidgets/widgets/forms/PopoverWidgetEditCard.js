import React from 'react'
import PropTypes from 'prop-types'
import {fromJS} from 'immutable'
import {Form, FormGroup, Button} from 'reactstrap'

import {isSimpleTemplateWidget} from '../../../../../utils.tsx'

import BooleanField from '../../../../../../../forms/BooleanField'
import InputField from '../../../../../../../forms/InputField'

class PopoverWidgetEditCard extends React.Component {
    state = {
        title: '',
        link: '',
        displayCard: true,
        limit: '',
        orderBy: '',
    }

    componentDidMount() {
        const {template, parent, isParentList} = this.props

        const cardModel = {
            title: template.get('title', ''),
            link: template.getIn(['meta', 'link'], ''),
            displayCard: template.getIn(['meta', 'displayCard'], true),
        }

        const listModel = {
            limit: parent.getIn(['meta', 'limit'], ''),
            orderBy: parent.getIn(['meta', 'orderBy'], ''),
        }

        // populating the form
        if (isParentList) {
            // editing the parent list AND the card inside that list
            this.setState(Object.assign({}, cardModel, listModel))
        } else {
            // editing only the card
            this.setState(cardModel)
        }
    }

    _closePopup = (e) => {
        if (e) {
            e.stopPropagation()
        }
        this.props.actions.stopWidgetEdition()
    }

    _handleSubmit = (e) => {
        e.preventDefault()
        const {isParentList} = this.props
        const card = {
            title: this.state.title,
            meta: {
                link: this.state.link,
                displayCard: this.state.displayCard,
            },
        }
        const list = {
            meta: {
                limit: this.state.limit,
                orderBy: this.state.orderBy,
            },
        }

        if (isParentList) {
            // saving the parent list AND the card inside that list
            this.props.actions.updateEditedWidget({
                ...list,
                widgets: [{...card}],
            })
        } else {
            // saving only the card
            this.props.actions.updateEditedWidget(card)
        }

        this._closePopup()
    }

    render() {
        const {isParentList, template, editionHiddenFields} = this.props

        let orderByOptions = fromJS([])
        if (isParentList) {
            orderByOptions = template
                .get('widgets', fromJS([]))
                .filter(isSimpleTemplateWidget)
                .map((w) => ({
                    label: w.get('title', ''),
                    value: w.get('path', ''),
                }))
        }

        return (
            <Form onSubmit={this._handleSubmit}>
                <InputField
                    type="text"
                    name="card.title"
                    label="Title"
                    placeholder="Order {{id}}"
                    value={this.state.title}
                    onChange={(title) => this.setState({title})}
                />
                {!editionHiddenFields.includes('link') && (
                    <InputField
                        type="text"
                        name="card.meta.link"
                        label="Link"
                        placeholder="http://myapi.com/{{id}}"
                        value={this.state.link}
                        onChange={(link) => this.setState({link})}
                    />
                )}
                {!editionHiddenFields.includes('displayCard') && (
                    <FormGroup>
                        <BooleanField
                            type="checkbox"
                            name="card.meta.displayCard"
                            label="Display card"
                            value={this.state.displayCard}
                            onChange={(displayCard) =>
                                this.setState({displayCard})
                            }
                        />
                    </FormGroup>
                )}
                {isParentList && [
                    <InputField
                        key="limit"
                        type="number"
                        name="list.meta.limit"
                        label="Limit"
                        placeholder="ex: 0"
                        value={this.state.limit}
                        onChange={(limit) => this.setState({limit})}
                    />,
                    <InputField
                        key="order"
                        type="select"
                        name="list.meta.orderBy"
                        label="Order by"
                        value={this.state.orderBy}
                        onChange={(orderBy) => this.setState({orderBy})}
                    >
                        {orderByOptions.map((option) => {
                            return ['-', '+'].map((order) => {
                                const value = `${order}${option.value}`
                                const label = `${option.label} (${
                                    order === '-' ? 'DESC' : 'ASC'
                                })`

                                return (
                                    <option value={value} key={value}>
                                        {label}
                                    </option>
                                )
                            })
                        })}
                    </InputField>,
                ]}

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

PopoverWidgetEditCard.propTypes = {
    editionHiddenFields: PropTypes.array.isRequired,

    template: PropTypes.object.isRequired,
    actions: PropTypes.object.isRequired,
    isParentList: PropTypes.bool.isRequired,
    parent: PropTypes.object,
}

PopoverWidgetEditCard.defaultProps = {
    editionHiddenFields: [],
    isParentList: false,
}

export default PopoverWidgetEditCard
