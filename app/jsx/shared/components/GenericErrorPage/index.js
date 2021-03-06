/*
 * Copyright (C) 2019 - present Instructure, Inc.
 *
 * This file is part of Canvas.
 *
 * Canvas is free software: you can redistribute it and/or modify it under
 * the terms of the GNU Affero General Public License as published by the Free
 * Software Foundation, version 3 of the License.
 *
 * Canvas is distributed in the hope that it will be useful, but WITHOUT ANY
 * WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR
 * A PARTICULAR PURPOSE. See the GNU Affero General Public License for more
 * details.
 *
 * You should have received a copy of the GNU Affero General Public License along
 * with this program. If not, see <http://www.gnu.org/licenses/>.
 */

import I18n from 'i18n!generic_error_page'
import React from 'react'

import {Button} from '@instructure/ui-buttons'
import Container from '@instructure/ui-core/lib/components/Container'
import Text from '@instructure/ui-core/lib/components/Text'
import axios from 'axios'
import {string} from 'prop-types'
import {Spinner} from '@instructure/ui-elements'
import {Flex} from '@instructure/ui-layout'
import ErrorTextInputForm from './ErrorTextInputForm'
import ErrorPageHeader from './ErrorPageHeader'

/*
 * A component that can be used to render an error page
 * with a error report comment box
 *
 * The submission comment box enables a user to log a report
 * to our errors_controller endpoint to explain how the
 * error occured
 */
class GenericErrorPage extends React.Component {
  static propTypes = {
    errorSubject: string,
    errorCategory: string,
    imageUrl: string.isRequired
  }

  static defaultProps = {
    errorSubject: 'No Error Subject',
    errorCategory: 'No Error Category'
  }

  state = {
    showingCommentBox: false,
    commentPosted: false,
    commentPostError: false,
    submitLoading: false,
    optionalEmail: '',
    textAreaComment: ''
  }

  handleOpenCommentBox = () => {
    // Only allow user to post a comment once
    this.setState({showingCommentBox: true})
  }

  handleChangeCommentBox = event => {
    this.setState({textAreaComment: event.target.value})
  }

  handleChangeOptionalEmail = event => {
    this.setState({optionalEmail: event.target.value})
  }

  // Submit makes a post to the create method used in the errors_controller.rb
  // The create method has detailed documentation on what each parameter means
  handleSubmitErrorReport = async () => {
    const postData = {
      error: {
        subject: this.props.errorSubject,
        category: this.props.errorCategory,
        url: window.location.href,
        comments: this.state.textAreaComment,
        email: this.state.optionalEmail
      }
    }
    this.setState({submitLoading: true, showingCommentBox: false})
    const request = await axios.post('/error_reports', postData, {
      headers: [{'content-type': 'application/json'}]
    })
    // Returns json of {logged: boolean, id: string}
    const logObject = request.data
    if (logObject.logged) {
      this.setState({commentPosted: true, submitLoading: false})
    } else {
      this.setState({commentPosted: true, commentPostError: true, submitLoading: false})
    }
  }

  render() {
    return (
      <Container margin="large auto" textAlign="center" display="block">
        <ErrorPageHeader imageUrl={this.props.imageUrl} />
        <Container margin="small" display="block">
          {!this.state.commentPosted && (
            <Flex justifyItems="center" margin="small" display="block">
              <Text margin="0">{I18n.t('If you have a moment,')}</Text>
              <Button
                padding="0"
                data-test-id="generic-shared-error-page-button"
                variant="link"
                onClick={this.handleOpenCommentBox}
              >
                {I18n.t('click here to tell us what happened')}
              </Button>
            </Flex>
          )}
          {this.state.showingCommentBox && (
            <ErrorTextInputForm
              handleChangeCommentBox={this.handleChangeCommentBox}
              handleChangeOptionalEmail={this.handleChangeOptionalEmail}
              handleSubmitErrorReport={this.handleSubmitErrorReport}
            />
          )}
          {this.state.submitLoading && (
            <Spinner
              data-test-id="generic-error=page-loading-indicator"
              title={I18n.t('Loading')}
              margin="0 0 0 medium"
            />
          )}
          {this.state.commentPosted && this.state.commentPostError && (
            <Container display="block" data-test-id="generic-error-comments-submitted">
              <Text color="error" margin="x-small">
                {I18n.t('Comment failed to post! Please try again later.')}
              </Text>
            </Container>
          )}
          {this.state.commentPosted && !this.state.commentPostError && (
            <Container display="block" data-test-id="generic-error-comments-submitted">
              <Text margin="x-small">{I18n.t('Comment submitted!')}</Text>
            </Container>
          )}
        </Container>
      </Container>
    )
  }
}

export default React.memo(GenericErrorPage)
