import { useRef } from 'react'

import { TEST_ID } from '~/common/enums'
import { Dialog, useDialogSwitch } from '~/components'

import CommentForm, { CommentFormProps } from './CommentForm'

export type CommentFormDialogProps = {
  children: ({ openDialog }: { openDialog: () => void }) => React.ReactNode
} & Omit<CommentFormProps, 'closeDialog'>

const BaseCommentFormDialog = ({
  children,
  ...props
}: CommentFormDialogProps) => {
  const { show, openDialog, closeDialog } = useDialogSwitch(true)
  const ref: React.RefObject<HTMLDivElement> | null = useRef(null)

  return (
    <div ref={ref}>
      {children && children({ openDialog })}

      <Dialog
        isOpen={show}
        onDismiss={closeDialog}
        testId={TEST_ID.DIALOG_COMMENT_FORM}
      >
        <CommentForm {...props} closeDialog={closeDialog} />
      </Dialog>
    </div>
  )
}

export const CommentFormDialog = (props: CommentFormDialogProps) => (
  <Dialog.Lazy mounted={<BaseCommentFormDialog {...props} />}>
    {({ openDialog }) => <>{props.children({ openDialog })}</>}
  </Dialog.Lazy>
)
