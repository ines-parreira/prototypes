import React, {PropTypes, Component} from 'react'
import {Link} from 'react-router'
import {fromJS} from 'immutable'
import {compactInteger} from '../../../../utils'
import classnames from 'classnames'
import css from './ViewNavbarView.less'
import {getPluralObjectName} from '../../../../utils'

// Component used to display a list of views in the navbar
class ViewNavbarView extends Component {
    static propTypes = {
        views: PropTypes.object.isRequired,
        currentView: PropTypes.object.isRequired,
        viewType: PropTypes.oneOf(['ticket-list', 'user-list']).isRequired
    }

    componentDidMount() {
        $(this.refs.plusButton).popup({variation: 'inverted'})
    }

    render() {
        const {views, currentView, viewType} = this.props
        // we use this to build urls
        const objectName = getPluralObjectName(viewType)
        const displayedViews = views
            .get('items', fromJS([]))
            .filter((view) => view.get('type') === viewType)
        const plusButtonClass = classnames(css['plus-button'], {
            [css.active]: !currentView.get('id')
        })

        return (
            <div>
                <div className="item">
                    <h4>
                        VIEWS
                        <Link to={`/app/${objectName}/new`} className={plusButtonClass}>
                            <span
                                ref="plusButton"
                                data-position="top center"
                                data-content="Create new view"
                            >
                                <i className="plus icon m0i"/>
                            </span>
                        </Link>
                    </h4>
                    <div className="menu">
                        {displayedViews.map((_view) => {
                            const view = _view.toJS()
                            const key = `${view.slug}-${view.id}`
                            let classes = classnames('item', {
                                active: currentView && currentView.get('id') === view.id
                            })
                            let count = 0

                            if (view.count !== undefined && view.count !== null) {
                                count = view.count
                            }

                            return (
                                <Link
                                    key={key}
                                    to={`/app/${objectName}/${view.id}/${view.slug}`}
                                    className={classes}
                                >
                                    {`${view.name} (${compactInteger(count)})`}
                                </Link>
                            )
                        })}
                    </div>
                </div>
            </div>
        )
    }
}

export default ViewNavbarView
