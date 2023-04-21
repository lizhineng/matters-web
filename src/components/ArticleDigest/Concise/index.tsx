import React from 'react'

import { stripHtml, toPath, UtmParams } from '~/common/utils'
import { Card, Media, ResponsiveImage } from '~/components'
import { UserDigest } from '~/components/UserDigest'
import {
  ArticleDigestConciseArticlePrivateFragment,
  ArticleDigestConciseArticlePublicFragment,
} from '~/gql/graphql'

import { ArticleDigestTitle } from '../Title'
import FooterActions, { FooterActionsProps } from './FooterActions'
import { fragments } from './gql'
import styles from './styles.css'

export type ArticleDigestConciseControls = {
  onClick?: () => any
  onClickAuthor?: () => void
  hasFollow?: boolean
  hasCircle?: boolean
}

export type ArticleDigestConciseProps = {
  article: ArticleDigestConciseArticlePublicFragment &
    Partial<ArticleDigestConciseArticlePrivateFragment>
  header?: React.ReactNode
  footerTag?: React.ReactNode
  footerCircle?: React.ReactNode
} & ArticleDigestConciseControls &
  FooterActionsProps &
  UtmParams

const BaseArticleDigestFeed = ({
  article,
  header,
  footerTag,
  footerCircle,
  date,

  hasFollow,
  hasCircle = true,
  onClick,
  onClickAuthor,

  utm_source,
  utm_medium,

  ...controls
}: ArticleDigestConciseProps) => {
  const { author, summary } = article
  const isBanned = article.articleState === 'banned'
  const cover = !isBanned ? article.cover : null
  const cleanedSummary = isBanned ? '' : stripHtml(summary)
  const path = toPath({
    page: 'articleDetail',
    article,
    utm_source,
    utm_medium,
  })

  const ConciseCard = ({ space }: { space: 0 | 'base' }) => (
    <Card
      {...path}
      spacing={['base', space]}
      bgActiveColor="none"
      onClick={onClick}
    >
      <section className="content">
        <section className="head">
          <section className="title">
            <ArticleDigestTitle article={article} textSize="xm" />
          </section>

          <section className="author">
            <UserDigest.Mini
              user={author}
              avatarSize="sm"
              textSize="sm"
              hasAvatar
              hasDisplayName
              onClick={onClickAuthor}
            />
          </section>
        </section>

        <p className="description">{cleanedSummary}</p>

        {cover && (
          <div className="cover">
            <ResponsiveImage url={cover} size="144w" smUpSize="360w" />
          </div>
        )}
      </section>

      <FooterActions
        article={article}
        inCard
        date={date}
        tag={footerTag}
        circle={footerCircle}
        {...controls}
      />

      <style jsx>{styles}</style>
    </Card>
  )

  return (
    <>
      <Media at="sm">
        <ConciseCard space={'base'} />
      </Media>
      <Media greaterThan="sm">
        <ConciseCard space={0} />
      </Media>
    </>
  )
}

/**
 * Memoizing
 */
type ArticleDigestConcise = React.MemoExoticComponent<
  React.FC<ArticleDigestConciseProps>
> & {
  fragments: typeof fragments
}

export const ArticleDigestConcise = React.memo(
  BaseArticleDigestFeed
) as ArticleDigestConcise

ArticleDigestConcise.fragments = fragments
