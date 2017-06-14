import React, {PropTypes} from 'react'

import InputField from './InputField'

export default class ReduxFormInput extends React.Component {
    static propTypes = {
        input: PropTypes.object.isRequired,
        meta: PropTypes.object.isRequired,
        tag: PropTypes.oneOfType([PropTypes.func, PropTypes.string]),
    }

    static defaultProps = {
        tag: InputField,
    }

    render() {
        const {
            input,
            meta,
            tag: Tag,
            ...rest,
        } = this.props

        return (
            <Tag
                value={input.value}
                onChange={input.onChange}
                name={input.name}
                error={meta.error}
                {...rest}
            />
        )
    }
}

