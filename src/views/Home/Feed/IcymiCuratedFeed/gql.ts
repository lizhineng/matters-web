import gql from 'graphql-tag'

import { ArticleDigestCurated } from '~/components'

export const fragments = gql`
  fragment IcymiCuratedFeedRecommendation on Recommendation {
    icymiTopic {
      id
      title
      articles {
        ...ArticleDigestCuratedArticle
      }
      pinAmount
      note
    }
  }
  ${ArticleDigestCurated.fragments.article}
`
