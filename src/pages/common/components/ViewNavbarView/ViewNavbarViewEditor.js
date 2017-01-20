import React, {PropTypes, Component} from 'react'
import {connect} from 'react-redux'
import {Link, withRouter} from 'react-router'
import {Field, reduxForm, getFormValues} from 'redux-form'
import {fromJS} from 'immutable'
import classnames from 'classnames'
import ReactSortable from './../../../common/components/dragging/ReactSortable'
import CheckboxField from './../../../common/components/formFields/CheckboxField'
import {compactInteger} from '../../../../utils'
import {logEvent} from '../../../../store/middlewares/amplitudeTracker'
import {submitSetting} from '../../../../state/currentUser/actions'
import {sortViews} from './utils'
import css from './ViewNavbarViewEditor.less'

class ViewNavbarViewEditor extends Component {
    static propTypes = {
        views: PropTypes.object.isRequired,
        objectName: PropTypes.string.isRequired,
        isUpdate: PropTypes.bool.isRequired,
        isLoading: PropTypes.bool.isRequired,
        change: PropTypes.func.isRequired,
        submitSetting: PropTypes.func.isRequired,
        formValues: PropTypes.object,
        setting: PropTypes.object,
        location: PropTypes.object.isRequired
    }

    state = {
        isLoading: false
    }

    componentWillReceiveProps(nextProps) {
        const {change, isUpdate} = this.props
        const {isLoading} = this.state
        const formValues = fromJS(this.props.formValues || {})
        const nextFormValues = fromJS(nextProps.formValues || {})
        const formHasChanged = this.props.formValues && nextProps.formValues &&
            !nextFormValues.get('data').equals(formValues.get('data'))

        // update setting
        if (formHasChanged) {
            this._submitSetting(nextFormValues.toJS())
        }

        // create setting
        if (!isUpdate && !isLoading) {
            this.setState({isLoading: true})
            this._submitSetting(nextFormValues.toJS()).then((resp) => {
                // add id to the setting (form values)
                change('id', resp.id)
                // when setting have an id, we allow user to modify it
                this.setState({isLoading: false})
            })
        }
    }

    _submitSetting = (values) => {
        return this.props.submitSetting(values)
    }

    _updateOrder = (orders) => {
        const {change, setting} = this.props
        let newSetting = setting.get('data', fromJS({}))

        // update form values with the new orders
        orders.forEach((id, index) => {
            newSetting = newSetting.setIn([id, 'display_order'], index)
        })
        change('data', newSetting.toJS())
        logEvent('Moved a view')
    }

    _renderViews = (views) => {
        const {change, formValues} = this.props
        const formData = fromJS(formValues || {}).get('data', fromJS({}))
        let newView = views

        // re-sort views with `display_order` values of the form
        if (!formData.isEmpty()) {
            newView = newView.map(view => {
                return view.set(
                    'display_order',
                    formData.getIn([view.get('id').toString(), 'display_order'], view.get('display_order'))
                )
            }).sort(sortViews)
        }

        return newView.map(view => {
            const viewId = view.get('id')
            const itemClass = classnames('item', css.viewItem, {
                [css.draggable]: !view.get('hide')
            })

            return (
                <div
                    key={viewId}
                    data-id={viewId}
                    className={itemClass}
                    onClick={() => {
                        change(`data.${viewId}.hide`, !formValues.data[viewId].hide)
                    }}
                >
                    <Field
                        type="checkbox"
                        label={`${view.get('name')} (${compactInteger(view.get('count', 0))})`}
                        labelClassName={css.viewItemName}
                        name={`data.${viewId}.hide`}
                        input={{
                            value: !formData.getIn([viewId.toString(), 'hide'], false),
                            onChange: ({target}) => {
                                change(`data.${viewId}.hide`, !target.checked)
                                logEvent(`${target.checked ? 'Showed' : 'Hided'} a view`)
                            }
                        }}
                        component={CheckboxField}
                    />
                </div>
            )
        })
    }

    render() {
        const {
            views,
            objectName,
            location: {pathname}
        } = this.props
        const {isLoading} = this.state
        const createButtonClass = classnames('mt10', 'item', {
            active: pathname.includes(`${objectName}/new`)
        })

        return !isLoading && (
            <div>
                <ReactSortable
                    options={{
                        sort: true,
                        draggable: `.${css.draggable}`,
                        chosenClass: css.chosen,
                        ghostClass: css.ghost,
                        animation: 150
                    }}
                    onChange={this._updateOrder}
                >
                    {this._renderViews(views)}
                </ReactSortable>
                <Link className={createButtonClass} to={`/app/${objectName}/new`}>
                    <div>
                        <i className="plus icon"/>
                        Create new view
                    </div>
                </Link>
            </div>
        )
    }
}

const VIEW_SETTING_FORM = 'VIEW_SETTING_FORM'

function mapStateToProps(state) {
    return {
        formValues: getFormValues(VIEW_SETTING_FORM)(state),
    }
}

const ViewNavbarViewEditorWithRouter = withRouter(ViewNavbarViewEditor)

const ReduxViewNavbarViewEditor = reduxForm({form: VIEW_SETTING_FORM})(ViewNavbarViewEditorWithRouter)

export default connect(mapStateToProps, {
    submitSetting
})(ReduxViewNavbarViewEditor)

