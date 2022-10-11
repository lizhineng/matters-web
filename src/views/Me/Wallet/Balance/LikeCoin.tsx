import { useQuery } from '@apollo/react-hooks'
import gql from 'graphql-tag'
import { useContext } from 'react'

import {
  Button,
  getErrorCodes,
  IconLikeCoin40,
  IconSpinner16,
  TextIcon,
  Translate,
  ViewerContext,
} from '~/components'

import { PATHS } from '~/common/enums'

import CurrencyFormatter from './CurrencyFormatter/index'
import styles from './styles.css'

import { ViewerLikeBalance } from './__generated__/ViewerLikeBalance'

const VIEWER_LIKE_BALANCE = gql`
  query ViewerLikeBalance {
    viewer {
      id
      liker {
        total
        rateUSD
      }
    }
  }
`

const Wrapper: React.FC = ({ children }) => (
  <section className="assetsItem">
    <TextIcon icon={<IconLikeCoin40 size="xl-m" />} size="md" spacing="xtight">
      <Translate zh_hant="LikeCoin" zh_hans="LikeCoin" en="LikeCoin" />
    </TextIcon>

    {children}

    <style jsx>{styles}</style>
  </section>
)

export const LikeCoin = () => {
  const viewer = useContext(ViewerContext)

  const likerId = viewer.liker.likerId
  const { data, loading, error } = useQuery<ViewerLikeBalance>(
    VIEWER_LIKE_BALANCE,
    {
      errorPolicy: 'none',
      skip: typeof window === 'undefined',
    }
  )

  const errorCodes = getErrorCodes(error)
  const shouldReAuth = errorCodes.some((code) => code === 'OAUTH_TOKEN_INVALID')

  const liker = data?.viewer?.liker
  const total = liker?.total || 0

  if (loading) {
    return (
      <Wrapper>
        <IconSpinner16 color="grey-light" size="sm" />
      </Wrapper>
    )
  }

  if (shouldReAuth) {
    return (
      <Wrapper>
        <Button
          spacing={[0, 'tight']}
          size={[null, '1.5rem']}
          borderColor="black"
          href={PATHS.ME_SETTINGS}
        >
          <TextIcon color="black" size="xs">
            <Translate
              zh_hant="重新綁定 Liker ID"
              zh_hans="重新绑定 Liker ID"
              en="Connect Liker ID"
            />
          </TextIcon>
        </Button>
      </Wrapper>
    )
  }

  if (likerId) {
    return (
      <Wrapper>
        <CurrencyFormatter currency={total} currencyCode={'LIKE'} />
      </Wrapper>
    )
  }

  return (
    <Wrapper>
      <Button
        spacing={[0, 'tight']}
        size={[null, '1.5rem']}
        borderColor="black"
        href={PATHS.ME_SETTINGS}
      >
        <TextIcon color="black" size="xs">
          <Translate
            zh_hant="設置 Liker ID"
            zh_hans="设置 Liker ID"
            en="Set Liker ID"
          />
        </TextIcon>
      </Button>
    </Wrapper>
  )
}