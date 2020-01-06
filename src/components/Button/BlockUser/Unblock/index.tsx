import gql from 'graphql-tag'
import { useContext } from 'react'

import { Button, Translate } from '~/components'
import { useMutation } from '~/components/GQL'
import { UnblockUser } from '~/components/GQL/mutations/__generated__/UnblockUser'
import UNBLOCK_USER from '~/components/GQL/mutations/unblockUser'
import { LanguageContext } from '~/components/Language'

import { ADD_TOAST, TEXT } from '~/common/enums'
import { translate } from '~/common/utils'

import { UnblockButtonUser } from './__generated__/UnblockButtonUser'

const fragments = {
  user: gql`
    fragment UnblockButtonUser on User {
      id
      isBlocked
    }
  `
}

const Unblock = ({
  user,
  size = 'sm'
}: {
  user: UnblockButtonUser
  size?: 'sm' | 'default'
}) => {
  const { lang } = useContext(LanguageContext)
  const [unblockUser] = useMutation<UnblockUser>(UNBLOCK_USER, {
    variables: { id: user.id },
    optimisticResponse: {
      unblockUser: {
        id: user.id,
        isBlocked: false,
        __typename: 'User'
      }
    }
  })

  return (
    <Button
      size={size}
      style={size === 'sm' ? { width: '4rem' } : { width: '5.5rem' }}
      onClick={async () => {
        await unblockUser()
        window.dispatchEvent(
          new CustomEvent(ADD_TOAST, {
            detail: {
              color: 'green',
              content: translate({
                zh_hant: TEXT.zh_hant.unblockSuccess,
                zh_hans: TEXT.zh_hans.unblockSuccess,
                lang
              })
            }
          })
        )
      }}
      bgColor="green"
    >
      <Translate
        zh_hant={TEXT.zh_hant.unblockUser}
        zh_hans={TEXT.zh_hans.unblockUser}
      />
    </Button>
  )
}

Unblock.fragments = fragments

export default Unblock
