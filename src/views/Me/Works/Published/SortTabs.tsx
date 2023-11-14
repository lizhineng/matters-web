import classNames from 'classnames'
import { useState } from 'react'
import { FormattedMessage, useIntl } from 'react-intl'

import { Button, IconClose20, IconUser2V16 } from '~/components'
import { UserArticlesSort } from '~/gql/graphql'

import styles from './styles.module.css'

const TabItem = ({
  active,
  onClick,
  title,
}: {
  title: string
  active: boolean
  onClick: () => void
}) => {
  const liClasses = classNames({
    [styles.tabItem]: true,
    [styles.active]: active,
  })
  return (
    <li
      className={liClasses}
      role="button"
      onClick={onClick}
      data-title={title}
    >
      {title}
    </li>
  )
}

export const SortTabs = ({
  sort,
  setSort,
}: {
  sort: UserArticlesSort
  setSort: React.Dispatch<React.SetStateAction<UserArticlesSort>>
}) => {
  const intl = useIntl()
  const [showHint, setShowHint] = useState(true)
  return (
    <>
      <ul className={styles.tabList}>
        <TabItem
          active={sort === UserArticlesSort.Newest}
          onClick={() => setSort(UserArticlesSort.Newest)}
          title={intl.formatMessage({
            defaultMessage: 'Latest',
            id: 'SPTRiT',
            description: 'src/views/Me/Works/Published/SortTabs.tsx',
          })}
        />
        <TabItem
          active={sort === UserArticlesSort.MostReaders}
          onClick={() => setSort(UserArticlesSort.MostReaders)}
          title={intl.formatMessage({
            defaultMessage: 'Most readers',
            id: 'rHi+cL',
            description: 'src/views/Me/Works/Published/SortTabs.tsx',
          })}
        />
        <TabItem
          active={sort === UserArticlesSort.MostAppreciations}
          onClick={() => setSort(UserArticlesSort.MostAppreciations)}
          title={intl.formatMessage({
            defaultMessage: 'Most claps',
            id: 'AA5PkU',
            description: 'src/views/Me/Works/Published/SortTabs.tsx',
          })}
        />
        <TabItem
          active={sort === UserArticlesSort.MostComments}
          onClick={() => setSort(UserArticlesSort.MostComments)}
          title={intl.formatMessage({
            defaultMessage: 'Most comments',
            id: 'aOFCqL',
            description: 'src/views/Me/Works/Published/SortTabs.tsx',
          })}
        />

        <TabItem
          active={sort === UserArticlesSort.MostDonations}
          onClick={() => setSort(UserArticlesSort.MostDonations)}
          title={intl.formatMessage({
            defaultMessage: 'Most Supporters',
            id: 'n/w6lW',
            description: 'src/views/Me/Works/Published/SortTabs.tsx',
          })}
        />
      </ul>
      {showHint && (
        <section className={styles.hint}>
          <p className={styles.left}>
            <IconUser2V16 color="grey" />
            <FormattedMessage
              defaultMessage="Number of readers: unique registered users plus number of anonymous IP addresses visited the article"
              description="src/views/Me/Works/Published/index.tsx"
              id="jaTUgx"
            />
          </p>
          <section className={styles.right}>
            <Button
              textColor="greyDarker"
              textActiveColor="black"
              onClick={() => setShowHint(false)}
            >
              <IconClose20 size="mdS" />
            </Button>
          </section>
        </section>
      )}
    </>
  )
}