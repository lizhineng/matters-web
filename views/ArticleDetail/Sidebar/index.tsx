import { useEffect, useRef } from 'react'

import { Footer, Responsive } from '~/components'

import { dom } from '~/common/utils'

import { ArticleDetail_article } from '../__generated__/ArticleDetail'
import Collection from '../Collection'
import styles from './styles.css'

export default ({
  article,
  hasCollection,
  canEditCollection
}: {
  article: ArticleDetail_article
  hasCollection: boolean
  canEditCollection?: boolean
}) => {
  const collectionRef: React.RefObject<HTMLElement> = useRef(null)

  /**
   * Update position of sidebar collection to align with `#collection-meta-hook`
   */
  useEffect(() => {
    const $metaHook = dom.$('#collection-meta-hook')
    const $collection = collectionRef.current

    if (!$metaHook || !$collection) {
      return
    }

    const top = $metaHook.offsetTop
    const headerHeight = '4rem'
    const mainTop = '2.5rem'
    const triangleTop = '1rem'
    $collection.style.marginTop = `calc(${top}px - ${headerHeight} - ${mainTop} - ${triangleTop})`
  })

  return (
    <Responsive.LargeUp>
      {(match: boolean) => (
        <>
          {match && article && (hasCollection || canEditCollection) && (
            <section className="collection" ref={collectionRef}>
              <Collection article={article} canEdit={canEditCollection} />
            </section>
          )}

          <Footer />
          <style jsx>{styles}</style>
        </>
      )}
    </Responsive.LargeUp>
  )
}
