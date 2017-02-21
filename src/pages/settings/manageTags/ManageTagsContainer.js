import {connect} from 'react-redux'
import ManageTags from './components/ManageTags'
import {fetchTags, edit, cancel, save, create, remove, select, selectAll, setPage} from '../../../state/tags/actions'

function mapPropsToState(state) {
    return {
        tags: state.tags
    }
}

export default connect(mapPropsToState, {
    fetch: fetchTags,
    edit,
    cancel,
    save,
    create,
    remove,
    select,
    selectAll,
    setPage
})(ManageTags)
