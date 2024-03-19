import { FormattedMessage } from 'react-intl'

import { Dialog } from '~/components/Dialog'

interface Props {
  closeDialog: () => void
}

const isProd = process.env.NEXT_PUBLIC_RUNTIME_ENV === 'production'

const Content: React.FC<Props> = ({ closeDialog }) => {
  const billboardURL = isProd
    ? 'https://billboard.matters-lab.io'
    : 'https://billboard-develop.matters-lab.io'
  return (
    <>
      <Dialog.Header
        title={
          <FormattedMessage
            defaultMessage="What's Billboard?"
            id="8CzY/X"
            description="src/components/Dialogs/BillboardDialog/Content.tsx"
          />
        }
      />
      <Dialog.Content>
        <Dialog.Content.Message>
          <p>
            <FormattedMessage
              defaultMessage="Billboard is a public NFT billboard for rent, where content can be displayed for 14 days. The rental fee, calculated using the Harberger Tax, is redistributed to the community through quadratic funding."
              id="vMfNNF"
              description="src/components/Dialogs/BillboardDialog/Content.tsx"
            />
          </p>
        </Dialog.Content.Message>
      </Dialog.Content>

      <Dialog.Footer
        btns={
          <>
            <Dialog.RoundedButton
              text={
                <FormattedMessage
                  defaultMessage="View Billboard NFT"
                  id="U7+5ED"
                  description="src/components/Dialogs/BillboardDialog/Content.tsx"
                />
              }
              htmlHref={billboardURL}
              htmlTarget="_blank"
              onClick={closeDialog}
            />
            <Dialog.RoundedButton
              text={
                <FormattedMessage
                  defaultMessage="Learn more"
                  id="wdz6Pf"
                  description="src/components/Dialogs/BillboardDialog/Content.tsx"
                />
              }
              color="greyDarker"
              onClick={closeDialog}
            />
          </>
        }
        smUpBtns={
          <>
            <Dialog.TextButton
              text={
                <FormattedMessage
                  defaultMessage="Learn more"
                  id="wdz6Pf"
                  description="src/components/Dialogs/BillboardDialog/Content.tsx"
                />
              }
              color="greyDarker"
              onClick={closeDialog}
            />
            <Dialog.TextButton
              text={
                <FormattedMessage
                  defaultMessage="View Billboard NFT"
                  id="U7+5ED"
                  description="src/components/Dialogs/BillboardDialog/Content.tsx"
                />
              }
              htmlHref={billboardURL}
              htmlTarget="_blank"
              onClick={closeDialog}
            />
          </>
        }
      />
    </>
  )
}

export default Content
