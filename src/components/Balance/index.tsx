import classNames from 'classnames'
import { useContext } from 'react'
import { FormattedMessage } from 'react-intl'

import { PAYMENT_CURRENCY as CURRENCY } from '~/common/enums'
import { formatAmount } from '~/common/utils'
import {
  BindEmailHintDialog,
  Button,
  LanguageContext,
  TextIcon,
  ViewerContext,
} from '~/components'

import styles from './styles.module.css'

type BalanceProps = {
  currency: CURRENCY
  amount: number
  isBalanceInsufficient?: boolean
  showTopUp?: boolean
  switchToAddCredit?: () => void
  loading?: boolean
}

const BalanceMessage: React.FC<{
  isHKD: boolean
  isBalanceInsufficient: boolean
}> = ({ isHKD, isBalanceInsufficient }) => {
  return (
    <>
      {isHKD && isBalanceInsufficient ? (
        <FormattedMessage
          defaultMessage="Insufficient: "
          description="src/components/Balance/index.tsx"
          id="hWq/ii"
        />
      ) : (
        <FormattedMessage
          defaultMessage="Balance:"
          description="src/components/Balance/index.tsx"
          id="1U/MPD"
        />
      )}
    </>
  )
}

const BalanceAmount: React.FC<{
  currency: CURRENCY
  formattedAmount: string
}> = ({ currency, formattedAmount }) => {
  if (currency === CURRENCY.USDT) return <span>USDT {formattedAmount}</span>
  if (currency === CURRENCY.HKD) return <span>HKD {formattedAmount}</span>
  if (currency === CURRENCY.LIKE) return <span>LIKE {formattedAmount}</span>
  return null
}

const TopUpButton: React.FC<{
  isBalanceInsufficient: boolean
  hasEmail: boolean
  switchToAddCredit?: () => void
}> = ({ isBalanceInsufficient, hasEmail, switchToAddCredit }) => {
  const topUpButtonClasses = classNames(styles.topUpButton, {
    [styles.insufficientBorder]: isBalanceInsufficient,
  })

  return (
    <BindEmailHintDialog>
      {({ openDialog }) => (
        <section className={topUpButtonClasses}>
          <Button onClick={hasEmail ? switchToAddCredit : openDialog}>
            <TextIcon
              size={14}
              decoration="underline"
              color={isBalanceInsufficient ? 'black' : 'gold'}
              weight="medium"
            >
              <FormattedMessage
                defaultMessage="Top up"
                id="hAyhzq"
                description="SUPPORT_HKD"
              />
            </TextIcon>
          </Button>
        </section>
      )}
    </BindEmailHintDialog>
  )
}

export const Balance: React.FC<BalanceProps> = ({
  currency,
  amount,
  isBalanceInsufficient = false,
  showTopUp = true,
  switchToAddCredit,
  loading = false,
}) => {
  const { lang } = useContext(LanguageContext)
  const viewer = useContext(ViewerContext)
  const hasEmail = !!viewer.info.email

  const isHKD = currency === CURRENCY.HKD

  const formattedAmount = formatAmount(
    amount,
    currency === CURRENCY.USDT ? 2 : 0
  )

  if (loading) {
    return (
      <span className={styles.container}>
        <FormattedMessage defaultMessage="Balance loading..." id="E7vGxB" />
      </span>
    )
  }

  const containerClasses = classNames(styles.container, {
    [styles.insufficient]: isHKD && isBalanceInsufficient,
  })

  return (
    <span className={containerClasses}>
      <>
        <BalanceMessage
          isHKD={isHKD}
          isBalanceInsufficient={isBalanceInsufficient}
        />
        {lang === 'en' && <>&nbsp;</>}
      </>
      <span className={styles.balance} title={formattedAmount}>
        <BalanceAmount currency={currency} formattedAmount={formattedAmount} />
      </span>
      {isHKD && showTopUp && (
        <TopUpButton
          isBalanceInsufficient={isBalanceInsufficient}
          hasEmail={hasEmail}
          switchToAddCredit={switchToAddCredit}
        />
      )}
    </span>
  )
}
