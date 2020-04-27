import gql from 'graphql-tag'
import React from 'react'

import {
  ArticleDigestTitle,
  Card,
  Icon,
  TextIcon,
  UserDigest,
} from '~/components'

import { toPath } from '~/common/utils'

import styles from './styles.css'

import { AppreciationSentAppreciation } from './__generated__/AppreciationSentAppreciation'

interface AppreciationSentProps {
  tx: AppreciationSentAppreciation
}

const fragments = {
  appreciation: gql`
    fragment AppreciationSentAppreciation on Appreciation {
      amount
      purpose
      content
      recipient {
        ...UserDigestMiniUser
      }
      target {
        ...ArticleDigestTitleArticle
      }
    }
    ${UserDigest.Mini.fragments.user}
    ${ArticleDigestTitle.fragments.article}
  `,
}

const AppreciationSent = ({ tx }: AppreciationSentProps) => {
  const { amount, content, purpose, recipient, target } = tx
  const isUseContent = purpose !== 'appreciate'
  const path = target
    ? toPath({ page: 'articleDetail', article: target })
    : null

  return (
    <Card {...path} spacing={['base', 'base']}>
      <section className="container">
        <section className="left">
          <header>
            {isUseContent && content && <h4 className="content">{content}</h4>}
            {!isUseContent && target && (
              <ArticleDigestTitle article={target} is="h2" />
            )}
          </header>

          <footer>
            {recipient && !isUseContent && (
              <UserDigest.Mini
                user={recipient}
                avatarSize="xs"
                hasAvatar
                hasDisplayName
                hasUserName
              />
            )}
          </footer>
        </section>

        <section className="right">
          <div className="appreciate-count" aria-label={`${amount} 次讚賞`}>
            <TextIcon
              icon={<Icon.Like />}
              spacing="xtight"
              weight="md"
              color="green"
            >
              {amount}
            </TextIcon>
          </div>
        </section>

        <style jsx>{styles}</style>
      </section>
    </Card>
  )
}

/**
 * Memoizing
 */
type MemoedAppreciationSentType = React.MemoExoticComponent<
  React.FC<AppreciationSentProps>
> & {
  fragments: typeof fragments
}

export const MemoedAppreciationSent = React.memo(
  AppreciationSent,
  () => true
) as MemoedAppreciationSentType

MemoedAppreciationSent.fragments = fragments

export default MemoedAppreciationSent