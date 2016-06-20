import React, {PropTypes} from 'react'
import Immutable from 'immutable'
import SearchInput from 'react-search-input'

export default class MacroList extends React.Component {
    constructor() {
        super()
        this.state = {searchTerm: ''}
    }

    searchUpdated = (term) => {
        this.setState({searchTerm: term}) // Necessary for re-render
    }

    render() {
        const {macros, currentMacro, actions} = this.props

        /** Used to replace the list of all macros with the list of macros corresponding to the current search term,
         *  if there is a current search term.
         */
        const curMacros = this.refs.search ? Immutable.fromJS(macros.valueSeq().toJS().filter(this.refs.search.filter(['name']))) : macros

        return (
            <div style={{ height: '100%' }}>
                <div className="ui secondary vertical fluid menu">
                    <div className="ui category search item">
                        <div className="ui icon input">
                            <SearchInput
                                ref="search"
                                onChange={this.searchUpdated}
                                className="ui icon input full-width prompt"
                                placeholder="Search for a macro"
                            />
                            <i className="search icon"/>
                        </div>
                    </div>
                    {
                        curMacros.map(macro => (
                            <a
                                className={`item ${macro.get('id') === currentMacro.get('id') ? 'active' : ''}`}
                                key={macro.get('id')}
                                onClick={() => actions.previewMacroInModal(macro.get('id'))}
                            >
                                {macro.get('name')}
                            </a>
                        ))
                    }
                </div>
                <div className="button-wrapper">
                    <div className="ui basic light blue fluid button" onClick={actions.addNewMacro}>Create macro</div>
                </div>
            </div>
        )
    }
}

MacroList.propTypes = {
    macros: PropTypes.object.isRequired,
    currentMacro: PropTypes.object,
    actions: PropTypes.object.isRequired
}
