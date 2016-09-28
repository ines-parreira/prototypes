import React, {PropTypes} from 'react'

export default class ShowMoreFieldsDropdown extends React.Component {
    componentDidMount = () => {
        $(this.refs.showmoreButton)
            .popup({
                distanceAway: 6,
                offset: 11,
                popup: $(this.refs.showmorePopup),
                on: 'click',
                position: 'bottom right',
                onVisible: () => amplitude.getInstance().logEvent('Opened more fields (column options)')
            })
    }

    setVisible(field) {
        $(this.refs.showmoreButton).popup('hide')
        return this.props.updateField(
            field.set('visible', !field.get('visible'))
        )
    }

    render() {
        return (
            <th className="show-more-fields-dropdown">
                <div className="show-more-fields-dropdown-icon">
                    <i
                        ref="showmoreButton"
                        className="block layout icon"
                        title="Show more fields"
                    />
                </div>
                <div
                    ref="showmorePopup"
                    className="ui popup"
                >
                    <div className="ui form">
                        <div className="grouped fields">
                            {
                                this.props.view
                                    .get('fields')
                                    .sortBy(f => f.get('display_order'))
                                    .map((field) => (
                                        <div
                                            className="field"
                                            key={field.get('name')}
                                        >
                                            <div className="ui checkbox">
                                                <input
                                                    id="field-visibility-{field.get('name')}"
                                                    type="checkbox"
                                                    name={field.get('name')}
                                                    checked={field.get('visible')}
                                                    onChange={() => this.setVisible(field)}
                                                />
                                                <label htmlFor="field-visibility-{field.get('name')}">
                                                    {field.get('title')}
                                                </label>
                                            </div>
                                        </div>
                                    ))
                            }
                        </div>
                    </div>
                </div>
            </th>
        )
    }
}

ShowMoreFieldsDropdown.propTypes = {
    updateField: PropTypes.func,
    view: PropTypes.object
}
