import classNames from 'classnames'
import gql from 'graphql-tag'
import { useContext, useEffect, useState } from 'react'
import { FormattedMessage } from 'react-intl'
import { useDebounce } from 'use-debounce'

import {
  INPUT_DEBOUNCE,
  OPEN_UNIVERSAL_AUTH_DIALOG,
  TEST_ID,
  TOOLBAR_FIXEDTOOLBAR_ID,
  UNIVERSAL_AUTH_TRIGGER,
} from '~/common/enums'
import { toLocale, toPath } from '~/common/utils'
import {
  BookmarkButton,
  ButtonProps,
  CommentFormBetaDialog,
  ReCaptchaProvider,
  ViewerContext,
} from '~/components'
import DropdownActions, {
  DropdownActionsControls,
} from '~/components/ArticleDigest/DropdownActions'
import {
  ArticleDetailPublicQuery,
  ToolbarArticlePrivateFragment,
  ToolbarArticlePublicFragment,
} from '~/gql/graphql'

import AppreciationButton from '../../AppreciationButton'
import CommentButton from '../CommentButton'
import DonationButton from '../DonationButton'
import styles from './styles.module.css'

export type FixedToolbarProps = {
  article: ToolbarArticlePublicFragment & Partial<ToolbarArticlePrivateFragment>
  articleDetails: NonNullable<ArticleDetailPublicQuery['article']>
  translated: boolean
  translatedLanguage?: string | null
  privateFetched: boolean
  lock: boolean
  showCommentToolbar: boolean
  openCommentsDialog?: () => void
} & DropdownActionsControls

const fragments = {
  article: {
    public: gql`
      fragment FixedToolbarArticlePublic on Article {
        id
        title
        tags {
          content
        }
        ...DropdownActionsArticle
        ...DonationButtonArticle
        ...AppreciationButtonArticlePublic
        ...CommentButtonArticlePublic
      }
      ${DonationButton.fragments.article}
      ${DropdownActions.fragments.article}
      ${AppreciationButton.fragments.article.public}
      ${CommentButton.fragments.article.public}
    `,
    private: gql`
      fragment FixedToolbarArticlePrivate on Article {
        id
        ...BookmarkArticlePrivate
        ...AppreciationButtonArticlePrivate
        ...CommentButtonArticlePrivate
      }
      ${AppreciationButton.fragments.article.private}
      ${BookmarkButton.fragments.article.private}
      ${CommentButton.fragments.article.private}
    `,
  },
}

const FixedToolbar = ({
  article,
  articleDetails,
  translated,
  translatedLanguage,
  privateFetched,
  lock,
  showCommentToolbar,
  openCommentsDialog,
  ...props
}: FixedToolbarProps) => {
  const viewer = useContext(ViewerContext)
  const path = toPath({ page: 'articleDetail', article })
  const sharePath =
    translated && translatedLanguage
      ? `${path.href}?locale=${toLocale(translatedLanguage)}`
      : path.href

  const dropdonwActionsProps: DropdownActionsControls = {
    size: 24,
    inCard: false,
    inFixedToolbar: true,
    sharePath,
    hasExtend: false,
    hasEdit: true,
    hasArchive: true,
    hasAddCollection: true,
    ...props,
  }

  const buttonProps: ButtonProps = {
    spacing: [10, 10],
    bgColor: 'white',
    borderRadius: 0,
  }

  const [playAnimation, setPlayAnimation] = useState(false)
  // NOTE: Implement debounce to address button flickering issue during browser page navigation forward or backward.
  const [debouncedPlayAnimation, setDebouncedPlayAnimation] = useDebounce(
    playAnimation,
    INPUT_DEBOUNCE
  )

  useEffect(() => {
    setPlayAnimation(debouncedPlayAnimation)
  }, [debouncedPlayAnimation])

  const [
    isLeftAppreciationButtonScaleOut,
    setIsLeftAppreciationButtonScaleOut,
  ] = useState(false)
  const [isCommentScaleInDone, setIsCommentScaleInDone] = useState(false)

  const startAnimation = () => {
    setDebouncedPlayAnimation(true)
  }
  const resetAnimation = () => {
    setPlayAnimation(false)
    setIsLeftAppreciationButtonScaleOut(false)
    setIsCommentScaleInDone(false)
  }

  useEffect(() => {
    if (showCommentToolbar) {
      startAnimation()
    } else {
      resetAnimation()
    }
  }, [showCommentToolbar])

  const leftAppreciationButtonClasses = classNames({
    [styles.scaleOut]: playAnimation,
  })

  const commentButtonClasses = classNames({
    [styles.commentButton]: true,
    [styles.expandX]: isLeftAppreciationButtonScaleOut,
  })

  const toolbarClasses = classNames({
    [styles.toolbar]: true,
  })

  const buttonsClasses = classNames({
    [styles.buttons]: true,
    [styles.justifyContentSpaceBetween]: !isLeftAppreciationButtonScaleOut,
    [styles.justifyContentCenter]: isLeftAppreciationButtonScaleOut,
  })

  const rightAppreciationButtonClasses = classNames({
    [styles.rightAppreciationButton]: true,
    [styles.scaleAnimation]: isCommentScaleInDone,
  })

  const handleLeftAppreciationButtonScaleOutEnd = (
    event: React.AnimationEvent<HTMLElement>
  ) => {
    setIsLeftAppreciationButtonScaleOut(true)
  }

  const handleCommentScaleInEnd = (
    event: React.AnimationEvent<HTMLElement>
  ) => {
    setIsCommentScaleInDone(true)
  }

  return (
    <section
      className={toolbarClasses}
      data-test-id={TEST_ID.ARTICLE_TOOLBAR}
      id={TOOLBAR_FIXEDTOOLBAR_ID}
    >
      <CommentFormBetaDialog articleId={article.id} type="article">
        {({ openDialog: openCommentFormBetaDialog }) => (
          <section className={buttonsClasses}>
            {!isLeftAppreciationButtonScaleOut && (
              <section
                className={leftAppreciationButtonClasses}
                onAnimationEnd={handleLeftAppreciationButtonScaleOutEnd}
              >
                <ReCaptchaProvider action="appreciateArticle">
                  <AppreciationButton
                    article={article}
                    privateFetched={privateFetched}
                    iconSize={24}
                    textWeight="normal"
                    textIconSpacing={4}
                    disabled={lock}
                    {...buttonProps}
                  />
                </ReCaptchaProvider>
              </section>
            )}

            {isLeftAppreciationButtonScaleOut && (
              <button
                className={commentButtonClasses}
                onAnimationEnd={handleCommentScaleInEnd}
                onClick={() => {
                  if (!viewer.isAuthed) {
                    window.dispatchEvent(
                      new CustomEvent(OPEN_UNIVERSAL_AUTH_DIALOG, {
                        detail: {
                          trigger: UNIVERSAL_AUTH_TRIGGER.replyComment,
                        },
                      })
                    )
                    return
                  }

                  openCommentFormBetaDialog()
                }}
                disabled={lock}
              >
                <FormattedMessage
                  defaultMessage="Leave a comment?"
                  id="gK6OxL"
                  description="src/views/ArticleDetail/Toolbar/FixedToolbar/index.tsx"
                />
              </button>
            )}

            {!isLeftAppreciationButtonScaleOut && (
              <CommentButton
                article={article}
                disabled={!article.canComment}
                iconSize={24}
                textWeight="normal"
                textIconSpacing={4}
                onClick={() => {
                  if (!viewer.isAuthed && article.commentCount === 0) {
                    window.dispatchEvent(
                      new CustomEvent(OPEN_UNIVERSAL_AUTH_DIALOG, {
                        detail: {
                          trigger: UNIVERSAL_AUTH_TRIGGER.replyComment,
                        },
                      })
                    )
                    return
                  }

                  if (openCommentsDialog) {
                    openCommentsDialog()
                  } else {
                    openCommentFormBetaDialog()
                  }
                }}
                {...buttonProps}
              />
            )}

            {isLeftAppreciationButtonScaleOut && (
              <section className={rightAppreciationButtonClasses}>
                <ReCaptchaProvider action="appreciateArticle">
                  <AppreciationButton
                    article={article}
                    privateFetched={privateFetched}
                    iconSize={24}
                    textWeight="normal"
                    textIconSpacing={4}
                    disabled={lock}
                    {...buttonProps}
                  />
                </ReCaptchaProvider>
              </section>
            )}

            <section>
              <DonationButton
                articleDetail={articleDetails}
                disabled={lock}
                iconSize={24}
                textWeight="normal"
                textIconSpacing={4}
                {...buttonProps}
              />
            </section>

            <BookmarkButton
              article={article}
              iconSize={24}
              inCard={false}
              disabled={lock}
              {...buttonProps}
            />

            {!isLeftAppreciationButtonScaleOut && (
              <section className={leftAppreciationButtonClasses}>
                <DropdownActions
                  article={article}
                  disabled={lock}
                  {...dropdonwActionsProps}
                  hasShare
                  hasBookmark={false}
                  hasReport
                />
              </section>
            )}
          </section>
        )}
      </CommentFormBetaDialog>
    </section>
  )
}

FixedToolbar.fragments = fragments

export default FixedToolbar
