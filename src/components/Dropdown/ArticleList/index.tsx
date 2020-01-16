import { ArticleDigest } from '~/components/ArticleDigest'
import { Menu } from '~/components/Menu'
import { Spinner } from '~/components/Spinner'

import styles from './styles.css'

import { DropdownDigestArticle } from '~/components/ArticleDigest/Dropdown/__generated__/DropdownDigestArticle'

const DropdownArticleList = ({
  articles,
  onClick,
  loading
}: {
  articles: DropdownDigestArticle[]
  onClick: (article: DropdownDigestArticle) => void
  loading?: boolean
}) => {
  if (loading) {
    return (
      <Menu width="md">
        <Menu.Item>
          <Spinner />
        </Menu.Item>
      </Menu>
    )
  }

  return (
    <Menu width="md">
      {articles.map(article => (
        <Menu.Item
          spacing={['xtight', 'tight']}
          hoverBgColor="green"
          key={article.id}
        >
          <button
            className="search-article-item"
            type="button"
            onClick={() => {
              onClick(article)
            }}
            disabled={article.state !== 'active'}
          >
            <ArticleDigest.Dropdown article={article} hasArrow disabled />

            <style jsx>{styles}</style>
          </button>
        </Menu.Item>
      ))}
    </Menu>
  )
}

export default DropdownArticleList
