import { useQuery } from '@apollo/react-hooks'
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

import { ADD_TOAST, APPRECIATE_DEBOUNCE, Z_INDEX } from '~/common/enums'
import { getQuery } from '~/common/utils'

import AnonymousButton from './AnonymousButton'
import AppreciateButton from './AppreciateButton'
import CivicLikerButton from './CivicLikerButton'
import { APPRECIATE_ARTICLE, fragments } from './gql'
import SetupLikerIdAppreciateButton from './SetupLikerIdAppreciateButton'

import { ClientPreference } from '~/components/GQL/queries/__generated__/ClientPreference'
import { AppreciateArticle } from './__generated__/AppreciateArticle'
import { AppreciationButtonArticlePrivate } from './__generated__/AppreciationButtonArticlePrivate'
import { AppreciationButtonArticlePublic } from './__generated__/AppreciationButtonArticlePublic'

interface AppreciationButtonProps {
  article: AppreciationButtonArticlePublic &
    Partial<AppreciationButtonArticlePrivate>
}

const AppreciationButton = ({ article }: AppreciationButtonProps) => {
  const router = useRouter()
  const mediaHash = getQuery({ router, key: 'mediaHash' })
  const viewer = useContext(ViewerContext)
  const { token, refreshToken } = useContext(ReCaptchaContext)

  const { data, client } = useQuery<ClientPreference>(CLIENT_PREFERENCE, {
    variables: { id: 'local' },
  })

  /**
   * Normal Appreciation
   */
  const [amount, setAmount] = useState(0)
  const [sendAppreciation] = useMutation<AppreciateArticle>(APPRECIATE_ARTICLE)
  const hasAppreciate = article.hasAppreciate
  const limit = article.appreciateLimit
  const left =
    (typeof article.appreciateLeft === 'number'
      ? article.appreciateLeft
      : limit) - amount
  const total = article.appreciationsReceivedTotal + amount
  const appreciatedCount = hasAppreciate || amount ? limit - left : 0
  const isReachLimit = left <= 0
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

  /**
   * SuperLike
   */
  const [superLiked, setSuperLiked] = useState(false)
  const canSuperLike = article.canSuperLike
  const isSuperLike = viewer.isCivicLiker && isReachLimit
  const sendSuperLike = async () => {
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
      window.dispatchEvent(
        new CustomEvent(ADD_TOAST, {
          detail: {
            color: 'green',
            content: (
              <Translate
                zh_hant="你對文章送出了一個 Super Like！"
                zh_hans="你对文章送出了一个 Super Like！"
              />
            ),
          },
        })
      )
    } catch (e) {
      setSuperLiked(false)
      console.error(e)
    }
  }

  /**
   * Render
   *
   * Anonymous:
   *   1) Show login toast on click
   *
   * Article Author:
   *   1) Disabled, show tooltip on hover
   *
   * No LikerID:
   *   1) Show Setup LikerID modal on click
   *
   * Non-Civic Liker:
   *   1) Allow to appreciate 5 times
   *   2) Show modal to introduce Civic Liker on click
   *   3) Show "MAX" on close
   *
   * Civic Liker:
   *   1) Allow to appreciate 5 times
   *   2) Show SuperLike
   *   3) Show "∞" on click
   */
  const appreciate = () => {
    if (isSuperLike) {
      setSuperLiked(true)

      if (canSuperLike) {
        sendSuperLike()
      } else {
        window.dispatchEvent(
          new CustomEvent(ADD_TOAST, {
            detail: {
              color: 'green',
              content: (
                <Translate
                  zh_hant="12 小時後才能再次 Super Like。"
                  zh_hans="12 小时后才能再次 Super Like。"
                />
              ),
            },
          })
        )
      }
    } else {
      setAmount(amount + 1)
      debouncedSendAppreciation()
    }
  }

  const isArticleAuthor = article.author.id === viewer.id
  const readCivicLikerDialog =
    viewer.isCivicLiker || data?.clientPreference.readCivicLikerDialog
  const canAppreciate =
    (!isReachLimit && !viewer.isArchived && viewer.liker.likerId) ||
    canSuperLike

  // Anonymous
  if (!viewer.isAuthed) {
    return <AnonymousButton total={total} />
  }

  // Article Author
  if (isArticleAuthor) {
    return (
      <Tooltip
        content={
          <Translate zh_hant="去讚賞其他用戶吧" zh_hans="去赞赏其他用户吧" />
        }
        zIndex={Z_INDEX.OVER_GLOBAL_HEADER}
      >
        <span>
          <AppreciateButton disabled total={total} />
        </span>
      </Tooltip>
    )
  }

  // Liker ID
  if (viewer.shouldSetupLikerID) {
    return <SetupLikerIdAppreciateButton total={total} />
  }

  /// Appreciable
  if (canAppreciate || (!hasAppreciate && amount <= 0)) {
    return (
      <AppreciateButton
        onClick={appreciate}
        count={appreciatedCount > 0 ? appreciatedCount : undefined}
        total={total}
        isSuperLike={isSuperLike}
        superLiked={superLiked}
      />
    )
  }

  // Civic Liker
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

  // MAX
  if (!canAppreciate && isReachLimit) {
    return (
      <AppreciateButton
        count="MAX"
        total={total}
        isSuperLike={isSuperLike}
        superLiked={superLiked}
      />
    )
  }

  // Disabled
  return (
    <Tooltip
      content={
        <Translate zh_hant="你還沒有讚賞權限" zh_hans="你还没有赞赏权限" />
      }
      zIndex={Z_INDEX.OVER_GLOBAL_HEADER}
    >
      <span>
        <AppreciateButton
          disabled
          count={appreciatedCount > 0 ? appreciatedCount : undefined}
          total={total}
        />
      </span>
    </Tooltip>
  )
}

AppreciationButton.fragments = fragments

export default AppreciationButton
