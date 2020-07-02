import { useQuery } from '@apollo/react-hooks'
import gql from 'graphql-tag'
import { useRouter } from 'next/router'
import { useContext, useState } from 'react'
import { useDebouncedCallback } from 'use-debounce'

import {
  ReCaptchaContext,
  Tooltip,
  Translate,
  ViewerContext,
} from '~/components'
import { useMutation } from '~/components/GQL'
import CLIENT_PREFERENCE from '~/components/GQL/queries/clientPreference'
import updateAppreciation from '~/components/GQL/updates/appreciation'

import { APPRECIATE_DEBOUNCE, Z_INDEX } from '~/common/enums'
import { getQuery } from '~/common/utils'

import AnonymousButton from './AnonymousButton'
import AppreciateButton from './AppreciateButton'
import CivicLikerButton from './CivicLikerButton'
import SetupLikerIdAppreciateButton from './SetupLikerIdAppreciateButton'

import { ClientPreference } from '~/components/GQL/queries/__generated__/ClientPreference'
import { AppreciateArticle } from './__generated__/AppreciateArticle'
import { AppreciationButtonArticlePrivate } from './__generated__/AppreciationButtonArticlePrivate'
import { AppreciationButtonArticlePublic } from './__generated__/AppreciationButtonArticlePublic'

interface AppreciationButtonProps {
  article: AppreciationButtonArticlePublic &
    Partial<AppreciationButtonArticlePrivate>
}

const fragments = {
  article: {
    public: gql`
      fragment AppreciationButtonArticlePublic on Article {
        id
        author {
          id
        }
        appreciationsReceivedTotal
        appreciateLimit
      }
    `,
    private: gql`
      fragment AppreciationButtonArticlePrivate on Article {
        id
        hasAppreciate
        appreciateLeft
        canSuperLike
      }
    `,
  },
}

const APPRECIATE_ARTICLE = gql`
  mutation AppreciateArticle(
    $id: ID!
    $amount: Int!
    $token: String!
    $superLike: Boolean
  ) {
    appreciateArticle(
      input: { id: $id, amount: $amount, token: $token, superLike: $superLike }
    ) {
      id
      canSuperLike
    }
  }
`

const AppreciationButton = ({ article }: AppreciationButtonProps) => {
  const router = useRouter()
  const mediaHash = getQuery({ router, key: 'mediaHash' })
  const viewer = useContext(ViewerContext)
  const { token, refreshToken } = useContext(ReCaptchaContext)

  const { data, client } = useQuery<ClientPreference>(CLIENT_PREFERENCE, {
    variables: { id: 'local' },
  })

  const [amount, setAmount] = useState(0)
  const [superLiked, setSuperLiked] = useState(false)
  const [sendAppreciation] = useMutation<AppreciateArticle>(APPRECIATE_ARTICLE)
  const limit = article.appreciateLimit
  const left =
    (typeof article.appreciateLeft === 'number' ? article.appreciateLeft : 5) -
    amount
  const canSuperLike = article.canSuperLike
  const total = article.appreciationsReceivedTotal + amount
  const appreciatedCount = limit - left

  // UI
  const isReachLimit = left <= 0
  const isMe = article.author.id === viewer.id
  const readCivicLikerDialog =
    viewer.isCivicLiker || data?.clientPreference.readCivicLikerDialog
  const isSuperLike = viewer.isCivicLiker && isReachLimit
  const canAppreciate =
    (!isReachLimit && !isMe && !viewer.isArchived && viewer.liker.likerId) ||
    canSuperLike

  // bundle appreciations
  const [debouncedSendAppreciation] = useDebouncedCallback(async () => {
    try {
      await sendAppreciation({
        variables: {
          id: article.id,
          amount,
          token,
        },
        update: (cache) => {
          updateAppreciation({
            cache,
            left,
            mediaHash,
            total,
            viewer,
          })
        },
      }).then(refreshToken)
    } catch (e) {
      console.error(e)
    }

    setAmount(0)
  }, APPRECIATE_DEBOUNCE)

  const appreciate = async () => {
    if (isSuperLike && canSuperLike) {
      setSuperLiked(true)

      try {
        await sendAppreciation({
          variables: {
            id: article.id,
            amount,
            token,
            superLike: true,
          },
          optimisticResponse: {
            appreciateArticle: {
              id: article.id,
              canSuperLike: false,
              __typename: 'Article',
            },
          },
        })
      } catch (e) {
        setSuperLiked(false)
        console.error(e)
      }
    } else {
      setAmount(amount + 1)
      debouncedSendAppreciation()
    }
  }

  /**
   * Anonymous
   */
  if (!viewer.isAuthed) {
    return <AnonymousButton total={total} />
  }

  /**
   * Setup Liker Id Button
   */
  if (viewer.shouldSetupLikerID) {
    return <SetupLikerIdAppreciateButton total={total} />
  }

  /**
   * Appreciate Button
   */
  if (canAppreciate) {
    return (
      <AppreciateButton
        onClick={appreciate}
        count={appreciatedCount > 0 ? appreciatedCount : undefined}
        total={total}
        isSuperLike={isSuperLike}
        canSuperLike={canSuperLike}
        superLiked={superLiked}
      />
    )
  }

  /**
   * Civic Liker Button
   */
  if (!canAppreciate && !readCivicLikerDialog && isReachLimit) {
    return (
      <CivicLikerButton
        onClose={() => {
          client.writeData({
            id: 'ClientPreference:local',
            data: { readCivicLikerDialog: true },
          })
        }}
        count={appreciatedCount > 0 ? appreciatedCount : undefined}
        total={total}
      />
    )
  }

  /**
   * MAX Button
   */
  if (!canAppreciate && isReachLimit) {
    return (
      <AppreciateButton
        count="MAX"
        total={total}
        isSuperLike={isSuperLike}
        canSuperLike={canSuperLike}
        superLiked={superLiked}
      />
    )
  }

  /**
   * Disabled Button
   */
  return (
    <Tooltip
      content={
        <Translate
          {...(isMe
            ? {
                zh_hant: '去讚賞其他用戶吧',
                zh_hans: '去赞赏其他用户吧',
              }
            : {
                zh_hant: '你還沒有讚賞權限',
                zh_hans: '你还没有赞赏权限',
              })}
        />
      }
      zIndex={Z_INDEX.OVER_GLOBAL_HEADER}
    >
      <span>
        <AppreciateButton
          disabled
          count={appreciatedCount > 0 ? appreciatedCount : undefined}
          total={total}
          isSuperLike={isSuperLike}
          canSuperLike={canSuperLike}
          superLiked={superLiked}
        />
      </span>
    </Tooltip>
  )
}

AppreciationButton.fragments = fragments

export default AppreciationButton
