// @flow
import React, {Component} from 'react'
import {connect} from 'react-redux'
import {bindActionCreators} from 'redux'
import _isString from 'lodash/isString'
import {type Map} from 'immutable'

import MultiSelectField from '../../../forms/MultiSelectField'
import SelectField from '../../../forms/SelectField'
import * as TagsActions from '../../../../../state/tags/actions.ts'
import TagDropdownMenu from '../../TagDropdownMenu/TagDropdownMenu.tsx'

type Props = {
    tags: Map<any, any>,
    value: ?string,
    onChange: Function,
    multiple: ?boolean,
    className?: ?string,
    actions: Object,
    caseInsensitive: ?boolean,
}

export class TagsSelectContainer extends Component<Props> {
    static defaultProps = {
        value: '',
        multiple: false,
    }

    _onChange = (val: string[]) => {
        const {multiple, value, tags, actions} = this.props
        const existingTagNames = tags.map((tag) => tag.get('name')).toJS()

        val.forEach((newTag) => {
            if (!existingTagNames.includes(newTag)) {
                actions.create({name: newTag})
            }
        })

        if (multiple && _isString(value)) {
            this.props.onChange(val.join(','))
        } else {
            this.props.onChange(val)
        }
    }

    render() {
        const {multiple, tags, value, className} = this.props
        const style = {
            display: 'inline-block',
        }
        const options = tags
            .map((tag) => {
                return {
                    label: tag.get('name'),
                    value: tag.get('name'),
                }
            })
            .toJS()
        // $TsFixMe remove any casting on migration
        let values: any = value

        if (multiple) {
            // this component is used to select tags for `add tags` and `set tags` actions
            // in this case, these functions have a (comma separated) list of tags as a string
            if (_isString(value)) {
                values = value.split(',').filter((value) => value !== '')
            }

            return (
                <MultiSelectField
                    allowCustomValues
                    onChange={this._onChange}
                    options={options}
                    plural="tags"
                    singular="tag"
                    style={style}
                    values={values}
                    caseInsensitive={this.props.caseInsensitive}
                    className={className}
                    dropdownMenu={TagDropdownMenu}
                />
            )
        }

        return (
            <SelectField
                allowCustomValue
                options={options}
                onChange={
                    // $FlowFixMe
                    this._onChange
                }
                placeholder="Add a tag"
                singular="tag"
                style={style}
                value={values}
                className={className}
            />
        )
    }
}

function mapStateToProps(state) {
    return {
        tags: state.tags.get('items'),
    }
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators(TagsActions, dispatch),
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(TagsSelectContainer)
