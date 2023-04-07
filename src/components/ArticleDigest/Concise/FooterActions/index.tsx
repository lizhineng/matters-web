import { BookmarkButton, DateTime } from '~/components'
import { FooterActionsConciseArticlePublicFragment } from '~/gql/graphql'

import { fragments } from './gql'
import styles from './styles.css'

export type FooterActionsProps = {
  article: FooterActionsConciseArticlePublicFragment
  date?: Date | string | number | boolean
  inCard?: boolean
  tag?: React.ReactNode
  circle?: React.ReactNode
}

const FooterActions = ({
  article,
  date,
  inCard,
  tag,
  circle,
}: FooterActionsProps) => {
  const hasDate = date !== false

  return (
    <footer>
      <section className="left">
        {tag}
        {circle}
        {hasDate && <DateTime date={date || article.createdAt} />}
      </section>

      <section className="right">
        <BookmarkButton article={article} inCard={inCard} />
      </section>

      <style jsx>{styles}</style>
    </footer>
  )
}

FooterActions.fragments = fragments

export default FooterActions