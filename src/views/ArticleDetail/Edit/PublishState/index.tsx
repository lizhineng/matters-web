import { useQuery } from '@apollo/react-hooks'
import { useEffect, useState } from 'react'

import { LatestVersionArticleQuery } from '~/gql/graphql'

import { LATEST_VERSION_ARTICLE } from './gql'
import PendingState from './PendingState'
import PublishedState from './PublishedState'
import styles from './styles.module.css'

interface PublishStateProps {
  articleId: string
  currVersionId: string
}

type State = 'pending' | 'published'

const PublishState = ({ articleId, currVersionId }: PublishStateProps) => {
  const [publishState, setPublishState] = useState<State>('pending')
  const isPending = publishState === 'pending'
  const isPublished = publishState === 'published'

  const { data, startPolling, stopPolling, refetch } =
    useQuery<LatestVersionArticleQuery>(LATEST_VERSION_ARTICLE, {
      variables: { id: articleId },
      errorPolicy: 'none',
      fetchPolicy: 'network-only',
      skip: typeof window === 'undefined',
    })
  const article = (data?.article?.__typename === 'Article' &&
    data.article) as NonNullable<
    LatestVersionArticleQuery['article'] & { __typename: 'Article' }
  >
  const latestVersionId = article.versions.edges[0]?.node.id

  useEffect(() => {
    startPolling(1000 * 2)

    refetch && refetch()

    return () => {
      stopPolling()
    }
  }, [])

  useEffect(() => {
    if (latestVersionId === currVersionId) {
      return
    }

    stopPolling()
    setPublishState('published')
  }, [latestVersionId])

  return (
    <section className={styles.container}>
      {isPending && <PendingState />}
      {isPublished && <PublishedState article={article} />}
    </section>
  )
}

export default PublishState
