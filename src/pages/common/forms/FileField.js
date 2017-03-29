/* FileField
 */

import React, {Component, PropTypes} from 'react'
import classnames from 'classnames'
import _last from 'lodash/last'
import {uploadFiles} from '../../../utils'

import css from './FileField.less'

const extensions = ['jpg', 'jpeg', 'png', 'bmp', 'svg']

class FileField extends Component {
    constructor(props) {
        super(props)

        this.state = {
            errors: [],
            loading: false
        }
    }

    // return string after last slash
    _getUrlName(url) {
        return url.split('/').pop()
    }

    _isImageUrl(url) {
        const fileExtension = _last(url.split('.'))
        return extensions.includes(fileExtension)
    }

    _isImageFile(file) {
        return file.type.includes('image/')
    }

    _isRatio(ratio, preview) {
        const image = new Image()
        image.src = preview

        return new Promise((resolve, reject) => {
            image.onload = () => {
                if (ratio === 'square') {
                    if (image.width === image.height) {
                        return resolve()
                    } else {
                        return reject()
                    }
                }

                resolve()
            }
        })
    }

    _onChange = (e) => {
        const files = e.target.files
        const upload = []
        const errors = []

        this.setState({
            loading: true
        })

        // check image ratio
        const promises = Array.prototype.map.call(files, (file) => {
            return new Promise((resolve) => {
                if (this._isImageFile(file)) {
                    const reader = new FileReader()
                    reader.onload = (readerEvent) => {
                        this
                        ._isRatio(this.props.ratio, readerEvent.target.result)
                        .then(() => {
                            upload.push(file)

                            resolve(file)
                        })
                        .catch(() => {
                            errors.push(`This image should be a ${this.props.ratio}.`)

                            resolve(file)
                        })
                    }
                    reader.readAsDataURL(file)
                } else {
                    upload.push(file)
                }
            })
        })

        return Promise
        .all(promises)
        .then(() => {
            this.setState({
                errors
            })

            return uploadFiles(upload)
        })
        .then((res) => {
            this.setState({
                loading: false
            })

            // don't remove existing images,
            // when uploads is empty because of errors.
            if (!res.length) {
                return
            }

            // return string if only one image uploaded
            let val = res[0].url

            if (res.length > 1) {
                val = res.map((f) => {
                    return f.url
                })
            }

            this.props.input.onChange(val)

            return val
        })
        .catch((err) => {
            this.setState({
                loading: false,
                errors: [err.toString()]
            })
        })
    }

    _renderOnePreview = (file, i) => {
        return (
            <div className={css.preview} key={i}>
                {this._isImageUrl(file) ?
                    <img src={file} className="ui image" role="presentation"/> :
                    <p>
                        <i className="file icon" />
                        {this._getUrlName(file)}
                    </p>
                }
            </div>
        )
    }

    _renderPreviews = (value) => {
        if (!value) {
            return null
        }

        let files = value

        // support array of files
        if (typeof files === 'string') {
            files = [value]
        }

        return files.map(this._renderOnePreview)
    }

    render() {
        const {input, label, className, required, accept} = this.props
        const {errors, loading} = this.state

        const fieldClassName = classnames({
            required,
        }, className, 'ui field')

        return (
            <div className={fieldClassName}>
                {label && <label htmlFor={input.name}>{label}</label>}

                <input type="hidden" {...input} />

                <label
                    className={classnames(css.button, 'ui basic grey button file-field', {
                        loading
                    })}
                >
                    UPLOAD NEW ICON

                    <input
                        type="file"
                        accept={accept}
                        onChange={this._onChange}
                    />
                </label>

                {this._renderPreviews(input.value)}

                {errors.length
                    ? (<div className="ui negative message">
                        {errors.map((err, i) => <p key={i}>{err}</p>)}
                    </div>)
                    : ''
                }
            </div>
        )
    }
}

FileField.defaultProps = {
    className: '',
    required: false,
    accept: '*'
}

FileField.propTypes = {
    input: PropTypes.object.isRequired,
    meta: PropTypes.object.isRequired,
    className: PropTypes.string,
    accept: PropTypes.string,
    ratio: PropTypes.string,
    label: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
    required: PropTypes.bool
}

export default FileField
