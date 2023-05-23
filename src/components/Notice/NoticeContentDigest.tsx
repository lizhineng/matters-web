import { TEST_ID } from '~/common/enums'
import { stripHtml } from '~/common/utils'

import styles from './styles.css'

const NoticeContentDigest = ({ content }: { content: string }) => {
  const collapseContent = stripHtml(
    content && content.replace(/\r?\n|\r|\s\s/g, ''),
    ''
  )

  return (
    <section
      className="notice-content-digest"
      data-test-id={TEST_ID.NOTICE_COMMENT_CONTENT}
    >
      {collapseContent}
      <style jsx>{styles}</style>
    </section>
  )
}

export default NoticeContentDigest