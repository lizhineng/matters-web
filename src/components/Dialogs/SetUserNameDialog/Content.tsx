import { useApolloClient } from '@apollo/react-hooks'
import _pickBy from 'lodash/pickBy'
import React, { useContext, useEffect, useState } from 'react'

import { MAX_USER_NAME_LENGTH, MIN_USER_NAME_LENGTH } from '~/common/enums'
import { normalizeUserName } from '~/common/utils'
import { Spinner, ViewerContext } from '~/components'
import { SocialAccountType } from '~/gql/graphql'

import ConfirmStep from './ConfirmStep'
import { QUERY_USER_NAME } from './gql'
import InputStep from './InputStep'

interface FormProps {
  closeDialog: () => void
}

type Step = 'input' | 'confirm'

const SetUserNameDialogContent: React.FC<FormProps> = ({ closeDialog }) => {
  const viewer = useContext(ViewerContext)
  const client = useApolloClient()

  const maxQueryCount = 10

  const googleId = viewer.info.socialAccounts.find(
    (s) => s.type === SocialAccountType.Google
  )?.email
  const facebookId = viewer.info.socialAccounts.find(
    (s) => s.type === SocialAccountType.Facebook
  )?.userName
  const twitterId = viewer.info.socialAccounts.find(
    (s) => s.type === SocialAccountType.Twitter
  )?.userName

  const presetUserName =
    viewer.info.email || googleId || facebookId || twitterId
  const [loading, setLoading] = useState(presetUserName !== null)

  const [index, setIndex] = useState(1)
  const normalizedUserName =
    presetUserName &&
    normalizeUserName(
      presetUserName.split('@')[0].slice(0, MAX_USER_NAME_LENGTH)
    )
  let initUserName = normalizedUserName
  if (initUserName && initUserName.length < MIN_USER_NAME_LENGTH) {
    initUserName = initUserName + String(index).padStart(3, '0')
  }

  const [userName, setUserName] = useState(
    presetUserName === null ? '' : initUserName
  )

  const [step, setStep] = useState<Step>('input')
  const isInput = step === 'input'
  const isConfirm = step === 'confirm'

  useEffect(() => {
    ;(async () => {
      if (!presetUserName) {
        return
      }
      const { data } = await client.query({
        query: QUERY_USER_NAME,
        variables: { userName: initUserName },
        fetchPolicy: 'network-only',
      })
      if (!!data.user) {
        initUserName =
          normalizedUserName.slice(0, MAX_USER_NAME_LENGTH - 3) +
          String(index + 1).padStart(3, '0')
        if (index < maxQueryCount) {
          setIndex(index + 1)
        } else {
          setUserName('')
          setLoading(false)
        }
      } else {
        setUserName(initUserName)
        setLoading(false)
      }
    })()
  }, [index])

  if (loading) {
    return <Spinner />
  }

  return (
    <>
      {isInput && (
        <InputStep
          userName={userName}
          gotoConfirm={(userName) => {
            setStep('confirm')
            setUserName(userName)
          }}
        />
      )}
      {isConfirm && (
        <ConfirmStep
          back={() => {
            setStep('input')
          }}
          userName={userName}
          closeDialog={closeDialog}
        />
      )}
    </>
  )
}

export default SetUserNameDialogContent
