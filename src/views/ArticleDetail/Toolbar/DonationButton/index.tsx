import gql from 'graphql-tag'
import { useContext } from 'react'
import { FormattedMessage, useIntl } from 'react-intl'

import { ReactComponent as IconMoney } from '@/public/static/icons/24px/money.svg'
import {
  ERROR_CODES,
  ERROR_MESSAGES,
  OPEN_UNIVERSAL_AUTH_DIALOG,
  UNIVERSAL_AUTH_TRIGGER,
} from '~/common/enums'
import { analytics, numAbbr } from '~/common/utils'
import {
  Button,
  ButtonProps,
  Icon,
  TextIcon,
  toast,
  ViewerContext,
} from '~/components'
import {
  ArticleDetailPublicQuery,
  DonationButtonArticleFragment,
} from '~/gql/graphql'

import { SupportDialog } from '../../Support/SupportDialog'

export type DonationButtonProps = {
  article: DonationButtonArticleFragment
  articleDetail: NonNullable<ArticleDetailPublicQuery['article']>
  iconSize?: 20 | 24
  textWeight?: 'medium' | 'normal'
  textIconSpacing?: 4 | 6 | 8
} & ButtonProps

const fragments = {
  article: gql`
    fragment DonationButtonArticle on Article {
      id
      donationsToolbar: donations(input: { first: 0 }) {
        totalCount
      }
      author {
        ...UserDonationRecipient
      }
    }
    ${SupportDialog.fragments.recipient}
  `,
}

const DonationButton = ({
  article,
  articleDetail,
  iconSize = 20,
  textWeight = 'medium',
  textIconSpacing = 6,
  ...buttonProps
}: DonationButtonProps) => {
  const viewer = useContext(ViewerContext)
  const intl = useIntl()

  const forbid = () => {
    toast.error({
      message: (
        <FormattedMessage {...ERROR_MESSAGES[ERROR_CODES.FORBIDDEN_BY_STATE]} />
      ),
    })
  }

  const donationCount =
    article.donationsToolbar.totalCount > 0
      ? article.donationsToolbar.totalCount
      : 0

  return (
    <SupportDialog article={articleDetail}>
      {({ openDialog }) => (
        <Button
          spacing={[8, 8]}
          aria-label={intl.formatMessage(
            {
              defaultMessage:
                'Support author (current {donationCount} supports)',

              id: 'KBeSFM',
            },
            { donationCount }
          )}
          aria-haspopup="dialog"
          disabled={article.author.id === viewer.id}
          onClick={() => {
            analytics.trackEvent('click_button', { type: 'donate' })
            if (!viewer.isAuthed) {
              window.dispatchEvent(
                new CustomEvent(OPEN_UNIVERSAL_AUTH_DIALOG, {
                  detail: { trigger: UNIVERSAL_AUTH_TRIGGER.support },
                })
              )
              return
            }
            if (viewer.isFrozen) {
              forbid()
              return
            }
            openDialog()
          }}
          {...buttonProps}
        >
          <TextIcon
            icon={<Icon icon={IconMoney} size={iconSize} />}
            weight={textWeight}
            spacing={
              article.donationsToolbar.totalCount > 0 ? textIconSpacing : 0
            }
            size={14}
          >
            {article.donationsToolbar.totalCount > 0
              ? numAbbr(article.donationsToolbar.totalCount)
              : undefined}
          </TextIcon>
        </Button>
      )}
    </SupportDialog>
  )
}

DonationButton.fragments = fragments

export default DonationButton
