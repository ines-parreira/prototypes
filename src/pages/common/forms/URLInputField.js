import React from 'react'
import ErrorMessage from '../components/ErrorMessage'
import classNames from 'classnames'
import _split from 'lodash/split'
import _replace from 'lodash/replace'

class URLInputField extends React.Component {
    constructor(props) {
        super(props)

        // Saving both the protocol and the trimmed URL in the state so that we can trigger input.onChange
        // when any of those is modified.
        this.state = {
            protocol: this._getProtocol(props.input.value),
            url: this._trimProtocol(props.input.value),
        }
    }

    componentDidMount() {
        $(this.refs.urlDropdown).dropdown({
            onChange: (value) => {
                this.state.protocol = value
                this.props.input.onChange(`${value}${this.state.url}`)
            }
        })

        $(this.refs.urlDropdown).dropdown('set text', this.state.protocol)
    }

    _setProtocol = (value) => {
        const protocol = this._getProtocol(value)
        this.state.protocol = protocol
        $(this.refs.urlDropdown).dropdown('set text', protocol)
    }

    _getProtocol = (value) => {
        const urlArray = _split(value, ':')

        // If there's no protocol specified in the URL, set `http://` as default
        return urlArray.length > 1 ? `${urlArray[0]}://` : 'http://'
    }

    _trimProtocol = (value) => _replace(value, /^http[s]?:\/\//, '')

    _onChange = (e) => {
        const trimmedUrl = this._trimProtocol(e.target.value)

        // When pasting an URL, automatically set the correct protocol in the dropdown
        if (trimmedUrl !== e.target.value) {
            this._setProtocol(e.target.value)
        }

        this.state.url = trimmedUrl

        let res = trimmedUrl

        // add protocol only if there is an url after it
        if (res) {
            res = `${this.state.protocol}${trimmedUrl}`
        }

        this.props.input.onChange(res)
    }

    render() {
        const {input, label, meta, placeholder, required} = this.props
        const fieldClassName = classNames({required}, 'field')

        return (
            <div className={fieldClassName}>
                {label && <label htmlFor={input.name}>{label}</label>}
                <div className="ui labeled input">
                    <div ref="urlDropdown" className="ui dropdown label">
                        <div className="text">http://</div>
                        <i className="dropdown icon" />
                        <div className="menu">
                            <div className="item">http://</div>
                            <div className="item">https://</div>
                        </div>
                    </div>
                    <input
                        value={this._trimProtocol(input.value)}
                        onChange={this._onChange}
                        placeholder={placeholder}
                    />
                </div>
                {meta.invalid && <ErrorMessage errors={meta.error} />}
                {meta.touched && <ErrorMessage errors={meta.warning} isWarning />}
            </div>
        )
    }
}

URLInputField.defaultProps = {
    required: false,
    placeholder: 'gorgias.io',
    meta: {
        invalid: false,
        touched: false
    }
}

URLInputField.propTypes = {
    input: React.PropTypes.object.isRequired,
    meta: React.PropTypes.object.isRequired,
    label: React.PropTypes.string,
    placeholder: React.PropTypes.string,
    required: React.PropTypes.bool,
}

export default URLInputField
