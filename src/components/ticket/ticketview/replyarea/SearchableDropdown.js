import React, {PropTypes} from 'react'
import _ from 'lodash'
import { validateEmail } from './../../../../utils'

export default class SearchableDropdown extends React.Component {

    componentWillMount() {
        // http://stackoverflow.com/questions/31283360/are-htmlcollection-and-nodelist-iterables
        // Using `for of` with HTMLCollection does not work with Chrome < 51, we're polyfilling to make it work.
        HTMLCollection.prototype[Symbol.iterator] = Array.prototype[Symbol.iterator];
    }
    componentDidMount() {
        const receiverDropdown = $(`#receiver-dropdown-${this.props.suffix}`)

        receiverDropdown.dropdown({
            allowAdditions: this.props.sourceType === 'email',
            onAdd: this.props.addValue,
            onRemove: this.props.removeValue
        })

        const searchInput = $(`#receiver-dropdown-${this.props.suffix} input.search`)

        searchInput.on('keyup', _.throttle((e) => {
            this.props.search(e.target.value)
        }, this.props.searchDebounceTime || 200))

        searchInput.on('blur', (e) => {
            if (this.props.sourceType === 'email' && validateEmail(e.target.value)) {
                receiverDropdown.dropdown('set selected', e.target.value)
                searchInput.val('')
            }
        })

        searchInput.attr('tabindex', 2)

        receiverDropdown.dropdown('set exactly', this.props.defaultValues.toJS())
    }

    /**
     * This method is used for repopulating the field when switching between tickets.
     *
     * It also handles the deletion of the 'Add...' item in the recipient-search dropdown, and the reselection of
     * another item of the dropdown.
     *
     * @param prevProps {Object}
     */
    componentDidUpdate(prevProps) {
        const receiverDropdown = $(`#receiver-dropdown-${this.props.suffix}`)

        // Take the ticketId AND the lastMessageId into account
        if (prevProps.parentId !== this.props.parentId && !prevProps.existingValues.equals(this.props.existingValues)) {
            receiverDropdown.dropdown('refresh')
            receiverDropdown.dropdown('set exactly', this.props.defaultValues.toJS())
        }

        if (prevProps.sourceType !== this.props.sourceType) {
            receiverDropdown.dropdown({
                allowAdditions: this.props.sourceType === 'email',
                onAdd: this.props.addValue,
                onRemove: this.props.removeValue
            })

            receiverDropdown.dropdown('set exactly', this.props.defaultValues.toJS())
        }

        if (this.refs.dropdownMenu.children.length < 2) {
            this.refs.dropdownMenu.style.border = 'none'
        } else {
            this.refs.dropdownMenu.style.border = ''

            let hasSelected = false;

            for (const child of this.refs.dropdownMenu.children) {
                if (_.includes(child.classList, 'addition') || _.includes(child.classList, 'message')) {
                    // If there is an addition item ('Add...') or a 'No results found' item in addition of other items, delete it
                    this.refs.dropdownMenu.removeChild(child)
                } else if (
                    _.includes(child.classList, 'selected') && !_.includes(child.classList, 'filtered')
                ) {
                    // If there's a non-filtered (i.e. displayed) selected item, we're good
                    hasSelected = true
                }
            }

            if (!hasSelected) {
                // If we don't have this selected item, we need to define the first non-filtered item as selected
                for (const child of Object.keys(this.refs.dropdownMenu.children)) {
                    if (child.classList && !_.includes(child.classList, 'filtered')
                    ) {
                        child.classList.add('selected')
                        break
                    }
                }
            }
        }
    }

    componentWillUnmount() {
        $(`#receiver-dropdown-${this.props.suffix}`).dropdown('destroy')
    }

    render() {
        const {optionValues, existingValues, suffix, enabled, valueProp} = this.props
        const isPopulated = $(`#receiver-dropdown-${this.props.suffix}`).dropdown('get value').length

        return (
            <div
                id={`receiver-dropdown-${suffix}`} multiple=""
                className={`SearchableDropdown ui inline multiple search selection floating dropdown ${enabled ? '' : 'disabled'}`}
            >
                <input type="hidden" name="receivers"/>
                <div className="default text">Choose some recipients</div>
                <div className="menu" ref="dropdownMenu">
                    {
                        optionValues.map(requester => {
                            if (!isPopulated || !~existingValues.indexOf(requester.get(valueProp))) {
                                return (
                                    <div
                                        key={`${requester.get('id')}-${requester.get(valueProp)}`}
                                        data-value={requester.get(valueProp)}
                                        data-text={`${requester.get('name')} &lt;${requester.get(valueProp)}&gt;`}
                                        className="item"
                                    >
                                        <i className="user icon"/>{`${requester.get('name')} <${requester.get(valueProp)}>`}
                                    </div>
                                )
                            }
                            return null
                        })
                    }
                </div>
            </div>
        )
    }
}

SearchableDropdown.propTypes = {
    defaultValues: PropTypes.object.isRequired, // the values which should populate the field when it mounts
    existingValues: PropTypes.object.isRequired, // the list of values already chosen
    optionValues: PropTypes.object.isRequired, // the list of possible choices

    search: PropTypes.func.isRequired, // the action to trigger to search for new options
    searchDebounceTime: PropTypes.number, // optional: throttling delay between each search

    addValue: PropTypes.func.isRequired, // the callback to call when adding a new value
    removeValue: PropTypes.func.isRequired, // the callback to call when removing a value

    enabled: PropTypes.bool.isRequired, // whether the dropdown should allow user interactions or not
    suffix: PropTypes.string.isRequired, // the id suffix
    parentId: PropTypes.string.isRequired, // the id of the parent object, to check if the field needs to be repopulated

    valueProp: PropTypes.string.isRequired, // the property to display from the object
    sourceType: PropTypes.string.isRequired
}
