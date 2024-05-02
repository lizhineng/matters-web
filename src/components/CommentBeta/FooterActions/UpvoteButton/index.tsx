import gql from 'graphql-tag'
import { useIntl } from 'react-intl'

import { ReactComponent as IconLike } from '@/public/static/icons/24px/like.svg'
import { ReactComponent as IconLikeFill } from '@/public/static/icons/24px/like-fill.svg'
import { numAbbr } from '~/common/utils'
import { Button, Icon, TextIcon, useMutation } from '~/components'
import {
  UNVOTE_COMMENT,
  VOTE_COMMENT,
} from '~/components/GQL/mutations/voteComment'
import {
  UnvoteCommentMutation,
  UpvoteCommentBetaPrivateFragment,
  UpvoteCommentBetaPublicFragment,
  VoteCommentMutation,
} from '~/gql/graphql'

interface UpvoteButtonProps {
  comment: UpvoteCommentBetaPublicFragment &
    Partial<UpvoteCommentBetaPrivateFragment>
  onClick?: () => void
  disabled?: boolean
  inCard: boolean
}

const fragments = {
  comment: {
    public: gql`
      fragment UpvoteCommentBetaPublic on Comment {
        id
        upvotes
      }
    `,
    private: gql`
      fragment UpvoteCommentBetaPrivate on Comment {
        id
        myVote
      }
    `,
  },
}

const UpvoteButton = ({
  comment,
  onClick,
  disabled,
  inCard,
}: UpvoteButtonProps) => {
  const intl = useIntl()

  const [unvote] = useMutation<UnvoteCommentMutation>(UNVOTE_COMMENT, {
    variables: { id: comment.id },
    optimisticResponse: {
      unvoteComment: {
        id: comment.id,
        upvotes: comment.upvotes - 1,
        downvotes: 0,
        myVote: null,
        __typename: 'Comment',
      },
    },
  })
  const [upvote] = useMutation<VoteCommentMutation>(VOTE_COMMENT, {
    variables: { id: comment.id, vote: 'up' },
    optimisticResponse: {
      voteComment: {
        id: comment.id,
        upvotes: comment.upvotes + 1,
        downvotes: 0,
        myVote: 'up' as any,
        __typename: 'Comment',
      },
    },
  })

  if (comment.myVote === 'up') {
    return (
      <Button
        spacing={[8, 8]}
        onClick={() => {
          onClick ? onClick() : unvote()
        }}
        disabled={disabled}
        aria-label={intl.formatMessage({
          defaultMessage: 'Undo upvote',
          id: 'z3uIHQ',
        })}
      >
        <TextIcon
          icon={<Icon icon={IconLikeFill} color="redLight" size={18} />}
          color="black"
          size={15}
        >
          {comment.upvotes > 0 ? numAbbr(comment.upvotes) : undefined}
        </TextIcon>
      </Button>
    )
  }

  return (
    <Button
      spacing={[8, 8]}
      textColor="greyDarker"
      textActiveColor="black"
      onClick={() => {
        onClick ? onClick() : upvote()
      }}
      disabled={disabled}
      aria-label={intl.formatMessage({
        defaultMessage: 'Upvote',
        id: 'ZD+vm/',
      })}
    >
      <TextIcon icon={<Icon icon={IconLike} size={18} />} size={15}>
        {comment.upvotes > 0 ? numAbbr(comment.upvotes) : undefined}
      </TextIcon>
    </Button>
  )
}

UpvoteButton.fragments = fragments

export default UpvoteButton