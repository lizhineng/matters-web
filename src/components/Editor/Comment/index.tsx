import { useApolloClient } from '@apollo/react-hooks'
import {
  commentEditorExtensions,
  Editor,
  EditorContent,
  Mention,
  Placeholder,
  useEditor,
} from '@matters/matters-editor'
import { useEffect } from 'react'
import { useIntl } from 'react-intl'

import { BYPASS_SCROLL_LOCK, ENBABLE_SCROLL_LOCK } from '~/common/enums'
import { useCommentEditorContext } from '~/components/Context'

import {
  CustomShortcuts,
  makeMentionSuggestion,
  SmartLink,
} from '../Article/extensions'
import { makeSmartLinkOptions } from '../Article/extensions/smartLink/utils'
import styles from './styles.module.css'

interface Props {
  content: string
  update: (params: { content: string }) => void
  onSubmit: () => any
  placeholder?: string
  setEditor?: (editor: Editor | null) => void
  onFocused?: () => void
  isFallbackEditor?: boolean
  lockScroll?: boolean
  editable?: boolean
}

const CommentEditor: React.FC<Props> = ({
  content,
  update,
  onSubmit,
  placeholder,
  setEditor,
  onFocused,
  isFallbackEditor,
  lockScroll = true,
  editable = true,
}) => {
  const client = useApolloClient()
  const intl = useIntl()
  const { setActiveEditor, setFallbackEditor } = useCommentEditorContext()

  placeholder =
    placeholder ||
    intl.formatMessage({
      id: 'liBHHE',
      defaultMessage: 'Any thoughts? Leave a kind comment~',
    })

  const editor = useEditor({
    editable,
    content: content || '',
    onUpdate: async ({ editor, transaction }) => {
      const content = editor.getHTML()
      update({ content })
    },
    // FIXME: toggle scroll lock when editor is focused
    // can be removed if editor is only used in single page
    // instead of being used in dialog
    onFocus: () => {
      lockScroll && window.dispatchEvent(new CustomEvent(BYPASS_SCROLL_LOCK))
    },
    onDestroy: () => {
      lockScroll && window.dispatchEvent(new CustomEvent(ENBABLE_SCROLL_LOCK))
    },
    extensions: [
      CustomShortcuts.configure({
        onModEnter: () => onSubmit(),
      }),
      Placeholder.configure({
        placeholder,
      }),
      Mention.configure({
        suggestion: makeMentionSuggestion({ client }),
      }),
      SmartLink.configure(makeSmartLinkOptions({ client })),
      ...commentEditorExtensions,
    ],
  })

  useEffect(() => {
    setEditor?.(editor)
    if (isFallbackEditor) {
      setFallbackEditor(editor)
    }
  }, [editor])

  useEffect(() => {
    if (!editor) return

    editor.extensionManager.extensions.filter(
      (extension) => extension.name === 'placeholder'
    )[0].options['placeholder'] = placeholder

    editor.view.dispatch(editor.state.tr)
  }, [editor, placeholder])

  return (
    <div
      className={styles.commentEditor}
      id="editor" // anchor for mention plugin
    >
      <EditorContent
        editor={editor}
        onFocus={() => {
          if (setActiveEditor) {
            setActiveEditor(editor)
          }
          onFocused?.()
        }}
      />
    </div>
  )
}

export default CommentEditor
