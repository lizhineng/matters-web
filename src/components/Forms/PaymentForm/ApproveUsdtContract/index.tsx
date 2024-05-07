import _get from 'lodash/get'
import { useContext, useEffect, useState } from 'react'
import { FormattedMessage } from 'react-intl'
import { waitForTransaction } from 'wagmi/actions'

import { ReactComponent as IconOpenWallet } from '@/public/static/icons/24px/open-wallet.svg'
import { WALLET_ERROR_MESSAGES } from '~/common/enums'
import {
  Dialog,
  Icon,
  LanguageContext,
  SpinnerBlock,
  TextIcon,
  useAllowanceUSDT,
  useApproveUSDT,
} from '~/components'

import styles from './styles.module.css'

interface ApproveUsdtContractProps {
  submitCallback: () => void
}

const ApproveUsdtContract: React.FC<ApproveUsdtContractProps> = ({
  submitCallback,
}) => {
  const { lang } = useContext(LanguageContext)
  const [showLoading, setShowLoading] = useState(true)
  const [approveConfirming, setApproveConfirming] = useState(false)
  const {
    data: allowanceData,
    refetch: refetchAllowanceData,
    isLoading: allowanceLoading,
    error: allowanceError,
  } = useAllowanceUSDT()
  const {
    data: approveData,
    isLoading: approving,
    write: approveWrite,
    error: approveError,
  } = useApproveUSDT()

  useEffect(() => {
    const allowanceUSDT = allowanceData || 0n
    if (allowanceUSDT > 0n) {
      submitCallback()
    }
    setShowLoading(false)
  }, [allowanceData])

  // USDT approval
  useEffect(() => {
    ;(async () => {
      if (approveData) {
        setApproveConfirming(true)
        await waitForTransaction({ hash: approveData.hash })
        refetchAllowanceData()
        setApproveConfirming(false)
      }
    })()
  }, [approveData])

  const errorName = _get(approveError, 'cause.name')
  const isUserRejected = errorName === 'UserRejectedRequestError'

  if (showLoading) {
    return <SpinnerBlock />
  }

  return (
    <section className={styles.container}>
      <section className={styles.content}>
        <section className={styles.title}>
          <FormattedMessage
            defaultMessage="Allow to use USDT in the wallet"
            id="OA3RuB"
            description="src/components/Forms/PaymentForm/ApproveUsdtContract/index.tsx"
          />
        </section>
        <section className={styles.info}>
          <FormattedMessage
            defaultMessage="Please confirm authorization in the wallet dialog.{br}Once confirmed, support steps can begin."
            id="YAIXL4"
            description="src/components/Forms/PaymentForm/ApproveUsdtContract/index.tsx"
            values={{ br: <br /> }}
          />
        </section>
        <Dialog.RoundedButton
          color="white"
          bgColor="green"
          onClick={approveWrite}
          textWeight="normal"
          textSize={16}
          text={
            <TextIcon icon={<Icon icon={IconOpenWallet} size={20} />}>
              {!allowanceError && !approveError && (
                <FormattedMessage
                  defaultMessage="Go to allow"
                  id="wBpJLd"
                  description="src/components/Forms/PaymentForm/ApproveUsdtContract/index.tsx"
                />
              )}
              {(allowanceError || approveError) && (
                <FormattedMessage
                  defaultMessage="Reauthorize"
                  id="1r1iQj"
                  description="src/components/Forms/PaymentForm/ApproveUsdtContract/index.tsx"
                />
              )}
            </TextIcon>
          }
          loading={approving || approveConfirming || allowanceLoading}
        />

        {(allowanceError || approveError) && (
          <section className={styles.error}>
            {isUserRejected && (
              <FormattedMessage
                defaultMessage="Authorization has been cancelled. If you want to support the author, please retry"
                id="y9LDu9"
              />
            )}
            {!isUserRejected && WALLET_ERROR_MESSAGES[lang].unknown}
          </section>
        )}
      </section>
    </section>
  )
}

export default ApproveUsdtContract
