import React, {Component} from 'react'
import {connect, ConnectedProps} from 'react-redux'
import {bindActionCreators} from 'redux'
import _isString from 'lodash/isString'
import {List} from 'immutable'

import MultiSelectField from '../../../forms/MultiSelectField'
import SelectField from '../../../forms/SelectField/SelectField'
import * as TagsActions from '../../../../../state/tags/actions'
import TagDropdownMenu from '../../TagDropdownMenu/TagDropdownMenu'
import {RootState} from '../../../../../state/types'

type OwnProps = {
    value: string[] | string
    onChange: (value: string[] | string) => any
    multiple: boolean
    className?: string
    caseInsensitive: boolean
}

type Props = OwnProps & ConnectedProps<typeof connector>

export class TagsSelectContainer extends Component<Props> {
    static defaultProps: Pick<Props, 'value' | 'multiple'> = {
        value: '',
        multiple: false,
    }

    _onChange = (newTag: string) => {
        const {onChange, tags, actions} = this.props

        const existingTagNames = tags
            .map((tag) => tag!.get('name') as string)
            .toJS() as string[]
        if (!existingTagNames.includes(newTag)) {
            actions.create({name: newTag})
        }

        onChange(newTag)
    }

    _onMultiChange = (val: string[]) => {
        const {value, tags, actions, onChange} = this.props

        const existingTagNames = tags
            .map((tag) => tag!.get('name') as string)
            .toJS() as string[]

        val.forEach((newTag) => {
            if (!existingTagNames.includes(newTag)) {
                actions.create({name: newTag})
            }
        })

        onChange(_isString(value) ? val.join(',') : val)
    }

    render() {
        const {multiple, tags, value, className} = this.props
        const style = {
            display: 'inline-block',
        }
        const options = tags
            .map((tag) => {
                return {
                    label: tag!.get('name'),
                    value: tag!.get('name'),
                }
            })
            .toJS()
        let values: string | string[] = value

        if (multiple) {
            // this component is used to select tags for `add tags` and `set tags` actions
            // in this case, these functions have a (comma separated) list of tags as a string
            if (_isString(value)) {
                values = value.split(',').filter((value) => value !== '')
            }

            return (
                <MultiSelectField
                    allowCustomValues
                    onChange={this._onMultiChange}
                    options={options}
                    plural="tags"
                    singular="tag"
                    style={style}
                    values={values as string[]}
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
                onChange={(value) => this._onChange(value.toString())}
                placeholder="Add a tag"
                singular="tag"
                style={style}
                value={values as string}
                className={className}
            />
        )
    }
}

const connector = connect(
    (state: RootState) => ({
        tags: state.tags.get('items') as List<Map<any, any>>,
    }),
    (dispatch) => ({
        actions: bindActionCreators(TagsActions, dispatch),
    })
)

export default connector(TagsSelectContainer)
