import React, {PropTypes} from 'react'
import md5 from 'md5'
import _split from 'lodash/split'


export default class ProfileImage extends React.Component {
    constructor(props) {
        super(props)
        this.state = {error: false}
    }

    _onError = () => {
        this.setState({error: true})
    }

    _getInitials = (name) => {
        if (!name) {
            return ''
        }

        const splittedName = _split(name, ' ')

        if (splittedName.length > 1) {
            return `${splittedName[0][0]}${splittedName[1][0]}`
        }

        return splittedName[0][0]
    }

    render() {
        const {email, name} = this.props

        if (this.state.error) {
            return (
                <div className="initials">{this._getInitials(name)}</div>
            )
        }

        const baseUrl = `https://www.gravatar.com/avatar/${md5(email)}?d=404&s=50`

        return (
            <img
                src={baseUrl}
                alt="profile"
                onError={this._onError}
            />
        )
    }
}

ProfileImage.propTypes = {
    email: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired
}
